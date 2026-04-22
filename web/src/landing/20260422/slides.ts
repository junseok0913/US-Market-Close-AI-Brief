import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-23',
    nutshell: '지정학적 우려 완화와 AI 기대감 속 기술주 랠리',
    description:
      '중동의 지정학적 긴장 완화가 투자 심리를 회복시키고, AI 산업에 대한 장기 성장 기대감이 다시 부각되며 기술주 중심의 강한 반등 장세를 이끌었습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '지정학적 우려 완화와 AI 관련주에 대한 투자 심리 회복에 힘입어 주요 지수 모두 강하게 반등했습니다. 특히 기술주 중심의 나스닥이 1.6% 이상 급등하며 상승을 주도했습니다.',
    indices: [
      { name: 'S&P 500', value: 7137.90, change: 73.89, changePercent: 1.05 },
      { name: 'NASDAQ', value: 24657.57, change: 397.61, changePercent: 1.64 },
      { name: 'DOW', value: 49490.03, change: 340.65, changePercent: 0.69 },
      { name: 'Russell 2000', value: 2785.38, change: 20.41, changePercent: 0.74 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 92.87, change: 0.74, changePercent: 0.80 },
      { name: 'Gold Futures', value: 4758.30, change: 59.90, changePercent: 1.27 },
      { name: 'Dollar Index', value: 98.61, change: 0.20, changePercent: 0.21 },
      { name: 'VIX', value: null, change: null, changePercent: -8.5 },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ Composite' },
      { ticker: 'DJ:DJI', title: 'Dow Jones Industrial Average' },
      { ticker: 'TVC:RUT', title: 'Russell 2000' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 5,
    icon: 'trending-up',
    title: '시장을 움직인 두 가지 핵심 동력',
    subtitle: '안도감과 기대감이 만들어낸 강한 반등',
    description:
      '오늘 시장은 과도한 우려가 해소되는 과정에서 나타난 안도 랠리와, 단기 변동성을 넘어선 장기 성장 스토리에 대한 기대감이 결합되며 강한 상승 동력을 확보했습니다.',
    bullets: [
      '지정학적 리스크 완화에 따른 투자 심리 회복',
      '국제 유가 하락 및 인플레이션 우려 완화',
      'AI 산업에 대한 강력한 성장 기대감 재부각',
      '반도체 주도를 필두로 한 기술주 랠리',
    ],
    theme: 'blue',
  },
  {
    id: 3,
    type: 'headline',
    turnId: 7,
    icon: 'globe',
    title: '중동 리스크 완화, 시장에 안도감',
    subtitle: '이란발 긴장 완화 소식에 위험자산 선호 심리 회복',
    description:
      '이란이 협상 재개 가능성을 시사하면서 중동의 전면전 우려가 크게 완화되었습니다. 이는 유가 하락과 투자 심리 개선으로 이어져 기술주 중심의 강한 반등을 이끌었습니다.',
    bullets: [
      '이란, 미국으로부터 봉쇄 해제 신호 받았다고 발표',
      '국제 유가 하락, 인플레이션 압력 완화 기대',
      'S&P 500 (+1.05%), 나스닥 (+1.64%) 급등',
      '변동성 지수(VIX) 급락하며 시장 안정세 회복',
    ],
    theme: 'green',
    charts: [
      { ticker: 'CL=F', title: 'WTI Crude Oil' },
      { ticker: 'TVC:VIX', title: 'Volatility Index' },
    ],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 9,
    title: '지정학적 프리미엄의 해소',
    description:
      '이란의 대화 가능성 시사로 유가에 반영되었던 지정학적 리스크 프리미엄이 해소되며 가격이 하락했습니다. 시장은 공급망에 대한 최악의 시나리오를 피했다고 판단했습니다.',
    stats: [
      { label: '호르무즈 해협', value: '원유 수송량 20%', subtext: '전 세계 물동량 기준', trend: 'neutral' },
      { label: '리스크 프리미엄', value: '해소', subtext: '유가에 붙었던 지정학적 거품', trend: 'down' },
      { label: '시장 반응', value: '위험 선호 (Risk-on)', subtext: '안전자산 선호도 약화', trend: 'up' },
    ],
    note: '일부에서는 완전한 해결까지는 아직 갈 길이 멀다는 신중론도 제기됩니다.',
    theme: 'green',
  },
  {
    id: 5,
    type: 'stats',
    turnId: 11,
    title: '시장의 외면을 받은 경제 지표',
    description:
      'S&P 글로벌 PMI 예비치가 발표되어 경기 둔화 신호를 보냈지만, 투자자들은 중동 리스크 완화라는 더 큰 호재에 집중하며 지표의 영향을 제한했습니다.',
    stats: [
      { label: 'S&P 제조업 PMI', value: '49.8', subtext: '예상 하회, 위축 국면 진입', trend: 'down' },
      { label: 'S&P 서비스업 PMI', value: '50.5', subtext: '예상 하회, 확장세 둔화', trend: 'down' },
      { label: '시장 반응', value: '무시 (Ignored)', subtext: '지정학적 안도감이 지표 압도', trend: 'neutral' },
    ],
    note: '시장의 초점이 거시 경제의 미세한 변화보다 큰 불확실성 해소에 맞춰져 있음을 보여줍니다.',
    theme: 'blue',
    charts: [{ ticker: 'TVC:US10Y', title: '미국 10년물 국채금리' }],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 15,
    icon: 'cpu',
    title: '다시 불붙은 AI 성장 스토리',
    subtitle: '단기 실적 우려를 압도하는 거대 패러다임 전환 기대감',
    description:
      '시장의 시선이 단기 실적을 넘어 AI라는 거대한 산업 변화로 되돌아왔습니다. 엔비디아 CEO의 발언은 AI 인프라 투자가 이제 시작 단계임을 강조하며 투자 심리를 강력하게 자극했습니다.',
    bullets: [
      '엔비디아 CEO, "인류 역사상 가장 큰 인프라 구축"',
      'TSMC, 긍정적 AI 수요 전망으로 기대감 뒷받침',
      '반도체 ETF(SMH) +2.6% 급등, 시장 수익률 상회',
      '바클레이즈, "AI가 창출할 기회가 위험 요인보다 크다"',
    ],
    theme: 'gold',
    charts: [
      { ticker: 'NASDAQ:NVDA', title: 'NVIDIA' },
      { ticker: 'NYSE:TSM', title: 'TSMC' },
    ],
  },
  {
    id: 7,
    type: 'stats',
    turnId: 17,
    title: 'AI 혁명의 의외의 증거: 엘리베이터',
    description:
      'AI 인프라 투자가 전통 산업재 기업인 오티스(OTIS)의 제품 수요까지 바꿔놓으며 AI 혁명의 광범위한 파급력을 증명하고 있습니다.',
    stats: [
      { label: 'OTIS 특수 엘리베이터', value: '수요 급증', subtext: '데이터센터/반도체 공장용', trend: 'up' },
      { label: '최대 하중', value: '2만 파운드', subtext: '무거운 서버 랙 운반용', trend: 'neutral' },
      { label: '시사점', value: 'AI 파급 효과', subtext: '빅테크를 넘어 전통 산업으로 확산', trend: 'up' },
    ],
    note: '이는 AI 혁명이 경제 전반에 미치는 효과가 가시화되고 있다는 명백한 증거입니다.',
    theme: 'gold',
    charts: [{ ticker: 'NYSE:OTIS', title: 'Otis Worldwide' }],
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 20,
    ticker: 'BKNG',
    companyName: 'Booking Holdings',
    currentPrice: 179.40,
    dayChange: -11.46,
    dayChangePercent: -6.00,
    description:
      '시장 전반의 랠리에도 불구하고, 온라인 여행 플랫폼 부킹 홀딩스는 6% 가까이 급락하며 시장의 주목을 받았습니다. 이는 평균 거래량을 두 배 이상 상회하는 대량 거래를 동반했습니다.',
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 21,
    ticker: 'BKNG',
    title: '규제 리스크의 그림자',
    points: [
      '유럽연합의 디지털 시장법(DMA)이 핵심 리스크로 부각',
      '스페인 경쟁 당국으로부터 이미 4.85억 유로 벌금 부과',
      '일회성 비용을 넘어 비즈니스 모델 자체에 대한 구조적 도전',
      '시장의 관심이 기업 펀더멘털에서 규제 불확실성으로 이동',
    ],
    description:
      '새로운 악재가 없음에도 주가가 급락한 배경에는 유럽의 강력한 플랫폼 규제가 있습니다. 투자자들은 이것이 장기적인 성장성과 수익성을 훼손할 수 있다고 우려하기 시작했습니다.',
    outlook: '명백하고 점증하는 리스크에 대한 관리가 필요한 시점',
    outlookColor: 'amber',
  },
  {
    id: 10,
    type: 'comparison',
    turnId: 23,
    title: '부킹 홀딩스: 현금흐름 vs. 규제 리스크',
    description:
      '시장은 부킹 홀딩스의 막대한 현금 창출 능력보다, 규제가 가져올 장기적인 수익성 훼손 가능성을 더 우려하고 있습니다.',
    items: [
      {
        label: '강점 (과거)',
        value: '$94억 현금흐름',
        description: '압도적인 시장 지배력과 현금 창출 능력',
        highlight: false,
      },
      {
        label: '약점 (현재)',
        value: 'DMA 규제',
        description: '비즈니스에 영구적으로 부과되는 ‘세금’처럼 작용할 가능성',
        highlight: true,
      },
      {
        label: '시장 우려',
        value: '내재가치 훼손',
        description: '장기적 수수료 인하 압박 및 이익률 하락으로 연결',
        highlight: true,
      },
    ],
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'BKNG',
    title: '성장 엔진마저 위협받다',
    points: [
      '미래 성장 동력 ‘커넥티드 트립’ 비전이 DMA 규제의 핵심 타겟',
      '자사 서비스 우대, 데이터 독점 등 DMA 금지 행위와 충돌 가능성',
      '자회사 카약(Kayak) 영업권 4.57억 달러 손상차손 인식',
      'M&A를 통한 과거의 성장 전략이 한계에 도달했다는 신호',
    ],
    description:
      '회사의 미래 성장 전략이 규제 장벽에 정면으로 부딪힌 형국이며, 내부적으로도 경쟁 심화로 인한 효율성 악화 신호가 나타나고 있습니다.',
    outlook: '시장의 인식이 ‘혁신 기업’에서 ‘규제에 갇힌 성숙 기업’으로 전환되는 과정',
    outlookColor: 'rose',
  },
  {
    id: 12,
    type: 'events',
    turnId: 29,
    title: '이번 주 주목해야 할 경제 이벤트',
    description:
      '향후 경제 방향성과 연준의 정책 경로를 가늠할 핵심 지표들이 연이어 발표됩니다. 시장의 변동성이 확대될 수 있으므로 주의가 필요합니다.',
    events: [
      {
        date: '4/29',
        label: 'FOMC 금리 결정',
        description: '파월 의장 기자회견에서 향후 금리 경로에 대한 힌트 제공',
      },
      {
        date: '4/30',
        label: '1분기 GDP 성장률 (예비치)',
        description: '미국 경제의 실제 체력을 확인할 수 있는 중요 지표',
      },
      {
        date: '4/30',
        label: '근원 PCE 가격지수',
        description: '연준이 가장 중시하는 인플레이션 지표로, 금리 인하 시점의 결정적 단서',
      },
    ],
  },
  {
    id: 13,
    type: 'headline',
    turnId: 31,
    icon: 'bar-chart',
    title: '모든 시선은 PCE로',
    subtitle: '연준의 금리 인하 경로를 결정할 마지막 퍼즐',
    description:
      '최근 CPI가 높게 나오며 인플레이션 고착화 우려가 커진 상황에서, 연준이 중시하는 PCE 지표의 결과에 따라 시장의 금리 인하 기대감이 크게 흔들릴 수 있습니다.',
    bullets: [
      '시장은 근원 PCE 전월 대비 상승률에 주목',
      '예상보다 높을 경우, 금리 인하 시점 하반기 이후로 연기 가능성',
      '국채 금리를 다시 자극하여 성장주에 부담으로 작용',
      '연준의 향후 통화정책 경로에 대한 결정적 단서 제공',
    ],
    theme: 'purple',
    charts: [{ ticker: 'TVC:US10Y', title: '미국 10년물 국채금리' }],
  },
  {
    id: 14,
    type: 'stats',
    turnId: 33,
    title: 'FOMC 회의 관전 포인트',
    description:
      '이번 회의에서 금리 동결은 기정사실화되어 있지만, 시장의 모든 관심은 회의 이후 열릴 제롬 파월 의장의 기자회견에 쏠려 있습니다.',
    stats: [
      { label: '금리 결정', value: '동결 확실', subtext: '시장 컨센서스', trend: 'neutral' },
      { label: '핵심 관심사', value: '파월 의장 발언', subtext: '향후 정책 방향성', trend: 'neutral' },
      { label: '주요 쟁점', value: '인플레이션 진단', subtext: '끈질긴 물가 vs. 경기 둔화 신호', trend: 'neutral' },
    ],
    note: '파월 의장이 기존 입장을 유지할지, 더 신중한 태도를 보일지에 따라 시장이 크게 움직일 수 있습니다.',
    theme: 'purple',
  },
  {
    id: 15,
    type: 'closing',
    turnId: 35,
    headline: '지표를 확인하며 대응할 시점',
    tagline: '거시 경제 불확실성과 빅테크 실적 시즌의 교차점',
    description:
      '중요한 경제 이벤트들을 앞두고 섣부른 방향성 예측보다는 발표되는 지표들을 차분히 확인하며 대응하는 지혜가 필요합니다. 본격적인 빅테크 실적 시즌이 시작된 만큼, 개별 기업의 실적이 시장 기대치를 충족하는지 여부도 중요한 변수가 될 것입니다.',
  },
];