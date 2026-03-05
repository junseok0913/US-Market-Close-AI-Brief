import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-28',
    nutshell: '인플레이션 우려 속 개별 기업 격변 장세',
    description:
      '예상보다 높은 생산자물가지수(PPI)가 시장 전반에 하방 압력을 가한 가운데, 대형 M&A 및 구조조정 소식을 발표한 일부 기업들은 시장 흐름과 무관하게 급등하며 차별화된 모습을 보였습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '주요 지수 하락 마감',
    description:
      '예상보다 높게 나온 생산자물가지수(PPI)가 연준의 긴축 장기화 우려를 자극하며 3대 지수 모두 하락했습니다. 소형주 중심의 러셀 2000은 더 큰 폭으로 내렸습니다.',
    indices: [
      { name: 'S&P 500', value: 6878.88, change: -29.98, changePercent: -0.43 },
      { name: 'NASDAQ', value: 22668.21, change: -210.17, changePercent: -0.92 },
      { name: 'DOW', value: 48977.92, change: -521.28, changePercent: -1.05 },
      { name: 'Russell 2000', value: 2632.36, change: -44.93, changePercent: -1.68 },
    ],
    commodities: [
      { name: '10년물 국채금리', value: 3.96, change: -0.06, changePercent: -1.37 },
      { name: '달러 인덱스', value: 97.68, change: -0.11, changePercent: -0.11 },
      { name: 'WTI 유', value: 67.40, change: 2.19, changePercent: 3.36 },
      { name: '금 선물', value: 5293.70, change: 117.20, changePercent: 2.26 },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: '나스닥' },
      { ticker: 'DJ:DJI', title: '다우존스' },
      { ticker: 'TVC:RUT', title: '러셀 2000' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 3,
    title: '시장을 역행한 개별 기업들',
    subtitle: 'M&A 및 구조조정 소식에 급등',
    description:
      '거시 경제 지표의 악재에도 불구하고, 명확한 개별 호재를 가진 기업들은 시장의 하락 분위기를 이겨내고 큰 폭의 주가 상승을 기록했습니다.',
    bullets: [
      '블록(SQ): AI 도입 및 대규모 인력 감축 발표 후 20% 이상 급등',
      '넷플릭스(NFLX): 워너 브라더스 인수 포기, 불확실성 해소에 13% 이상 급등',
      '파라마운트(PARA): 워너 브라더스 인수 유력해지며 20% 이상 급등',
      '워너 브라더스(WBD): 인수 가격 상승 기대감 꺾이며 2% 이상 하락',
    ],
    theme: 'gold',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '예상 상회한 1월 생산자물가지수(PPI)',
    description:
      '시장의 예상을 크게 웃돈 PPI 데이터가 인플레이션과의 싸움이 아직 끝나지 않았음을 시사하며 투자 심리를 위축시켰습니다.',
    stats: [
      { label: 'PPI 월간 상승률', value: '0.5%', subtext: '예상치(0.3%) 상회', trend: 'up' },
      { label: '근원 PPI 월간 상승률', value: '0.8%', subtext: '예상치 두 배 이상', trend: 'up' },
      { label: '10년물 국채금리', value: '3.96%', subtext: '금리 인하 기대 후퇴 반영', trend: 'up' },
    ],
    note: '높은 물가 지표는 연준의 금리 인하 경로가 더 험난할 수 있음을 시사합니다.',
    theme: 'red',
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'TVC:US10Y', title: '미 10년물 국채금리' },
    ],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 9,
    title: '연준 금리 인하 기대감 후퇴',
    subtitle: '끈적한 인플레이션, 긴축 장기화 우려',
    description:
      '끈적한 인플레이션이 확인되면서 시장의 조기 금리 인하 기대감은 크게 후퇴했으며, 이는 금리에 민감한 기술주에 특히 부담으로 작용했습니다.',
    bullets: [
      '상반기(5월/6월) 금리 인하 기대감 크게 후퇴',
      '하반기에나 첫 금리 인하 가능할 것이라는 전망에 무게',
      '기술주 섹터(-1.6%) 하락 주도, 성장주 부담 가중',
      '유틸리티 섹터(+1%) 상승, 안전자산 선호 심리 반영',
    ],
    theme: 'red',
    charts: [
      { ticker: 'XLK', title: '기술주 ETF' },
      { ticker: 'XLU', title: '유틸리티 ETF' },
    ],
  },
  {
    id: 5,
    type: 'headline',
    turnId: 11,
    title: '시장의 다음 관문: PCE 물가지수',
    subtitle: '금리 경로의 향방을 결정할 핵심 지표',
    description:
      '시장의 모든 시선은 연준이 가장 중요하게 여기는 인플레이션 지표인 개인소비지출(PCE) 가격지수로 향하고 있습니다. PCE 결과에 따라 시장의 방향성이 결정될 전망입니다.',
    bullets: [
      '발표 예정일: 3월 13일',
      '연준이 가장 선호하는 인플레이션 척도',
      'PCE 높을 경우: 금리 인하 지연, 추가 인상 가능성 부상',
      'PCE 낮을 경우: PPI 쇼크 상쇄, 시장 안도 가능성',
    ],
    theme: 'amber',
  },
  {
    id: 6,
    type: 'headline',
    turnId: 13,
    icon: 'film',
    title: '미디어 업계 지각변동',
    subtitle: '워너 브라더스 인수전, 희비 교차',
    description:
      '워너 브라더스 디스커버리 인수전의 구도가 급변하면서 관련 기업들의 주가가 크게 엇갈렸습니다. 이는 거시 경제 환경과 무관하게 개별 기업의 서사가 주가를 움직일 수 있음을 보여줍니다.',
    bullets: [
      '넷플릭스, 워너 브라더스 인수전 공식 철수',
      '파라마운트 스카이댄스, 유력 인수 후보로 부상',
      '인수전 참여 기업들의 손익계산서가 주가에 명확히 반영',
      '거시 경제 악재 속 개별 서사의 중요성 부각',
    ],
    theme: 'purple',
  },
  {
    id: 7,
    type: 'comparison',
    turnId: 15,
    title: 'WBD 인수전, 주가 희비 교차',
    description:
      '워너 브라더스 인수전 구도 변화에 따라 시장은 각 기업의 전략적 선택에 명확한 평가를 내렸습니다.',
    items: [
      {
        label: 'Netflix (NFLX)',
        value: '+13%',
        description: '무리한 출혈 경쟁 회피, 핵심 사업 집중 기대감',
        highlight: true,
      },
      {
        label: 'Paramount (PARA)',
        value: '+20%',
        description: '인수 성공 시 콘텐츠 라이브러리 및 시장 지배력 확대 기대',
        highlight: true,
      },
      {
        label: 'Warner Bros (WBD)',
        value: '-2%',
        description: '강력한 인수 후보 이탈로 인수 가격 상승 기대감 하락',
      },
    ],
  },
  {
    id: 8,
    type: 'headline',
    turnId: 17,
    icon: 'cpu',
    title: '블록(SQ), AI 기반 구조조정',
    subtitle: '비용 효율화에 월가 \'열광\'',
    description:
      '핀테크 기업 블록은 AI를 활용한 과감한 구조조정 계획을 발표하며, 비용 절감을 넘어 AI를 통한 체질 개선 의지를 보여주었고 시장은 이에 뜨겁게 반응했습니다.',
    bullets: [
      '4천 명 규모의 대규모 인력 감축 발표',
      '자체 AI 도구 \'구스\' 활용, 생산성 향상 비전 제시',
      'AI를 위기가 아닌 기회로 활용하겠다는 의지 표명',
      '주가 20% 이상 급등, 기술주 하락세 속 독보적 상승',
    ],
    theme: 'blue',
    charts: [
      { ticker: 'SQ', title: 'Block Inc.' },
      { ticker: 'NASDAQ:IXIC', title: '나스닥 지수' },
    ],
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 19,
    ticker: 'MS',
    companyName: 'Morgan Stanley',
    currentPrice: 166.51,
    dayChange: -10.98,
    dayChangePercent: -6.19,
    description:
      '모건 스탠리는 미래 성장 동력 발표와 내부 비관론이 동시에 나오면서 투자자들의 혼란이 가중, 주가가 4% 넘게 하락했습니다.',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 20,
    ticker: 'MS',
    title: '기회와 위험의 충돌',
    points: [
      '호재 (기회): 비트코인 수탁, 거래, 대출 등 디지털 자산 사업 전면 진출 발표',
      '악재 (위험): 자사 수석 전략가의 \'보이지 않는 시장 붕괴\' 경고',
      '결과: 상반된 소식에 투자자 혼란 가중, 주가 큰 폭 하락 마감',
    ],
    description:
      '월가의 대표 금융주 모건 스탠리가 암호화폐 사업 진출이라는 혁신적 발표와 시장 붕괴 경고라는 비관적 전망 사이에서 큰 변동성을 보였습니다.',
    outlook: '신사업의 잠재력과 기존 사업의 리스크 사이에서 투자자들의 평가가 엇갈리며 단기 변동성이 확대될 수 있습니다.',
    outlookColor: 'amber',
  },
  {
    id: 11,
    type: 'comparison',
    turnId: 22,
    title: '디지털 자산 사업: 양날의 검',
    description:
      '모건 스탠리의 암호화폐 사업 진출은 미래 금융을 선점하려는 대담한 시도인 동시에, 회사의 핵심 자산인 \'신뢰\'를 위협할 수 있는 위험한 도박으로 평가받고 있습니다.',
    items: [
      {
        label: '성장 기회 (Bull)',
        value: '미래 금융 선점',
        description: '브랜드 신뢰도를 바탕으로 시장 장악, 새로운 성장 곡선 창출 기대',
        highlight: true,
      },
      {
        label: '평판 리스크 (Bear)',
        value: '핵심 사업 위협',
        description: '암호화폐 사고 발생 시 웰스 매니지먼트 사업부의 신뢰에 치명타',
      },
      {
        label: '손익 비대칭',
        value: '위험 > 수익',
        description: '신사업의 잠재 이익보다 평판 훼손으로 인한 손실이 더 클 수 있다는 우려',
      },
    ],
  },
  {
    id: 12,
    type: 'stats',
    turnId: 26,
    title: '모건 스탠리의 핵심: 웰스 매니지먼트',
    description:
      '암호화폐 사업의 가장 큰 리스크는 회사 순수익의 약 46%를 차지하는 거대한 웰스 매니지먼트 사업부의 평판을 훼손할 수 있다는 점입니다.',
    stats: [
      { label: '관리 자산(AUM)', value: '$9조+', subtext: '2025년 연차보고서 기준', trend: 'neutral' },
      { label: '순수익 기여도', value: '약 46%', subtext: '회사 전체 수익의 기둥', trend: 'neutral' },
      { label: '잠재적 손실', value: '0.5% 자산 이탈 시', subtext: '신사업 기대 이익 상쇄 가능', trend: 'down' },
    ],
    note: '시장은 신사업의 수익을 위해 회사의 핵심 자산인 \'신뢰\'를 담보로 잡는 것에 의문을 제기하고 있습니다.',
    theme: 'blue',
  },
  {
    id: 13,
    type: 'events',
    turnId: 30,
    title: '주요 경제 지표 발표 일정',
    description:
      '물가 지표 발표 이후, 시장의 관심은 경제의 실질적인 체력을 보여주는 제조업, 서비스업, 고용 관련 지표로 이동할 것입니다.',
    events: [
      {
        date: '2026-03-02',
        label: 'ISM 제조업 구매관리자지수',
        description: '제조업 경기의 확장/위축 국면 판단',
      },
      {
        date: '2026-03-04',
        label: 'ISM 서비스업 구매관리자지수',
        description: '경제의 큰 부분을 차지하는 서비스업 동향',
      },
      {
        date: '2026-03-06',
        label: '2월 고용보고서',
        description: '신규 고용, 실업률, 임금 상승률 등 핵심 데이터',
      },
    ],
  },
  {
    id: 14,
    type: 'headline',
    turnId: 32,
    title: '최종 관문: 2월 고용보고서',
    subtitle: '연준의 정책 경로를 결정할 핵심 변수',
    description:
      '다음 주 발표될 2월 고용보고서는 PCE 발표 이후 가장 중요한 분수령이 될 것입니다. 특히 임금 상승률 데이터는 인플레이션과 직결되어 시장의 방향을 결정할 수 있습니다.',
    bullets: [
      '주요 관찰 지표: 비농업 신규 고용, 실업률, 시간당 평균 임금',
      '임금 상승률: 인플레이션과 직결, 연준의 최대 관심사',
      '1월 고용 서프라이즈: 시장에 충격을 줬던 강한 고용 데이터',
      '2월 데이터 향방: 노동 시장의 점진적 둔화 신호 여부가 관건',
    ],
    theme: 'amber',
  },
  {
    id: 15,
    type: 'closing',
    turnId: 34,
    headline: '데이터에 의존하는 변동성 장세 지속',
    tagline: '단기 변동보다 큰 그림을 확인해야 할 때',
    description:
      '시장은 당분간 개별 데이터 하나하나에 민감하게 반응할 가능성이 높습니다. 단기적인 지표 변동에 흔들리기보다, 인플레이션 둔화와 고용 시장 균형이라는 큰 흐름이 훼손되지 않는지 확인하며 신중하게 포트폴리오를 관리하는 지혜가 필요합니다.',
  },
];