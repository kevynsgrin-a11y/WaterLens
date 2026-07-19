export const meta = {
  name: 'v0-prompt-forge',
  description: 'Compose an exhaustive, paste-ready v0.dev prompt for a firm-grade frontend via a specialist fan-out',
  whenToUse: 'Invoked by the /v0-prompt-subagents command to generate a polished v0 prompt for a given product/concept.',
  phases: [
    { title: 'Draft sections' },
    { title: 'Synthesize' },
    { title: 'Polish' },
  ],
}

// -----------------------------------------------------------------------------
// Reusable v0-prompt generator. Fans out five specialist "prompt engineers"
// (art direction, global UI, page specs, data-viz, imagery+tech), then a
// synthesizer merges them and a final editor polishes into ONE paste-ready
// prompt. Grounds everything in the product context supplied via `args`.
//
// args (pass as a JSON object, or a bare string treated as the concept):
//   { concept?: string, context?: string, stack?: string }
//     concept — one/two-line description of the product to build
//     context — brand, exact color tokens, typography, page list, sample data,
//               trust/UX rules (assembled by the calling command from the repo
//               and/or the user); the richer this is, the better the output
//     stack   — optional target stack override (defaults to v0's Next + shadcn)
// -----------------------------------------------------------------------------

const a = args && typeof args === 'object' ? args : {}
const concept = typeof args === 'string' ? args : (a.concept || '')
const context = typeof args === 'string' ? '' : (a.context || '')
const stack =
  (typeof args === 'object' && a.stack) ||
  'Next.js (App Router) + React + TypeScript (strict) + Tailwind CSS + shadcn/ui + lucide-react icons + recharts for charts + framer-motion for restrained motion + next-themes (class strategy) + next/font.'

const BRIEF =
  [
    concept ? `PRODUCT / CONCEPT:\n${concept}` : '',
    context
      ? `PROJECT CONTEXT — ground the entire prompt in this (use exact color hexes, typography, page list, sample data, and rules verbatim where given; where something is missing, make excellent, cohesive, opinionated decisions and briefly state the assumption):\n${context}`
      : '',
    `TARGET STACK: ${stack}`,
  ]
    .filter(Boolean)
    .join('\n\n') ||
  'No explicit product context was provided. Infer a specific, plausible product from any available hints, invent a cohesive premium brand and design system (name, positioning, a full color scale, type pairing, page set, and realistic sample data), and STATE your assumptions explicitly so the user can adjust.'

const CALIBER =
  'The end artifact is a single prompt a user will paste verbatim into v0.dev to generate a frontend indistinguishable from an expensive top-tier web-development firm: pixel-precise, editorially confident, fully responsive, light AND dark mode, WCAG 2.1 AA, real content (zero lorem), high-resolution photography/imagery, and publication-grade charts/graphics. Restraint and provenance beat decoration.'

phase('Draft sections')

