/* =========================================================
   AI Engine Practice Lab — 공통 프레임워크
   필요: ../../data.js (ENGINES, CATS, CONN, API) + ../content/<cat>.js (FEATURES)
   window.ENGINE_ID 로 엔진 지정
   ========================================================= */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const CATCOLOR = {llm:['#55606e','#8b7cf6'],research:['#2F6FD6','#14b8a6'],image:['#e0571f','#f59e0b'],video:['#c0265e','#7c3aed'],audio:['#7C3AED','#ec4899'],avatar:['#db2777','#f97316'],design:['#0e9f8e','#3b82f6'],coding:['#1f2937','#2563eb'],automation:['#ca8a04','#ea580c'],meeting:['#15803d','#0ea5e9']};
const EXTERNAL = {gamma:'https://yalli2.github.io/gamma_practice/', heygen:'https://yalli2.github.io/heyzen_practice/', zapier:'https://yalli2.github.io/zapier_practice/'};
const PARTNER_CATS = {llm:['research','design','coding'],research:['design','meeting','automation'],image:['design','video','avatar'],video:['audio','avatar','image'],audio:['avatar','video','coding'],avatar:['audio','video','meeting'],design:['image','research','automation'],coding:['design','automation','research'],automation:['research','meeting','design'],meeting:['design','automation','audio']};

const E = ENGINES.find(e => e.id === window.ENGINE_ID);
if (!E) { document.body.innerHTML = '<p style="padding:40px">엔진을 찾을 수 없어요.</p>'; return; }
const CAT = CATS.find(c => c.id === E.cat);
const SHORT = E.name.split(' (')[0];
const [A1, A2] = CATCOLOR[E.cat] || ['#2F6FD6', '#7b5cff'];
document.documentElement.style.setProperty('--acc', A1);
document.documentElement.style.setProperty('--acc2', A2);
document.documentElement.style.setProperty('--accbg', `color-mix(in srgb, ${A1} 9%, #fff)`);
document.title = `${SHORT} 연습실 · Claude 협업 따라하기`;

/* 조사 */
const lastCode = s => { const c = s.charCodeAt(s.length - 1); return (c >= 0xAC00 && c <= 0xD7A3) ? (c - 0xAC00) % 28 : (/[013678lmnr]$/i.test(s) ? 1 : 0); };
const J = (w, a, b) => w + (lastCode(w) ? a : b);  // J(SHORT,'은','는')

/* ---------- 기능 미션 데이터 ---------- */
const RAW = (window.FEATURES || {})[E.id] || [];
const FEATS = RAW.map(r => ({
  icon: r[0], title: r[1], why: r[2],
  steps: r[3].split('|').map(s => { const [l, ...d] = s.split('::'); return { l: l.trim(), d: d.join('::').trim() }; }),
  out: r[4], prompt: r[5], quiz: { q: r[6], o: r[7].split('|'), a: r[8], x: r[9] }
}));

/* ---------- 연결 방식별 문구 ---------- */
const CONNTXT = {
  dir: { route: 'Claude 커넥터', short: '커넥터로 직접 실행',
    why: `<p><b>${SHORT}</b>${J(SHORT,'은','는').slice(SHORT.length)} Claude의 <b>커넥터 디렉터리</b>에 들어 있어요. 한 번 연결해 두면 Claude가 대화 중에 ${SHORT}의 기능을 <b>직접 호출</b>하고, 결과(링크·파일·데이터)를 받아 다음 작업으로 이어 줘요.</p><p>연결은 OAuth 방식이라 비밀번호를 Claude에 알려 줄 필요가 없고, 언제든 설정에서 끊을 수 있어요.</p>`,
    steps: ['claude.ai 왼쪽 아래 <b>프로필 → 설정(Settings) → 커넥터(Connectors)</b>를 열어요.', `<b>둘러보기(Browse connectors)</b>에서 “${SHORT}”를 검색하고 <b>연결(Connect)</b>을 눌러요.`, `${SHORT} 로그인 창이 뜨면 로그인하고 <b>권한 허용</b>을 눌러요.`, '새 대화에서 입력창 아래 <b>＋ → 커넥터</b> 목록에 켜져 있는지 확인해요.'],
    code: v => `// Claude가 커넥터 도구를 호출하는 모습 (예시)\n{\n  "tool": "${E.id}.${v}",\n  "input": { "request": "${FEATS[0] ? FEATS[0].title : '작업'}", "details": "…Claude가 정리한 내용…" }\n}\n→ ✅ ${SHORT} 실행 완료 · 결과 링크/데이터를 Claude가 받아 정리`,
    prompt: `${SHORT} 커넥터가 연결되어 있는지 확인해 줘. 지금 쓸 수 있는 ${SHORT} 도구 목록과 각각 어떤 일을 할 수 있는지 표로 정리하고, 내가 처음 해 보면 좋을 작업 3가지를 추천해 줘.` },
  mcp: { route: '공식 MCP 서버', short: 'MCP로 직접 실행',
    why: `<p><b>${SHORT}</b> 제조사는 <b>공식 MCP 서버</b>를 제공해요. MCP(Model Context Protocol)는 Claude 같은 AI가 외부 도구를 표준 방식으로 부를 수 있게 해 주는 “만능 플러그”예요.</p><p>보통 ${SHORT}에서 <b>API 키</b>를 발급받아 MCP 서버에 넣고, claude.ai의 <b>커스텀 커넥터</b>나 <b>Claude Code</b>(\`claude mcp add\`)로 등록하면 Claude가 직접 실행할 수 있어요.</p>`,
    steps: [`${SHORT} 공식 문서에서 <b>MCP 서버</b> 안내(원격 URL 또는 설치 명령)를 찾아요.`, `${SHORT} 계정 설정에서 <b>API 키</b>를 발급받아 안전한 곳에 보관해요.`, 'claude.ai <b>설정 → 커넥터 → 커스텀 커넥터 추가</b>에 원격 URL을 넣거나, Claude Code에서 <code>claude mcp add</code>로 등록해요.', '새 대화에서 도구 목록에 나타나는지 확인하고 간단한 작업으로 테스트해요.'],
    code: v => `// MCP 도구 호출 (예시)\n{\n  "server": "${E.id}-mcp",\n  "tool": "${v}",\n  "arguments": { "input": "…Claude가 만든 지시…" }\n}\n// API 키는 MCP 서버 설정(환경 변수)에만 넣고, 채팅창에는 절대 붙여넣지 않아요.\n→ ✅ 결과가 Claude에게 돌아와요`,
    prompt: `${SHORT} MCP 서버가 연결되어 있는지 확인해 줘. 사용할 수 있는 도구 이름과 필요한 입력값을 표로 보여 주고, 비용(크레딧)이 드는 도구는 따로 표시해 줘.` },
  third: { route: 'API·서드파티 연동', short: 'API/연동 또는 프롬프트 복사',
    why: `<p><b>${SHORT}</b>${J(SHORT,'은','는').slice(SHORT.length)} 아직 Claude 공식 커넥터는 없지만 <b>공개 API</b>가 있어요. 그래서 세 가지 길이 있어요.</p><ul><li><b>Claude Code</b>에서 Claude가 API를 호출하는 코드를 짜고 실행</li><li>Zapier·Composio 같은 <b>연동 허브</b>나 신뢰할 수 있는 커뮤니티 MCP 사용</li><li>가장 쉬운 방법: Claude가 <b>최적의 프롬프트</b>를 만들고 내가 ${SHORT}에 붙여넣기</li></ul>`,
    steps: [`${SHORT} 개발자 페이지에서 <b>API 키</b>를 발급받아요 (무료 크레딧이 있는지 확인).`, '연동 허브(Zapier·Composio 등)나 커뮤니티 MCP 중 <b>믿을 수 있는 것</b>을 골라요.', 'Claude Code에서는 “API를 호출하는 스크립트를 만들어 줘”라고 요청하고 키는 <b>환경 변수</b>로 넣어요.', '처음엔 Claude가 만든 프롬프트를 복사해 붙여넣는 방식으로 시작해도 충분해요.'],
    code: v => `# Claude Code가 만들어 주는 API 호출 예시 (파이썬)\nimport os, requests\nkey = os.environ["${E.id.toUpperCase()}_API_KEY"]   # 키는 환경 변수에!\nres = requests.post("https://api.example/${v}",\n                    headers={"Authorization": f"Bearer {key}"},\n                    json={"prompt": "…Claude가 쓴 프롬프트…"})\nprint(res.json())   # → 결과를 Claude가 읽고 다음 단계로`,
    prompt: `${SHORT}${J(SHORT,'을','를').slice(SHORT.length)} Claude와 함께 쓰고 싶어. 1) API로 연결하는 방법(키 보관법 포함), 2) 연동 허브를 쓰는 방법, 3) 프롬프트를 복사해 쓰는 방법을 비교표로 정리하고 초보자에게 맞는 방법을 추천해 줘.` },
  none: { route: '수동 연계(복사·붙여넣기)', short: '프롬프트 복사 → 붙여넣기',
    why: `<p><b>${SHORT}</b>${J(SHORT,'은','는').slice(SHORT.length)} 공식 API나 MCP가 없어 Claude가 직접 실행할 수는 없어요. 대신 <b>“Claude가 설계하고, 사람이 실행하는”</b> 방식이 아주 효과적이에요.</p><ul><li>Claude: 목표 정리 → ${SHORT}에 맞는 프롬프트·대본·설정값 작성</li><li>나: ${SHORT}에 붙여넣고 결과 만들기</li><li>Claude: 결과(텍스트·스크린샷·파일)를 보고 개선점 제안</li></ul>`,
    steps: ['공식 API·MCP가 없다는 점을 이해해요. (비공식 “API”는 계정 정지 위험이 있어요!)', `Claude에게 “${SHORT}에 붙여넣을 프롬프트를 만들어 줘”라고 요청해요.`, `${SHORT}에 붙여넣고 결과를 만들어요.`, '결과를 캡처하거나 파일로 저장해 Claude에 올리고 검수·수정을 받아요.'],
    code: () => `✳️ Claude ─ 프롬프트 작성 ─▶ 📋 복사\n                                  │\n🙋 나 ─ ${SHORT}에 붙여넣기 ◀────┘\n   │\n   └─ 결과 캡처/파일 ─▶ ✳️ Claude 검수 ─▶ 수정 프롬프트 ─▶ 반복`,
    prompt: `나는 ${SHORT}${J(SHORT,'을','를').slice(SHORT.length)} 쓰고 있어. ${SHORT}에서 좋은 결과를 내는 프롬프트 작성 규칙을 5가지로 알려 주고, 앞으로 내가 요청하면 ${SHORT}에 그대로 붙여넣을 수 있는 형식으로 프롬프트를 만들어 줘.` }
};
const CT = CONNTXT[E.conn];

