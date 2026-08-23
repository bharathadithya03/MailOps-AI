# MailOps AI

> **AI-powered email operations platform for intelligent classification, policy-driven routing, human review, and auditable email workflows.**

<p align="center">
  <a href="https://mailops-ten.vercel.app/">🌐 Live Website</a> •
  <a href="https://github.com/bharathadithya03/MailOps-AI">💻 GitHub</a> •
  <a href="YOUR_DEMO_VIDEO_URL">🎥 Demo Video</a>
</p>

---

## 🚨 Problem Statement

Modern teams receive a large volume of emails every day—billing requests, payment notifications, security alerts, disputes, compliance messages, customer inquiries, and spam.

Handling these emails manually creates several problems:

- Important emails can be missed or delayed.
- Teams spend significant time sorting and classifying messages.
- Sensitive or high-risk cases may not reach the right person quickly.
- Manual processing is inconsistent and difficult to audit.
- Teams have limited visibility into confidence, workload, escalations, and email operations.

### The core challenge

**How can email operations be made faster and more intelligent without removing human control from sensitive decisions?**

---

## 💡 Our Solution — MailOps AI

**MailOps AI** connects to a user's Gmail account through Google OAuth and turns incoming emails into an intelligent, policy-aware operational workflow.

The platform:

1. Connects to the user's Gmail account securely.
2. Synchronizes emails belonging only to that connected account.
3. Classifies emails using an AI intent engine.
4. Calculates confidence for each classification.
5. Applies policy and safety rules.
6. Automatically processes eligible high-confidence cases.
7. Routes uncertain or sensitive emails to Human Review.
8. Maintains an Audit Trail for operational transparency.
9. Provides dashboards and analytics for monitoring the complete pipeline.

### The workflow

**Gmail → Synchronization → AI Classification → Confidence → Policy → Automation / Human Review → Audit**

---

## 🌐 Project Links

