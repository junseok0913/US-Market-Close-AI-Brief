import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  // Opening
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-13',
    nutshell: '예상 웃돈 월간 CPI에 기술주 하락, 중소형주는 강세',
    description:
      '오늘 미국 증시는 1월 소비자물가지수(CPI) 발표에 따라 지수별로 등락이 엇갈렸습니다. 금리 인하 기대감이 후퇴하며 기술주는 약세를 보였지만, 견조한 경제에 대한 기대로 중소형주는 급등하는 차별화 장세를 연출했습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '예상보다 높은 월간 근원 CPI가 금리 인하 기대감을 후퇴시키며 기술주에 부담으로 작용했습니다. 반면, 중소형주는 경기 기대를 반영하며 강세를 보였습니다.',
    indices: [
      { name: 'S&P 500', value: 6836.17, change: 3.41, changePercent: 0.05 },
      { name: 'NASDAQ', value: 22546.67, change: -50.48, changePercent: -0.22 },
      { name: 'DOW', value: 49500.93, change: 48.95, changePercent: 0.10 },
      { name: 'Russell 2000', value: 2646.70, change: 30.87, changePercent: 1.18 },
    ],
    commodities: [
      { name: '10년물 국채금리', value: 4.3, change: null, changePercent: 0.0 },
      { name: '달러 인덱스', value: 104.8, change: null, changePercent: 0.0 },
    ],
    charts: [
      { ticker: 'SP:SPX' },
      { ticker: 'NASDAQ:IXIC' },
      { ticker: 'TVC:RUT' },
      { ticker: 'TVC:US10Y' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 5,
    icon: 'trending-up',
    title: '오늘 시장의 세 가지 흐름',
    subtitle: '금리, 차별화, 그리고 펀더멘털',
    description:
      '오늘 시장은 세 가지 핵심 동인에 의해 움직였습니다. 인플레이션 데이터가 촉발한 금리 인하 기대감의 후퇴, 대형 기술주와 중소형주 간의 뚜렷한 차별화, 그리고 개별 기업 실적에 따른 주가 희비가 시장을 관통하는 주요 흐름이었습니다.',
    bullets: [
      '예상보다 높은 월간 물가에 후퇴한 금리인하 기대감',
      '나스닥 약세 속에서 돋보인 중소형주의 강세',
      '개별 기업 실적에 따라 극명하게 엇갈린 주가',
    ],
  },

  // Theme 1: Inflation & Rate Cut Expectations
  {
    id: 3,
    type: 'headline',
    turnId: 7,
    icon: 'bar-chart',
    title: '인플레이션의 두 얼굴',
    subtitle: '예상 웃돈 월간 근원 CPI가 시장 발목',
    description:
      '연간 헤드라인 CPI는 둔화세를 이어갔지만, 시장은 변동성이 큰 항목을 제외한 월간 근원 CPI 상승률에 더 민감하게 반응했습니다. 이는 연준의 금리 인하 경로가 순탄치 않을 것이라는 우려를 키웠습니다.',
    bullets: [
      '1월 연간 CPI: 2.4%로 둔화 흐름 유지 (긍정적)',
      '1월 월간 근원 CPI: 0.3% 상승, 예상치(0.2%) 상회 (부정적)',
      '국채금리 반등하며 기술주 중심의 나스닥 지수 압박',
      '금리 인하 시점 지연 가능성에 대한 우려 확산',
    ],
    theme: 'amber',
    charts: [{ ticker: 'TVC:US10Y' }, { ticker: 'NASDAQ:IXIC' }],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 9,
    title: '끈적한 물가의 세부 항목',
    description:
      '연준이 주시하는 서비스 물가의 압력이 여전함이 확인되었습니다. 특히 주거비와 개인 서비스 비용이 전체 물가 상승을 주도하며 인플레이션 고착화 우려를 더했습니다.',
    stats: [
      { label: '주거비 (연간)', value: '+3.0%', subtext: '여전히 높은 수준 유지', trend: 'up' },
      {
        label: '개인 관리 서비스 (연간)',
        value: '+5.4%',
        subtext: '서비스 물가 고착화 현상',
        trend: 'up',
      },
      { label: '휘발유 가격 (연간)', value: '-7.5%', subtext: '에너지 비용은 안정세', trend: 'down' },
    ],
    note: '연준은 변동성이 큰 에너지보다 기조적인 서비스 물가 흐름을 더 중요하게 판단합니다.',
    theme: 'amber',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 11,
    icon: 'calendar',
    title: '후퇴하는 금리 인하 기대감',
    subtitle: '시장의 눈은 6월 이후로',
    description:
      '이번 CPI 발표로 3월 금리 인하 가능성은 거의 소멸했으며, 시장은 첫 인하 시점을 6월 이후로 미루는 분위기입니다. 이러한 기대감의 후퇴는 기술주 밸류에이션에 직접적인 부담으로 작용했습니다.',
    bullets: [
      '금리 선물 시장, 3월 금리 인하 가능성 거의 배제',
      '주요 기관들, 첫 금리 인하 시점으로 6월 또는 9월 전망',
      '연말까지 약 2차례 금리 인하를 가격에 반영 중',
      '미래 이익 가치에 민감한 기술주 중심의 나스닥 하락',
    ],
    theme: 'amber',
  },
  {
    id: 6,
    type: 'headline',
    turnId: 13,
    icon: 'activity',
    title: "인플레이션과의 싸움, '라스트 마일'의 어려움",
    subtitle: '시장의 시선은 다음 PCE 지표로',
    description:
      '오늘 CPI 보고서는 물가 둔화 추세 속에서도 주거비 등 서비스 물가의 끈적함이 여전함을 보여주었습니다. 이로 인해 시장은 연준의 다음 행보를 가늠하기 위해 PCE 가격지표에 더욱 집중할 전망입니다.',
    bullets: [
      '주거비 중심의 서비스 물가, 조기 정책 전환의 핵심 걸림돌',
      '2월 20일 발표될 PCE 가격지표가 시장의 핵심 변수로 부상',
      '지표 확인 전까지 방향성 탐색 구간 이어질 것으로 분석',
    ],
    theme: 'amber',
  },

  // Theme 2: Market Divergence
  {
    id: 7,
    type: 'headline',
    turnId: 15,
    icon: 'git-compare',
    title: '엇갈린 지수의 운명',
    subtitle: '기술주 하락 vs 중소형주 급등',
    description:
      '끈적한 물가 지표는 빅테크의 밸류에이션에는 부담을 주었지만, 동시에 미국 경제가 견조하다는 신호로도 해석되었습니다. 이에 따라 자금이 대형 기술주에서 상대적으로 소외되었던 중소형주로 이동하는 순환매가 나타났습니다.',
    bullets: [
      '나스닥: -0.22% (금리 부담에 하락)',
      '러셀 2000: +1.18% (견조한 경기에 대한 기대로 급등)',
      'S&P 500 / 다우: 강보합 (혼조세 반영)',
      '투자자금, 대형주에서 중소형주로 순환',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'TVC:RUT' }],
  },
  {
    id: 8,
    type: 'comparison',
    turnId: 17,
    title: '대형 기술주 vs 중소형주: 왜 달랐을까?',
    description:
      '금리 인하 기대감 후퇴는 두 그룹에 서로 다른 영향을 미쳤습니다. 기술주에는 밸류에이션 부담을, 중소형주에는 견조한 내수 경제라는 긍정적 신호를 주었습니다.',
    items: [
      {
        label: '대형 기술주 (나스닥)',
        value: '금리 부담',
        description: '금리 인하 기대감 후퇴로 미래가치 할인율이 상승하며 밸류에이션에 직접적인 부담으로 작용했습니다.',
        highlight: false,
      },
      {
        label: '중소형주 (러셀 2000)',
        value: '견조한 내수',
        description: '끈적한 물가는 견조한 경제의 반증으로, 내수 중심의 중소형 기업에 긍정적 신호로 해석되며 자금이 유입되었습니다.',
        highlight: true,
      },
    ],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 19,
    ticker: 'TVC:RUT',
    title: '중소형주 강세, 지속될까?',
    points: [
      "오늘 강세는 불확실성 해소에 따른 '안도 랠리' 성격이 강합니다.",
      '연준의 통화정책 경로가 명확해지기 전까지는 변동성이 클 수 있습니다.',
      '향후 강한 경제지표는 오히려 추가 긴축 우려를 자극해 부담으로 작용할 수 있습니다.',
    ],
    outlook: '추세적 전환보다는 단기 순환매일 가능성. 향후 경제 지표 확인이 필요합니다.',
    outlookColor: 'amber',
  },

  // Theme 3: Earnings-Driven Market
  {
    id: 10,
    type: 'stats',
    turnId: 21,
    title: '거시경제 지표, 긴축 우려를 자극하다',
    description:
      '예상보다 높은 CPI는 국채금리와 달러 가치를 끌어올려 시장 전반에 부담으로 작용하며, 개별 기업의 펀더멘털에 대한 중요성을 더욱 부각시켰습니다.',
    stats: [
      { label: '10년물 국채금리', value: '4.3% 돌파', subtext: '장중 급등', trend: 'up' },
      { label: '달러 인덱스', value: '강세 전환', subtext: '긴축 우려 반영', trend: 'up' },
      { label: '시장 방향성', value: '불투명', subtext: '개별 실적 중요성 부각', trend: 'neutral' },
    ],
    theme: 'red',
  },
  {
    id: 11,
    type: 'comparison',
    turnId: 23,
    title: '실적에 따라 갈린 희비',
    description:
      '거시 경제의 방향성이 불투명해지자, 투자자들은 개별 기업의 실적과 전망에 더욱 집중했습니다. 견고한 실적을 발표한 기업은 급등했지만, 실망스러운 가이던스를 제시한 기업은 급락했습니다.',
    items: [
      {
        label: 'Applied Materials (AMAT)',
        value: '+13%',
        description: 'AI 칩 수요에 힘입어 예상 상회 실적 및 가이던스 제시',
        highlight: true,
      },
      {
        label: 'Rivian (RIVN)',
        value: '+20%',
        description: '예상보다 좋은 실적과 함께 긍정적인 연간 인도량 가이던스 발표',
        highlight: true,
      },
      {
        label: 'Pinterest (PINS)',
        value: '-12%',
        description: '예상 하회 매출 및 부진한 1분기 가이던스, 지정학적 리스크 부각',
        highlight: false,
      },
    ],
  },
  {
    id: 12,
    type: 'headline',
    turnId: 25,
    icon: 'alert-triangle',
    title: 'Pinterest, 지정학적 리스크 부상',
    subtitle: '무역 정책 불확실성에 투자 심리 냉각',
    description:
      '핀터레스트는 실적 부진과 더불어, 경영진이 잠재적인 관세 정책이 중국계 광고주 지출에 미칠 불확실성을 언급하며 새로운 리스크가 부각되었습니다. 이는 단순 실적 쇼크를 넘어선 우려를 낳았습니다.',
    bullets: [
      '4분기 매출 및 1분기 가이던스 모두 시장 예상 하회',
      '성장의 상당 부분을 중국 이커머스 기업 광고에 의존',
      '미래 무역 정책 변화가 광고 예산을 위축시킬 수 있다는 우려 제기',
      '펀더멘털 우려에 지정학적 리스크까지 더해지며 주가 급락',
    ],
    theme: 'red',
    charts: [{ ticker: 'PINS' }],
  },

  // Ticker Analysis: MSFT
  {
    id: 13,
    type: 'ticker-intro',
    turnId: 28,
    ticker: 'MSFT',
    companyName: 'Microsoft Corp.',
    currentPrice: 645.18,
    dayChange: -4.82,
    dayChangePercent: -0.74,
    description:
      '마이크로소프트는 AI가 이끄는 강력한 성장세와 반독점 규제라는 리스크가 공존하며 장중 변동성 끝에 약보합으로 마감했습니다.',
    charts: [{ ticker: 'MSFT' }],
  },
  {
    id: 14,
    type: 'stats',
    turnId: 31,
    title: 'MSFT의 강력한 성장 엔진: AI와 클라우드',
    description:
      '마이크로소프트는 AI 서비스 수요에 힘입어 클라우드 부문에서 폭발적인 성장을 기록하며, AI 시대의 필수 인프라 기업으로 자리매김하고 있습니다.',
    stats: [
      {
        label: '클라우드 서비스 매출',
        value: '+39%',
        subtext: 'AI 서비스 수요가 견인 (YoY)',
        trend: 'up',
      },
      {
        label: '생산성 부문',
        value: '견고한 성장',
        subtext: 'Office 365 + Copilot 시너지',
        trend: 'up',
      },
    ],
    theme: 'green',
  },
  {
    id: 15,
    type: 'headline',
    turnId: 33,
    icon: 'shield-alert',
    title: '성장 가도에 드리운 규제의 그림자',
    subtitle: 'FTC 반독점 조사와 세금 분쟁 리스크',
    description:
      '강력한 성장세 이면에는 규제 당국의 조사가 강화되고 있으며, 대규모 세금 분쟁 또한 잠재적인 재무 리스크로 남아있어 투자 시 고려해야 할 핵심 쟁점입니다.',
    bullets: [
      "FTC, AI 서비스를 오피스 제품군에 통합 판매하는 '번들링' 전략 집중 조사",
      '핵심 성장 전략 자체에 제동이 걸릴 수 있는 중대한 사안',
      '미 국세청(IRS)과 289억 달러 규모의 세금 분쟁 진행 중',
    ],
    theme: 'red',
  },
  {
    id: 16,
    type: 'ticker-analysis',
    turnId: 35,
    ticker: 'MSFT',
    title: '투자 전망: 신중한 접근 필요',
    points: [
      '기업의 본질적인 가치 창출 능력과 재무 건전성은 매우 뛰어남',
      '규제라는 안개가 걷히기 전까지는 주가의 상방이 제한될 수 있음',
      '현재 주가는 장밋빛 미래와 현실적 리스크를 모두 반영하는 수준',
    ],
    outlook: '불확실성이 해소되기 전까지 상황을 지켜보는 신중한 자세가 필요한 시점입니다.',
    outlookColor: 'amber',
  },

  // Closing
  {
    id: 17,
    type: 'events',
    turnId: 37,
    title: '향후 주요 경제 이벤트',
    description:
      '오늘 CPI 쇼크 이후, 시장의 관심은 연준의 정책 방향에 대한 추가적인 힌트를 제공할 다음 경제 지표와 이벤트에 집중될 것입니다.',
    events: [
      {
        date: '2026-02-18',
        label: 'FOMC 의사록 공개',
        description: '금리 인하 조건에 대한 연준 위원들의 논의를 파악할 기회',
      },
      {
        date: '2026-02-20',
        label: '개인소비지출(PCE) 가격지수',
        description: '연준이 가장 중요하게 여기는 물가 지표로, 시장 방향성을 결정할 핵심 변수',
      },
      {
        date: '2026-02-20',
        label: 'S&P 글로벌 PMI 예비치',
        description: '제조업 및 서비스업 경기를 파악하여 경제 건전성을 가늠',
      },
    ],
  },
  {
    id: 18,
    type: 'closing',
    turnId: 41,
    headline: '인플레이션과의 싸움은 아직 끝나지 않았다',
    tagline: '데이터를 확인하며 신중하게 대응할 시점',
    description:
      '금리 인하에 대한 과도한 낙관론을 경계하고, 앞으로 발표될 경제 지표 하나하나를 신중하게 분석해야 합니다. 섣부른 저점 매수보다는 지표를 확인하고 대응하는 전략이 유효합니다.',
  },
];