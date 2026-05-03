# Fallow reports (`nextjs-app`)

JSON snapshots from [fallow](https://docs.fallow.tools) scoped to the `nextjs-app` workspace (`--workspace nextjs-app`, repo root as `--root`).

## Scripts

From `nextjs-app/`:

- `pnpm run fallow:dead-code` — full dead-code JSON
- `pnpm run fallow:dead-code:unused` — unused files/exports/types/members
- `pnpm run fallow:dead-code:deps` — dependency issues
- `pnpm run fallow:dead-code:cycles` — circular dependencies only
- `pnpm run fallow:dead-code:boundaries` — boundary violations only
- `pnpm run fallow:dupes` — duplication
- `pnpm run fallow:health` — complexity / health score / hotspots / targets
- `pnpm run fallow:audit` — changed-file audit (uses git base)

`pnpm dlx` needs network on first run to fetch the CLI.

## Files

- `*.json` — baseline runs
- `*.after.json` — post-cleanup comparison (when present)
