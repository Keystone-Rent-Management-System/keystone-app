// VILLA_5_TENANTS — one coherent demo family for the tenant onboarding
// journey.
//
// Everything in here describes ONE story: Maya Patel lets a five-bedroom
// villa room by room; Amina Brooks is applying for Bedroom 3 alongside
// four sitting roommates. The existing fixtures could not tell that story
// — screening described unrelated applicants in a different unit, the
// tenant's agreement was already accepted, and "onboarding" was a
// post-move checklist for payment methods and condition photos. A demo
// that contradicts itself cannot validate a journey.
//
// PER-ROOM LIABILITY IS READ FROM THE AGREEMENT, never assumed. Amina is
// liable for her own $1,000 share, not the villa's $5,000 — that fact
// belongs to the agreement document, so it lives on the agreement object
// here rather than being inferred from the landlord or property.

export const ONBOARDING_STATES = [
  'INVITE_RECEIVED',
  'ABOUT_YOU_REQUIRED',
  'IDENTITY_REQUIRED',
  'SCREENING_CONSENT_REQUIRED',
  'SCREENING_IN_PROGRESS',
  'SCREENING_NEEDS_INFORMATION',
  'LANDLORD_REVIEW',
  'AGREEMENT_READY',
  'AGREEMENT_SIGNATURE_PENDING',
  'ONBOARDED',
  'ADVERSE_ACTION',
];

export const VILLA = {
  inviteCode: 'KS-VILLA-3',
  property: 'Cedar Grove Villa',
  address: '412 Cedar Grove Ln, Austin, TX',
  space: 'Bedroom 3',
  landlord: 'Maya Patel',
  applicant: 'Amina Brooks',
  rentShare: 1000,
  villaRent: 5000,
  deposit: 1000,
  leaseStart: '2026-09-01',
  leaseEnd: '2027-08-31',
  bedrooms: 5,
  roommates: [
    {id: 'r1', name: 'Priya Raman', space: 'Bedroom 1', since: '2025-09-01'},
    {id: 'r2', name: 'Tomas Vidal', space: 'Bedroom 2', since: '2025-09-01'},
    {id: 'r4', name: 'Grace Okafor', space: 'Bedroom 4', since: '2026-01-15'},
    {id: 'r5', name: 'Daniel Levy', space: 'Bedroom 5', since: '2026-03-01'},
  ],
};

// The invite as the claim screen consumes it.
export const villaInvite = {
  token: VILLA.inviteCode,
  property: VILLA.property,
  unit: VILLA.space,
  address: VILLA.address,
  landlord: VILLA.landlord,
  tenantName: VILLA.applicant,
  rent: VILLA.rentShare,
};

// The agreement Amina is asked to sign. `liability` is a property OF THE
// AGREEMENT — the UI must read it here and never derive it from a
// landlord or property setting.
export const villaAgreement = {
  agreementId: 'agr-villa-b3',
  property: VILLA.property,
  address: VILLA.address,
  space: VILLA.space,
  landlord: VILLA.landlord,
  monthlyRent: VILLA.rentShare,
  deposit: VILLA.deposit,
  startDate: VILLA.leaseStart,
  endDate: VILLA.leaseEnd,
  term: '12 months',
  liability: {
    type: 'PER_ROOM',
    // Stated in the agreement, quoted verbatim by the review screen.
    summary:
      'You are responsible for your own rent of $1,000 per month. You are not ' +
      'responsible for the rent of the other bedrooms in this villa.',
    villaRent: VILLA.villaRent,
    yourShare: VILLA.rentShare,
  },
};

// ── State machine ──────────────────────────────────────────────────
//
// Five checklist steps, each 'done' | 'active' | 'waiting' | 'locked' |
// 'attention'. The copy is deliberate:
//
//  · Screening never reports a RESULT to the applicant. When it finishes
//    the tenant is told it is complete and with the landlord — never
//    "passed", "approved" or "strong applicant". A consumer report
//    informs the landlord's decision; it does not make it.
//  · The agreement stays LOCKED until the landlord explicitly approves.
//    "Background check complete" must never imply "approved".
//  · No manual refresh. The tenant is told they can close the app.

