// AI Engine Service — Real Multi-Factor Email Classification & Policy Engine

export const INTENTS = [
  'invoice',
  'payment_confirmation',
  'payment_request',
  'dispute',
  'compliance',
  'security',
  'inquiry',
  'spam',
  'general',
];

export const HANDLERS = {
  invoice: 'invoice',
  payment_confirmation: 'payment',
  payment_request: 'payment',
  dispute: 'dispute',
  compliance: 'dispute',
  security: 'dispute',
  inquiry: 'payment',
  spam: 'general',
  general: 'general',
};

/**
 * Multi-factor AI Intent Classification using Sender, Subject, Body Text, and Gmail Labels
 */
export function classifyEmail(emailBody = '', subject = '', sender = '', labels = []) {
  const fullText = `${subject} ${emailBody}`.toLowerCase();
  const senderLower = (sender || '').toLowerCase();
  const labelList = Array.isArray(labels) ? labels.map((l) => String(l).toUpperCase()) : [];

  // Check for spam / promotional labels first
  if (labelList.includes('SPAM') || labelList.includes('TRASH')) {
    return {
      intent: 'spam',
      confidence: 96,
      handler: 'general',
      reason: 'Flagged as spam by Gmail system label.',
    };
  }

  // Weight scores for each intent
  const scores = {
    invoice: 0,
    payment_confirmation: 0,
    payment_request: 0,
    dispute: 0,
    compliance: 0,
    security: 0,
    inquiry: 0,
    spam: 0,
    general: 5, // baseline
  };

  // 1. Sender heuristics
  if (senderLower.includes('billing@') || senderLower.includes('invoice@') || senderLower.includes('invoices@') || senderLower.includes('accounting@')) {
    scores.invoice += 35;
  }
  if (senderLower.includes('payments@') || senderLower.includes('pay@') || senderLower.includes('stripe') || senderLower.includes('paypal')) {
    scores.payment_confirmation += 25;
    scores.payment_request += 15;
  }
  if (senderLower.includes('security@') || senderLower.includes('no-reply@accounts.google.com') || senderLower.includes('auth@') || senderLower.includes('alert@')) {
    scores.security += 40;
  }
  if (senderLower.includes('legal@') || senderLower.includes('compliance@') || senderLower.includes('privacy@')) {
    scores.compliance += 40;
  }
  if (senderLower.includes('newsletter@') || senderLower.includes('marketing@') || senderLower.includes('promo@')) {
    scores.spam += 30;
  }

  // 2. Keyword rules
  const keywords = {
    invoice: [
      'invoice', 'inv-', 'bill to', 'amount due', 'payment due', 'net 30', 'net 60', 'total due',
      'tax invoice', 'billing receipt', 'subscription renewal', 'statement of account', 'due date',
    ],
    payment_confirmation: [
      'payment received', 'payment confirmed', 'payment successful', 'transaction id', 'wire transfer confirmed',
      'receipt for your payment', 'funds transferred', 'credited to your account', 'thank you for your payment',
    ],
    payment_request: [
      'request for payment', 'payment reminder', 'outstanding balance', 'past due', 'overdue notice',
      'arrange payment', 'payment plan', 'please remit',
    ],
    dispute: [
      'dispute', 'chargeback', 'incorrect charge', 'double charged', 'overcharged', 'billing error',
      'fraudulent transaction', 'unauthorized charge', 'request a refund', 'demand refund',
    ],
    security: [
      'security alert', 'new sign-in', 'password reset', 'verification code', '2-step verification',
      'suspicious activity', 'unrecognized device', 'access challenge', 'security notice',
    ],
    compliance: [
      'compliance', 'regulatory requirement', 'privacy policy update', 'terms of service update',
      'audit request', 'gdpr request', 'legal notice', 'data protection',
    ],
    inquiry: [
      'pricing question', 'how much does', 'inquiry about', 'requesting a quote', 'demo request',
      'interested in learning more', 'schedule a call', 'can you clarify',
    ],
    spam: [
      'unsubscribe', 'exclusive deal', 'limited time offer', 'act now', 'special discount',
      'winner', 'free gift', 'promotional offer', 'marketing update',
    ],
  };

  for (const [intent, wordList] of Object.entries(keywords)) {
    for (const word of wordList) {
      if (fullText.includes(word)) {
        // Subject matches count for higher weight
        if (subject.toLowerCase().includes(word)) {
          scores[intent] += 25;
        } else {
          scores[intent] += 12;
        }
      }
    }
  }

  // Label checks (e.g. PROMOTIONS -> spam/marketing)
  if (labelList.includes('CATEGORY_PROMOTIONS')) {
    scores.spam += 25;
  }
  if (labelList.includes('CATEGORY_UPDATES') && scores.invoice === 0 && scores.payment_confirmation === 0) {
    scores.general += 15;
  }

  // Find top intent
  const sortedIntents = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topIntent, topScore] = sortedIntents[0];

  // Calculate realistic confidence score
  let confidence = 65; // baseline for neutral email

  if (topScore >= 50) {
    // Strong signals
    confidence = Math.min(97, 85 + Math.floor((topScore - 50) / 5));
  } else if (topScore >= 25) {
    // Moderate signals
    confidence = Math.min(84, 72 + Math.floor((topScore - 25) / 2));
  } else if (topScore > 10) {
    // Weak signals
    confidence = Math.min(71, 58 + topScore);
  } else {
    // Very ambiguous / general
    confidence = 54;
  }

  return {
    intent: topIntent,
    confidence,
    handler: HANDLERS[topIntent] || 'general',
    allScores: scores,
  };
}

