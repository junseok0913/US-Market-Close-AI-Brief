import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '20260127',
    nutshell: '빅테크 실적 기대감과 FOMC 경계감 속 지수 혼조',
    description:
      '기술주는 AI 실적 기대감에 상승했지만, 헬스케어 섹터의 급락으로 다우 지수는 하락하는 등 시장이 엇갈린 모습을 보였습니다. 투자자들은 내일 있을 연준의 금리 결정을 앞두고 관망하는 자세를 취했습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      'S&P 500 지수는 사상 최고치를 경신했으나, 다우 지수는 유나이티드헬스의 급락으로 하락하며 주요 지수가 혼조세로 마감했습니다. 기술주 중심의 나스닥은 빅테크 실적 기대로 강세를 보였습니다.',
    indices: [
      { name: 'S&P 500', value: 0, change: 0, changePercent: 0.4 },
      { name: 'NASDAQ', value: 0, change: 0, changePercent: 0.9 },
      { name: 'DOW', value: 0, change: 0, changePercent: -0.8 },
    ],
    commodities: [
      { name: '10년물 국채금리', value: 4.2, change: 0, changePercent: 0.0 },
    ],
    charts: [
      { ticker: 'SP:SPX' },
      { ticker: 'NASDAQ:IXIC' },
      { ticker: 'DJ:DJI' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 7,
    icon: 'cpu',
    title: 'AI 기대감, 기술주 랠리 주도',
    subtitle: '빅테크 실적 발표 앞두고 기대감 최고조',
    description:
      '시장은 인공지능(AI)이 클라우드 사업의 폭발적인 성장으로 이어질 것이라는 기대감에 기술주 중심의 랠리를 보였습니다. 마이크로소프트, 알파벳, 엔비디아 등 주요 기술주가 동반 상승했습니다.',
    bullets: [
      'MSFT & GOOGL: 실적 발표 앞두고 1% 이상 상승',
      'NVIDIA: AI 칩 리더십 부각되며 2% 이상 상승',
      '핵심 동력: AI 투자가 클라우드 수익으로 증명될 것이라는 기대',
      'FOMC 경계감 속에서도 기술주로 자금 쏠림 현상 발생',
    ],
    theme: 'blue',
  },
  {
    id: 3,
    type: 'comparison',
    turnId: 9,
    title: 'MSFT vs GOOGL: AI 실적 관전 포인트',
    description:
      '이번 실적 발표는 두 빅테크 기업이 AI 기술을 어떻게 실제 수익으로 연결하고 있는지 보여주는 첫 번째 성적표가 될 전망입니다. 시장은 클라우드 부문의 성장률에 주목하고 있습니다.',
    items: [
      {
        label: 'Microsoft (MSFT)',
        value: 'Azure 성장 가속화',
        description: '생성형 AI 도입이 기존 고객 지출을 늘리고 신규 고객을 유치하는 선순환을 만들었는지 확인',
      },
      {
        label: 'Alphabet (GOOGL)',
        value: 'Google Cloud 점유율',
        description: 'AI를 무기로 AWS, Azure와의 경쟁에서 점유율을 얼마나 확대했는지, 광고 사업에 미치는 영향은 어떤지 주목',
        highlight: true,
      },
    ],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 11,
    title: 'AI 생태계의 낙수 효과',
    description:
      'AI 랠리는 칩 제조사인 엔비디아를 넘어 반도체 장비 기업인 ASML까지 공급망 전반으로 확산되고 있습니다. 클라우드 기업의 투자가 관련 생태계 기업들의 실적 개선으로 이어지는 구조입니다.',
    stats: [
      { label: 'NVIDIA (NVDA)', value: '+2.3%', subtext: '52주 신고가 경신', trend: 'up' },
      { label: 'ASML', value: '주가 동반 상승', subtext: 'EUV 장비 독점 공급', trend: 'up' },
      { label: '핵심 논리', value: '클라우드 투자 → 칩 수요 ↑ → 장비 수요 ↑', trend: 'neutral' },
    ],
    note: 'AI를 중심으로 한 강력한 반도체 공급망 생태계가 형성되며 관련 기업 주가를 견인하고 있습니다.',
    theme: 'blue',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 15,
    icon: 'activity',
    title: '헬스케어 섹터 급락',
    subtitle: '다우 지수 하락의 주범',
    description:
      '기술주 강세에도 불구하고 다우 지수가 하락한 주된 원인은 헬스케어 섹터의 동반 부진이었습니다. 특히 다우 지수 내 비중이 큰 유나이티드헬스 그룹의 주가 폭락이 지수 전체를 끌어내렸습니다.',
    bullets: [
      '다우 지수 홀로 0.8% 이상 하락',
      'S&P 500 헬스케어 섹터, 11개 중 가장 저조한 성과',
      '유나이티드헬스(UNH) 주가 20% 가까이 폭락',
      '특정 섹터의 악재가 시장을 왜곡하는 모습',
    ],
    theme: 'red',
    charts: [{ ticker: 'DJ:DJI' }, { ticker: 'UNH' }, { ticker: 'XLV' }],
  },
  {
    id: 6,
    type: 'stats',
    turnId: 17,
    title: '메디케어 지급률 쇼크',
    description:
      '정부가 발표한 2027년도 메디케어 어드밴티지 플랜의 잠정 지급률이 시장 예상치를 터무니없이 밑돌면서 투자 심리가 급격히 악화되었습니다. 이는 보험사들의 수익성 악화 우려로 이어졌습니다.',
    stats: [
      { label: '정부 잠정 제안', value: '+0.09%', subtext: '실질적 인상률', trend: 'down' },
      { label: '시장 예상치', value: '4% ~ 6%', subtext: '인상률 기대', trend: 'neutral' },
      { label: '시장 반응', value: '충격', subtext: '수익성 악화 우려 폭발', trend: 'down' },
    ],
    note: '양호한 분기 실적에도 불구하고, 정부 정책 리스크가 주가에 결정적인 악재로 작용했습니다.',
    theme: 'red',
  },
  {
    id: 7,
    type: 'headline',
    turnId: 19,
    title: '보험주 동반 폭락',
    subtitle: '업계 전반으로 번진 공포',
    description:
      '메디케어 지급률 쇼크는 유나이티드헬스뿐만 아니라 관련 사업 비중이 높은 경쟁사들의 주가에도 큰 타격을 주었습니다. 이는 개별 기업의 문제가 아닌 업계 전체의 규제 리스크로 인식되었습니다.',
    bullets: [
      '휴매나(HUM): 20% 이상 폭락',
      'CVS 헬스(CVS): 10% 이상 급락',
      '시그나 그룹 등 관련주 일제히 큰 폭으로 하락',
      '정부 정책 변화가 업계 수익 모델을 위협한다는 우려 확산',
    ],
    theme: 'red',
    charts: [{ ticker: 'HUM' }, { ticker: 'CVS' }],
  },
  {
    id: 8,
    type: 'events',
    turnId: 23,
    title: '연준의 결정을 기다리는 시장',
    description:
      '시장은 빅테크 실적이라는 호재와 거시 경제 불확실성이라는 악재가 맞서며 뚜렷한 방향성을 보이지 못했습니다. 투자자들은 내일 있을 FOMC 회의 결과를 기다리며 숨을 죽이는 모습입니다.',
    events: [
      {
        date: '2026-01-28',
        label: 'FOMC 기준금리 결정',
        description: '금리 동결이 유력하지만, 향후 정책 방향에 대한 힌트가 나올지 주목됩니다.',
      },
      {
        date: '2026-01-27',
        label: '소비자 신뢰지수 발표',
        description: '2014년 5월 이후 최저치로 급락하며 경기 둔화 우려를 자극했습니다.',
      },
    ],
  },
  {
    id: 9,
    type: 'stats',
    turnId: 27,
    title: '소비 심리, 10년래 최악',
    description:
      '컨퍼런스보드가 발표한 1월 소비자 신뢰지수가 시장 예상치를 크게 밑돌며 10년 이상 만에 가장 낮은 수준으로 떨어졌습니다. 이는 연준의 정책 결정에 부담으로 작용할 수 있습니다.',
    stats: [
      { label: '1월 소비자 신뢰지수', value: '84.5', subtext: '시장 예상치 대폭 하회', trend: 'down' },
      { label: '수준', value: '2014년 이후 최저', subtext: '팬데믹 초기보다 비관적', trend: 'down' },
      { label: '미래 기대 지수', value: '< 80', subtext: '통상적 경기 침체 예고 신호', trend: 'down' },
    ],
    note: '소비 심리 급랭은 인플레이션과 경기 침체 사이에서 연준의 정책 딜레마를 심화시킬 가능성이 있습니다.',
    theme: 'red',
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 28,
    ticker: 'MU',
    companyName: 'Micron Technology',
    currentPrice: 0,
    dayChange: 0,
    dayChangePercent: 0,
    description:
      '마이크론 테크놀로지는 오늘 대규모 투자 계획을 발표하며 시장의 주목을 받았습니다. 이는 회사가 AI 시대의 핵심 공급자로 변모하려는 전략적 움직임으로 해석되며 주가에 긍정적인 영향을 미쳤습니다.',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'MU',
    title: '핵심 기회: AI 시대의 거대한 베팅',
    description:
      '마이크론은 향후 10년간 싱가포르에 240억 달러를 투자해 신규 낸드 메모리 칩 공장을 건설한다고 발표했습니다. 이는 AI 데이터센터의 폭발적인 스토리지 수요를 선점하기 위한 전략으로 풀이됩니다.',
    points: [
      '향후 10년간 싱가포르에 240억 달러 투자 계획 발표',
      '신규 낸드 메모리 칩 제조 시설 건설',
      'AI 데이터센터의 폭발적인 스토리지 수요 선점 목적',
      '단순 메모리 기업에서 AI 인프라 핵심 공급자로의 변모 기대',
    ],
    outlook: 'AI Momentum',
    outlookColor: 'purple',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 31,
    ticker: 'MU',
    title: '주요 리스크: 공급 과잉의 역사',
    description:
      '메모리 산업은 과거 호황기에 이루어진 대규모 증설이 공급 과잉과 가격 붕괴로 이어진 역사가 있습니다. 경쟁사들 역시 막대한 투자를 진행하고 있어, 2028년경 공급 과잉이 재현될 수 있다는 우려가 제기됩니다.',
    points: [
      '메모리 산업의 고질적인 호황-불황 사이클',
      '경쟁사(삼성, SK하이닉스) 역시 대규모 증설 진행 중',
      '2028년경 생산 능력 동시 집중 시 공급 과잉 우려',
      '과거와 같은 "치킨 게임" 재현 가능성 제기',
    ],
    outlook: 'Cyclical Risk',
    outlookColor: 'amber',
  },
  {
    id: 13,
    type: 'comparison',
    turnId: 33,
    title: 'AI 수요, 과거의 패턴을 깰 것인가?',
    description:
      '이번 대규모 투자의 성패는 AI가 창출할 메모리 수요가 과거 PC나 스마트폰 수요와 근본적으로 다를 것인지에 대한 전망에 달려 있습니다.',
    items: [
      {
        label: '과거의 패턴 (비관론)',
        value: '공급 과잉 우려',
        description: 'PC, 스마트폰 수요처럼 경기 변동에 민감할 것이며, 증설은 가격 붕괴로 이어질 수 있다는 관점.',
      },
      {
        label: '새로운 패러다임 (낙관론)',
        value: '구조적 성장',
        description: 'AI 수요는 빅테크 투자가 주도하며 경기 변동에 둔감. 메모리는 AI 성능에 필수재이므로 모든 공급을 흡수할 것이라는 관점.',
        highlight: true,
      },
    ],
  },
  {
    id: 14,
    type: 'ticker-analysis',
    turnId: 35,
    ticker: 'MU',
    title: '재무적 부담 분석',
    description:
      '240억 달러라는 천문학적인 투자금은 상당한 규모의 부채 발행을 동반할 수 있으며, 이는 향후 금리 변동에 대한 재무적 취약성을 높이는 요인입니다. 또한 신규 공장의 감가상각비 부담도 고려해야 합니다.',
    points: [
      '대규모 투자금 조달을 위한 신규 부채 발행 가능성',
      '금리 변동에 대한 재무적 취약성 증가',
      '2028년 하반기부터 막대한 감가상각비 발생 예상',
      '시장 하강 국면과 맞물릴 경우 수익성 급격 악화 위험',
    ],
    outlook: 'Financial Pressure',
    outlookColor: 'rose',
  },
  {
    id: 15,
    type: 'closing',
    turnId: 43,
    headline: '변동성 속 기회 탐색',
    tagline: '거시적 관점으로 원칙을 지키는 투자',
    description:
      'FOMC 발표 직후 시장의 첫 반응은 단기적일 수 있습니다. 성급한 판단보다는 연준의 메시지를 차분히 분석하고, 거시적인 관점에서 자신의 투자 전략을 점검하는 지혜가 필요한 시점입니다.',
  },
];