// Generates the M3 HCT tonal palettes for the style guide.
//   npm i --no-save @material/material-color-utilities && node gen-palettes.mjs > src/data/tonal-palettes.json
const BASE = './node_modules/@material/material-color-utilities';
const { Hct } = await import(`${BASE}/hct/hct.js`);
const { TonalPalette } = await import(`${BASE}/palettes/tonal_palette.js`);
const { argbFromHex, hexFromArgb } = await import(`${BASE}/utils/string_utils.js`);

const TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

const SOURCES = [
  { key: 'primary',     name: 'Primary',     token: 'accent',           hex: '#4575e7', note: 'Periwinkle — accents, rules, tints' },
  { key: 'primary-ink', name: 'Primary Ink', token: 'accent-dark',      hex: '#2a4fbf', note: 'Interactive text on white (AA)' },
  { key: 'neutral',     name: 'Neutral',     token: 'gray-900',         hex: '#333945', note: 'Cool slate — text and surfaces' },
  { key: 'pink',        name: 'Pink',        token: 'pill-pink-text',   hex: '#b23e79', note: 'Pill pair — pink' },
  { key: 'yellow',      name: 'Yellow',      token: 'pill-yellow-text', hex: '#92710e', note: 'Pill pair — yellow' },
  { key: 'green',       name: 'Green',       token: 'pill-green-text',  hex: '#1f8a63', note: 'Pill pair — green' },
];

// M3 role mapping — the tone each role takes from its palette.
const ROLES = {
  light: [
    { role: 'Primary', tone: 40 },
    { role: 'On Primary', tone: 100 },
    { role: 'Primary Container', tone: 90 },
    { role: 'On Primary Container', tone: 10 },
    { role: 'Inverse Primary', tone: 80 },
  ],
  dark: [
    { role: 'Primary', tone: 80 },
    { role: 'On Primary', tone: 20 },
    { role: 'Primary Container', tone: 30 },
    { role: 'On Primary Container', tone: 90 },
    { role: 'Inverse Primary', tone: 40 },
  ],
  neutralLight: [
    { role: 'Surface', tone: 99 },
    { role: 'On Surface', tone: 10 },
    { role: 'Surface Variant', tone: 90 },
    { role: 'On Surface Variant', tone: 30 },
    { role: 'Outline', tone: 50 },
  ],
  neutralDark: [
    { role: 'Surface', tone: 10 },
    { role: 'On Surface', tone: 90 },
    { role: 'Surface Variant', tone: 30 },
    { role: 'On Surface Variant', tone: 80 },
    { role: 'Outline', tone: 60 },
  ],
};

const palettes = SOURCES.map((s) => {
  const argb = argbFromHex(s.hex);
  const hct = Hct.fromInt(argb);
  const palette = TonalPalette.fromInt(argb);
  return {
    ...s,
    hct: { h: +hct.hue.toFixed(1), c: +hct.chroma.toFixed(1), t: +hct.tone.toFixed(1) },
    tones: Object.fromEntries(TONES.map((t) => [t, hexFromArgb(palette.tone(t))])),
  };
});

console.log(JSON.stringify({ tones: TONES, roles: ROLES, palettes }, null, 2));
