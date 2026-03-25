import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const srcDir = path.join(root, 'src', 'assets')
const outDir = path.join(srcDir, 'optimized')

const files = [
  'alianza.png',
  'amanecer.png',
  'amigo.png',
  'Captura de pantalla 2026-03-24 214701.png',
  'carmesi.png',
  'dulce.png',
  'gala.png',
  'granlogro.png',
  'lavanda.png',
  'noche.png',
  'pequeña.png',
  'pequeñojardin.png',
  'quinteto.png',
  'rayito.png',
  'sulli.png',
  'valentiaeterna.png',
  'valletulipanes.png',
]

await mkdir(outDir, { recursive: true })

for (const file of files) {
  const input = path.join(srcDir, file)
  const output = path.join(outDir, `${path.parse(file).name}.webp`)

  await sharp(input)
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 6,
    })
    .toFile(output)

  console.log(`optimized: ${file} -> ${path.basename(output)}`)
}