/* ---------- 미션 구성 ---------- */
const partners = (PARTNER_CATS[E.cat] || []).map(c => ENGINES.filter(x => x.cat === c && x.id !== E.id).sort((a, b) => b.collab - a.collab)[0]).filter(Boolean);
const priceParts = E.price.split(' / ').map(s => s.trim());
const CONNKEYS = ['dir', 'mcp', 'third', 'none'];

const MISSIONS = [];
MISSIONS.push({
  id: 'welcome', ch: '출발', icon: '👋', title: `${SHORT} 첫 만남 & 협업 지도`, sub: `${SHORT}${J(SHORT,'이','가').slice(SHORT.length)} 무엇을 잘하는지, Claude와 어떻게 역할을 나누는지 알아봐요`, time: '5분', xp: 60,
  why: `<p><b>${esc(SHORT)}</b>(${esc(E.vendor)})${J(SHORT,'은','는').slice(SHORT.length)} <b>${CAT.icon} ${esc(CAT.name)}</b> 분야에서 전 세계적으로 많이 쓰이는 AI예요. 이 분야의 도구는 주로 <i>${esc(CAT.desc)}</i>에 쓰여요.</p>
    <p><b>대표 기능</b></p><ul>${E.feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    <p>AI 엔진 조합 내비게이터에서 매긴 <b>Claude 협업도는 ${E.collab}점</b>이에요. 연결 방식은 <b>${CONN[E.conn].label}</b> — ${esc(CONN[E.conn].desc)}.</p>
    <p>이 연습실에서는 <b>${FEATS.length}개의 핵심 기능</b>을 미니 시뮬레이터로 직접 눌러 보고, 각 기능을 <b>Claude와 어떻게 협업</b>하면 좋은지 프롬프트까지 연습해요. 미션을 끝낼 때마다 XP와 배지를 받아요! 🎮</p>`,
  steps: ['아래 <b>협업 지도</b>의 5단계를 하나씩 눌러 누가 무엇을 하는지 읽어 보세요.', '<b>요금제 카드</b>를 모두 눌러 무료로 어디까지 되는지 확인하세요.', `<a href="${E.url}" target="_blank" rel="noopener">${esc(SHORT)} 공식 사이트</a>에 접속해 무료 가입(또는 둘러보기)을 해 보세요.`, '첫 화면에서 새 작업을 시작하는 버튼의 위치를 찾아 두세요.'],
  widget: 'map', tasks: { flow: '협업 지도 5단계 보기', plan: '요금제 모두 확인' },
  claude: [{ t: `Claude에게 ${SHORT} 활용 계획 세우기`, p: `나는 [국제학교 교사 / 학원 운영자]야. ${SHORT}${J(SHORT,'을','를').slice(SHORT.length)} 처음 써 보려고 해.\n1) ${SHORT}${J(SHORT,'이','가').slice(SHORT.length)} 잘하는 일과 Claude가 잘하는 일을 표로 나눠 주고\n2) 내 업무에서 바로 써 볼 수 있는 아이디어 5가지를 추천하고\n3) 무료 플랜으로 시작할 때 주의할 점을 알려 줘.`, n: 'Claude = 기획·글쓰기·검수, ' + SHORT + ' = 전문 실행. 역할을 나누면 결과물이 훨씬 좋아져요.' }],
  real: [`${SHORT} 가입 또는 접속 완료`, '무료 한도(크레딧·횟수) 위치 확인', '설정에서 언어·지역 옵션 확인', '도움말(Help)·튜토리얼 메뉴 위치 확인'],
  quiz: [{ q: `${SHORT}${J(SHORT,'과','와').slice(SHORT.length)} Claude를 연결하는 방식으로 가장 알맞은 것은?`, o: CONNKEYS.map(k => CONN[k].label), a: CONNKEYS.indexOf(E.conn), x: `${SHORT}${J(SHORT,'은','는').slice(SHORT.length)} “${CONN[E.conn].label}” 방식이에요. ${CONN[E.conn].desc}.` }]
});
MISSIONS.push({
  id: 'connect', ch: '출발', icon: '🔌', title: 'Claude와 연결하기', sub: `${CT.route} — Claude가 ${SHORT}에 닿는 길을 직접 따라가 봐요`, time: '7분', xp: 80,
  why: CT.why + `<p>🔗 <b>이 엔진의 연동 요약:</b> ${esc(E.how)}</p>`,
  steps: CT.steps, widget: 'connect', tasks: { route: '올바른 연결 경로 고르기', run: '호출 과정 끝까지 보기' },
  claude: [{ t: '연결 상태 점검 & 첫 작업 추천받기', p: CT.prompt, n: E.conn === 'none' ? '직접 실행은 안 되지만, Claude가 만든 프롬프트 품질이 결과를 좌우해요.' : '비용이 드는 작업은 “실행 전에 확인받아 줘”라고 꼭 덧붙이세요.' }],
  real: E.conn === 'dir' ? ['claude.ai 설정 → 커넥터 열기', `${SHORT} 커넥터 연결(로그인·권한 허용)`, '새 대화에서 커넥터가 켜졌는지 확인', '“연결된 도구 목록 보여 줘”로 테스트'] :
        E.conn === 'mcp' ? [`${SHORT} API 키 발급`, '공식 MCP 서버 안내 문서 확인', '커스텀 커넥터 또는 Claude Code에 등록', '간단한 요청으로 호출 테스트'] :
        E.conn === 'third' ? [`${SHORT} API 문서 열어 보기`, 'API 키 발급(선택)', 'Claude에게 연결 방법 비교표 받기', '프롬프트 복사 방식으로 첫 결과 만들어 보기'] :
        ['Claude에게 전용 프롬프트 받기', `${SHORT}에 붙여넣어 결과 만들기`, '결과를 Claude에 올려 피드백 받기', '수정 프롬프트로 한 번 더 개선하기'],
  quiz: [{ q: 'API 키를 다루는 올바른 방법은?', o: ['Claude 채팅창에 붙여넣어 기억시킨다', '환경 변수나 커넥터 설정 같은 안전한 곳에만 넣는다', '친구와 공유해 같이 쓴다', '웹사이트 코드(HTML)에 그대로 적는다'], a: 1, x: 'API 키는 비밀번호와 같아요. 채팅·공개 코드에 노출되면 남이 내 크레딧을 쓸 수 있어요. 환경 변수나 공식 연결 설정에만 넣으세요.' }]
});
FEATS.forEach((f, i) => {
  MISSIONS.push({
    id: 'f' + (i + 1), ch: '핵심 기능', icon: f.icon, title: f.title, sub: `미니 ${SHORT}에서 직접 눌러 보고, Claude와 협업하는 법까지`, time: '8분', xp: 100,
    why: `<p>${f.why}</p>`,
    steps: f.steps.map(s => `<b>${esc(s.l)}</b> — ${s.d}`),
    widget: 'sim', feat: f, tasks: { sim: '시뮬레이터 순서대로 완료', review: 'Claude 검수 받기' },
    claude: [{ t: `Claude와 함께: ${f.title}`, p: f.prompt, n: `${CT.short}. [대괄호] 부분을 내 상황에 맞게 바꿔서 쓰세요.` }],
    real: f.steps.map(s => `실제 ${SHORT}에서 “${s.l}” 해 보기`).concat(['결과를 Claude에게 보여 주고 개선점 받기']),
    quiz: [f.quiz]
  });
});
MISSIONS.push({
  id: 'recipe', ch: 'Claude 협업', icon: '🧪', title: '나만의 협업 레시피 만들기', sub: '목표·대상·분위기를 골라 Claude에게 줄 완벽한 지시문을 완성해요', time: '6분', xp: 90,
  why: `<p>좋은 결과의 80%는 <b>좋은 지시문</b>에서 나와요. Claude에게 <b>역할 · 목표 · 대상 · 분위기 · 진행 순서 · 주의사항</b>을 알려 주면, Claude가 ${SHORT}에 맞는 작업을 정확하게 설계하고 실행(또는 프롬프트 작성)해 줘요.</p><p>아래 레시피 빌더에서 재료를 골라 나만의 지시문을 만들고 복사해 보세요.</p>`,
  steps: ['<b>목표 기능</b>을 하나 골라요.', '<b>주제</b>를 내 업무에 맞게 적어요.', '<b>대상</b>과 <b>분위기</b>를 골라요.', '완성된 지시문을 <b>복사</b>해서 Claude에 붙여넣어 보세요.'],
  widget: 'builder', tasks: { build: '재료 모두 고르기', copy: '지시문 복사하기' },
  claude: [], real: ['만든 지시문을 Claude에 붙여넣기', 'Claude가 제안한 구성안 확인', `${SHORT} 결과물 만들기`, '수정 요청을 1번 이상 해 보기'],
  quiz: [{ q: 'Claude에게 작업을 맡길 때 가장 효과적인 지시문은?', o: ['“알아서 잘 만들어 줘”', '목표·대상·분위기·순서·주의사항을 구체적으로 적은 지시문', '영어로만 쓴 아주 짧은 지시문', '결과물 예시 없이 키워드만 나열'], a: 1, x: '구체적인 맥락을 줄수록 Claude가 정확한 계획과 프롬프트를 만들어요.' }]
});
MISSIONS.push({
  id: 'roles', ch: 'Claude 협업', icon: '🔀', title: '역할 나누기 게임 & 단짝 엔진', sub: `Claude가 할 일과 ${SHORT}${J(SHORT,'이','가').slice(SHORT.length)} 할 일을 나누고, 함께 쓰면 좋은 엔진을 만나요`, time: '5분', xp: 80,
  why: `<p>AI 협업의 핵심은 <b>“각자 가장 잘하는 일을 맡기는 것”</b>이에요. Claude는 생각·글쓰기·구조화·검수에 강하고, ${SHORT}${J(SHORT,'은','는').slice(SHORT.length)} ${esc(CAT.name)} 작업에 특화되어 있어요.</p><p>게임으로 역할을 나눠 본 뒤, ${SHORT}${J(SHORT,'과','와').slice(SHORT.length)} 함께 쓰면 좋은 <b>단짝 엔진</b>도 만나 보세요.</p>`,
  steps: ['각 작업 카드를 읽고 <b>Claude</b> 또는 <b>' + esc(SHORT) + '</b> 버튼을 눌러요.', '틀리면 카드가 흔들려요. 다시 생각해 보세요!', '모두 맞히면 단짝 엔진 카드가 열려요.', '단짝 엔진 연습실도 방문해 보세요.'],
  widget: 'sort', tasks: { sort: '작업 8개 모두 분류' },
  claude: [{ t: '단짝 엔진과 함께 쓰는 워크플로', p: `${SHORT}${J(SHORT,'과','와').slice(SHORT.length)} ${partners.map(p => p.name.split(' (')[0]).join(', ')}${J((partners[partners.length-1]||{name:'도구'}).name.split(' (')[0],'을','를').slice(-1)} 함께 써서 [목표: 예) 다음 달 홍보 캠페인 준비]를 하려고 해. 각 도구의 역할과 작업 순서, 단계별로 Claude에게 넘길 결과물 형식을 표로 정리해 줘.`, n: '여러 도구를 쓸 때는 Claude를 “지휘자”로 두고 순서를 맡기면 편해요.' }],
  real: ['역할 분담표를 내 업무에 적용해 보기', '단짝 엔진 중 하나 가입해 보기'],
  quiz: [{ q: '다음 중 Claude에게 맡기기 가장 좋은 일은?', o: [`${SHORT}의 전용 기능 실행`, '목표에 맞는 구성안 작성과 결과물 검수', '실시간 하드웨어 제어', '결제 정보 입력'], a: 1, x: 'Claude는 기획·글쓰기·구조화·검수에 강해요. 전문 생성·실행은 전용 엔진에 맡기세요.' }]
});
MISSIONS.push({
  id: 'final', ch: '졸업', icon: '🎓', title: '졸업 시험 & 수료증', sub: '모든 미션의 핵심을 확인하고 수료증을 받아요', time: '8분', xp: 150,
  why: `<p>마지막 관문이에요! 지금까지 배운 ${SHORT}의 기능과 Claude 협업법을 확인하는 시험이에요. <b>70점 이상</b>이면 수료증을 받을 수 있어요. 🎉</p>`,
  steps: ['문제를 차분히 읽고 답을 골라요.', '<b>채점하기</b>를 눌러요.', '70점 이상이면 이름을 적고 수료증을 받아요.', '수료증은 인쇄(PDF 저장)할 수 있어요.'],
  widget: 'final', tasks: { pass: '졸업 시험 통과' }, claude: [], real: [], quiz: []
});
const MAP = Object.fromEntries(MISSIONS.map(m => [m.id, m]));
/* 퀴즈 보기 순서를 엔진·미션별로 고정된 무작위 순서로 섞기 (정답이 항상 같은 자리에 오지 않도록) */
function seeded(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
MISSIONS.forEach(m => m.quiz.forEach((q, qi) => {
  const rnd = seeded(E.id + m.id + qi);
  const idx = q.o.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  q.o = idx.map(i => q.o[i]); q.a = idx.indexOf(q.a);
}));

/* ---------- 상태 ---------- */
const KEY = 'aep_' + E.id;
const fresh = () => ({ xp: 0, done: {}, steps: {}, tasks: {}, real: {}, quiz: {}, copied: {}, badges: [], name: '', first: {}, total: MISSIONS.length });
let S; try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
S.total = MISSIONS.length;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const LEVELS = [[0,'🌱 새싹'],[150,'🧭 탐험가'],[400,'🛠️ 실습러'],[700,'🤝 협업러'],[1050,'🚀 마스터'],[1500,'👑 레전드']];
const lvOf = xp => { let i = 0; LEVELS.forEach((l, k) => { if (xp >= l[0]) i = k; }); return i; };
const BADGES = [
  ['first','🚀','첫 미션 완료'],['connect','🔌','연결 마스터'],['half','🔥','절반 돌파'],
  ['recipe','🧪','레시피 셰프'],['roles','🔀','역할 분담왕'],['quiz','🎯','퀴즈 명사수'],
  ['copy','📋','프롬프트 수집가'],['all','🏆',`${SHORT} 마스터`],['grad','🎓','수료증 획득']];

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }
function confetti(n = 80) {
  const cols = [A1, A2, '#d97757', '#17b26a', '#f5b400'];
  for (let i = 0; i < n; i++) { const c = document.createElement('i'); c.className = 'confetti'; c.style.left = Math.random() * 100 + 'vw'; c.style.background = cols[i % cols.length]; c.style.animationDelay = Math.random() * .6 + 's'; c.style.borderRadius = Math.random() > .5 ? '50%' : '2px'; document.body.appendChild(c); setTimeout(() => c.remove(), 3200); }
}
function addXP(n, why) {
  const before = lvOf(S.xp); S.xp += n; save(); renderXP();
  if (why) toast(`+${n} XP · ${why}`);
  const after = lvOf(S.xp);
  if (after > before) setTimeout(() => { toast(`레벨 업! ${LEVELS[after][1]}`); confetti(); }, 1000);
}
function badge(id) {
  if (S.badges.includes(id)) return;
  S.badges.push(id); save();
  const b = BADGES.find(x => x[0] === id);
  setTimeout(() => { toast(`🏅 배지 획득: ${b[1]} ${b[2]}`); confetti(50); }, 600);
}
function checkBadges() {
  const d = Object.keys(S.done).length;
  if (d >= 1) badge('first');
  if (S.done.connect) badge('connect');
  if (d >= Math.ceil(MISSIONS.length / 2)) badge('half');
  if (S.done.recipe) badge('recipe');
  if (S.done.roles) badge('roles');
  if (Object.keys(S.copied).length >= 3) badge('copy');
  const qs = MISSIONS.flatMap(m => m.quiz.map((q, i) => m.id + ':' + i));
  if (qs.length && qs.every(k => S.first[k] === 1)) badge('quiz');
  if (MISSIONS.every(m => S.done[m.id])) badge('all');
}
function renderXP() {
  const i = lvOf(S.xp), cur = LEVELS[i][0], nxt = (LEVELS[i + 1] || [S.xp + 1])[0];
  $('#lvName').textContent = LEVELS[i][1];
  $('#xpNum').textContent = `${S.xp} XP`;
  $('#xpFill').style.width = Math.min(100, (S.xp - cur) / Math.max(1, nxt - cur) * 100) + '%';
}

