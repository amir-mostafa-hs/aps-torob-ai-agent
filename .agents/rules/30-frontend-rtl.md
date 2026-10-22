---
trigger: glob
globs: "*.tsx, *.ts, *.css"
description: Rules for Next.js frontend, Persian RTL, accessible interaction, and controlled Generative UI.
---

- Use Next.js, TypeScript, Tailwind and shadcn/ui according to the repository's chosen stable versions. React/Vite files are inspiration, not a requirement to preserve the old app.
- Persian is the only user-facing language in this version; RTL must be correct across layout, forms, cards, dialogs and navigation. Isolate English model/brand IDs and numbers where needed for bidirectional text.
- Use concise UI copy and progressive disclosure. Keep details, long explanations and advanced controls out of the default surface until useful or requested.
- Provide keyboard navigation, visible focus, semantic labels, adequate contrast, empty/loading/error states, reduced motion, and mobile behavior.
- Use reusable design tokens and components. Avoid multiple overlapping component libraries.
- Generative UI renders only known validated component types. Unknown schema type => safe fallback; never execute model output.
- Animations must be restrained, responsive and non-blocking. Prefer CSS where sufficient; check reduced-motion preference.
- Never hard-code Mock results into production components. Use the API client/domain interfaces and one explicit source mode configuration.
