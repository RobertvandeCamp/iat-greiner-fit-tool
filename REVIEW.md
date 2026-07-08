# Review instructions

Review against the Codaeva coding principles. This is an AI-first React +
TypeScript frontend (Vite or Next.js, Supabase backend). Optimize for an agent
that must understand, modify, and **verify** a single component or hook in
isolation, with a fault staying **local**. Maximize signal per token.

Write findings in English. No emoji. Do not merge the PR and do not push changes;
review only.

## Principles (the frame)

1. Single Responsibility — one reason to change; small enough to fit in context.
2. Locality of Behaviour over premature DRY — Rule of Three before abstracting.
3. Explicit over implicit or clever — no magic, no multi-hop reasoning.
4. Types and schemas as contract — validate every I/O boundary; derive types.
5. Tests are the guardrail — every change ships a runnable check; never weaken a test.
6. Deterministic core, side effects at the edges — pure core, idempotent handlers.
7. Fail-fast with high-signal errors — no silent fallbacks; structured logging.
8. One consistent pattern per service type — converge on the canonical example.
9. Backward-compatible and reversible by default — additive, with rollback.
10. Navigable structure, descriptive names, intent where needed.

## What "Important" means here (fix before merge)

- **Correctness:** incorrect logic, unhandled edge cases, broken error/loading
  states, race conditions in async effects, stale closures over state; floating
  promises — an async call that is neither awaited nor explicitly handled
  silently drops its errors.
- **React safety:** side effects inside render or inside state updaters (updaters
  must be pure); unstable list keys or array-index keys; component definitions
  nested inside another component; unstable Context values that re-render the tree;
  timers/listeners/subscriptions not cleared on unmount; hooks called
  conditionally, in loops, or after an early return; incomplete dependency
  arrays in `useEffect`/`useMemo`/`useCallback`.
- **Contracts:** an external boundary (Supabase, API, form input) without schema
  validation (Zod), or types not derived from the schema. `any` or unsafe casts
  that silence the type checker at a boundary.
- **Security:** secrets or service-role keys exposed to the client; user input
  rendered without sanitization (XSS); open redirects from user-controlled URLs;
  trusting client-side checks for authorization; `Math.random()` for tokens or
  ids in a security context (use the platform CSPRNG). Mutations and inputs are
  validated server-side, not only in the UI.
- **Data scope:** queries not scoped to the caller's tenant/company; PII shown or
  logged where it should not be.
- **Reversibility:** a non-backward-compatible change to shared component/hook
  contracts without an additive, optional-prop path.
- **Consistency:** a second way to do something that already has a canonical
  component, hook, or pattern in the repo.

## Nit at most — cap at 5, then say "plus N similar items"

- Naming, file structure, docstrings.
- Duplication that is not genuine shared logic. Apply the Rule of Three before
  flagging duplication; prefer duplication over the wrong abstraction.
- Memoization opportunities where props/identities are stable.
- Components drifting well past ~200-400 lines that should be split.

## Accessibility (flag when user-facing)

- Anchors used as buttons (and vice versa); interactive elements with
  non-interactive ARIA roles; headings without meaningful content.
- Images without explicit dimensions and `alt`; inputs without correct
  `autocomplete`.

## Do not report

- Formatting, style, lint, and type errors — these are owned by the
  linter/formatter and CI, not the review.
- Generated files (e.g. generated DB types), lockfiles, and vendored code.
- Test code that intentionally violates production rules (fixtures, fakes).

## Always check

- A behavioral change ships with a runnable test; tests are the executable spec.
  A test must never be weakened to pass — the implementation is fixed instead.
- Expensive or frequent user input (search, resize, scroll) is debounced or
  throttled, and the work is torn down on unmount.
- No secret or privileged key reaches the client bundle.
- No stray `console.log` left in production code paths.

## Verification bar

Behavior claims need a `file:line` citation in the source, not an inference from
naming. Lead the summary with a tally (e.g. "2 important, 3 nits") and lead with
"no blocking issues" when that is true. After the first review, suppress new nits
and post Important findings only.
