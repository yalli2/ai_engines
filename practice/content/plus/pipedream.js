/* Pipedream — 추가 기능 미션 (순위 22위) */
var P = (id, rows) => { const f = (window.FEATURES = window.FEATURES || {}); f[id] = (f[id] || []).concat(rows); };
P('pipedream', [
 ['⏰','스케줄 트리거(Cron)','<b>Schedule</b> 트리거로 “매일 오전 8시”, “매주 월요일”처럼 정해진 시간에 워크플로를 실행해요.',
  'Schedule 트리거 선택::새 워크플로|주기 설정::cron 또는 간단 설정|시간대 지정::Asia/Seoul|테스트 실행::결과 확인',
  '⏰ 매일 08:00 오늘 수업 일정 슬랙 알림',
  '매일 아침 [오늘 수업 일정 요약]을 보내는 Pipedream 워크플로를 설계해 줘: cron 식, 캘린더 조회 단계, Claude 요약 단계, 슬랙 전송.',
  '정해진 시간마다 실행하는 트리거는?','Schedule(cron)|HTTP webhook|Email only|Manual only',0,'Schedule 트리거는 cron 주기로 실행해요.',
  '심화 기능','시간대를 Asia/Seoul로 꼭 지정하세요. 기본은 UTC일 수 있어요.'],
 ['💾','Data Stores로 상태 저장','<b>Data Stores</b>에 키-값 데이터를 저장해 “마지막으로 처리한 메일 ID” 같은 상태를 기억해요.',
  'Data Store 만들기::이름|코드에서 읽기·쓰기::$.service.db|중복 확인::처리한 ID 비교|조회::대시보드',
  '💾 같은 메일을 두 번 처리하지 않음',
  'Pipedream 코드 단계에서 Data Store로 처리한 문의 ID를 기록하고 중복을 건너뛰는 Node.js 코드를 써 줘.',
  '워크플로 실행 사이에 값을 기억하는 Pipedream 기능은?','Data Stores|Sources|Logs|Billing',0,'Data Stores는 실행 간 상태를 저장해요.',
  '심화 기능','키 이름 규칙(예: processed:메일ID)을 정해 두면 관리가 쉬워요.'],
 ['🌐','HTTP 응답으로 API 만들기','HTTP 트리거 워크플로에서 <b>응답(Response)</b>을 돌려주면 나만의 간단한 API를 만들 수 있어요.',
  'HTTP 트리거::엔드포인트 URL|입력 처리::쿼리·본문|Claude 단계 호출::응답 생성|$.respond()::결과 반환',
  '🌐 단어를 보내면 예문 3개를 돌려주는 API',
  'Pipedream으로 [단어 → 예문 3개(스페인어+한국어) JSON] API를 만드는 단계와 코드를 써 줘. 남용을 막는 간단한 키 검사도 넣어 줘.',
  'Pipedream HTTP 워크플로에서 결과를 요청자에게 돌려주는 방법은?','응답($.respond) 반환|이메일 발송만|로그 출력만|파일 삭제',0,'응답을 반환하면 워크플로가 API처럼 동작해요.',
  '전문가 기능','공개 엔드포인트에는 간단한 비밀 키 검사를 꼭 넣으세요.'],
 ['🔗','Connect로 사용자 앱 연결','<b>Pipedream Connect</b>로 내 서비스 사용자가 자기 계정(구글 등)을 연결하게 하고, 그 권한으로 작업을 실행해요.',
  'Connect 프로젝트 만들기::설정|연결 버튼 삽입::내 사이트|사용자 인증::OAuth|사용자 권한으로 실행::API 호출',
  '🔗 학습 사이트에서 학생이 구글 드라이브 연결',
  '학습 사이트에 [구글 드라이브 과제 제출] 연결 기능을 넣을 때 Pipedream Connect 흐름(연결 → 업로드 → 확인)과 개인정보 안내 문구를 써 줘.',
  '내 서비스 사용자가 자기 앱 계정을 연결하게 하는 Pipedream 기능은?','Connect|Schedule|Data Stores|Logs',0,'Connect로 최종 사용자 계정 연결을 관리해요.',
  '전문가 기능','학생 계정 연결은 최소 권한만 요청하고 목적을 분명히 안내하세요.']
]);
