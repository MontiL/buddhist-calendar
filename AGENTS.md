<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Git Workflow

**CRITICAL**: After any code changes, ALWAYS follow this sequence automatically without waiting to be asked:

1. **Check**: `pnpm check` (runs `tsc --noEmit`)
2. **Commit**: Use Conventional Commits format
   - Format: `<type>(<scope>): <subject>`
   - Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `perf`, `revert`, `build`, `test`
   - Example: `feat(calendar): add color theme toggle`
<!-- END:nextjs-agent-rules -->
