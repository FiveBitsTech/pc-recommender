/**
 * Repara PKs/FKs/uniques faltantes alineando la BD al schema.prisma
 * (causa típica de @@ignore en db pull).
 *
 * Uso: pnpm prisma:repair-db
 */
const { spawnSync } = require('node:child_process')

const r = spawnSync(
  'pnpm',
  ['exec', 'prisma', 'db', 'push', '--accept-data-loss'],
  { stdio: 'inherit', shell: true, cwd: process.cwd(), env: process.env },
)
process.exit(r.status ?? 1)
