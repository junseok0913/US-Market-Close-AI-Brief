import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-13',
    nutshell: '예상 웃돈 월간 CPI에 기술주 하락, 중소형주는 강세',
    description:
      '오늘 미국 증시는 1월 소비자물가지수(CPI) 발표 이후 지수별로 등락이 엇갈리는 혼조세를 보였습니다. 예상보다 높은 월간 근원 물가 상승률에 금리인하 기대감이 후퇴하며 기술주는 약세를 보였지만, 견조한 경제에 대한 기대로 중소형주는 강세를 나타냈습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '1월 소비자물가지수(CPI)가 예상보다 높게 나오면서 시장은 혼조세로 마감했습니다. 기술주 중심의 나스닥은 하락했지만, 중소형주 중심의 러셀 2000 지수는 큰 폭으로 상승하며 차별화된 흐름을 보였습니다.',
    indices: [
      { name: 'S&P 500', value: 0, change: 0, changePercent: 0.05 },
      { name: 'NASDAQ', value: 0, change: 0, changePercent: -0.22 },
      { name: 'DOW', value: 0, change: 0, changePercent: 0.1 },
      { name: 'RUSSELL 2000', value: 0, change: 0, changePercent: 1.18 },
    ],
    commodities: [],
    charts: [
      { ticker: 'SP:SPX' },
      { ticker: 'NASDAQ:IXIC' },
      { ticker: 'DJ:DJI' },
      { ticker: 'TVC:RUT' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 7,
    icon: 'trending-down',
    title: '끈적한 물가, 후퇴하는 금리인하 기대감',
    subtitle: '1월 CPI, 시장 예상 상회하며 긴축 우려 재점화',
    description:
      '1월 소비자물가지수는 연간 상승률 둔화에도 불구하고, 변동성이 큰 항목을 제외한 월간 근원 물가 상승률이 예상을 웃돌면서 시장에 부담으로 작용했습니다. 이로 인해 국채금리가 상승하고 금리에 민감한 기술주가 하락했습니다.',
    bullets: [
      '연간 CPI 2.4%로 둔화 흐름 유지',
      '월간 근원 CPI 0.3% 상승 (시장 예상 0.2% 상회)',
      '10년물 국채금리 반등하며 기술주 압박',
      '주거비, 서비스 비용 등 ‘끈적한 물가’가 주요 원인으로 지목',
    ],
    theme: 'red',
    charts: [{ ticker: 'TVC:US10Y' }, { ticker: 'NASDAQ:IXIC' }],
  },
  {
    id: 3,
    type: 'stats',
    turnId: 9,
    title: '1월 CPI 세부 항목 분석',
    description:
      '연준이 주시하는 주거비와 서비스 물가의 압력이 여전히 높은 것으로 나타나, 인플레이션 둔화 경로가 순탄치 않을 수 있다는 우려를 낳았습니다.',
    stats: [
      {
        label: '월간 근원 CPI',
        value: '+0.3%',
        subtext: '시장 예상(0.2%) 상회',
        trend: 'up',
      },
      {
        label: '주거비 (연간)',
        value: '+3.0%',
        subtext: '여전히 높은 수준 유지',
        trend: 'up',
      },
      {
        label: '개인 관리 서비스 (연간)',
        value: '+5.4%',
        subtext: '서비스 물가 고착화 현상',
        trend: 'up',
      },
      {
        label: '휘발유 가격 (연간)',
        value: '-7.5%',
        subtext: '전체 물가 둔화에 기여',
        trend: 'down',
      },
    ],
    theme: 'red',
  },
  {
    id: 4,
    type: 'headline',
    turnId: 11,
    title: '금리인하 시점 전망 변화',
    subtitle: '시장의 기대, 3월에서 6월 이후로 이동',
    description:
      '끈적한 물가 지표 확인 후, 금리 선물 시장은 3월 금리인하 가능성을 거의 배제하기 시작했습니다. 다수의 기관과 트레이더들은 첫 금리인하 시점을 6월 이후로 전망하며, 연내 인하 횟수 기대치도 낮추고 있습니다.',
    theme: 'red',
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'TVC:RUT' }],
  },
  {
    id: 5,
    type: 'headline',
    turnId: 15,
    icon: 'git-compare',
    title: '엇갈린 지수, 중소형주의 반란',
    subtitle: '금리 부담에 기술주 하락, 경기 자신감에 중소형주 급등',
    description:
      '끈적한 물가 지표가 빅테크의 밸류에이션에는 부담을 주었지만, 다른 한편으로는 미국 경제가 견조하다는 신호로 해석되었습니다. 이에 따라 자금이 상대적으로 소외되었던 중소형주로 이동하는 순환매가 나타났습니다.',
    bullets: [
      '나스닥 지수: -0.22% (금리 민감도 부각)',
      '러셀 2000 지수: +1.18% (견조한 경기에 대한 신호)',
      '빅테크 밸류에이션 부담 vs. 소외주 순환매 현상',
      '국채 금리 상승이 지수별 차별화의 핵심 요인으로 작용',
    ],
    theme: 'gold',
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'TVC:RUT' }],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 21,
    icon: 'microscope',
    title: '실적이 가른 희비, 펀더멘털 장세',
    subtitle: '거시경제 불확실성 속 개별 기업 성적표에 쏠린 눈',
    description:
      '시장 전반의 방향성이 불투명해지자, 투자자들의 시선은 개별 기업이 내놓은 실적과 미래 전망으로 더욱 집중되었습니다. 그 결과에 따라 주가가 극단적으로 반응하는 차별화 장세가 펼쳐졌습니다.',
    bullets: [
      '불투명한 시장 방향성 속 실적의 중요성 부각',
      '실적 호조 기업: 주가 급등 (AMAT, RIVN)',
      '실적 부진 기업: 주가 급락 (PINS)',
      '투자자, 막연한 기대감보다 확실한 실적 선호',
    ],
    theme: 'purple',
  },
  {
    id: 7,
    type: 'comparison',
    turnId: 23,
    title: '실적 발표 후 명암이 엇갈린 기업들',
    description:
      '어플라이드 머티리얼즈와 리비안은 긍정적인 실적과 전망으로 주가가 급등한 반면, 핀터레스트는 부진한 실적과 새로운 리스크 요인 부각으로 급락했습니다.',
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
        description: '예상 상회 실적 및 긍정적 차량 인도량 가이던스 제시',
        highlight: true,
      },
      {
        label: 'Pinterest (PINS)',
        value: '-12%',
        description:
          '예상 하회 매출 및 부진한 가이던스, 지정학적 리스크 부각',
        highlight: false,
      },
    ],
    charts: [{ ticker: 'AMAT' }, { ticker: 'RIVN' }, { ticker: 'PINS' }],
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 28,
    ticker: 'MSFT',
    companyName: 'Microsoft',
    currentPrice: 650.15,
    dayChange: -4.85,
    dayChangePercent: -0.74,
    description:
      '마이크로소프트는 AI가 이끄는 강력한 펀더멘털 성장과 미 규제 당국의 반독점 조사라는 두 가지 상반된 힘이 팽팽하게 맞서면서 주가에 불확실성으로 작용하고 있습니다.',
    charts: [{ ticker: 'MSFT' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 33,
    ticker: 'MSFT',
    title: '핵심 관전 포인트: AI 성장 동력 vs. 규제 리스크',
    points: [
      '기회: AI 서비스 수요에 힘입어 클라우드 부문 매출 39% 급증',
      '기회: 코파일럿 AI를 오피스 365에 통합하며 강력한 성장세 유지',
      '리스크: FTC, AI 서비스 번들링 전략에 대한 반독점 조사 착수',
      '리스크: 미 국세청(IRS)과의 289억 달러 규모 세금 분쟁 가능성',
    ],
    description:
      '기업의 본질적인 가치 창출 능력은 뛰어나지만, 규제라는 불확실성이 해소되기 전까지는 주가의 상방이 제한될 수 있는 상황입니다. AI가 제공하는 기회와 규제가 야기하는 위협이 공존하고 있습니다.',
    outlook: '성장과 규제의 균형',
    outlookColor: 'amber',
  },
  {
    id: 10,
    type: 'events',
    turnId: 37,
    title: '향후 시장 방향을 결정할 주요 이벤트',
    description:
      '오늘 CPI 충격으로 조기 금리인하 기대감이 약화된 가운데, 시장은 연준의 다음 행보를 가늠하기 위해 향후 발표될 주요 경제 지표와 이벤트에 모든 신경을 집중할 것으로 보입니다.',
    events: [
      {
        date: '2월 18일',
        label: 'FOMC 의사록 공개',
        description: '금리 인하 조건에 대한 연준 위원들의 논의 확인',
      },
      {
        date: '2월 20일',
        label: 'PCE 가격지수 발표',
        description: '연준이 인플레이션 판단 시 가장 중요하게 여기는 물가 지표',
      },
      {
        date: '2월 20일',
        label: 'S&P 글로벌 PMI 예비치',
        description: '미국 경제의 건전성을 판단할 수 있는 지표',
      },
    ],
  },
  {
    id: 11,
    type: 'closing',
    turnId: 41,
    headline: '인플레이션과의 싸움은 아직 끝나지 않았다',
    tagline: '신중한 데이터 확인과 대응 전략이 필요한 시점',
    description:
      '금리 인하에 대한 과도한 낙관론을 경계하고, 앞으로 발표될 데이터 하나하나의 의미를 신중하게 분석할 필요가 있습니다. 섣부른 저점 매수보다는 지표를 확인하고 대응하는 신중한 전략이 유효한 시점으로 관찰됩니다.',
  },
];