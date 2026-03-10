import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-11',
    nutshell: '오라클 호실적과 유가 급락 속 혼조 마감',
    description:
      '주요 지수가 각기 다른 방향으로 마감하며 혼란스러운 모습을 보였습니다. 대형 기술주의 호재와 국제 유가 급락이라는 상반된 재료가 충돌하며 시장의 방향성을 가늠하기 어려운 하루였습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '주요 지수 및 원자재 동향',
    description:
      '오라클의 호실적이 기술주에 긍정적 영향을 미쳤으나, 지정학적 긴장 완화 기대감에 따른 유가 급락이 에너지 섹터를 끌어내리며 지수는 혼조세로 마감했습니다.',
    indices: [
      { name: 'S&P 500', value: 6781.48, change: -14.51, changePercent: -0.21 },
      { name: 'NASDAQ', value: 22697.10, change: 1.15, changePercent: 0.01 },
      { name: 'DOW', value: 47706.51, change: -34.29, changePercent: -0.07 },
      { name: 'Russell 2000', value: 2548.08, change: -5.59, changePercent: -0.22 },
    ],
    commodities: [
      { name: 'WTI Crude (USD/bbl)', value: 86.39, change: -8.38, changePercent: -8.84 },
      { name: 'Gold Futures (USD/oz)', value: 5198.70, change: 107.20, changePercent: 2.11 },
      { name: 'Dollar Index', value: 98.94, change: -0.24, changePercent: -0.24 },
      { name: '10-Yr Treasury (Yield)', value: 4.15, change: 0.01, changePercent: 0.24 },
    ],
    charts: [
      { ticker: 'SP:SPX' },
      { ticker: 'NASDAQ:IXIC' },
      { ticker: 'DJ:DJI' },
      { ticker: 'TVC:RUT' },
      { ticker: 'NYMEX:CL1!' },
      { ticker: 'TVC:DXY' },
      { ticker: 'COMEX:GC1!' },
      { ticker: 'TVC:US10Y' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 7,
    icon: 'cpu',
    title: "AI 수요가 이끈 오라클의 '깜짝 실적'",
    subtitle: '클라우드 부문 성장으로 시간 외 주가 급등',
    bullets: [
      '시장 예상을 뛰어넘는 분기 매출 및 이익 달성',
      'AI 수요에 힘입은 클라우드 인프라(OCI) 부문 괄목할 성장',
      '실적 발표 후 시간 외 거래에서 주가 6% 이상 급등',
      '향후 매출 전망까지 상향 조정하며 자신감 피력',
    ],
    theme: 'blue',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 8,
    title: '오라클 분기 실적 하이라이트',
    description:
      '오라클은 인공지능발 수요가 얼마나 강력한지 다시 한번 입증하며 시장의 우려를 불식시켰습니다. 안정적인 국채 금리도 기술주에 긍정적으로 작용했습니다.',
    stats: [
      { label: '분기 매출', value: '$171.9억', subtext: '시장 예상 상회', trend: 'up' },
      { label: '주당 순이익(EPS)', value: '$1.79', subtext: '시장 예상 상회', trend: 'up' },
      { label: '시간 외 주가', value: '+6% 이상', subtext: '실적 발표 후 급등', trend: 'up' },
    ],
    theme: 'blue',
    charts: [{ ticker: 'ORCL' }],
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 9,
    title: '클라우드 시장의 새로운 강자, 오라클',
    description:
      '오라클은 거대 경쟁사들이 즐비한 시장에서 자신만의 영역을 성공적으로 구축하고 있음을 증명했습니다. 특히 미래 수익의 가늠자인 잔여이행의무(RPO)가 폭발적으로 증가했습니다.',
    items: [
      {
        label: 'Oracle (OCI)',
        value: '$49억 매출',
        description: '핵심 인프라 매출, 시장 예상치 상회하며 급성장',
        highlight: true,
      },
      {
        label: 'Amazon (AWS)',
        value: '시장 선두주자',
        description: '업계 1위의 거대 경쟁사',
        highlight: false,
      },
      {
        label: 'Microsoft (Azure)',
        value: '강력한 2위',
        description: 'AI를 앞세워 빠르게 추격 중',
        highlight: false,
      },
      {
        label: 'Google (GCP)',
        value: '3대 클라우드 강자',
        description: '치열한 경쟁을 벌이는 주요 사업자',
        highlight: false,
      },
    ],
  },
  {
    id: 5,
    type: 'stats',
    turnId: 11,
    title: '미래를 향한 오라클의 자신감',
    description:
      '오라클은 막대한 데이터센터 투자와 기술적 차별화 전략을 바탕으로 미래 매출 전망치를 대폭 상향 조정하며 시장에 강한 신뢰를 주었습니다.',
    stats: [
      { label: '잔여이행의무(RPO)', value: '$5,530억', subtext: '전년 대비 300%+ 급증', trend: 'up' },
      { label: '2027년 매출 전망', value: '$900억', subtext: '기존 예상치 대폭 상향', trend: 'up' },
      { label: '핵심 전략', value: 'AI 레이크하우스', subtext: '대규모 AI 계약의 원동력', trend: 'neutral' },
    ],
    note: '대규모 데이터센터 투자와 기술 차별화가 미래 성장의 배경입니다.',
    theme: 'blue',
  },
  {
    id: 6,
    type: 'headline',
    turnId: 15,
    icon: 'droplet',
    title: '지정학적 긴장 완화 기대감에 유가 급락',
    subtitle: "트럼프 발언 한마디에 에너지 섹터 '휘청'",
    bullets: [
      '이란 분쟁 조기 종식 가능성 시사 발언이 촉매',
      '서부 텍사스산 원유(WTI) 8.2% 이상 폭락',
      '브렌트유 11% 이상 폭락하며 더 큰 하락폭 기록',
      '엑슨모빌, 쉐브론 등 에너지 대형주 동반 하락',
    ],
    theme: 'amber',
  },
  {
    id: 7,
    type: 'stats',
    turnId: 16,
    title: '유가 급락의 시장 파급 효과',
    description:
      '공급망 불안에 대한 우려가 급격히 해소되며 국제 유가가 폭락했고, 이는 에너지 섹터 전반의 약세로 이어져 주요 지수의 발목을 잡았습니다.',
    stats: [
      { label: 'WTI 유가', value: '-8.2% 이상', subtext: '배럴당 $86선 마감', trend: 'down' },
      { label: '브렌트유', value: '-11% 이상', subtext: '더 큰 폭으로 하락', trend: 'down' },
      { label: '에너지 섹터(XLE)', value: '-1.3%', subtext: '업종 지수 급락', trend: 'down' },
    ],
    charts: [{ ticker: 'NYMEX:CL1!' }, { ticker: 'ICE:BRN1!' }, { ticker: 'XLE' }],
  },
  {
    id: 8,
    type: 'headline',
    turnId: 17,
    title: "사라진 '지정학적 리스크 프리미엄'",
    subtitle: '시장이 유가 급락에 민감하게 반응한 이유',
    description:
      '시장은 그동안 호르무즈 해협 봉쇄 가능성 등 지정학적 리스크를 유가에 미리 반영하고 있었습니다. 이 프리미엄이 순식간에 사라지면서 투매 현상이 나타났습니다.',
    bullets: [
      '호르무즈 해협 봉쇄 우려 등 리스크가 유가에 선반영',
      "트럼프 발언이 '최악의 시나리오' 회피 심리 자극",
      'G7 재무장관의 전략비축유(SPR) 방출 준비 발언',
      "실제 상황 변화보다 '위험 인식' 변화가 투매 유발",
    ],
    theme: 'amber',
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'VRTX',
    companyName: 'Vertex Pharmaceuticals',
    currentPrice: 499.17,
    dayChange: 38.30,
    dayChangePercent: 8.31,
    description:
      "신장 질환 치료제 후보물질 '포베타셉트'의 3상 임상시험 결과가 '놀라운' 수준으로 발표되며 S&P 500 내에서 가장 높은 상승률을 기록했습니다.",
    charts: [{ ticker: 'VRTX' }],
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'VRTX',
    title: '성공적인 파이프라인 다각화',
    points: [
      "신장 질환 치료제 '포베타셉트' 3상 임상에서 '놀라운' 결과 발표",
      '주력 사업인 낭포성 섬유증 의존도를 낮출 핵심 성장 동력 확보',
      "$50억에 인수한 '알파인 이뮨 사이언스' M&A 전략의 성공 증명",
    ],
    description:
      '이번 임상 성공은 버텍스가 단일 질환 치료제 중심에서 벗어나 새로운 성장 스토리를 쓰고 있음을 보여주는 중요한 이정표입니다.',
    outlook: '긍정적 모멘텀',
    outlookColor: 'emerald',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'VRTX',
    title: '숨겨진 위험: 단일 제품 의존도',
    points: [
      "전체 매출의 86%가 낭포성 섬유증 치료제 '트리카프타'에서 발생",
      '회사의 운명이 사실상 하나의 제품군에 달려있는 구조적 취약점',
      "핵심 수익원에 문제 발생 시 회사 전체가 흔들릴 수 있는 '단일 실패 지점' 리스크",
    ],
    description:
      '화려한 신약 개발 뉴스 이면에는 핵심 사업의 높은 집중도라는 본질적인 리스크가 존재합니다.',
    outlook: '구조적 취약점',
    outlookColor: 'amber',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'VRTX',
    title: '현실화된 위협: 규제 리스크',
    points: [
      '미국 정부의 인플레이션 감축법(IRA)으로 인한 약가 인하 압박',
      "여러 주에서 설립한 '처방약 경제성 위원회'의 감시",
      "실제 콜로라도 주에서 '트리카프타' 약가 적정성 검토 진행 사례",
    ],
    description:
      '신약 개발의 자금줄 역할을 하는 핵심 사업의 수익성이 규제에 의해 언제든 훼손될 수 있다는 명백한 신호입니다.',
    outlook: '규제 압박 심화',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'VRTX',
    title: '밸류에이션: 기대감이 과도하게 반영되었나?',
    points: [
      '현재 주가는 모든 신약 파이프라인의 성공이라는 가장 낙관적인 시나리오를 반영',
      '분석가 추산 본질가치(주당 $340-390)를 30% 이상 상회하는 수준',
      "미래 불확실성에 대한 '안전마진'이 거의 없는 가격대",
    ],
    description:
      '버텍스는 훌륭한 기술력을 가진 기업이지만, 현재 주가는 그 가치를 넘어 미래의 불확실한 성공까지 모두 가격에 녹여낸 것으로 보입니다.',
    outlook: '고평가 우려',
    outlookColor: 'amber',
  },
  {
    id: 14,
    type: 'events',
    turnId: 35,
    title: '이번 주 주목해야 할 주요 경제 지표',
    description:
      '이번 주는 인플레이션 데이터 주간입니다. 연준의 금리 결정에 직접적인 영향을 미칠 핵심 지표들이 연이어 발표됩니다.',
    events: [
      {
        date: '3월 12일 (화)',
        label: '2월 소비자물가지수 (CPI)',
        description: '연준의 금리 정책에 가장 직접적인 영향을 미치는 핵심 인플레이션 지표',
      },
      {
        date: '3월 14일 (목)',
        label: '2월 생산자물가지수 (PPI)',
        description: '소비자 물가의 선행 지표로 인플레이션 방향성 가늠',
      },
      {
        date: '3월 14일 (목)',
        label: '2월 소매판매',
        description: '미국 경제의 70%를 차지하는 소비 건전성 확인',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '데이터를 확인하며 대응하는 지혜가 필요한 시점',
    tagline: '인플레이션 지표에 쏠린 시장의 눈',
    description:
      'CPI를 시작으로 PPI, 소매판매까지 핵심 지표 결과에 따라 시장의 단기 변동성이 크게 확대될 수 있습니다. 섣부른 예측보다 발표되는 데이터를 차분히 확인하며 대응하는 전략이 유효합니다.',
  },
];