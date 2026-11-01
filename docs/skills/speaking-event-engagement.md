# Speaking Event Engagement

**Managed skill:** `speaking-event-engagement` v1.0
**Canonical source:** PPS managed skill library
**Repository role:** Governs how this website participates in the attendee continuation experience around an approved PPS speaking engagement.

## When to Use It

Load `speaking-event-engagement` **after** the speaking opportunity, audience, speaker, and core session materials are approved, and before creating or changing any of the following:

- event-specific landing pages or same-route attendee states;
- keynote, workshop, webinar, or conference QR/short-URL bridges;
- attendee routing, resource, directional-guide, qualification, inquiry, or booking flows;
- event-specific forms, consent language, result delivery, CRM/provider projection, or booking handoff;
- pre-event, in-room, transactional-result, or post-event attendee communications that point to this website;
- event lifecycle controls, including preview testing, closure, reconciliation, retention/disposition, and learning review.

Use it for a change to an existing event route as well as for a new event experience. The skill is especially important whenever the site captures personal or strategic attendee information, invokes a provider/CRM action, or reveals a booking/payment route.

## When Not to Use It

Do not use this skill for:

- topic discovery, event selection, pricing recommendation, proposal, or timed-outline work; use `speaking-topic-proposal-builder`;
- deck, speaker script, curriculum, facilitator, or participant-resource production; use `porch-speaking-workshops`;
- broad ongoing nurture unrelated to the finite event asset set; use `porch-email-sequences` and the relevant campaign workflow;
- new public offering or pricing decisions; verify those through current PPS authority and leadership decisions.

## Required Companion Skills

| Work in This Repository | Required / Recommended Skill |
|---|---|
| Attendee-facing language, CTA, terminology, and trademarks | `porch-voice-standards` |
| Event visual system, image use, color, and accessibility | `porch-visual-brand` |
| Landing-page architecture, website accessibility, and public-page design | `porch-web-design` |
| Offer invitation and qualification language | `porch-offerings-catalog` |
| Approved audience promise and commercial context | `speaking-topic-proposal-builder` |
| Approved session deck, script, and participant materials | `porch-speaking-workshops` |
| Ongoing sequence after finite event communications | `porch-email-sequences` |

Load the attributed author skill for speaker-authored assets. Use `porch-icp-ecosystem` or `porch-competitive-differentiation` when the event brief calls for those lenses.

## Website Implementation Expectations

Before implementation begins, the pull request or linked work item must identify the approved event-engagement brief, state map, asset ledger, route, event source/attribution, owner, and exact closure behavior.

Where the event captures information or invokes an external provider, implementation must preserve these controls:

1. **Value before capture.** A resource or guide returns useful direction before optional contact information is requested.
2. **One primary action per state.** Do not stack competing CTAs, forms, booking widgets, or commercial detail in the same decision moment.
3. **Contextual routing, not forced progression.** Attendees choose a starting point based on their situation; no event flow implies an offering ladder or mandatory sequence.
4. **Consent by purpose.** Result delivery, operational processing, and optional marketing are separate decisions with versioned wording and recorded state.
5. **Source record before projection.** Preserve the approved structured context before a CRM, provider, booking, or payment projection occurs. Restrict outbound fields to an explicit allowlist.
6. **Protected handoff.** Do not expose strategic responses, record IDs, session values, or booking tokens in URLs, browser storage, analytics, error telemetry, or uncontrolled provider fields.
7. **Event-specific configuration.** A prior event’s route, access method, investment, score, provider configuration, or closure rule is never a default for a new event.
8. **Bounded lifecycle.** Endpoint behavior must enforce the approved closure timestamp; closeout must reconcile applicable event, provider, and exception records.

## Pull Request Checklist

Include the following in a PR that implements or changes an event engagement:

- [ ] Link to the approved Event Engagement Brief and named deck/script versions.
- [ ] State map showing entry condition, one primary CTA, exit, and prohibited premature action for each state.
- [ ] Asset ledger IDs/versions for page, form, QR/take-home, and attendee communications in scope.
- [ ] Current-source verification for offering claims, qualification conditions, and investment language.
- [ ] Data/consent, duplicate, retention/disposition, human-follow-up, and provider-projection rules when attendee information is captured.
- [ ] Preview evidence covering routing, validation/error states, mobile QR, accessibility, provider/booking behavior, and closure as applicable.
- [ ] Separate publication and send approvals; a live page does not authorize a send.
- [ ] Closeout and learning plan with owners.

## Repository Change Boundary

This document records how the managed skill applies to this codebase. It does not authorize a public page, form, provider configuration, data schema, payment route, email send, or production release on its own. Any event-specific content and configuration must be approved in the event brief and released through the applicable technical and communications gates.
