---
name: PPS offerings register
description: PPS Ops Hub (pps-ops-hub) owns the canonical offerings catalog via offerings_unified (topics × deliveries). PPS site path_finder_offerings is a one-way mirror. The Drive Offerings Master Register is historical evidence only (PPS-DEC-0047).
type: feature
---

**Canonical:** PPS Ops Hub Supabase `offerings_unified` (`topics × deliveries`). The repository register file lives in `Curaosity-Collective/pps-ops-hub`. The admin editing surface is the PPS Op Platform project at `https://paintedporch-ops.lovable.app`; older docs call it the "Blue Door project."

**Mirror:** PPS site `path_finder_offerings`. One-way sync from the PPS Ops Hub catalog.

**Public product note:** The public Blue Door sale is retired; its successor is the **Epic ShIFt Organizational Appraisal** (PPS-DEC-0017/0018). It is unrelated to this register. The Drive Offerings Master Register is frozen historical evidence and must not be used for current offer names, routing, or pricing (PPS-DEC-0047).

**Why:** The PPS Ops Hub schema (path_stage, pillar_alignment, pricing JSONB, icp_routing, etc.) is built for diagnostic-driven recommendations. The PPS site needs only the routing/display slice (name, blurb, URL, anchor, tier, eligibility). Two apps, two databases, one current register.

**Topic + delivery model:** One *topic* (e.g. "AI EI Oh") → N *deliveries* (speaking / workshop / lab / keynote / course) with their own URL, price, anchor, and audience. Avoids duplicated blurbs and price drift.

**Sync key:** `offering_key = ${topic.slug}--${delivery.format}` (deterministic, stable across runs).

**Current state:** The live `offerings_unified` catalog is the operational state. The repository register file carries the mapping and governance record. The two are current in their own layer; do not create a third current register.

**Edit rule:** Canonical fields are edited in the PPS Ops Hub only. Routing fields remain editable in the website admin.

**Do NOT:** Build cross-project Supabase reads (fragile RLS, separate auth contexts, brittle env). Always go through the sync. Do not use the Drive OMR for current specs.

**Naming/code:** File paths and code identifiers retain "bluedoor" / "BlueDoor" prefixes (e.g. `src/integrations/bluedoor/`, `useBlueDoorRecommendations`, `BlueDoorEditLink`). Only **user-visible copy** uses current names. Renaming identifiers is out of scope.
