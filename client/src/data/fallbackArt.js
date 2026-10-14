// Built-in illustrations, one per heritage subject. They are shown automatically when a photograph
// cannot load (offline, blocked network, expired link), so a page never has an empty hole in it.
// They are plain SVG strings turned into data: URIs, so no files or network are needed.

const INK = '#3a2a1e'
const SKY_TOP = '#f1e2b9'
const SKY_BOT = '#e3a982'

const shell = (inner, sun = true) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY_TOP}"/><stop offset="1" stop-color="${SKY_BOT}"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#g)"/>${sun ? '<circle cx="320" cy="78" r="30" fill="#f8efd2" opacity=".85"/>' : ''}${inner}</svg>`

const ground = (y = 232, color = INK) => `<rect x="0" y="${y}" width="400" height="${300 - y}" fill="${color}"/>`
const arch = (x, y, w, h, c = '#e9d6a5') => `<path d="M${x} ${y + h}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + h}z" fill="${c}"/>`

const SCENES = {
  palace: () => shell(`
    <rect x="48" y="160" width="84" height="76" fill="${INK}" opacity=".88"/><rect x="268" y="160" width="84" height="76" fill="${INK}" opacity=".88"/>
    <rect x="120" y="120" width="160" height="116" fill="${INK}"/>
    <path d="M150 120a50 50 0 0 1 100 0z" fill="#5b4330"/><rect x="196" y="58" width="8" height="26" fill="${INK}"/>
    <circle cx="200" cy="54" r="6" fill="${INK}"/>
    <rect x="128" y="106" width="22" height="14" fill="${INK}"/><path d="M128 106a11 11 0 0 1 22 0z" fill="#5b4330"/>
    <rect x="250" y="106" width="22" height="14" fill="${INK}"/><path d="M250 106a11 11 0 0 1 22 0z" fill="#5b4330"/>
    ${[142, 176, 210, 244].map((x) => arch(x, 160, 22, 40)).join('')}${arch(188, 196, 24, 40, '#c99a5b')}
    ${[62, 94].map((x) => arch(x, 184, 18, 30)).join('')}${[288, 320].map((x) => arch(x, 184, 18, 30)).join('')}
    ${ground(236)}`),

  fort: () => shell(`
    <rect x="0" y="170" width="400" height="66" fill="${INK}" opacity=".9"/>
    ${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 30 + 4}" y="156" width="18" height="16" fill="${INK}" opacity=".9"/>`).join('')}
    <rect x="130" y="96" width="140" height="140" fill="${INK}"/>
    ${[130, 158, 186, 214, 242].map((x) => `<rect x="${x}" y="82" width="16" height="16" fill="${INK}"/>`).join('')}
    <path d="M166 236V176a34 34 0 0 1 68 0v60z" fill="#e9d6a5"/><path d="M178 236V180a22 22 0 0 1 44 0v56z" fill="#6a4a30"/>
    <rect x="30" y="120" width="40" height="116" fill="${INK}"/><rect x="330" y="120" width="40" height="116" fill="${INK}"/>
    ${[30, 46, 62].map((x) => `<rect x="${x}" y="108" width="8" height="12" fill="${INK}"/>`).join('')}${[330, 346, 362].map((x) => `<rect x="${x}" y="108" width="8" height="12" fill="${INK}"/>`).join('')}
    ${ground(236)}`),

  stepwell: () => shell(`
    ${ground(120, '#6a4a30')}
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${40 + i * 24}" y="${120 + i * 22}" width="${320 - i * 48}" height="${22}" fill="${i % 2 ? '#8b6643' : '#a47c52'}" stroke="${INK}" stroke-width="1.5"/>`).join('')}
    <rect x="184" y="274" width="32" height="26" fill="#2c4a52"/><path d="M184 280q8 -5 16 0t16 0" stroke="#7fb0b8" fill="none" stroke-width="2"/>
    <rect x="30" y="86" width="14" height="40" fill="${INK}"/><rect x="356" y="86" width="14" height="40" fill="${INK}"/>`, false),

  temple: () => shell(`
    <rect x="110" y="196" width="180" height="40" fill="${INK}"/>
    <rect x="140" y="150" width="120" height="48" fill="#5b4330"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${150 + i * 6} ${150 - i * 14}h${100 - i * 12}l-4 -14h-${92 - i * 12}z" fill="${i % 2 ? INK : '#5b4330'}"/>`).join('')}
    <rect x="198" y="38" width="4" height="26" fill="${INK}"/><path d="M202 40l22 6-22 6z" fill="#b8431f"/>
    ${arch(184, 170, 32, 66, '#e9d6a5')}
    <rect x="96" y="228" width="208" height="8" fill="#8b6643"/><rect x="84" y="236" width="232" height="8" fill="#a47c52"/>
    ${ground(244)}`),

  village: () => shell(`
    <path d="M0 220q100 -50 200 -10t200 -20v110H0z" fill="#7b8650"/>
    ${[[40, 190], [150, 200], [250, 186], [330, 204]].map(([x, y]) => `<rect x="${x}" y="${y}" width="56" height="40" fill="#d8bd8e"/><path d="M${x - 6} ${y}L${x + 28} ${y - 30}L${x + 62} ${y}z" fill="#8c4a30"/><rect x="${x + 22}" y="${y + 16}" width="12" height="24" fill="${INK}"/>`).join('')}
    <rect x="112" y="150" width="8" height="60" fill="#5b4330"/><circle cx="116" cy="138" r="26" fill="#56633a"/><circle cx="100" cy="150" r="16" fill="#657342"/>
    ${ground(246, '#5d6b3a')}`),

  street: () => shell(`
    <path d="M0 40L150 110V250H0z" fill="#8c6a48"/><path d="M400 40L250 110V250H400z" fill="#a07a50"/>
    <rect x="150" y="110" width="100" height="140" fill="#f0d7a2"/>
    ${[0, 1, 2].map((i) => `<rect x="${22 + i * 40}" y="${96 + i * 14}" width="${22 - i * 3}" height="${40 - i * 4}" fill="${INK}" opacity=".7"/>`).join('')}
    ${[0, 1, 2].map((i) => `<rect x="${356 - i * 40}" y="${96 + i * 14}" width="${22 - i * 3}" height="${40 - i * 4}" fill="${INK}" opacity=".7"/>`).join('')}
    <path d="M0 250L150 250L170 300H0z" fill="#6a4a30"/><path d="M400 250L250 250L230 300H400z" fill="#6a4a30"/><path d="M150 250H250L270 300H130z" fill="#c9a875"/>
    <path d="M150 110a50 50 0 0 1 100 0" fill="none" stroke="${INK}" stroke-width="6"/>`, false),

  festival: () => shell(`
    <path d="M0 70Q100 120 200 70T400 70" fill="none" stroke="${INK}" stroke-width="2"/>
    ${Array.from({ length: 12 }, (_, i) => { const x = 20 + i * 33; const y = 70 + Math.sin(i * 0.9) * 22 + 22; return `<path d="M${x} ${y}l9 22l-18 0z" fill="${['#b8431f', '#d99a1a', '#56633a', '#7a2f55'][i % 4]}"/>` }).join('')}
    ${[[70, 170], [190, 150], [310, 176]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="28" fill="${['#e1a02a', '#c4502a', '#d7b24a'][i]}"/><rect x="${x - 3}" y="${y - 40}" width="6" height="14" fill="${INK}"/><path d="M${x - 14} ${y + 6}h28" stroke="#fff3cf" stroke-width="3" opacity=".7"/>`).join('')}
    <circle cx="130" cy="214" r="3" fill="#fff3cf"/><circle cx="250" cy="200" r="3" fill="#fff3cf"/><circle cx="360" cy="218" r="3" fill="#fff3cf"/>
    ${ground(236)}`, false),

  food: () => shell(`
    <rect x="0" y="190" width="400" height="110" fill="#6a4a30"/>
    <ellipse cx="200" cy="205" rx="150" ry="44" fill="#f2e6c9"/><ellipse cx="200" cy="205" rx="126" ry="34" fill="#e8d7ae"/>
    <circle cx="150" cy="198" r="38" fill="#c98f4e"/><circle cx="150" cy="198" r="30" fill="#d9a766"/>
    <circle cx="250" cy="206" r="30" fill="#8c3a22"/><circle cx="250" cy="206" r="22" fill="#b6532e"/>
    <circle cx="214" cy="224" r="12" fill="#e2b13a"/>
    <path d="M110 120q10 -20 0 -40M150 130q10 -20 0 -40M190 118q10 -20 0 -40" stroke="#fff3cf" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>`, false),

  craft: () => shell(`
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 50}" y="0" width="50" height="300" fill="${['#8c3a22', '#e8d7ae', '#2c4a52', '#d99a1a'][i % 4]}" opacity=".9"/>`).join('')}
    ${Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<path d="M${c * 50 + 25} ${r * 50 + 8}l12 17l-12 17l-12 -17z" fill="none" stroke="${INK}" stroke-width="2" opacity=".55"/>`).join('')).join('')}
    <rect x="140" y="120" width="120" height="70" rx="4" fill="#8b6643" stroke="${INK}" stroke-width="3"/>
    <rect x="156" y="134" width="88" height="42" fill="#a47c52"/><path d="M168 156h64M200 140v30" stroke="${INK}" stroke-width="4"/>
    <rect x="186" y="84" width="28" height="36" fill="${INK}"/>`, false),

  dance: () => shell(`
    ${ground(230, '#6a4a30')}
    <ellipse cx="200" cy="236" rx="150" ry="22" fill="#8b6643"/>
    ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; const x = 200 + Math.cos(a) * 120; const y = 218 + Math.sin(a) * 16; const s = 0.8 + (Math.sin(a) + 1) * 0.18; const col = ['#b8431f', '#d99a1a', '#2c4a52', '#7a2f55'][i % 4]; return `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-86" r="9" fill="#5b4330"/><path d="M-12 -74h24l12 74h-48z" fill="${col}"/><path d="M-12 -70l-18 22M12 -70l18 22" stroke="${col}" stroke-width="5" stroke-linecap="round"/></g>` }).join('')}
    <circle cx="200" cy="210" r="6" fill="#f8efd2"/>`),

  monument: () => shell(`
    <rect x="70" y="196" width="260" height="40" fill="${INK}"/><rect x="56" y="226" width="288" height="10" fill="#5b4330"/><rect x="44" y="236" width="312" height="10" fill="#8b6643"/>
    ${[96, 148, 200, 252].map((x) => `<rect x="${x}" y="130" width="22" height="68" fill="#5b4330"/><rect x="${x - 4}" y="124" width="30" height="8" fill="${INK}"/>`).join('')}
    <rect x="80" y="116" width="240" height="10" fill="${INK}"/>
    <path d="M140 116a60 60 0 0 1 120 0z" fill="#5b4330"/><rect x="196" y="40" width="8" height="30" fill="${INK}"/><circle cx="200" cy="38" r="7" fill="#e1a02a"/>
    ${ground(246)}`),
}

const cache = {}
export function fallbackSrc(subject) {
  const scene = SCENES[subject]
  if (!scene) return null
  if (!cache[subject]) cache[subject] = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene())}`
  return cache[subject]
}
export const hasFallback = (subject) => Boolean(SCENES[subject])
