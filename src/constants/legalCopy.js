// ⚠️  DRAFT LEGAL COPY — NOT LEGAL ADVICE  ⚠️
// ---------------------------------------------------------------------------
// Every user-facing legal / consent / authorization string in the tenant app
// lives in THIS FILE. It is plain-language placeholder text drafted from the
// standard FCRA, NACHA, and Reg E (EFTA) patterns. It MUST be reviewed and
// signed off by counsel before any production release. Counsel: edit the
// strings here and the screens pick them up with no code change — there is no
// legal copy hard-coded inside the screens.
//
// Compliance models in effect (CEO decision, 2026-06-07):
//   • Credit reporting: AGGREGATOR PARTNER is the furnisher of record. FCRA
//     furnisher duties (accuracy, dispute investigation) sit mostly with the
//     partner; Keystone's job is to (a) capture the tenant's express opt-in
//     consent, (b) disclose the downside truthfully, and (c) route disputes to
//     the partner. Reporting must default OFF until the tenant opts in.
//   • Payments: DWOLLA WHITE-LABEL. Keystone hosts the Dwolla Terms-of-Service
//     acceptance and the ACH authorization capture (NACHA) itself, plus the
//     Reg E error-resolution notice. Recurring debits (Autopay) require a
//     separate, explicit authorization.
//
// TODOs marked below need a real value before production (partner name, dispute
// URL, Keystone terms URL, support contact, confirmed Dwolla legal URLs).
// ---------------------------------------------------------------------------

export const LEGAL_DRAFT_BADGE = 'DRAFT — pending legal review';

// ── FCRA · rent-to-credit reporting (aggregator model) ────────────────────
export const CREDIT_REPORTING = {
  partnerName: 'our credit-reporting partner', // TODO: named aggregator
  consentTitle: 'Report your rent to build credit',
  // Truthful disclosure — names BOTH the upside and the downside (UDAAP).
  disclosure:
    'When you turn this on, you authorize Keystone and our credit-reporting ' +
    'partner to share your rent payment history — including on-time payments ' +
    'and any late or missed payments — with consumer credit bureaus such as ' +
    'TransUnion and Equifax. On-time payments may help your credit; late or ' +
    'missed payments may lower your score. You can turn reporting off at any ' +
    'time, and we only report going forward.',
  consentCheckbox:
    'I have read the above and authorize Keystone and its partner to report ' +
    'my rent payments to the consumer credit bureaus.',
  enrollCta: 'Turn on rent reporting',
  enrolledLabel: 'Rent reporting is on',
  pauseCta: 'Turn off reporting',
  // FCRA dispute right — routed to the furnisher (the partner).
  disputeText:
    'See something wrong on what was reported? You can dispute it with our ' +
    'reporting partner, who will investigate.',
  disputeCta: 'Dispute a reported item',
  disputeUrl: '', // TODO: partner dispute portal URL
};

// ── Dwolla white-label · funding-source Terms acceptance ──────────────────
export const DWOLLA = {
  tosTitle: 'Before you add a payment method',
  tosText:
    'Payments are processed by Dwolla, Inc. By continuing, you agree to the ' +
    'Dwolla Terms of Service and Privacy Policy and to Keystone’s Payment Terms.',
  tosCheckbox:
    'I agree to the Dwolla Terms of Service, the Dwolla Privacy Policy, and the ' +
    'Keystone Payment Terms.',
  continueCta: 'Agree & continue',
  dwollaTosUrl: 'https://www.dwolla.com/legal/tos/', // TODO: confirm w/ counsel
  dwollaPrivacyUrl: 'https://www.dwolla.com/legal/privacy/', // TODO: confirm
  keystoneTermsUrl: '', // TODO: hosted Keystone payment terms
};

// ── NACHA / Reg E · ACH authorization language ────────────────────────────
export const ACH = {
  // Recurring (Autopay) mandate. Args fill amount / day / funding source.
  autopayMandate: (amount, dayLabel, method) =>
    `You authorize Keystone to electronically debit ${amount} from ${method} on ` +
    `the ${dayLabel} of each month for rent, beginning next cycle, until you ` +
    `cancel. You may cancel at least 3 business days before a scheduled payment ` +
    `by turning off Autopay in the app. We’ll keep a copy of this authorization.`,
  autopayCheckbox: 'I authorize this recurring payment.',
  autopayConfirmCta: 'Authorize & turn on',
  // One-time payment mandate. Args fill amount / method / period.
  oneTimeMandate: (amount, method, period) =>
    `By tapping Pay, you authorize Keystone to debit ${amount} from ${method} ` +
    `today for your ${period} rent. This is a one-time payment.`,
  // Reg E error-resolution short notice.
  regE:
    'For questions or errors about an electronic payment, contact Keystone within ' +
    '60 days of the transfer. See the Electronic Fund Transfer disclosure for your ' +
    'rights.',
  supportContact: 'support@keystone.example', // TODO: real support contact
};
