# Stage 08, Unit 01: Terms Conditions And Privacy Policy

Create the formal legal-facing documents and acceptance surfaces needed before the MVP is shared beyond internal/test users.

## Product Intent

The MVP can warn players during gameplay that their play is public, but public launch needs explicit Terms and Conditions and Privacy Policy documents that explain what data is collected, how gameplay is published, and what users agree to when they participate.

## Scope

- Draft a Terms and Conditions page for MVP gameplay.
- Draft a Privacy Policy page for MVP account, player, gameplay, and analytics data.
- Link both documents from account creation, player creation, and the `Before we begin` gate.
- Replace provisional MVP gameplay-term wording with references to the published documents.
- Record version/date metadata for accepted terms.

## Out Of Scope

- Legal review by counsel.
- International compliance beyond clear MVP disclosure.
- Payment, subscription, or commerce terms.
- Child-directed product policy beyond the existing minimum-age validation.

## Acceptance Criteria

- Terms and Conditions page exists and is reachable in-app.
- Privacy Policy page exists and is reachable in-app.
- The `Before we begin` checkbox references the published terms clearly.
- Player acceptance stores enough version/date information to know which terms were accepted.
- Public gameplay publication is disclosed in both the in-app gate and the formal documents.

## Data And State Notes

- Store accepted terms version separately from the daily gameplay acknowledgement when formal terms exist.
- Keep the daily public-gameplay acknowledgement even after formal terms exist, because it is contextual to each day's session.

## Verification

- Test links render without auth-only dead ends.
- Test the acceptance checkbox copy references the correct document URLs.
- Test stored acceptance metadata includes the active terms version.

## Manual Steps

- Have a human review the legal copy before public launch.
- Confirm whether additional jurisdiction-specific language is required before inviting external users.
