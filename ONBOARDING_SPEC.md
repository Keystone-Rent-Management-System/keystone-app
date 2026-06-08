# Tenant Onboarding / Claim — Spec (Phase 5)

Keystone tenants are **provisioned, not self-signup**: the landlord creates the
tenant + lease (agreement = `PENDING`) and the tenant *claims* an account that
already exists. Onboarding is therefore an **invite → claim → activate** flow.

## CEO decisions (2026-06-07)
- **KYC is just-in-time** — collected at "Add bank" (§T12), not at claim.
- **Minimum to finish onboarding = claim + verify contact + accept lease.**
  Payment, KYC, autopay, credit, and the move-in checklist are post-claim nudges
  on a Home "Finish setting up" card.
- **Provisioned-only** — reuse the registration screens (OTP / password /
  profile) inside the claim flow; remove open tenant self-signup. (Landlord
  self-registration stays — landlords are the buyer.)

## The flow
| # | Step | Source |
|---|------|--------|
| 0 | Invite (SMS + email, claim token) | BE / landlord |
| 1 | Claim landing (token → property/landlord) | **new** `ClaimLanding` |
| 2 | Verify contact (OTP) | reuse `RegistrationVerification` |
| 3 | Set password | reuse `RegistrationPassword` |
| 4 | Confirm profile | reuse `RegistrationProfile` |
| 5 | Identity / KYC (JIT at Add bank) | **new** + Dwolla (§T12) |
| 6 | Review & accept lease | reuse accept-lease |
| 7 | Add payment (Dwolla ToS + Plaid) + optional autopay/credit | reuse + Plaid |
| 8 | Move-in checklist | reuse Checklist |
| 9 | Land on Home + "Finish setting up" card | **new** |

## The "ask your landlord" supply loop
A renter with **no invite** (their landlord isn't on Keystone) isn't a dead end —
they can share a prefilled message inviting the landlord to add them. A renter
who wants Keystone pulls their landlord onto the platform. v1 uses the OS share
sheet (no BE). Future: capture the referral lead for sales follow-up (§T16).

## PR breakdown
- **5a — Claim front door + supply loop** *(this PR)*: `ClaimLanding` (invite +
  no-invite/"ask your landlord" share + invite-code entry); Welcome routes the
  tenant door to claim; mock invite; BE_ASKS §T16. The OTP/password/profile
  account-setup steps are reuse, fully wired when BE ships the claim token (§T16);
  for now the landing routes to sign-in.
- **5b — Rent-ready**: JIT KYC capture + Plaid bank-link + accept-lease stitched
  in + payment (autopay/credit optional).
- **5c — Guided first-run**: Home "Finish setting up" card resuming skipped steps
  + onboarding-complete state.

See `BE_ASKS_MOBILE.md` §T16 (invite/claim) and §T12 (KYC) for the BE contracts.
