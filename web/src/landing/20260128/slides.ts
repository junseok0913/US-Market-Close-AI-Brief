import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-01-28',
    nutshell: '연준의 매파적 동결 속 빅테크 실적 대기 장세',
    description:
      '연방공개시장위원회(FOMC)가 금리를 동결했지만, 제롬 파월 의장의 매파적 발언으로 시장은 혼조세로 마감했습니다. 투자자들의 시선은 이제 장 마감 후 발표될 빅테크 기업들의 실적으로 향하고 있습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '연준의 금리 동결과 파월 의장의 기자회견 내용에 따라 시장이 변동성을 보이며 혼조세로 마감했습니다. 기술주는 빅테크 실적 기대감에 상대적 강세를 보였습니다.',
    indices: [
      { name: 'S&P 500', value: 6999.3, change: -0.7, changePercent: -0.01 },
      { name: 'NASDAQ', value: 24040.8, change: 40.8, changePercent: 0.17 },
      { name: 'DOW', value: 49009.8, change: 9.8, changePercent: 0.02 },
    ],
    commodities: [
      { name: '10년물 국채금리', value: 4.25, change: 0.06, changePercent: 1.43 },
      { name: '달러 인덱스', value: 104.1, change: 0.15, changePercent: 0.14 },
      { name: '금 선물', value: 5360.5, change: 85.2, changePercent: 1.61 },
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
    icon: 'bank',
    title: '연준의 매파적 동결',
    subtitle: '조기 금리 인하 기대감 후퇴하며 시장 변동성 확대',
    description:
      '연준이 금리를 동결했지만, 파월 의장이 3월 금리 인하 가능성에 선을 그으면서 시장의 기대감이 꺾였습니다. 이로 인해 국채금리와 달러는 상승하고, 증시는 장중 상승분을 반납했습니다. 반면 금 가격은 사상 최고치를 경신했습니다.',
    bullets: [
      'S&P 500, 장중 사상 첫 7,000선 돌파 후 약보합 마감',
      '10년물 국채금리, 4.25% 수준까지 상승',
      '달러 인덱스, 약세에서 벗어나 소폭 반등',
      '금 선물, 온스당 $5,300 돌파하며 사상 최고치 경신',
    ],
    theme: 'blue',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 9,
    title: '파월 의장의 기자회견 주요 내용',
    description:
      '파월 의장은 견고한 경제를 이유로 섣부른 금리 인하에 대한 기대를 차단했습니다. 이는 CME 페드워치에 반영된 3월 인하 확률을 급격히 낮추는 결과로 이어졌습니다.',
    stats: [
      { label: 'FOMC 결정', value: '만장일치 아님', subtext: '2명, 25bp 인하 주장', trend: 'neutral' },
      { label: '경제 평가', value: '견고한 확장', subtext: '긍정적 전망 유지', trend: 'up' },
      { label: '향후 정책', value: '데이터 의존', subtext: '3월 인하 가능성 일축', trend: 'down' },
    ],
    note: '시장의 조기 금리 인하 기대가 후퇴하면서 국채 매도세가 나타나 금리 상승을 유발했습니다.',
    theme: 'blue',
    charts: [{ ticker: 'TVC:US10Y', title: '미 10년물 국채금리' }],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 11,
    icon: 'shield-check',
    title: '정치적 압박 속 연준의 독립성',
    subtitle: '통화정책의 신뢰도와 예측 가능성 시험대',
    description:
      '이번 FOMC는 행정부의 금리 인하 압박 속에서 연준의 독립성이 주목받는 회의였습니다. 파월 의장은 정치적 압력에 굴하지 않겠다는 의지를 분명히 하며, 통화정책의 신뢰도를 지키려는 모습을 보였습니다.',
    theme: 'purple',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 13,
    icon: 'cpu',
    title: '시장의 초점, 빅테크 실적으로 이동',
    subtitle: '나스닥, 실적 기대감에 차별화된 강세',
    description:
      '연준 이벤트가 끝나자 시장의 관심은 개별 기업의 펀더멘털로 빠르게 이동했습니다. 특히 장 마감 후 발표될 마이크로소프트, 메타 등 빅테크 실적에 대한 기대감이 나스닥 지수를 홀로 상승시키는 원동력이 되었습니다.',
    bullets: [
      '거시 경제(Macro)에서 개별 기업(Micro)으로 관심 이동',
      'AI 관련 투자가 실질적 매출/이익으로 연결되는지 여부가 관건',
      '기업 이익 성장이 시장의 새로운 방향키가 될 전망',
    ],
    theme: 'green',
    charts: [{ ticker: 'NASDAQ:IXIC', title: '나스닥 지수' }],
  },
  {
    id: 6,
    type: 'comparison',
    turnId: 17,
    title: '빅테크 실적 핵심 관전 포인트',
    description:
      '장 마감 후 실적을 발표한 마이크로소프트와 메타에 대한 시장의 기대는 각기 다른 곳에 집중되었습니다.',
    items: [
      {
        label: 'Microsoft (MSFT)',
        value: 'AI 수익화 증명',
        description: '핵심 클라우드 서비스 애저(Azure)의 성장률이 AI 모멘텀의 바로미터. 단, 막대한 자본 지출은 부담 요인.',
        highlight: false,
      },
      {
        label: 'Meta (META)',
        value: '광고 시장 회복',
        description: '핵심인 디지털 광고 시장의 회복세와 향후 가이던스가 시장 전체의 소비 심리를 가늠하는 지표로 작용.',
        highlight: false,
      },
    ],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 21,
    icon: 'bar-chart-2',
    title: '이중 속도 시장 (Two-Speed Market)',
    subtitle: '유동성 장세에서 펀더멘털 장세로',
    description:
      '오늘 시장은 금리 인하 기대감 같은 유동성의 힘이 아닌, 기업의 실제 이익 성장이라는 펀더멘털이 시장을 움직이는 새로운 국면에 진입했음을 보여주었습니다. AI 패러다임 속에서 실제 수익 창출 능력을 증명하는 기업에게만 자금이 몰리는 선별 장세가 본격화될 것으로 관측됩니다.',
    theme: 'gold',
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'META',
    companyName: 'Meta Platforms',
    currentPrice: 751.5,
    dayChange: 1.5,
    dayChangePercent: 0.2,
    description:
      '메타는 강력한 4분기 실적과 함께 천문학적인 규모의 AI 투자 계획을 발표하며 시장의 평가가 극명하게 엇갈리고 있습니다.',
    charts: [{ ticker: 'META' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'META',
    title: '핵심 쟁점: 성장과 비용의 충돌',
    points: [
      '호재: 4분기 매출, 전년 대비 24% 성장하며 광고 사업 건재 과시',
      '악재: ‘초지능’ 개발 위해 2026년 자본 지출(CapEx) 최대 1,350억 달러 계획',
      '논쟁: 미래를 위한 담대한 베팅인가, 통제 불능의 비용 지출인가?',
    ],
    description:
      '투자자들은 메타의 천문학적인 AI 투자를 두고 과거 리얼리티 랩스의 실패를 떠올리며 우려하는 시각과, 새로운 성장 동력으로 보는 시각으로 나뉘어 팽팽하게 맞서고 있습니다.',
    outlook: '기회와 리스크 공존',
    outlookColor: 'amber',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'META',
    title: '비판론: 과거의 자본 파괴 리스크',
    points: [
      '과거 실패 사례: 리얼리티 랩스, 지난 3년간 470억 달러 이상 누적 영업손실 기록 (10-K 보고서).',
      '반복 우려: 명확한 수익 모델 없이 자본을 소모했던 과거의 실패를 반복할 수 있다는 불신.',
      '회사의 경고: AI 투자가 단기적으로 수익성을 저해할 것이라고 스스로 공시하며 우려 가중.',
    ],
    description:
      '회의적인 시각은 과거 리얼리티 랩스에 대한 막대한 투자가 뚜렷한 성과를 내지 못했던 사례를 근거로, 이번 AI 투자 역시 자본 배분의 실패로 이어질 가능성을 제기합니다.',
    outlook: '과거 사례 부담',
    outlookColor: 'rose',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'META',
    title: '성장론: 본질적으로 다른 AI 투자',
    points: [
      '즉각적 시너지: AI 투자는 핵심 광고 사업의 효율을 극대화하여 즉각적인 성과로 연결 (4분기 매출 성장이 증거).',
      '새로운 수익 모델: 왓츠앱 AI 챗봇 유료화(이탈리아)는 ‘서비스형 AI’라는 구체적 수익 모델의 시작점이 될 수 있다는 기대.',
      '수익 구조 다각화: 광고에만 의존하던 비즈니스 모델을 다변화할 잠재력 보유.',
    ],
    description:
      '긍정론자들은 이번 AI 투자가 리얼리티 랩스와 달리 핵심 사업과 직접적인 시너지를 내고, 광고 외 새로운 수익원을 창출할 구체적인 경로를 보여준다는 점에서 본질적으로 다르다고 주장합니다.',
    outlook: 'AI 시너지 기대',
    outlookColor: 'emerald',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'META',
    title: '종합 분석 요약',
    points: [
      '현재 주가는 강력한 광고 사업의 가치와 미래 AI 투자에 대한 극심한 불확실성을 동시에 반영하고 있습니다.',
      '경영진은 이번 투자가 과거의 실패와 다르다는 것을 구체적인 숫자로 증명해야 하는 과제를 안고 있습니다.',
      '투자자본수익률(ROIC) 개선이나 의미 있는 신규 매출 발생 여부가 향후 주가의 핵심 동력이 될 것으로 보입니다.',
    ],
    description:
      '메타는 거대한 기회와 명백한 리스크가 공존하는 상황입니다. 따라서 경영진이 AI 투자의 성과를 가시적인 숫자로 증명해낼 때까지 신중한 관망 자세가 유효할 수 있습니다.',
    outlook: '증명이 필요한 시점',
    outlookColor: 'blue',
  },
  {
    id: 13,
    type: 'events',
    turnId: 35,
    title: '향후 주목해야 할 경제 지표',
    description:
      'FOMC 이후, 시장의 관심은 연준의 다음 행보를 가늠할 수 있는 핵심 경제 지표, 특히 고용 시장 데이터로 이동할 것입니다.',
    events: [
      {
        date: '2026-02-06',
        label: '미국 비농업 고용지수 및 실업률',
        description:
          '고용 시장의 강도가 연준의 금리 인하 시점을 결정할 가장 중요한 변수 중 하나입니다.',
      },
    ],
  },
  {
    id: 14,
    type: 'closing',
    turnId: 37,
    headline: '변동성 장세 속, 펀더멘털에 집중할 때',
    tagline: '시장은 이제 연준의 입이 아닌 기업의 실적을 주목합니다.',
    description:
      '금리 인하의 시기와 속도를 둘러싼 불확실성으로 단기적인 변동성이 커질 수 있습니다. 이럴 때일수록 성급한 판단을 지양하고, 발표되는 경제 지표와 기업들의 펀더멘털에 기반한 신중한 접근이 필요한 시점입니다.',
  },
];