---
description: Generate a paste-ready v0.dev prompt for a polished, firm-grade frontend using a multi-agent (subagent) workflow, auto-grounded in this repo's design system and data.
argument-hint: [product/concept, or leave blank to use the current repo]
---

You are running the **/v0-prompt-subagents** command. Produce a single, exhaustive, paste-ready prompt the user can drop into v0.dev to generate a frontend **indistinguishable from an expensive top-tier web-development firm** — high-resolution imagery, publication-grade charts/graphics, full responsiveness, light/dark, WCAG AA, real content. Do this with a multi-agent workflow (this instruction is your explicit authorization to call the **Workflow** tool).

## 1. Determine the target
- If `$ARGUMENTS` is non-empty, treat it as the product/concept to build a frontend for.
- Also **ground the prompt in the current repository** whenever possible. Quickly inspect for an existing design system and domain data, e.g.:
  - Tailwind/theme tokens (`tailwind.config.*`, CSS variables, `globals.css`) → pull the **exact color hexes**, typography, radii, shadows.
  - Component/design conventions (`components/**`, any `DESIGN.md`).
  - Real domain/sample data (`lib/**`, `**/data*.{ts,js,json}`, seed/migration files) → capture concrete records to render (so screens aren't lorem).
  - Page/route inventory (`app/**`, `pages/**`) and product positioning (`README*`, brief/spec docs).
- If there are **no** arguments and the repo yields no discernible product, ask the user ONE concise question for the product/brand/concept, then proceed.

## 2. Assemble a CONTEXT block
Compose a rich, factual context string covering (only what you can substantiate): product name + one-line positioning; audience; exact color token scales; typography; the page/route list; concrete sample data to render; and any trust/UX/brand rules. Prefer verbatim tokens and data from the repo. Do not invent facts that contradict the codebase; where something is genuinely absent, let the workflow's specialists make cohesive decisions and note assumptions.

## 3. Run the multi-agent workflow
Invoke the **Workflow** tool with the saved reusable workflow:
- `name: "v0-prompt-forge"` (defined in `.claude/workflows/v0-prompt-forge.js`; if name resolution fails, fall back to `scriptPath: ".claude/workflows/v0-prompt-forge.js"`).
- `args`: a JSON object `{ "concept": "<one/two-line concept>", "context": "<the CONTEXT block from step 2>" }`. Optionally add `"stack"` to override the default v0 stack.

The workflow fans out five specialist prompt-engineers (art direction · global UI/interaction · page-by-page spec · data-viz/graphics · imagery+tech/acceptance), then synthesizes and polishes them into one prompt. It runs in the background and returns `{ prompt }` on completion.

## 4. Deliver the result verbatim
When the workflow completes:
- Extract the final `prompt` string (if the notification is truncated, read the run's `journal.jsonl` and take the final/longest `result`).
- Save it to a file (e.g. the scratchpad dir, or `./v0-prompt.md`) and send it with **SendUserFile** for a clean copy.
- Also paste the **entire prompt verbatim** into the reply inside a fenced code block (use a fence that won't collide with inline backticks).
- Close with a short "how to use" note and offer two variants: a **lite** version (for v0's faster model / tighter context) and a **live-API** version (consume a real endpoint instead of embedded sample data).

Keep your own commentary minimal — the prompt itself is the deliverable.
