// Mirror the bundled core package into the static /content folder so the
// "load from static folder" path serves the same data the app bundles.
// Runs automatically before dev/build.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const core = readFileSync(resolve(root, 'src/content/core.package.json'), 'utf8')
mkdirSync(resolve(root, 'public/content'), { recursive: true })
writeFileSync(resolve(root, 'public/content/core.json'), core)
console.log('synced src/content/core.package.json -> public/content/core.json')