/**
 * Evaluate policy rules strictly based on configured thresholds:
 * ≥85% → Auto-process (when policy permits)
 * 70–84% → Human Review
 * <70% → Escalation
 * Special conditions:
 * - Disputes, security alerts, compliance emails ALWAYS require human review.
 * - Amounts > $50,000 always require human review.
 */
export function evaluatePolicy(intent, confidence, amount = 0) {
  const AUTO_THRESHOLD = 85;
  const REVIEW_THRESHOLD = 70;
  const MAX_AUTO_AMOUNT = 50000;

  // 1. Safety-critical intents ALWAYS escalate to human review regardless of confidence
  if (intent === 'dispute') {
    return {
      decision: 'human_review',
      action: 'human_review',
      reason: 'Disputes require mandatory manual verification and customer reconciliation.',
    };
  }

  if (intent === 'compliance') {
    return {
      decision: 'human_review',
      action: 'human_review',
      reason: 'Compliance and regulatory notices are routed to legal / compliance team.',
    };
  }

  if (intent === 'security') {
    return {
      decision: 'human_review',
      action: 'human_review',
      reason: 'Security notices and access alerts require security review.',
    };
  }

  // 2. High amount policy check
  if (amount > MAX_AUTO_AMOUNT) {
    return {
      decision: 'human_review',
      action: 'human_review',
      reason: `Amount ($${amount.toLocaleString()}) exceeds the automated threshold ($${MAX_AUTO_AMOUNT.toLocaleString()}).`,
    };
  }

  // 3. Threshold policy checks
  if (confidence >= AUTO_THRESHOLD) {
    return {
      decision: 'auto_approve',
      action: 'automated',
      reason: `High classification confidence (${confidence}% ≥ ${AUTO_THRESHOLD}% threshold). Auto-processed.`,
    };
  }

  if (confidence >= REVIEW_THRESHOLD) {
    return {
      decision: 'human_review',
      action: 'human_review',
      reason: `Moderate confidence (${confidence}% in 70–84% range). Assigned to review queue.`,
    };
  }

  // Below 70%
  return {
    decision: 'escalate',
    action: 'human_review',
    reason: `Low classification confidence (${confidence}% < ${REVIEW_THRESHOLD}%). Escalated for manual review.`,
  };
}

/**
 * Process a single email through the AI Intent & Policy pipeline
 */
export function processEmail(email) {
  const classification = classifyEmail(email.body, email.subject, email.from, email.labels);
  const policy = evaluatePolicy(classification.intent, classification.confidence, email.amount || 0);

  return {
    ...email,
    intent: classification.intent,
    confidence: classification.confidence,
    handler: classification.handler,
    policyDecision: policy.decision,
    action: policy.action,
    policyReason: policy.reason,
    status: policy.action === 'automated' ? 'processed' : 'pending',
    processedAt: new Date().toISOString(),
  };
}