/* ---------- 레이아웃 ---------- */
document.body.innerHTML = `
<header class="top">
  <button class="tbtn menu-btn" id="bMenu">☰</button>
  <div class="brand" id="bHome"><span class="logo">${CAT.icon}</span><div class="nm">${esc(SHORT)} 연습실<small>${esc(SHORT)} × Claude 협업 따라하기</small></div></div>
  <div class="xpwrap"><div class="xpline"><span id="lvName"></span><span id="xpNum"></span></div><div class="xpbar"><i id="xpFill"></i></div></div>
  <button class="tbtn" id="bBadges">🏅<span class="opt-hide"> 배지</span></button>
  <a class="tbtn opt-hide" href="../" title="전체 연습실">🏠 전체</a>
  <button class="tbtn opt-hide" id="bReset" title="진행 상황 초기화">↺</button>
</header>
<div class="wrap"><nav class="side" id="side"></nav><main class="main" id="main"></main></div>
<div class="toast" id="toast"></div>`;

function renderSide(cur) {
  const groups = [...new Set(MISSIONS.map(m => m.ch))];
  $('#side').innerHTML = `<div class="mi ${cur === 'home' ? 'on' : ''}" data-go="home"><span class="ic">🏠</span>연습실 홈</div>` +
    groups.map(g => `<h4>${g}</h4>` + MISSIONS.filter(m => m.ch === g).map(m => {
      const st = stepState(m);
      return `<div class="mi ${cur === m.id ? 'on' : ''} ${S.done[m.id] ? 'done' : ''}" data-go="${m.id}"><span class="ic">${S.done[m.id] ? '✓' : m.icon}</span><span>${esc(m.title)}</span><span class="pc">${S.done[m.id] ? '완료' : st}</span></div>`;
    }).join('')).join('') +
    `<h4>더 보기</h4><a class="mi" href="../" style="text-decoration:none"><span class="ic">🧭</span>전체 엔진 연습실</a><a class="mi" href="../../" style="text-decoration:none"><span class="ic">📊</span>AI 엔진 조합 내비게이터</a>`;
  $$('#side [data-go]').forEach(el => el.onclick = () => { go(el.dataset.go); $('#side').classList.remove('open'); });
}
function stepState(m) {
  const tk = Object.keys(m.tasks || {}); const doneT = tk.filter(k => S.tasks[m.id + ':' + k]).length;
  return tk.length ? `${doneT}/${tk.length}` : '';
}
function go(id) { location.hash = id === 'home' ? '' : '#' + id; route(); window.scrollTo(0, 0); }
function route() {
  const id = location.hash.replace('#', '');
  if (MAP[id]) renderMission(MAP[id]); else renderHome();
}