const step = (key, label, state, sub) => ({key, label, state, sub});

const CHECKLIST = {
  INVITE_RECEIVED: [
    step('about', 'About you', 'active', 'Tell us who you are'),
    step('screening', 'Background check', 'locked'),
    step('review', 'Landlord review', 'locked'),
    step('agreement', 'Agreement', 'locked', 'Locked until approved'),
    step('movein', 'Move-in ready', 'locked'),
  ],
  ABOUT_YOU_REQUIRED: [
    step('about', 'About you', 'active', 'Tell us who you are'),
    step('screening', 'Background check', 'locked'),
    step('review', 'Landlord review', 'locked'),
    step('agreement', 'Agreement', 'locked', 'Locked until approved'),
    step('movein', 'Move-in ready', 'locked'),
  ],
  IDENTITY_REQUIRED: [
    step('about', 'About you', 'done', 'Complete'),
    step('screening', 'Background check', 'active', 'Confirm it’s you first'),
    step('review', 'Landlord review', 'locked'),
    step('agreement', 'Agreement', 'locked', 'Locked until approved'),
    step('movein', 'Move-in ready', 'locked'),
  ],
  SCREENING_CONSENT_REQUIRED: [
    step('about', 'About you', 'done', 'Complete'),
    step('screening', 'Background check', 'active', 'Your permission is needed'),
    step('review', 'Landlord review', 'locked'),
    step('agreement', 'Agreement', 'locked', 'Locked until approved'),
    step('movein', 'Move-in ready', 'locked'),
  ],
  SCREENING_IN_PROGRESS: [
    step('about', 'About you', 'done', 'Complete'),
    step('screening', 'Background check', 'waiting', 'In progress'),
    step('review', 'Landlord review', 'locked', 'Waiting for review'),
    step('agreement', 'Agreement', 'locked', 'Locked until approved'),
    step('movein', 'Move-in ready', 'locked'),
  ],
  SCREENING_NEEDS_INFORMATION: [
    step('about', 'About you', 'done', 'Complete'),
    step('screening', 'Background check', 'attention', 'We need one more thing'),
    step('review', 'Landlord review', 'locked', 'Waiting for review'),
    step('agreement', 'Agreement', 'locked', 'Locked until approved'),
    step('movein', 'Move-in ready', 'locked'),
  ],
  LANDLORD_REVIEW: [
    step('about', 'About you', 'done', 'Complete'),
    step('screening', 'Background check', 'done', 'Complete'),
    step('review', 'Landlord review', 'waiting', 'Waiting for review'),
    step('agreement', 'Agreement', 'locked', 'Locked until approved'),
    step('movein', 'Move-in ready', 'locked'),
  ],
  AGREEMENT_READY: [
    step('about', 'About you', 'done', 'Complete'),
    step('screening', 'Background check', 'done', 'Complete'),
    step('review', 'Landlord review', 'done', 'Approved'),
    step('agreement', 'Agreement', 'active', 'Ready to review'),
    step('movein', 'Move-in ready', 'locked'),
  ],
  AGREEMENT_SIGNATURE_PENDING: [
    step('about', 'About you', 'done', 'Complete'),
    step('screening', 'Background check', 'done', 'Complete'),
    step('review', 'Landlord review', 'done', 'Approved'),
    step('agreement', 'Agreement', 'waiting', 'Sending your signature'),
    step('movein', 'Move-in ready', 'locked'),
  ],
  ONBOARDED: [
    step('about', 'About you', 'done', 'Complete'),
    step('screening', 'Background check', 'done', 'Complete'),
    step('review', 'Landlord review', 'done', 'Approved'),
    step('agreement', 'Agreement', 'done', 'Signed'),
    step('movein', 'Move-in ready', 'done', 'All set'),
  ],
  ADVERSE_ACTION: [
    step('about', 'About you', 'done', 'Complete'),
    step('screening', 'Background check', 'done', 'Complete'),
    step('review', 'Landlord review', 'attention', 'Decision made'),
    step('agreement', 'Agreement', 'locked'),
    step('movein', 'Move-in ready', 'locked'),
  ],
};

