// 엔진별 연습실 폴더(index.html)를 생성하는 스크립트 — node practice/build.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + ';global.ENGINES=ENGINES;global.CATS=CATS;');
const SKIP = ['gamma', 'heygen', 'zapier']; // 별도 전용 연습실이 있는 엔진
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
</head>
<body>
<noscript>이 연습실은 자바스크립트가 필요해요.</noscript>
<script>window.ENGINE_ID = "${e.id}";</script>
<script src="../../data.js"></script>
<script src="../content/${e.cat}.js"></script>
<script src="../assets/practice.js"></script>
</body>
</html>
`);
  n++;
}
console.log('generated', n, 'engine labs');