/* ---------- 홈 ---------- */
function renderHome() {
  renderSide('home');
  const done = MISSIONS.filter(m => S.done[m.id]).length;
  const next = MISSIONS.find(m => !S.done[m.id]);
  const ext = EXTERNAL[E.id];
  $('#main').innerHTML = `
  <section class="hero">
    <span class="chip">${CAT.icon} ${esc(CAT.name)}</span><span class="chip">✳️ Claude 협업도 ${E.collab}점</span><span class="chip">${esc(CONN[E.conn].label)}</span>${E.ko ? '<span class="chip">🇰🇷 한국어 ◎</span>' : ''}
    <h1>${esc(SHORT)} × Claude<br>따라하며 배우는 연습실</h1>
    <p>${esc(E.vendor)}의 <b>${esc(SHORT)}</b> 핵심 기능 ${FEATS.length}가지를 미니 시뮬레이터로 하나씩 눌러 보고, Claude에게 어떻게 일을 맡기면 되는지 프롬프트까지 연습해요. 미션 ${MISSIONS.length}개를 끝내면 수료증을 드려요! 🎓</p>
    <button class="btn c" id="startBtn">${done ? '이어서 하기' : '첫 미션 시작'} → ${esc(next ? next.title : '복습하기')}</button>
    ${ext ? `<a class="btn w" style="margin-left:8px" href="${ext}" target="_blank" rel="noopener">✨ 전용 심화 연습실</a>` : ''}
    <div class="stats">
      <div class="stat"><b>${done}/${MISSIONS.length}</b><span>완료한 미션</span></div>
      <div class="stat"><b>${S.xp}</b><span>획득 XP</span></div>
      <div class="stat"><b>${S.badges.length}/${BADGES.length}</b><span>배지</span></div>
      <div class="stat"><b>${esc(priceParts[0])}</b><span>시작 요금</span></div>
    </div>
  </section>
  <h2 class="sec-title">🗺️ 미션 지도</h2>
  <div class="grid g3">${MISSIONS.map((m, i) => `<div class="card mcard ${S.done[m.id] ? 'done' : ''}" data-go="${m.id}"><span class="st">${S.done[m.id] ? '✓ 완료' : 'M' + (i + 1)}</span><div class="big">${m.icon}</div><h3>${esc(m.title)}</h3><p>${esc(m.sub)}</p></div>`).join('')}</div>
  <h2 class="sec-title">💳 사용료 한눈에</h2>
  <div class="card"><div class="plans" style="margin-top:0">${priceParts.map(p => `<div class="plan" style="cursor:default"><span class="pl">PLAN</span><br>${esc(p)}</div>`).join('')}</div>
  <p class="disc" style="margin-top:12px">미국 달러 월 요금 기준(2026년 11월 조사). 연간 결제·지역·프로모션에 따라 달라요. 결제 전 <a href="${E.url}" target="_blank" rel="noopener">공식 사이트</a>를 꼭 확인하세요.</p></div>
  <p class="disc">이 사이트는 비공식 학습용 연습실이에요. ${esc(SHORT)}${J(SHORT,'은','는').slice(SHORT.length)} ${esc(E.vendor)}의 서비스이며, 메뉴 이름·기능·요금은 바뀔 수 있어요. 시뮬레이터는 실제 화면을 단순화한 연습용 모형이에요.</p>`;
  $('#startBtn').onclick = () => go(next ? next.id : 'welcome');
  $$('#main [data-go]').forEach(el => el.onclick = () => go(el.dataset.go));
}

