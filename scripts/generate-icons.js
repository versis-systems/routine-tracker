/**
 * Simple icon generator using Node.js canvas
 * Run: node scripts/generate-icons.js
 *
 * Requires: npm install canvas
 * Or use any image editor to create icons manually at:
 * - public/icons/icon-192.png (192x192)
 * - public/icons/icon-512.png (512x512)
 */

const fs = require('fs')
const path = require('path')

// Create placeholder SVG icons
const sizes = [192, 512]

const svgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0a0a"/>
  <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" rx="${size * 0.15}" fill="#6366f1" opacity="0.15"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="${size * 0.45}" font-family="system-ui">✨</text>
</svg>`

const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

sizes.forEach((size) => {
  const svgPath = path.join(iconsDir, `icon-${size}.svg`)
  fs.writeFileSync(svgPath, svgIcon(size))
  console.log(`Created ${svgPath}`)
})

console.log('SVG icons created! For PNG versions, convert them using:')
console.log('- Online: https://svgtopng.com')
console.log('- CLI: npx sharp-cli -i public/icons/icon-192.svg -o public/icons/icon-192.png')
