/**
 * Pull seguro: evita schema con @@ignore / sin @id (rompe prisma.company).
 *
 * Uso: pnpm prisma:pull
 */
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()
const schemaPath = path.join(root, 'prisma', 'schema.prisma')

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd: root, env: process.env })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

function loadDatabaseUrl() {
  const envPath = path.join(root, '.env')
  if (!fs.existsSync(envPath)) return process.env.DATABASE_URL
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#') || !t.startsWith('DATABASE_URL=')) continue
    let v = t.slice('DATABASE_URL='.length).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    return v
  }
  return process.env.DATABASE_URL
}

async function countPrimaryKeys(databaseUrl) {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT count(*)::int AS c
      FROM pg_index i
      JOIN pg_class c ON c.oid = i.indrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE i.indisprimary AND n.nspname = 'public' AND c.relname <> '_prisma_migrations'
    `)
    return rows[0].c
  } finally {
    await prisma.$disconnect()
  }
}

function assertSchemaHealthy(schema) {
  const ignoreCount = (schema.match(/@@ignore/g) || []).length
  const idCount = (schema.match(/@id\b/g) || []).length
  if (ignoreCount > 0) {
    throw new Error(
      `Pull dejó ${ignoreCount} @@ignore. La BD no tiene PKs visibles. Ejecuta: pnpm prisma:repair-db`,
    )
  }
  if (idCount < 5) {
    throw new Error(`Pull dejó pocos @id (${idCount}). Revisa la BD / pnpm prisma:repair-db`)
  }
}

async function main() {
  const databaseUrl = loadDatabaseUrl()
  if (!databaseUrl) {
    console.error('Falta DATABASE_URL en .env')
    process.exit(1)
  }

  const pkBefore = await countPrimaryKeys(databaseUrl)
  console.log(`PKs en BD: ${pkBefore}`)
  if (pkBefore < 11) {
    console.log('BD sin PKs suficientes → reparando con db push…')
    run('pnpm', ['exec', 'prisma', 'db', 'push', '--accept-data-loss', '--skip-generate'])
  }

  const backup = fs.readFileSync(schemaPath, 'utf8')
  const backupPath = path.join(root, 'prisma', 'schema.prisma.pre-pull.bak')
  fs.writeFileSync(backupPath, backup)

  try {
    run('pnpm', ['exec', 'prisma', 'db', 'pull'])
    const pulled = fs.readFileSync(schemaPath, 'utf8')
    assertSchemaHealthy(pulled)
    console.log('Pull OK (sin @@ignore). Generando client…')
    const gen = spawnSync('pnpm', ['exec', 'prisma', 'generate'], {
      stdio: 'inherit',
      shell: true,
      cwd: root,
      env: process.env,
    })
    if (gen.status !== 0) {
      console.warn(
        'Generate falló (en Windows suele ser EPERM si Nest tiene el DLL bloqueado). Schema del pull está OK.',
      )
      console.warn('Cierra el server (pnpm serve) y corre: pnpm prisma:generate')
      process.exit(gen.status ?? 1)
    }
    console.log('Listo. Backup previo: prisma/schema.prisma.pre-pull.bak')
  } catch (err) {
    console.error(err.message || err)
    console.error('Restaurando schema anterior…')
    fs.writeFileSync(schemaPath, backup)
    spawnSync('pnpm', ['exec', 'prisma', 'generate'], {
      stdio: 'inherit',
      shell: true,
      cwd: root,
      env: process.env,
    })
    process.exit(1)
  }
}

main()
