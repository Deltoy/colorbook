// node build.js → data.js (책 색 159·배색 348 + 한국어 이름 미리 계산. 톤 적합도는 브라우저에서 fit.js 로 계산)
const fs = require('fs'), F = require('./fit.js'), src = require('./src_colors.json');
const colors = src.map((c, i) => ({ i, n: c.name.replace(/\s+/g, ' ').replace(/BLue/, 'Blue'), hex: c.hex, cmyk: c.cmyk, lab: c.lab.map(v => +v.toFixed(2)), g: c.swatch, ko: F.korName(c.lab) }));
const combos = {}; src.forEach((c, i) => c.combinations.forEach(k => (combos[k] = combos[k] || []).push(i)));
const list = Object.keys(combos).map(Number).sort((a, b) => a - b).map(k => ({ no: k, c: combos[k] }));
if (colors.length !== 159 || list.length !== 348) throw new Error('개수 이상: ' + colors.length + '/' + list.length);
fs.writeFileSync('data.js', '// 와다 산조 『배색사전』 색·배색 (mattdesl/dictionary-of-colour-combinations, MIT)\nvar CB=' + JSON.stringify({ colors, combos: list }) + ';\n');
console.log('data.js', colors.length, '색', list.length, '배색', (fs.statSync('data.js').size / 1024).toFixed(0) + 'KB');
