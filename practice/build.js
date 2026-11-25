// 엔진별 연습실 폴더(index.html)를 생성하는 스크립트 — node practice/build.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + ';global.ENGINES=ENGINES;global.CATS=CATS;');
const SKIP = ['gamma', 'heygen', 'zapier']; // 별도 전용 연습실이 있는 엔진
// plus/ 폴더의 각 파일이 어떤 엔진을 담고 있는지 찾기 (파일 하나에 여러 엔진 가능)
const plusDirPath = path.join(__dirname, 'content', 'plus');
const plusMap = {};
if (fs.existsSync(plusDirPath)) for (const f of fs.readdirSync(plusDirPath)) {
  const src = fs.readFileSync(path.join(plusDirPath, f), 'utf8');
  for (const m of src.matchAll(/P\('([a-z0-9]+)'/g)) (plusMap[m[1]] = plusMap[m[1]] || []).push(f);
}
let n = 0;
for (const e of ENGINES) {
  if (SKIP.includes(e.id)) continue;
  const short = e.name.split(' (')[0];
  const cat = CATS.find(c => c.id === e.cat);
  const dir = path.join(__dirname, e.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${short} 연습실 · Claude 협업 따라하기</title>
<meta name="description" content="${short}의 핵심 기능을 미니 시뮬레이터로 하나씩 따라 하고 Claude와 협업하는 방법을 익히는 인터랙티브 연습 사이트">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${cat.icon}</text></svg>">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="../assets/practice.css">
<!-- dain-theme --><link rel="stylesheet" href="https://yalli2.github.io/request_for_quotation/theme/dain-theme.css"><link rel="stylesheet" href="https://yalli2.github.io/request_for_quotation/theme/kits/practice.css"></head>
<body>
<noscript>이 연습실은 자바스크립트가 필요해요.</noscript>
<script>window.ENGINE_ID = "${e.id}";</script>
<script src="../../data.js"></script>
<script src="../content/${e.cat}.js"></script>${(plusMap[e.id] || []).map(f => `\n<script src="../content/plus/${f}"></script>`).join('')}
<script src="../assets/practice.js"></script>
</body>
</html>
`);
  n++;
}
// 허브용 기능 수 목록
global.window = {};
for (const f of fs.readdirSync(path.join(__dirname, 'content'))) if (f.endsWith('.js')) eval(fs.readFileSync(path.join(__dirname, 'content', f), 'utf8'));
const plusDir = path.join(__dirname, 'content', 'plus');
if (fs.existsSync(plusDir)) for (const f of fs.readdirSync(plusDir)) eval(fs.readFileSync(path.join(plusDir, f), 'utf8'));
const counts = Object.fromEntries(Object.entries(window.FEATURES).map(([k, v]) => [k, v.length]));
fs.writeFileSync(path.join(__dirname, 'content', 'counts.json.js'), '/* 자동 생성: 엔진별 기능 미션 수 */\nwindow.FEATURE_COUNTS = ' + JSON.stringify(counts) + ';\n');
console.log('generated', n, 'engine labs; features total', Object.values(counts).reduce((a, b) => a + b, 0));
