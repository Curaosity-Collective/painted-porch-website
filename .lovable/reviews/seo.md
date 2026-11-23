# Technical SEO closeout

1 current failing finding was found; the existing brand icon is now linked, awaiting scanner verification.

| Finding | Level | State |
| --- | --- | --- |
| Site icon is missing | mid | failing |
| Home page is reachable | low | passing |
| AI assistants can see your site as markdown | low | passing |
| Search engines see your fully-rendered pages | low | passing |
| Crawler rules look good | low | passing |
| Sitemap looks good | low | passing |
| Page basics are set | low | passing |
| Home page search metadata is set | low | passing |
| Social preview basics are set | low | passing |

Fresh foundations review: 23 November 2026. Content, Search Console and extended metadata results are stale; their earlier passing results are not a fresh review. The two vague-description findings were already corrected. The ignored consulting-page suggestion remains untouched.

## Proposed metadata diff, not applied

Only search/sharing metadata would change, not headings, offer names, pricing or visible marketing copy. Existing titles not shown below remain unchanged. Each new description would also become its matching Open Graph and Twitter description. Approval would replace Envision's previously locked long metadata description with the shorter version below, retaining its investment.

```diff
Route: /
- title: Painted Porch Strategies | Build an Organization That Can Do Epic ShIFt
+ title: Painted Porch Strategies | Epic ShIFt
- description: Painted Porch Strategies partners with leaders on organizational change and strategic positioning, beginning at Phase Zero to prepare, align and architect what comes next.
+ description: Painted Porch Strategies partners with leaders on organizational change and strategic positioning, beginning at Phase Zero: Prepare and Align.

Route: /the-path
- description: Prepare, Align, Take Off, Create Habits: the four stages of change behind every Painted Porch engagement, and how Envision, Architect and Embody ShIFt partner on each.
+ description: Prepare, Align, Take Off, Create Habits: the four stages of the P.A.T.H., with Envision, Architect and Embody ShIFt.

Route: /envision-shift
- title: The Epic ShIFt Organizational Appraisal | Painted Porch Strategies
+ title: The Epic ShIFt Organizational Appraisal
- description: An interview-led organizational 360 built on six interviews, from executives to the frontline. Your P.A.T.H. Compass clarifies which change and direction make sense to pursue NOW and what in your organization needs reinforcement first, so you can lead with clarity and build with confidence. Investment: $24,000.
+ description: Six interviews, from executives to the frontline, inform your P.A.T.H. Compass and recommended next step. Investment: $24,000.

Route: /architect-shift
- description: An executive strategy & authorship intensive, a 90-day pillar-fortification sprint and a retrospective that decides your organization's next step. Starting at $90,000, in a weekly or a biweekly version.
+ description: An executive strategy & authorship intensive, a 90-day sprint and a retrospective to decide your next step. Starting at $90,000.

Route: /embody-shift
- description: Ongoing advisory while your organization designs and leads the change it envisioned and authored, reinforcing it as a continuous practice. $9,000–$18,000 per month, depending on advisory depth and need.
+ description: Ongoing advisory while your organization designs and leads its change, reinforcing it as a continuous practice. $9,000–$18,000 per month.

Route: /workshops
- description: Team workshops from Painted Porch Strategies: the P.A.T.H.™ to Lasting Change, organizational architecture, leadership development, and team building, in 1–3 day team engagements.
+ description: Team workshops on the P.A.T.H.™ to Lasting Change, organizational architecture, leadership development and team building. 1–3 day engagements.

Route: /leadership-labs
- description: Cohort-based Leadership Labs from Painted Porch Strategies: 6–12 week programs on Stractical Leadership, Leading Change, Stoicism at Work, AI+EI, and more.
+ description: Leadership Labs from Painted Porch Strategies: 6–12 week cohorts on Stractical Leadership, Leading Change, Stoicism at Work, and AI+EI.
```

## Outstanding infrastructure limitations

- Unknown clean URLs still return HTTP 200 through Lovable's Classic SPA fallback. React cannot set the original response status; no unsupported `_redirects` or fake status tag was added. The error page's `noindex, nofollow` was verified after rendering, and explicit noindex now takes priority over saved SEO overrides.
- `www.onthepaintedporch.com/the-path` returns HTTP 302 to the same path on the apex. DNS is external, but DNS records cannot choose HTTP status. A Cloudflare edge Redirect Rule, when traffic passes through Cloudflare, can enforce a permanent redirect preserving path/query; application JavaScript cannot turn Lovable's 302 into 301.
- Direct and Googlebot HTML for Envision and Architect contains only short noscript summaries plus unrelated homepage fallback text. Live GPTBot requests with `Accept: text/markdown` return the full rendered content, including every tested heading. These are separate delivery paths, not evidence that the static HTML is complete.