/* ---------- 미션 ---------- */
function renderMission(m) {
  renderSide(m.id);
  const idx = MISSIONS.indexOf(m);
  let n = 0; const sec = (t) => `<h2><span class="n">${++n}</span>${t}</h2>`;
  $('#main').innerHTML = `
  <div class="mhead"><div class="bigic">${m.icon}</div><div><h1>${esc(m.title)}</h1><div class="sub">${esc(m.sub)}</div><span class="tag">⏱ ${m.time}</span><span class="tag x">+${m.xp} XP</span><span class="tag">미션 ${idx + 1}/${MISSIONS.length}</span></div></div>
  <div class="sec">${sec('개념 이해')}<div class="card why">${m.why}</div></div>
  <div class="sec">${sec('따라하기')}<ul class="steps">${m.steps.map((s, i) => `<li data-i="${i}" class="${S.steps[m.id + ':' + i] ? 'on' : ''}"><span class="box">✓</span><span><span class="sn">${i + 1}.</span>${s}</span></li>`).join('')}</ul></div>
  <div class="sec">${sec('연습실')}<div class="lab"><div class="lab-top"><b>🎮 ${labTitle(m)}</b><div class="task-list">${Object.entries(m.tasks).map(([k, v]) => `<span class="task ${S.tasks[m.id + ':' + k] ? 'ok' : ''}" data-t="${k}">${v}</span>`).join('')}</div></div><div id="lab"></div></div></div>
  ${m.claude.length ? `<div class="sec">${sec('Claude와 협업하기')}${m.claude.map((c, i) => `<div class="pcard"><div class="ph"><b>✳️ ${esc(c.t)}</b><button class="btn c sm" data-copy="${i}">📋 복사하기</button></div><textarea id="pc${i}">${esc(c.p)}</textarea>${c.n ? `<div class="note">💡 ${esc(c.n)}</div>` : ''}</div>`).join('')}</div>` : ''}
  ${m.real.length ? `<div class="sec">${sec(`실제 ${esc(SHORT)}에서 해 보기`)}<div class="real">${m.real.map((r, i) => `<label><input type="checkbox" data-r="${i}" ${S.real[m.id + ':' + i] ? 'checked' : ''}> ${esc(r)}</label>`).join('')}</div><p style="font-size:13px;margin:8px 2px 0"><a href="${E.url}" target="_blank" rel="noopener">↗ ${esc(SHORT)} 열기</a></p></div>` : ''}
  ${m.quiz.length ? `<div class="sec">${sec('확인 퀴즈')}<div id="quizBox"></div></div>` : ''}
  <div class="donebar" id="doneBar"></div>`;
  $$('.steps li').forEach(li => li.onclick = () => {
    const k = m.id + ':' + li.dataset.i;
    if (S.steps[k]) { delete S.steps[k]; li.classList.remove('on'); save(); return; }
    S.steps[k] = 1; li.classList.add('on'); addXP(5, '따라하기 체크');
  });
  $$('[data-copy]').forEach(b => b.onclick = () => copyText($('#pc' + b.dataset.copy).value, m.id + ':c' + b.dataset.copy, b));
  $$('.real input').forEach(c => c.onchange = () => { const k = m.id + ':' + c.dataset.r; if (c.checked) { if (!S.real[k]) { S.real[k] = 1; addXP(5, '실전 체크'); } } else { delete S.real[k]; save(); } });
  if (m.quiz.length) renderQuiz(m);
  WIDGETS[m.widget](m, $('#lab'));
  refreshDone(m);
}
function labTitle(m) { return { map: '협업 지도 & 요금제', connect: '연결 시뮬레이터', sim: `미니 ${SHORT} 시뮬레이터`, builder: '협업 레시피 빌더', sort: '역할 나누기 게임', final: '졸업 시험' }[m.widget]; }
function copyText(txt, key, btn) {
  const ok = () => { if (btn) { const o = btn.textContent; btn.textContent = '✅ 복사됨'; setTimeout(() => btn.textContent = o, 1500); } if (!S.copied[key]) { S.copied[key] = 1; addXP(10, '프롬프트 복사'); checkBadges(); } };
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, () => fallbackCopy(txt, ok)); else fallbackCopy(txt, ok);
}
function fallbackCopy(txt, cb) { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); cb(); }
function task(m, k) {
  const key = m.id + ':' + k; if (S.tasks[key]) return;
  S.tasks[key] = 1; save(); addXP(30, m.tasks[k]);
  const el = $(`.task[data-t="${k}"]`); if (el) el.classList.add('ok');
  renderSide(m.id); refreshDone(m);
}
function renderQuiz(m) {
  $('#quizBox').innerHTML = m.quiz.map((q, qi) => {
    const k = m.id + ':' + qi, ans = S.quiz[k];
    return `<div class="quiz" data-q="${qi}"><div class="q">Q${qi + 1}. ${esc(q.q)}</div>${q.o.map((o, oi) => `<button class="o ${ans !== undefined && oi === q.a ? 'ok' : ''}" data-o="${oi}">${esc(o)}</button>`).join('')}<div class="x ${ans !== undefined ? '' : 'hidden'}">💡 ${esc(q.x)}</div></div>`;
  }).join('');
  $$('#quizBox .quiz').forEach(box => {
    const qi = +box.dataset.q, q = m.quiz[qi], k = m.id + ':' + qi;
    $$('.o', box).forEach(b => b.onclick = () => {
      if (S.quiz[k] !== undefined) return;
      const oi = +b.dataset.o;
      if (oi === q.a) {
        b.classList.add('ok'); S.quiz[k] = 1; if (S.first[k] === undefined) S.first[k] = 1;
        $('.x', box).classList.remove('hidden'); save(); addXP(S.first[k] === 1 ? 30 : 20, '퀴즈 정답!'); checkBadges(); refreshDone(m);
      } else {
        b.classList.add('no', 'shake'); if (S.first[k] === undefined) { S.first[k] = 0; save(); }
        setTimeout(() => b.classList.remove('shake'), 400); toast('아쉬워요! 다시 골라 보세요 🙂');
      }
    });
  });
}
function missionReady(m) {
  const tk = Object.keys(m.tasks).every(k => S.tasks[m.id + ':' + k]);
  const qz = m.quiz.every((q, i) => S.quiz[m.id + ':' + i] !== undefined);
  return tk && qz;
}
function refreshDone(m) {
  const bar = $('#doneBar'); if (!bar) return;
  const idx = MISSIONS.indexOf(m), next = MISSIONS[idx + 1];
  if (S.done[m.id]) {
    bar.className = 'donebar ok';
    bar.innerHTML = `<b>✅ 미션 완료! 잘했어요.</b>${next ? `<button class="btn g" id="nextBtn">다음 미션: ${esc(next.title)} →</button>` : `<a class="btn g" href="../">🧭 다른 엔진 연습실로</a>`}`;
  } else if (missionReady(m)) {
    bar.className = 'donebar';
    bar.innerHTML = `<b>🎉 모든 과제를 끝냈어요!</b><button class="btn c" id="doneBtn">미션 완료하고 +${m.xp} XP 받기</button>`;
    $('#doneBtn').onclick = () => { S.done[m.id] = 1; save(); addXP(m.xp, '미션 완료: ' + m.title); confetti(); checkBadges(); renderSide(m.id); refreshDone(m); };
  } else {
    bar.className = 'donebar';
    bar.innerHTML = `<span>🎯 연습실 과제${m.quiz.length ? '와 퀴즈' : ''}를 끝내면 미션을 완료할 수 있어요.</span>${next ? `<button class="btn w sm" id="nextBtn">건너뛰기 →</button>` : ''}`;
  }
  const nb = $('#nextBtn'); if (nb) nb.onclick = () => go(next.id);
}

