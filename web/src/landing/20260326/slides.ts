import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-27',
    nutshell: '이란 휴전 협상 불확실성 부각에 따른 증시 급락',
    description:
      '3월 27일 뉴욕 증시는 이란 휴전 협상을 둘러싼 지정학적 리스크가 최고조에 달하며 3대 지수 모두 큰 폭으로 하락했습니다. 유가 급등과 인플레이션 우려가 시장 전반을 짓눌렀습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '이란과의 휴전 협상을 둘러싼 상반된 소식이 위험자산 회피 심리를 자극하며 시장을 끌어내렸습니다. 특히 기술주 중심의 나스닥은 2% 넘게 급락했습니다.',
    indices: [
      { name: 'S&P 500', value: 6477.16, change: -114.74, changePercent: -1.74 },
      { name: 'NASDAQ', value: 21408.08, change: -521.74, changePercent: -2.38 },
      { name: 'DOW', value: 45960.11, change: -469.38, changePercent: -1.01 },
      { name: 'Russell 2000', value: 2493.32, change: -43.06, changePercent: -1.70 },
      { name: 'VIX', value: 16.2, change: 1.2, changePercent: 8.0 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 93.59, change: 3.27, changePercent: 3.62 },
      { name: 'Brent Crude', value: 93.59, change: 3.27, changePercent: 3.62 },
      { name: 'Gold Futures', value: 4399.10, change: -150.70, changePercent: -3.31 },
      { name: 'Dollar Index', value: 99.93, change: 0.33, changePercent: 0.33 },
      { name: 'US 10Y Yield', value: 4.41, change: 0.09, changePercent: 2.08 },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ' },
      { ticker: 'TVC:RUT', title: 'Russell 2000' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 6,
    icon: 'alert-triangle',
    theme: 'red',
    title: '지정학적 리스크 최고조',
    subtitle: '이란 휴전 협상, 상반된 소식에 시장 혼란',
    description:
      '백악관과 이란의 입장이 정면으로 충돌하면서 한치 앞을 내다볼 수 없는 상황이 전개되자 시장은 즉시 위험 회피 모드로 전환했습니다.',
    bullets: [
      '백악관 "생산적 대화" vs 이란 "미국 제안 공식 거부"',
      'S&P 500 -1.74%, 나스닥 -2.38% 급락',
      'WTI 유가 +3.6% 폭등, 인플레이션 공포 자극',
      'VIX 지수 +8% 이상 급등, 시장 불안감 증폭',
    ],
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '혼란에 빠진 금융 지표',
    description:
      '전통적인 안전자산 공식이 깨지며 시장의 혼란이 얼마나 극심했는지를 증명했습니다. 이례적으로 국채 금리가 급등하고 금 가격은 하락했습니다.',
    stats: [
      { label: 'S&P 500', value: '-1.74%', subtext: '위험자산 회피', trend: 'down' },
      { label: 'WTI Crude Oil', value: '+3.63%', subtext: '공급 불안', trend: 'up' },
      { label: '10-Year Treasury Yield', value: '4.41%', subtext: '+9bp 급등', trend: 'up' },
      { label: 'Gold Futures', value: '-0.8%', subtext: '이례적 약세', trend: 'down' },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'CL=F', title: 'WTI Crude Oil' },
      { ticker: 'TVC:US10Y', title: 'US 10Y Yield' },
      { ticker: 'GC=F', title: 'Gold' },
    ],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 9,
    icon: 'gas-station',
    theme: 'amber',
    title: '사상 최악의 오일 쇼크',
    subtitle: '호르무즈 해협 봉쇄, 전세계 원유 공급망 마비',
    description:
      '전 세계 원유의 약 20%가 통과하는 호르무즈 해협이 사실상 봉쇄 상태에 들어가면서, 이번 사태는 과거 어떤 석유 파동과도 비교할 수 없는 악몽이라는 평가가 나오고 있습니다.',
    bullets: [
      'BP 수석 이코노미스트: "과거 어떤 파동과도 비교 불가한 악몽"',
      '호르무즈 해협 봉쇄로 하루 1,500만 배럴 공급 차질 발생',
      '블랙록 경고: "협상 타결돼도 유가 $150까지 치솟을 것"',
      '에너지 섹터(XLE)는 시장 하락 속 +1.5% 이상 상승',
    ],
    charts: [
      { ticker: 'CL=F', title: 'WTI Crude Oil' },
      { ticker: 'XLE', title: 'Energy Sector ETF' },
    ],
  },
  {
    id: 5,
    type: 'stats',
    turnId: 15,
    title: '유가 쇼크, 금융 시장을 뒤흔들다',
    description:
      '호르무즈 해협 봉쇄라는 지정학적 리스크가 단순한 유가 상승을 넘어 시장의 근본적인 성장과 물가 전망 자체를 뒤흔들었습니다.',
    stats: [
      { label: 'WTI Crude (CL=F)', value: '$93.60', subtext: '+3.63% 급등', trend: 'up' },
      { label: '10-Year Treasury Yield', value: '4.41%', subtext: '+9bp 급등', trend: 'up' },
      { label: 'NASDAQ Composite', value: '-2.38%', subtext: '조정 국면 진입', trend: 'down' },
      { label: 'VIX Index', value: '+8.0%', subtext: '공포 심리 확산', trend: 'up' },
    ],
    charts: [
      { ticker: 'CL=F', title: 'WTI Crude Oil' },
      { ticker: 'TVC:US10Y', title: 'US 10Y Yield' },
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ' },
      { ticker: 'TVC:VIX', title: 'VIX' },
    ],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 19,
    icon: 'bank',
    theme: 'purple',
    title: '연준의 딜레마',
    subtitle: '유가 쇼크, 통화정책 경로를 뒤흔들다',
    description:
      '유가 쇼크는 연준의 통화정책 경로 자체를 불확실하게 만들고 있습니다. 금리 인하 기대감이 빠르게 후퇴하며 오히려 추가 긴축에 대한 우려가 커지고 있습니다.',
    bullets: [
      'OECD, 미국 인플레이션 전망치 4.2%로 대폭 상향',
      '금리 인하 기대감 후퇴, 추가 긴축 우려 부상',
      '연준 내부에서도 의견 엇갈려 (미란 vs 바)',
      '국채 금리 급등은 시장의 긴축 우려를 반영',
    ],
    charts: [{ ticker: 'TVC:US10Y', title: 'US 10Y Yield' }],
  },
  {
    id: 7,
    type: 'stats',
    turnId: 21,
    title: '스태그플레이션 공포 확산',
    theme: 'red',
    description:
      '시장은 물가 상승과 경기 둔화가 동시에 나타나는 최악의 시나리오, 즉 스태그플레이션을 가격에 반영하기 시작했습니다.',
    stats: [
      { label: 'Global GDP Growth', value: '최대 -2%p', subtext: '블랙록 경고', trend: 'down' },
      { label: 'NASDAQ Composite', value: '조정 국면 진입', subtext: '52주 고점 대비 -10% 이상', trend: 'down' },
      { label: 'Consumer Discretionary (XLY)', value: '하락', subtext: '소비 위축 우려', trend: 'down' },
    ],
    note: '높은 에너지 가격이 기업 비용을 높이고 소비자의 구매력을 감소시켜 경기 침체 우려를 키우고 있습니다.',
    charts: [
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ' },
      { ticker: 'XLY', title: 'Consumer Discretionary ETF' },
    ],
  },
  {
    id: 8,
    type: 'headline',
    turnId: 23,
    icon: 'cpu',
    theme: 'blue',
    title: '기술주, 직격탄을 맞다',
    subtitle: '나스닥, 고점 대비 10% 이상 하락하며 조정장 진입',
    description:
      '미래 성장 가치에 민감한 기술주들은 금리 상승과 경기 위축 전망에 특히 취약할 수밖에 없습니다. 투자자들의 위험회피 심리가 극에 달하며 성장주 매도세가 거셌습니다.',
    bullets: [
      '유가 급등 → 국채 금리 상승 → 성장주 밸류에이션 부담',
      '나스닥 종합지수 -2.38% 급락, 공식 조정 국면 진입',
      '투자자 위험회피 심리 극대화 (VIX +8% 이상)',
      'S&P 500도 -1.74% 하락하며 시장 전반 압박',
    ],
    charts: [
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ' },
      { ticker: 'TVC:VIX', title: 'VIX' },
    ],
  },
  {
    id: 9,
    type: 'headline',
    turnId: 25,
    icon: 'hammer',
    theme: 'blue',
    title: '빅테크, 겹악재에 \'휘청\'',
    subtitle: '거시경제 압박 속 개별 악재까지 터져',
    description:
      '시장 전반의 분위기도 좋지 않았지만, 빅테크 내부에서 터져 나온 악재들이 하락의 기폭제가 되었습니다. 규제 리스크와 수요 둔화 우려가 동시에 부각되었습니다.',
    bullets: [
      '메타/구글, 유해성 소송 패소로 규제 리스크 현실화',
      '메타(META) 주가 -8%, 알파벳(GOOGL) -3.4% 급락',
      '알파벳 AI 알고리즘 변경, 반도체 수요 우려 자극',
      '엔비디아(NVDA) 주가 -4% 이상 하락',
    ],
    charts: [
      { ticker: 'META', title: 'Meta Platforms' },
      { ticker: 'GOOGL', title: 'Alphabet' },
      { ticker: 'NVDA', title: 'NVIDIA' },
    ],
  },
  {
    id: 10,
    type: 'stats',
    turnId: 27,
    title: '엇갈린 빅테크 희비',
    description:
      '대부분의 기술주가 하락한 가운데, 애플은 자사 AI 비서 시리의 개방 계획 소식에 힘입어 유일하게 소폭 상승하며 장을 마감했습니다.',
    stats: [
      { label: 'Tech Sector ETF (XLK)', value: '-3.1%', subtext: '기술주 전반 약세', trend: 'down' },
      { label: 'Semiconductor ETF (SOXX)', value: '-4.7%', subtext: '반도체 업종 타격 심화', trend: 'down' },
      { label: 'Apple (AAPL)', value: '소폭 상승', subtext: 'AI 전략 기대감', trend: 'up' },
    ],
    charts: [
      { ticker: 'XLK', title: 'Technology Select Sector SPDR Fund' },
      { ticker: 'SOXX', title: 'iShares Semiconductor ETF' },
      { ticker: 'AAPL', title: 'Apple Inc.' },
    ],
  },
  {
    id: 11,
    type: 'headline',
    turnId: 29,
    icon: 'compass',
    theme: 'blue',
    title: '기술주 향방, 거시 변수에 달렸다',
    subtitle: '지정학적 리스크와 인플레이션이 핵심 변수',
    description:
      '오늘 나스닥의 조정 국면 진입은 거시 경제 불확실성에 기술주가 얼마나 민감하게 반응하는지를 명확히 보여준 사례입니다.',
    bullets: [
      '이란 분쟁 → 유가 자극 → 연준 금리 인하 기대 후퇴',
      '성장주 투자 심리 위축, 보수적 밸류에이션 평가 확산',
      '향후 중동 분쟁 상황과 인플레이션 지표가 주가 방향 결정',
    ],
    charts: [
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ Composite' },
      { ticker: 'CL=F', title: 'WTI Crude Oil' },
      { ticker: 'TVC:US10Y', title: 'US 10Y Yield' },
    ],
  },
  {
    id: 12,
    type: 'ticker-intro',
    turnId: 30,
    ticker: 'SNDK',
    companyName: 'SanDisk Corporation',
    currentPrice: 603.17,
    dayChange: -74.69,
    dayChangePercent: -11.02,
    description:
      '뚜렷한 개별 뉴스 없이 7.54% 급락했습니다. 지난 1월 공시된 10-Q 보고서에 담긴 잠재적 리스크가 뒤늦게 부각되며 투자 심리가 급격히 위축된 것으로 분석됩니다.',
    charts: [{ ticker: 'SNDK' }],
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 33,
    ticker: 'SNDK',
    title: '키옥시아 계약, \'족쇄\'인가 \'해자\'인가?',
    description:
      '1월 10-Q 공시에 담긴 키옥시아와의 합작 벤처 약정이 시장의 핵심 논쟁거리로 부상했습니다. 이를 재무적 족쇄로 볼 것인지, 미래를 위한 전략적 투자로 볼 것인지에 따라 평가가 극명하게 엇갈립니다.',
    points: [
      '리스크 (족쇄): 키옥시아 합작 벤처에 대한 재무적 부담. 4년간 12억 달러 지불 및 총 53억 달러 약정은 과도한 의존이자 고정비용 부담으로 작용할 수 있다는 우려.',
      '기회 (해자): 최근 분기 순이익 672% 급증, 강력한 현금흐름. 연간 3억 달러 지출은 감당 가능하며, 오히려 향후 10년간 안정적 생산 능력을 확보하는 경쟁 우위로 작용.',
    ],
    outlook:
      '오늘의 급락은 AI 시대 핵심 공급자로서의 펀더멘털을 고려할 때 과도한 공포 반응일 가능성이 있습니다. 리스크 요인은 분명하지만, 장기적 관점에서 기업 가치를 재평가할 기회를 제공합니다.',
    outlookColor: 'amber',
  },
  {
    id: 14,
    type: 'comparison',
    turnId: 35,
    title: 'SanDisk(SNDK) 투자 논리 비교',
    description: '동일한 10-Q 공시 내용을 두고 시장의 해석이 극명하게 엇갈리고 있습니다.',
    items: [
      {
        label: '부정적 시각 (Bear)',
        value: '치명적인 족쇄',
        description: '단일 파트너(키옥시아)에 대한 과도한 의존. 53억 달러 약정은 반도체 하강 사이클 시 현금흐름을 옭아맬 고정비용 부담.',
        highlight: true,
      },
      {
        label: '긍정적 시각 (Bull)',
        value: '전략적 해자',
        description: '폭발적인 실적 성장과 현금 창출 능력(연 30억$+) 감안 시 감당 가능한 투자. 향후 10년간 안정적 생산 능력 확보로 경쟁 우위 구축.',
      },
      {
        label: '핵심 변수',
        value: 'AI 수요 지속성',
        description: '현재의 AI 인프라 투자가 구조적 변화라면, 샌디스크의 가격 결정력과 현금 창출 능력은 지속될 가능성이 높음.',
      },
    ],
  },
  {
    id: 15,
    type: 'events',
    turnId: 41,
    title: '이번 주 주목해야 할 경제 이벤트',
    description:
      '시장의 관심은 이번 주 후반에 발표될 주요 경제 지표와 제롬 파월 연준 의장의 발언에 집중되고 있습니다.',
    events: [
      {
        date: '목요일',
        label: '4분기 GDP 성장률 (확정치)',
        description: '미국 경기 상황 최종 점검',
      },
      {
        date: '목요일',
        label: '주간 신규 실업수당 청구건수',
        description: '고용 시장 건전성 확인',
      },
      {
        date: '금요일 (휴장일)',
        label: '2월 개인소비지출(PCE) 가격지수',
        description: '연준이 가장 중시하는 핵심 물가 지표',
      },
      {
        date: '금요일 (휴장일)',
        label: '제롬 파월 연준 의장 연설',
        description: 'PCE 결과에 대한 코멘트가 나올지 주목',
      },
    ],
  },
  {
    id: 16,
    type: 'closing',
    turnId: 43,
    headline: '폭풍전야의 시장: 휴장일의 PCE 발표',
    tagline: '주말 동안의 분석이 다음 주 시장의 향방을 결정합니다.',
    description:
      '금요일(성금요일) 휴장일에 핵심 물가 지표인 PCE가 발표되고 파월 의장 연설까지 예정되어 있어, 투자자들은 주말 동안 관련 정보를 소화한 후 월요일 시장에서 한꺼번에 반응할 것입니다. 섣부른 추격 매수보다 차분한 대응 전략 수립이 필요한 시점입니다.',
  },
];