| Resource | Link |
|---|---|
| **Live Website** | **[Open MailOps AI](https://mailops-ten.vercel.app/)** |
| **GitHub Repository** | [github.com/bharathadithya03/MailOps-AI](https://github.com/bharathadithya03/MailOps-AI) |
| **Demo Video** | **[Watch the 5–7 minute demo](YOUR_DEMO_VIDEO_URL)** |

> **Before publishing:** replace `https://mailops-ten.vercel.app/` and `YOUR_DEMO_VIDEO_URL` with the final links.

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │     User / Admin    │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │   MailOps AI Web UI │
                    │       Next.js       │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │  Firebase Auth   │        │    Gmail OAuth   │
       │  User Identity   │        │   Gmail API      │
       └────────┬─────────┘        └────────┬─────────┘
                └─────────────┬─────────────┘
                              ▼
                    ┌─────────────────────┐
                    │ Gmail Sync / APIs   │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │      Firestore      │
                    │ User-scoped Emails  │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │   AI Intent Engine  │
                    │    Classification   │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Confidence & Policy │
                    │       Engine        │
                    └───────┬─────┬───────┘
                            │     │
                    Eligible      Sensitive /
                    automation     uncertain
                            │     │
                            ▼     ▼
                     ┌─────────┐ ┌──────────────┐
                     │Automate │ │ Human Review │
                     └────┬────┘ └──────┬───────┘
                          └──────┬───────┘
                                 ▼
                         ┌──────────────┐
                         │  Audit Trail │
                         └──────────────┘
```

---

# ⚙️ Core Workflow

### 1. Gmail Connection

The user connects Gmail using **Google OAuth**.

The application uses the authenticated connection rather than a shared email dataset.

### 2. Email Synchronization

Emails are synchronized through the Gmail API and stored in a user-scoped data layer.

Each authenticated user has isolated email data.

### 3. AI Classification

The AI intent engine analyzes email content and assigns an operational category such as:

- Invoice
- Payment
- Dispute
- Security
- Compliance
- Inquiry
- General
- Spam

### 4. Confidence Evaluation

Each classification receives a confidence score. The score helps determine whether the email can move forward automatically or requires review.

### 5. Policy Engine

Business and safety policies are applied after classification.

Examples include:

- High-confidence automation
- Human review for uncertain cases
- Mandatory review for sensitive categories
- High-value transaction protection

### 6. Human Review

Emails that should not be processed automatically are routed to a dedicated review queue.

This keeps humans in control of sensitive or ambiguous decisions.

### 7. Audit Trail

Operational events record what happened, which classification was assigned, what confidence was used, and whether automation or human review was selected.

---

# 🔐 Security & User Data Isolation

Security is a core part of the application design.

Email records and integration data are associated with the authenticated user's Firebase UID.

Conceptually:

```text
users/{user.uid}/emails/{messageId}
users/{user.uid}/integrations/gmail
```

This prevents one MailOps AI user from viewing another user's synchronized emails.

### Gmail lifecycle

```text
Gmail Connected
      ↓
Email Synchronization Enabled
      ↓
Emails available for classification
      ↓
Gmail Disconnected
      ↓
Synchronization stops
      ↓
Connected email data is cleared from the MailOps pipeline
```

The application does not display OAuth secrets or access tokens in the UI.

---

# 🧠 AI & Decision Engine

MailOps AI combines AI-assisted email understanding with deterministic policy rules.

```text
AI Prediction
     ↓
Confidence Score
     ↓
Policy / Safety Rules
     ↓
┌──────────────┬─────────────────┐
│ Automation   │ Human Review    │
└──────────────┴─────────────────┘
```

### ML model training

The current implementation focuses on **AI/API-based classification, confidence evaluation, policy enforcement, and workflow orchestration** rather than a separately trained proprietary classifier.

---

# 📊 Platform Modules

| Module | Purpose |
|---|---|
| **Dashboard** | Operational overview of synchronized email activity |
| **Inbox** | Browse and search synchronized emails |
| **AI Classification** | View intents, confidence, handlers, and decisions |
| **Human Review** | Review cases requiring human intervention |
| **Audit Trail** | Track operational events and decisions |
| **Analytics / Confidence** | Understand confidence distribution and policy thresholds |
| **Invoice Handler** | Invoice-related workflow |
| **Payment Handler** | Payment-related workflow |
| **Dispute Handler** | Dispute and sensitive-case workflow |
| **Settings** | Profile and Gmail integration management |

---

# 🛠️ Technology Stack

### Frontend
- **Next.js 16**
- **React**
- **JavaScript**
- **CSS**

### Backend / APIs
- **Next.js App Router API routes**
- **Gmail API**
- **Google OAuth 2.0**

### Authentication & Database
- **Firebase Authentication**
- **Cloud Firestore**

### AI
- **Generative AI / AI intent classification**
- Confidence scoring
- Policy-based decision engine
- AI-assisted routing

### Deployment
- **Vercel**
- Production Next.js deployment
- Environment variables

---

# 📁 Project Structure

```text
mailops-ai/
│
├── app/
│   ├── api/
│   │   └── gmail/
│   │       ├── auth-url/
│   │       ├── callback/
│   │       ├── disconnect/
│   │       ├── status/
│   │       └── sync/
│   │
│   ├── dashboard/
│   │   ├── audit/
│   │   ├── classification/
│   │   ├── confidence/
│   │   ├── handlers/
│   │   ├── inbox/
│   │   └── settings/
│   │
│   ├── login/
│   ├── signup/
│   ├── privacy/
│   └── terms/
│
├── components/
├── lib/
├── public/
├── package.json
├── next.config.mjs
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone

```bash
git clone https://github.com/bharathadithya03/MailOps-AI.git
cd MailOps-AI
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_APP_URL=
```

> **Never commit `.env.local` or expose OAuth secrets in GitHub.**

## 4. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## 5. Production build

```bash
npm run build
```

---

# ☁️ Deployment Architecture

```text
GitHub
  ↓
Vercel
  ↓
Environment Variables
  ↓
Next.js Production Build
  ↓
MailOps AI
  ↓
Firebase + Firestore
  ↓
Google OAuth + Gmail API
```

For production Gmail OAuth, the deployed domain must be configured in the relevant Google OAuth and Firebase settings.

---

# 🎯 Why MailOps AI Is Different

Most email tools stop at:

> **"Find and classify my emails."**

MailOps AI goes further:

> **"Understand the email, evaluate confidence, apply business policy, decide whether automation is safe, route sensitive cases to humans, and record what happened."**

The differentiator is the combination of:

**AI + Confidence + Policy + Human-in-the-loop + Auditability**

This makes the platform designed for controlled operational automation rather than blind automation.

---

# 📈 Impact

MailOps AI is designed to help teams:

- Reduce repetitive email triage.
- Prioritize important messages faster.
- Route sensitive cases to the correct workflow.
- Reduce unnecessary manual classification.
- Improve operational visibility.
- Maintain an auditable history of decisions.
- Scale email operations while keeping humans in control.

---

# ⚠️ Current Limitations

- Gmail is currently the primary email integration.
- Outlook / Microsoft 365 integration is planned.
- AI classification quality depends on the underlying AI service and email content.
- Production enterprise use would require additional monitoring, rate-limit handling, recovery mechanisms, and security controls.
- Automated actions should be further validated before high-risk production use.

---

# 🔮 Future Improvements

### Integrations
- Microsoft Outlook / Graph API
- Slack and additional business platforms
- More enterprise email providers

### AI
- Custom classification models
- RAG-based contextual understanding
- Domain-specific classification
- Better AI explainability
- Feedback-driven evaluation

### Automation
- Visual workflow builder
- Configurable business rules
- Automated response generation
- SLA-based escalation
- Scheduled processing

### Enterprise
- Role-based access control
- Multi-tenant organization management
- Advanced security monitoring
- Compliance enhancements
- Advanced operational analytics
- Admin-level audit controls

---

# 👨‍💻 Author

**Bharath Adithya**  
B.Tech — Computer Science & Engineering (AI & ML)

**GitHub:** https://github.com/bharathadithya03

---

## ⭐ MailOps AI

**Turning email overload into an intelligent, controlled, and auditable operations workflow.**