/* ---------- 위젯 ---------- */
const WIDGETS = {
  map(m, el) {
    const f0 = FEATS[0] || { title: '핵심 기능' };
    const nodes = [
      ['me', '🙋 나', '🎯 목표 정하기', `무엇을, 누구에게, 언제까지 만들지 정해요. 예) “다음 주 수업용 ${CAT.name.split('·')[0]} 자료”`],
      ['cl', '✳️ Claude', '📝 기획·지시문', `Claude가 구성안을 짜고, ${SHORT}에 맡길 작업을 구체적인 지시(프롬프트·대본·설정값)로 바꿔요.`],
      ['en', `${CAT.icon} ${SHORT}`, '⚙️ 전문 실행', `${SHORT}${J(SHORT,'이','가').slice(SHORT.length)} “${f0.title}” 같은 전문 작업을 해요. 연결: ${CONN[E.conn].label} (${CT.short}).`],
      ['cl', '✳️ Claude', '🔍 검수·수정', '결과를 Claude가 확인해 목표와 맞는지, 틀린 내용은 없는지 점검하고 수정 지시를 만들어요.'],
      ['me', '🙋 나 + 다음 도구', '🚀 활용·공유', `완성본을 수업·홍보·업무에 써요. 다음 단계에 ${partners.map(p => p.name.split(' (')[0]).join(', ')} 같은 단짝 엔진을 이어 붙일 수 있어요.`]
    ];
    el.innerHTML = `<div class="flow">${nodes.map((n, i) => `${i ? '<div class="arr">→</div>' : ''}<div class="node ${n[0]}" data-i="${i}"><span class="who ${n[0]}">${esc(n[1])}</span><b>${n[2]}</b><span>단계 ${i + 1}</span></div>`).join('')}</div>
      <div class="detail" id="fd">👆 단계를 눌러 보세요.</div>
      <div class="plans">${priceParts.map((p, i) => `<div class="plan" data-p="${i}"><span class="pl">${i === 0 ? 'START' : 'PLAN ' + (i + 1)}</span><br>${esc(p)}</div>`).join('')}</div>`;
    const seen = new Set(), pseen = new Set();
    $$('.node', el).forEach(nd => nd.onclick = () => {
      $$('.node', el).forEach(x => x.classList.remove('on')); nd.classList.add('on', 'seen');
      const n = nodes[+nd.dataset.i]; $('#fd').innerHTML = `<b>${n[2]}</b> · <span class="who ${n[0]}">${esc(n[1])}</span><br>${esc(n[3])}`;
      seen.add(nd.dataset.i); if (seen.size === nodes.length) task(m, 'flow');
    });
    $$('.plan', el).forEach(p => p.onclick = () => { p.classList.add('seen'); pseen.add(p.dataset.p); if (pseen.size === priceParts.length) task(m, 'plan'); });
  },

  connect(m, el) {
    const f0 = FEATS[0] || { title: '첫 작업', icon: '✨' };
    const verb = (f0.title.match(/[A-Za-z]+/) || ['run'])[0].toLowerCase();
    el.innerHTML = `<div class="chat">
      <div class="bubble"><div class="av me">🙋</div><div class="tx">Claude, ${esc(SHORT)}${J(SHORT,'으로','로').slice(SHORT.length)} “${esc(f0.title)}” 작업을 해 줘!</div></div>
      <div class="bubble cl"><div class="av cl">✳️</div><div class="tx">좋아요! 그런데 저는 어떤 길로 ${esc(SHORT)}에 닿을 수 있을까요? 👇 알맞은 경로를 골라 주세요.</div></div>
    </div>
    <div class="routes">${CONNKEYS.map(k => `<button class="route" data-k="${k}">${esc(CONN[k].label)}<small>${esc(CONN[k].desc)}</small></button>`).join('')}</div>
    <div id="pipeBox"></div>`;
    $$('.route', el).forEach(b => b.onclick = () => {
      if (b.dataset.k !== E.conn) { b.classList.add('no', 'shake'); setTimeout(() => b.classList.remove('shake'), 400); toast(`힌트: ${SHORT}의 협업도 세부 점수에서 연결 방식은 ${E.connPts}점이에요.`); return; }
      b.classList.add('ok'); task(m, 'route');
      const stages = E.conn === 'none'
        ? [['cl', '✳️ Claude 프롬프트 작성'], ['me', '📋 복사'], ['en', `${CAT.icon} ${SHORT}에 붙여넣기`], ['me', '🖼️ 결과 캡처'], ['cl', '✳️ Claude 검수']]
        : [['me', '🙋 요청'], ['cl', '✳️ Claude 계획'], ['', E.conn === 'third' ? '🔑 API 호출' : '🔌 도구 호출'], ['en', `${CAT.icon} ${SHORT} 실행`], ['cl', '✳️ 결과 정리']];
      $('#pipeBox').innerHTML = `<div class="pipe">${stages.map((s, i) => `${i ? '<em>→</em>' : ''}<span class="${s[0]}">${esc(s[1])}</span>`).join('')}</div><pre class="code">${esc(CT.code(verb))}</pre><div id="pipeEnd"></div>`;
      $$('#pipeBox .pipe span').forEach((s, i) => setTimeout(() => s.classList.add('lit'), 450 * (i + 1)));
      setTimeout(() => {
        $('#pipeEnd').innerHTML = `<div class="bubble cl"><div class="av cl">✳️</div><div class="tx">${E.conn === 'none' ? `${esc(SHORT)}에 붙여넣을 프롬프트를 준비했어요. 결과를 캡처해서 올려 주시면 바로 검수해 드릴게요!` : `${esc(SHORT)}에서 “${esc(f0.title)}” 작업을 마쳤어요. 결과를 확인하고 개선점 3가지를 정리해 드릴게요.`}</div></div>`;
        task(m, 'run');
      }, 450 * (stages.length + 1));
    });
  },

  sim(m, el) {
    const f = m.feat, order = f.steps.map(s => s.l);
    let idx = 0;
    el.innerHTML = `<div class="sim">
      <div class="acts"><div class="hint">👇 올바른 순서대로 눌러 보세요 (섞여 있어요!)</div>${shuffle(order.map((l, i) => ({ l, i }))).map(o => `<button class="act" data-i="${o.i}" data-n="${o.i + 1}">${esc(o.l)}</button>`).join('')}</div>
      <div class="win"><div class="bar"><i></i><i></i><i></i>${esc(SHORT)} — ${esc(f.title)}</div>
        <div class="canvas"><div class="stage" id="stage">${f.icon}</div><div class="pbar"><i id="pb"></i></div><div class="log" id="log"><div>🟢 ${esc(SHORT)} 작업 공간이 열렸어요. 첫 단계를 골라 보세요.</div></div><div id="outBox"></div></div></div>
    </div>`;
    $$('.act', el).forEach(b => b.onclick = () => {
      if (b.classList.contains('used')) return;
      if (+b.dataset.i !== idx) { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); toast(`힌트: 먼저 “${order[idx]}” 단계가 필요해요`); return; }
      b.classList.add('used');
      const st = f.steps[idx];
      $('#log').insertAdjacentHTML('beforeend', `<div><b>${idx + 1}. ${esc(st.l)}</b> — ${st.d}</div>`);
      $('#log').scrollTop = 1e5;
      const sg = $('#stage'); sg.classList.add('pop'); setTimeout(() => sg.classList.remove('pop'), 350);
      idx++; $('#pb').style.width = (idx / order.length * 100) + '%';
      if (idx === order.length) {
        $('#outBox').innerHTML = `<div class="result"><h4>✨ 결과물 완성!</h4>${f.out}</div><button class="btn c sm" id="sendC" style="margin-top:10px">✳️ Claude에게 결과 보내 검수받기</button>`;
        task(m, 'sim');
        $('#sendC').onclick = () => {
          $('#sendC').remove();
          $('#outBox').insertAdjacentHTML('beforeend', `<div class="bubble cl"><div class="av cl">✳️</div><div class="tx">결과 잘 받았어요! 👀 ① 목표(대상·분위기)와 맞는지 ② 사실·표기 오류가 없는지 ③ 다음 단계(${esc(partners[0] ? partners[0].name.split(' (')[0] : '공유')})로 넘길 형식인지 확인했어요. 수정 지시문도 만들어 드릴까요?</div></div>`);
          task(m, 'review');
        };
      }
    });
  },

  builder(m, el) {
    const goals = FEATS.map(f => f.title);
    const auds = ['학생', '학부모', '수강생·고객', '팀 동료', 'SNS 구독자'];
    const tones = ['친근하고 재미있게', '전문적이고 깔끔하게', '짧고 강렬하게', '차분하고 자세하게'];
    const st = { goal: null, aud: null, tone: null, topic: '' };
    el.innerHTML = `<div class="bld">
      <div class="row"><b>① 목표 기능</b><div class="opts" data-k="goal">${goals.map(g => `<button class="opt">${esc(g)}</button>`).join('')}</div></div>
      <div class="row"><b>② 주제</b><input id="topic" placeholder="예) 여름방학 스페인어 캠프 홍보 / 3과 과거시제 복습"></div>
      <div class="row"><b>③ 대상</b><div class="opts" data-k="aud">${auds.map(g => `<button class="opt">${esc(g)}</button>`).join('')}</div></div>
      <div class="row"><b>④ 분위기</b><div class="opts" data-k="tone">${tones.map(g => `<button class="opt">${esc(g)}</button>`).join('')}</div></div>
      <div class="pcard" style="margin:4px 0 0"><div class="ph"><b>✳️ 완성된 지시문</b><button class="btn c sm" id="bCopy" disabled>📋 복사하기</button></div><textarea id="bOut" readonly></textarea></div>
    </div>`;
    const act = E.conn === 'dir' || E.conn === 'mcp' ? `${SHORT} 도구를 직접 호출해서 만들어 줘. 비용(크레딧)이 드는 단계는 실행 전에 확인받아 줘.`
      : E.conn === 'third' ? `${SHORT} API로 실행하는 코드를 작성하거나, 어렵다면 ${SHORT}에 붙여넣을 프롬프트를 만들어 줘.`
      : `${SHORT}에 그대로 붙여넣을 프롬프트(영어 버전 + 한국어 설명)를 만들어 줘.`;
    const upd = () => {
      const ready = st.goal && st.aud && st.tone && st.topic.trim();
      $('#bOut').value = `[역할] 너는 나의 ${CAT.name} 작업 파트너이자 디렉터야.\n[목표] ${SHORT}의 「${st.goal || '(목표 기능 선택)'}」 기능으로 “${st.topic.trim() || '(주제 입력)'}” 결과물을 만들고 싶어.\n[대상] ${st.aud || '(대상 선택)'}\n[분위기] ${st.tone || '(분위기 선택)'}\n[진행 순서]\n1) 먼저 구성안(개요)을 5줄 이내로 제안해 줘.\n2) 내가 확인하면 ${act}\n3) 결과를 보고 개선점 3가지와 수정본을 만들어 줘.\n[출력] 마지막에 다음 단계(${partners.map(p => p.name.split(' (')[0]).join('·')})로 넘길 수 있는 형식으로 정리해 줘.`;
      $('#bCopy').disabled = !ready;
      if (ready) task(m, 'build');
    };
    $$('.opts', el).forEach(g => $$('.opt', g).forEach(b => b.onclick = () => { $$('.opt', g).forEach(x => x.classList.remove('on')); b.classList.add('on'); st[g.dataset.k] = b.textContent; upd(); }));
    $('#topic').oninput = e => { st.topic = e.target.value; upd(); };
    $('#bCopy').onclick = () => { copyText($('#bOut').value, 'recipe:build', $('#bCopy')); task(m, 'copy'); };
    upd();
  },

  sort(m, el) {
    const items = shuffle([
      ...['목표와 구성안(개요) 짜기', `${SHORT}에 줄 프롬프트·대본 작성`, '결과물 사실 확인·검수', '다음 도구로 넘길 형식으로 정리'].map(t => ({ t, w: 'c' })),
      ...FEATS.slice(0, 4).map(f => ({ t: f.title, w: 'e' }))
    ]);
    let left = items.length;
    el.innerHTML = `<div class="sortl">${items.map((it, i) => `<div class="si" data-i="${i}"><span class="t">${esc(it.t)}</span><button class="c">✳️ Claude</button><button class="e">${CAT.icon} ${esc(SHORT)}</button></div>`).join('')}</div><div id="ptn"></div>`;
    $$('.si', el).forEach(row => {
      const it = items[+row.dataset.i];
      $$('button', row).forEach(b => b.onclick = () => {
        const pick = b.classList.contains('c') ? 'c' : 'e';
        if (pick !== it.w) { row.classList.add('shake'); setTimeout(() => row.classList.remove('shake'), 400); toast(pick === 'c' ? `이건 ${SHORT}의 전문 기능이에요!` : '이건 Claude가 더 잘하는 생각·글쓰기 작업이에요!'); return; }
        row.classList.add('done'); row.insertAdjacentHTML('beforeend', `<span class="lbl ${pick}">${pick === 'c' ? '✳️ Claude' : CAT.icon + ' ' + esc(SHORT)}</span>`);
        if (--left === 0) {
          task(m, 'sort'); confetti(40);
          $('#ptn').innerHTML = `<h4 style="margin:18px 0 0">🤝 ${esc(SHORT)}의 단짝 엔진</h4><div class="partners">${partners.map(p => `<a class="partner" href="${EXTERNAL[p.id] || '../' + p.id + '/'}"><b>${CATS.find(c => c.id === p.cat).icon} ${esc(p.name.split(' (')[0])}</b><small>${esc(CATS.find(c => c.id === p.cat).name)} · 협업도 ${p.collab}</small><small>${esc(p.feats[0])}</small></a>`).join('')}</div>`;
        }
      });
    });
  },

  final(m, el) {
    const pool = MISSIONS.filter(x => x.id !== 'final').flatMap(x => x.quiz);
    const qs = pool.map(q => ({ ...q }));
    el.innerHTML = qs.map((q, qi) => `<div class="quiz" data-q="${qi}"><div class="q">Q${qi + 1}. ${esc(q.q)}</div>${q.o.map((o, oi) => `<button class="o" data-o="${oi}">${esc(o)}</button>`).join('')}</div>`).join('') +
      `<button class="btn g" id="grade">✅ 채점하기</button><div id="certBox"></div>`;
    const pick = {};
    $$('.quiz', el).forEach(box => $$('.o', box).forEach(b => b.onclick = () => { $$('.o', box).forEach(x => x.classList.remove('ok')); b.classList.add('ok'); pick[box.dataset.q] = +b.dataset.o; }));
    $('#grade').onclick = () => {
      if (Object.keys(pick).length < qs.length) { toast(`아직 ${qs.length - Object.keys(pick).length}문제가 남았어요!`); return; }
      let c = 0;
      $$('.quiz', el).forEach(box => { const qi = +box.dataset.q, q = qs[qi]; $$('.o', box).forEach((b, oi) => { b.classList.remove('ok', 'no'); if (oi === q.a) b.classList.add('ok'); else if (oi === pick[qi]) b.classList.add('no'); }); if (pick[qi] === q.a) c++; });
      const score = Math.round(c / qs.length * 100);
      if (score < 70) { $('#certBox').innerHTML = `<div class="donebar"><b>${score}점 — 조금만 더! 틀린 문제의 미션을 복습하고 다시 도전해요 💪</b><button class="btn w sm" id="retry">다시 풀기</button></div>`; $('#retry').onclick = () => renderMission(m); return; }
      task(m, 'pass');
      $('#certBox').innerHTML = `<div class="donebar ok"><b>🎉 ${score}점! 합격이에요.</b><span>이름을 적고 수료증을 받으세요.</span></div>
        <div class="bld" style="margin-top:12px"><input id="cname" placeholder="이름 (예: 황부연)" value="${esc(S.name || '')}"></div>
        <div class="cert" id="cert"><div class="seal">🎓</div><div style="letter-spacing:.3em;color:#a07a2c;font-weight:800">CERTIFICATE</div><h2>${esc(SHORT)} × Claude 협업 수료증</h2><div class="who2" id="cwho">${esc(S.name || '이름')}</div><p>위 사람은 <b>${esc(SHORT)} 연습실</b>의 미션을 수행하고 졸업 시험에서 <b>${score}점</b>을 받아<br>${esc(SHORT)}${J(SHORT,'과','와').slice(SHORT.length)} Claude를 함께 활용하는 역량을 갖추었음을 증명합니다.</p><p style="color:#8a7a5a;font-size:13px">${new Date().toLocaleDateString('ko-KR')} · AI Engine Practice Lab</p></div>
        <button class="btn w" style="margin-top:12px" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>`;
      $('#cname').oninput = e => { S.name = e.target.value; save(); $('#cwho').textContent = S.name || '이름'; };
      badge('grad'); confetti(120);
    };
  }
};

/* ---------- 배지 & 초기화 ---------- */
$('#bBadges').onclick = () => {
  const d = document.createElement('div'); d.className = 'modal';
  d.innerHTML = `<div class="box"><h3 style="margin:0">🏅 배지 컬렉션 (${S.badges.length}/${BADGES.length})</h3><div class="badges">${BADGES.map(b => `<div class="badge ${S.badges.includes(b[0]) ? 'on' : ''}"><span class="e">${b[1]}</span>${esc(b[2])}</div>`).join('')}</div><button class="btn" style="margin-top:16px">닫기</button></div>`;
  d.onclick = e => { if (e.target === d || e.target.tagName === 'BUTTON') d.remove(); };
  document.body.appendChild(d);
};
$('#bReset').onclick = () => { if (confirm(`${SHORT} 연습실 진행 상황을 모두 지울까요?`)) { S = fresh(); save(); renderXP(); go('home'); } };
$('#bMenu').onclick = () => $('#side').classList.toggle('open');
$('#bHome').onclick = () => go('home');
window.addEventListener('hashchange', route);
renderXP(); route();
})();
