import { classifyEmail, evaluatePolicy } from './aiEngine';

/**
 * Derives consistent priority based on AI classification and policy signals
 */
export function deriveEmailPriority(intent, amount) {
  if (
    intent === 'security' ||
    intent === 'compliance' ||
    intent === 'dispute' ||
    (amount && amount > 10000)
  ) {
    return 'high';
  }
  if (
    intent === 'invoice' ||
    intent === 'payment_request' ||
    intent === 'payment_confirmation'
  ) {
    return 'medium';
  }
  return 'low';
}

/**
 * Normalizes a raw Gmail message object into MailOps AI standardized email schema
 */
export function normalizeGmailMessage(messageData, userId) {
  if (!userId) {
    throw new Error('User ID is required for email normalization');
  }

  const headers = messageData.payload?.headers || [];
  const getHeader = (name) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const from = getHeader('from') || 'unknown@domain.com';
  const to = getHeader('to') || 'me@domain.com';
  const subject = getHeader('subject') || '(No Subject)';
  const dateStr = getHeader('date');
  const receivedAt = dateStr ? new Date(dateStr).toISOString() : new Date(Number(messageData.internalDate || Date.now())).toISOString();

  // Extract body/snippet
  let body = messageData.snippet || '';
  if (messageData.payload?.parts) {
    const textPart = messageData.payload.parts.find((p) => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      try {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      } catch (e) {
        body = messageData.snippet || '';
      }
    }
  }

  // Extract sender name from "Name <email>"
  let fromName = from;
  const nameMatch = from.match(/^"?([^"<]+)"?\s*<?/);
  if (nameMatch && nameMatch[1]) {
    fromName = nameMatch[1].trim();
  }

  // Parse amount if present in text (e.g. $1,250.00)
  let amount = null;
  const amountMatch = (subject + ' ' + body).match(/\$\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  const labelIds = messageData.labelIds || ['INBOX'];

  // Run through MailOps AI Intent & Policy Classification with full multi-factor context
  const classification = classifyEmail(body, subject, from, labelIds);
  const policy = evaluatePolicy(classification.intent, classification.confidence, amount || 0);
  const priority = deriveEmailPriority(classification.intent, amount);

  return {
    id: messageData.id,
    messageId: messageData.id,
    threadId: messageData.threadId,
    userId,
    from,
    fromName,
    to,
    subject,
    body,
    snippet: messageData.snippet || body.substring(0, 100),
    receivedAt,
    timestamp: receivedAt,
    status: policy.action === 'automated' ? 'processed' : 'pending',
    intent: classification.intent,
    confidence: classification.confidence,
    handler: classification.handler,
    action: policy.action,
    policyDecision: policy.decision,
    policyReason: policy.reason,
    priority,
    amount: amount || null,
    labels: labelIds,
    source: 'gmail',
  };
}

/**
 * Generate real audit events corresponding to a normalized Gmail email
 */
export function generateAuditEventsForEmail(email) {
  const events = [];

  // 1. Ingestion Event
  events.push({
    id: `audit_sync_${email.id}`,
    emailId: email.id,
    userId: email.userId,
    status: 'completed',
    action: 'Email Synchronized',
    description: `Email received from "${email.fromName || email.from}" regarding "${email.subject}".`,
    performedBy: 'Gmail Sync Engine',
    handler: email.handler || 'general',
    confidence: 100,
    timestamp: email.receivedAt || new Date().toISOString(),
  });

  // 2. AI Classification Event
  events.push({
    id: `audit_classify_${email.id}`,
    emailId: email.id,
    userId: email.userId,
    status: 'completed',
    action: 'AI Intent Classified',
    description: `Classified as "${email.intent?.replace(/_/g, ' ')}" with ${email.confidence}% confidence. Assigned to ${email.handler} handler.`,
    performedBy: 'AI Intent Engine',
    handler: email.handler || 'general',
    confidence: email.confidence,
    timestamp: email.receivedAt || new Date().toISOString(),
  });

  // 3. Policy Execution Event
  if (email.action === 'automated') {
    events.push({
      id: `audit_policy_${email.id}`,
      emailId: email.id,
      userId: email.userId,
      status: 'completed',
      action: 'Automated Action Executed',
      description: `Auto-approved and processed. ${email.policyReason}`,
      performedBy: 'Policy Engine',
      handler: email.handler || 'general',
      confidence: email.confidence,
      timestamp: email.receivedAt || new Date().toISOString(),
    });
  } else {
    events.push({
      id: `audit_policy_${email.id}`,
      emailId: email.id,
      userId: email.userId,
      status: 'pending_review',
      action: 'Routed to Human Review',
      description: `Escalated for human review. ${email.policyReason}`,
      performedBy: 'Policy Engine',
      handler: email.handler || 'general',
      confidence: email.confidence,
      timestamp: email.receivedAt || new Date().toISOString(),
    });
  }

  return events;
}