// Headline + explanation per state. `waitingMessage` replaces a refresh
// affordance — the tenant is told they can leave.
const HEADLINE = {
  INVITE_RECEIVED: {
    title: 'Let’s get you into Bedroom 3',
    body: `${VILLA.landlord} invited you to ${VILLA.property}. Four steps and you’re in.`,
  },
  ABOUT_YOU_REQUIRED: {
    title: 'Tell us about you',
    body: 'A few details so your landlord knows who’s applying.',
  },
  IDENTITY_REQUIRED: {
    title: 'Confirm it’s you',
    body:
      'The background check needs a photo of your ID and your SSN. ' +
      'Nothing runs until you review and agree on the next step.',
  },
  SCREENING_CONSENT_REQUIRED: {
    title: 'Your permission is needed',
    body: 'A background check is part of applying. You decide whether it runs.',
  },
  SCREENING_IN_PROGRESS: {
    title: 'Your background check is running',
    body: 'This usually takes a few minutes, sometimes longer.',
    waiting: true,
  },
  SCREENING_NEEDS_INFORMATION: {
    title: 'We need one more thing',
    body: 'Your background check couldn’t be completed with what we have.',
  },
  LANDLORD_REVIEW: {
    // Never "passed" / "approved" / "strong applicant".
    title: 'Screening complete — your landlord is reviewing it',
    body: `${VILLA.landlord} has your application and will decide next. We’ll let you know either way.`,
    waiting: true,
  },
  AGREEMENT_READY: {
    title: 'You’re approved — review your agreement',
    body: `${VILLA.landlord} approved your application. Read the terms, then sign.`,
  },
  AGREEMENT_SIGNATURE_PENDING: {
    title: 'Sending your signature',
    body: 'One moment while we record it.',
    waiting: true,
  },
  ONBOARDED: {
    title: 'Welcome to Cedar Grove Villa',
    body: 'Bedroom 3 is yours. Your home is ready in the app.',
  },
  ADVERSE_ACTION: {
    title: 'Your landlord didn’t move forward',
    body:
      'This decision was based in part on a consumer report. You have the right to a free copy ' +
      'of that report and to dispute anything in it that is wrong.',
  },
};

/**
 * The onboarding rollup for a demo state — the shape the UI reads.
 * Mirrors what BE would return from GET /tenants/onboarding.
 */
export const villaOnboarding = (state = 'INVITE_RECEIVED') => {
  const key = ONBOARDING_STATES.includes(state) ? state : 'INVITE_RECEIVED';
  const headline = HEADLINE[key];
  return {
    state: key,
    demo: true,
    invite: villaInvite,
    applicant: VILLA.applicant,
    property: VILLA.property,
    space: VILLA.space,
    landlord: VILLA.landlord,
    rentShare: VILLA.rentShare,
    roommates: VILLA.roommates,
    steps: CHECKLIST[key],
    title: headline.title,
    body: headline.body,
    waiting: !!headline.waiting,
    // The agreement is only ever present once the landlord has approved.
    // Absence is the lock: a screen cannot accidentally render a signable
    // agreement for an applicant who has not been approved.
    agreement:
      key === 'AGREEMENT_READY' ||
      key === 'AGREEMENT_SIGNATURE_PENDING' ||
      key === 'ONBOARDED'
        ? villaAgreement
        : null,
    complete: key === 'ONBOARDED',
  };
};

export default villaOnboarding;