const SECTIONS = [
  {
    key: 'art-direction',
    brief: `Write the "## Art Direction & Visual Identity" section. Cover: mood & references (name specific best-in-class touchstones), the full color system mapped to semantic roles using exact hexes (from context if given, else define a complete scale), light AND dark theme treatment (re-map, never invert), typography system (families, weights, fluid scale, and a mono for all numeric/data values), iconography style, 2-3 signature visual motifs, high-resolution PHOTOGRAPHY & IMAGERY direction (subjects, one cohesive grade, duotone/overlay treatments, aspect ratios, and required alt-text pattern), and illustration/spot-graphic style. Opinionated and buildable.`,
  },
  {
    key: 'global-ui',
    brief: `Write the "## Global UI System, Layout & Interaction" section. Cover: container/grid/spacing rhythm (8pt), the shared shell (sticky nav + rich footer), core components styled to the system (buttons, inputs, cards, badges/pills, tooltips, tabs, tables, skeletons, empty states), MOTION & micro-interactions (restrained scroll-reveals, hover lifts, count-ups; honor prefers-reduced-motion), accessibility (WCAG 2.1 AA specifics: contrast, focus rings, keyboard operability, semantics, skip link), and performance (image strategy, code-splitting, fonts, Lighthouse targets). Concrete Tailwind-flavored direction.`,
  },
  {
    key: 'pages',
    brief: `Write the "## Page-by-Page Build Spec" section — the largest section. Enumerate every route/page implied by the context (or a sensible IA if none), and for EACH give section order, components, and the REAL copy + SAMPLE DATA to render so screens look real, not lorem. Make the primary conversion/"hero" page and the core value-delivery page exceptional. Reference the exact sample data from context where provided. Directive and buildable.`,
  },
  {
    key: 'dataviz',
    brief: `Write the "## Data Visualization & Graphics" section. Specify every chart/graphic and how to build it (recharts or lightweight inline SVG) to publication-grade, accessible standard: global chart rules (never encode meaning by color alone; direct labeling; no chartjunk; consistent numerals/units; accessible tooltips + data-table fallback; dark-mode aware; a calm categorical palette drawn from the brand ramps), then each specific chart/meter/stat-tile/graphic the product needs with exact color usage and states. If the product is not data-heavy, still specify stat tiles, KPI rows, and any comparison/graphic elements to a high bar. Mandate one shared number/unit formatting helper.`,
  },
  {
    key: 'media-tech',
    brief: `Write TWO closing sections. FIRST "## Imagery, Assets & Iconography": how to source and treat high-resolution imagery (subjects, one cohesive grade, brand overlays, product/asset shots, next/image usage, alt text, favicon + OG image direction) and spot-illustration style. SECOND "## Technical Requirements & Acceptance Criteria": target stack, responsiveness, light/dark, WCAG AA, semantic HTML + SEO metadata + JSON-LD, real-content mandate, and a crisp bulleted ACCEPTANCE CHECKLIST defining "indistinguishable from an expensive top-tier web-dev firm" (visual polish, typographic craft, motion, imagery quality, chart quality, trust/UX, accessibility, performance, cohesion). Directive.`,
  },
]

const drafts = await parallel(
  SECTIONS.map((s) => () =>
    agent(
      `${BRIEF}\n\n${CALIBER}\n\nYou are a principal product designer + prompt engineer authoring ONE section of that single paste-ready v0 prompt. Write ONLY your assigned section as clean, directive Markdown (start with the exact "## " heading named in the brief; use tight sub-structure). Be specific and opinionated; reference exact tokens, pages, and sample data from the context where given. No preamble, no sign-off — output only the section.\n\nYOUR SECTION:\n${s.brief}`,
      { label: `draft:${s.key}`, phase: 'Draft sections', effort: 'high' }
    )
  )
)

const sections = drafts.filter(Boolean)

phase('Synthesize')

const synthesized = await agent(
  `${BRIEF}\n\n${CALIBER}\n\nAssemble the FINAL single, paste-ready v0.dev prompt from the drafted sections below. Structure it as: (1) a strong opening directive to v0 (role, what to build, the caliber bar, the stack); (2) a one-paragraph brand & product brief; (3) the merged, de-duplicated sections in order — Art Direction & Visual Identity; Global UI System, Layout & Interaction; Data Visualization & Graphics; Page-by-Page Build Spec; Imagery, Assets & Iconography; Technical Requirements & Acceptance Criteria. Preserve ALL concrete detail (exact hexes, pages, sample data, rules, chart specs); remove redundancy; resolve conflicts into one consistent voice. Output ONLY the final prompt as Markdown — nothing before or after it.\n\n=== DRAFTED SECTIONS ===\n\n${sections.join('\n\n---\n\n')}`,
  { label: 'synthesize', phase: 'Synthesize', effort: 'high' }
)

phase('Polish')

const final = await agent(
  `You are the final editor. Refine the v0 prompt below into the definitive paste-ready version. It must read as ONE coherent, confident instruction to v0.dev; no redundancy, no contradictions, no meta-commentary about the prompt itself. Preserve every concrete spec (exact color hexes, typography, all pages, all sample data, trust/UX rules, and all chart specifications). End with a tight "Acceptance criteria" checklist for a build indistinguishable from an expensive top-tier web-dev firm. Reasonable length is expected — do not truncate detail.\n\nCRITICAL: Output ONLY the final prompt text (Markdown), nothing before or after it — it will be handed to the user verbatim to paste into v0.\n\n=== PROMPT TO POLISH ===\n\n${synthesized}`,
  { label: 'polish', phase: 'Polish', effort: 'high' }
)

return { prompt: final }
