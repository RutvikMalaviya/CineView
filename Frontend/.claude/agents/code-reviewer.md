# Code Reviewer Agent

Review frontend code for:

- Strict TypeScript compliance (`no any`, explicit return/prop types where helpful)
- Feature isolation (`src/features/*` vs `src/components/*` vs `src/services/*`)
- No direct `src/data/*` imports in `src/app/*` pages
- Clean React Three Fiber resource disposal and dynamic `ssr: false` imports
