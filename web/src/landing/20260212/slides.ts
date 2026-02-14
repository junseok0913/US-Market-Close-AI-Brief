import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-12',
    nutshell: 'AI발 기술주 투매와 CPI 발표 경계감 속 동반 하락',
    description:
      '오늘 시장은 AI 기술의 파괴적 잠재력에 대한 새로운 공포감과 내일 있을 소비자물가지수(CPI) 발표에 대한 경계심리가 겹치면서 주요 지수가 큰 폭으로 하락했습니다. 기술주를 중심으로 매도세가 확산되며 시장의 불안 심리가 고조된 하루였습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      'AI발 기술주 투매와 CPI 발표를 앞둔 경계감이 시장을 짓누르며 3대 지수가 모두 하락했습니다. 특히 기술주 중심의 나스닥은 2% 이상 급락하며 투자 심리 위축을 드러냈습니다.',
    indices: [
      { name: 'S&P 500', value: 6832.0, change: -104.0, changePercent: -1.5 },
      { name: 'NASDAQ', value: 22597.0, change: -461.1, changePercent: -2.0 },
      { name: 'DOW', value: 49451.0, change: -652.3, changePercent: -1.3 },
    ],
    commodities: [
      { name: 'VIX', value: 15.2, change: 2.3, changePercent: 17.8 },
      { name: 'US 10Y', value: 4.25, change: -0.02, changePercent: -0.47 },
      { name: 'Dollar Index', value: 104.5, change: 0.15, changePercent: 0.14 },
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
    turnId: 6,
    icon: 'cpu',
    title: 'AI발 파괴적 혁신 공포',
    subtitle: '모든 배를 띄우는 순풍에서 특정 배를 침몰시키는 폭풍으로',
    description:
      '지금까지 시장의 성장 동력이었던 AI가 이제는 특정 산업의 비즈니스 모델을 파괴할 수 있다는 공포의 대상으로 부상했습니다. 이러한 우려가 기술주 전반의 투매 현상으로 이어졌습니다.',
    bullets: [
      'AI가 인간의 업무를 대체할 수 있는 분야부터 매도세 집중',
      '물류, 상업용 부동산, 소프트웨어 관련 기업 주가 급락',
      '변동성 지수(VIX) 18% 가까이 치솟으며 시장 불안감 증폭',
      '안전자산 선호 심리 확산 속 국채금리 하락, 달러 강세',
    ],
    theme: 'red',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 9,
    title: 'AI 공포가 덮친 산업들',
    description:
      'AI의 효율성이 인간의 역할을 대체할 것이라는 우려가 커지면서 관련 산업의 대표 기업들 주가가 큰 충격을 받았습니다.',
    stats: [
      {
        label: 'C.H. Robinson (물류 중개)',
        value: '-14%',
        subtext: 'AI 플랫폼의 효율성 발표가 기폭제',
        trend: 'down',
      },
      {
        label: 'CBRE Group (상업용 부동산)',
        value: '-8%',
        subtext: '원격 근무 확산 및 중개 서비스 대체 우려',
        trend: 'down',
      },
      {
        label: 'S&P 500 소프트웨어 지수',
        value: '-15%',
        subtext: '1월 말 이후, 코딩 자동화 우려 지속',
        trend: 'down',
      },
    ],
    theme: 'red',
    charts: [{ ticker: 'CHRW' }, { ticker: 'CBRE' }],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 13,
    title: '시장의 패러다임 전환',
    subtitle: '무차별적 상승에서 종목 선별 장세로',
    description:
      '시장은 AI 혁명을 소화하는 과정에서 옥석 가리기 단계에 진입했습니다. 이제 AI 인프라 수혜주에 대한 막연한 기대감을 넘어, 실제 AI 기술 적용에 따른 산업별 명암을 냉정하게 평가하기 시작했습니다.',
    bullets: [
      'AI 기술의 실제 적용 및 산업 지형 변화에 대한 가치 재평가 시작',
      '개별 종목의 생존 가능성을 따지는 장세로 전환될 가능성',
      'CPI 발표 결과에 따라 가치 재평가 작업이 더욱 냉혹하게 진행될 수 있음',
    ],
    theme: 'blue',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 14,
    icon: 'bar-chart',
    title: 'CPI 발표 경계감 고조',
    subtitle: '연준 금리 인하 기대감의 최종 시험대',
    description:
      '최근 발표된 강력한 고용 보고서로 금리 인하 기대감이 한풀 꺾인 가운데, 시장은 내일 발표될 1월 소비자물가지수(CPI)에 모든 신경을 곤두세우고 있습니다. 인플레이션마저 높게 나올 경우, 연준의 긴축 장기화 우려가 현실화될 수 있습니다.',
    bullets: [
      '강력한 1월 고용 보고서로 금리 인하 기대감 이미 후퇴',
      '끈적한 인플레이션 확인 시 긴축 장기화 논리 강화',
      '주식과 채권 동시 약세, 달러 강세 등 전형적인 위험회피 장세',
    ],
    theme: 'amber',
  },
  {
    id: 6,
    type: 'stats',
    turnId: 17,
    title: '1월 CPI 주요 관전 포인트',
    description:
      '시장은 인플레이션 둔화세가 지속될지에 대한 확신을 찾고 있습니다. 특히 연준이 중시하는 근원 CPI의 움직임이 시장의 방향을 결정할 핵심 변수가 될 전망입니다.',
    stats: [
      {
        label: '근원 CPI (전월 대비)',
        value: '소폭 반등 가능성',
        subtext: '월가 전문가들의 주요 우려 사항',
        trend: 'up',
      },
      {
        label: '근원 CPI (전년 대비)',
        value: '둔화세 지속 여부',
        subtext: '금리 인하 기대감의 명맥',
        trend: 'neutral',
      },
      {
        label: '신규 물가 압력',
        value: 'AI 데이터센터발 전기료',
        subtext: '새로운 인플레이션 요인으로 부상',
        trend: 'up',
      },
    ],
    note: '연준은 변동성이 큰 에너지/식품을 제외한 근원 물가를 더 중요하게 여깁니다.',
    theme: 'amber',
  },
  {
    id: 7,
    type: 'ticker-intro',
    turnId: 20,
    ticker: 'MSTR',
    companyName: 'MicroStrategy',
    currentPrice: 1485.5,
    dayChange: -57.3,
    dayChangePercent: -3.71,
    description:
      '마이크로스트래티지는 추가 자금 조달이 가능해졌다는 호재성 소식에도 불구하고 주가가 3.7% 넘게 하락했습니다. 시장이 회사의 본질을 비트코인에 대한 레버리지 투자 수단으로 재확인하며 리스크를 더 크게 평가한 것으로 보입니다.',
    charts: [{ ticker: 'MSTR' }],
  },
  {
    id: 8,
    type: 'comparison',
    turnId: 22,
    title: 'MicroStrategy: 상반된 두 가지 시선',
    description:
      '마이크로스트래티지의 전략은 비트코인 상승장에서의 극단적 수익 추구와 그에 따른 높은 리스크라는 양면성을 가집니다.',
    items: [
      {
        label: '긍정적 시각: 비트코인 개발 회사',
        value: '주당 BTC 가치 극대화',
        description:
          '부채를 ‘로켓 연료’로 활용해 자본시장에서 자금을 조달하고, 이를 통해 현물 ETF가 제공할 수 없는 초과 수익(알파)을 창출하는 혁신적 전략',
        highlight: true,
      },
      {
        label: '부정적 시각: 레버리지 투자 수단',
        value: '과도한 부채 리스크',
        description:
          '비트코인 가격이 충분히 오르지 못할 경우, 전환사채 만기 시 대규모 유동성 위기에 직면할 수 있는 ‘부채의 벽’이라는 시한폭탄을 안고 있음',
        highlight: false,
      },
    ],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'MSTR',
    title: '핵심 리스크: 부채의 벽',
    description:
      '시장의 가장 큰 우려는 회사가 짊어진 막대한 전환사채입니다. 비트코인 가격이 획기적으로 오르지 못하면, 2027년부터 도래하는 조기 상환 요구가 회사의 유동성에 심각한 위협이 될 수 있습니다.',
    points: [
      '총 전환사채 규모: 약 82억 달러',
      '핵심 만기: 2027-2028년, 약 74억 달러 풋옵션 도래',
      '현재 주가는 대부분의 전환 가격을 크게 하회하는 상황',
      '주가 상승 실패 시, 현금 상환 요구로 인한 보유 비트코인 강제 매각 가능성',
    ],
    outlook: 'Debt Wall Risk',
    outlookColor: 'rose',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'MSTR',
    title: '종합 분석 요약',
    description:
      '저비용으로 비트코인에 직접 투자할 수 있는 현물 ETF가 등장하면서, 투자자들은 마이크로스트래티지의 복잡한 금융 구조와 레버리지 전략에 내재된 리스크를 감수할 필요성에 대해 근본적인 의문을 제기하고 있습니다.',
    points: [
      '성장 스토리: 통제 불가능한 변수인 비트코인 가격에 전적으로 의존',
      '리스크: 계약에 명시된 현실적인 부채 상환 의무',
      '대안 존재: 저비용 비트코인 현물 ETF라는 명확한 경쟁자 등장',
      '시장 평가: 긍정적 뉴스에도 주가가 하락한 것은 이러한 냉정한 현실 인식이 확산되고 있다는 신호',
    ],
    outlook: 'ETF Competition',
    outlookColor: 'amber',
  },
  {
    id: 11,
    type: 'events',
    turnId: 31,
    title: '향후 주요 경제 지표 일정',
    description:
      '시장의 모든 눈은 연이어 발표될 핵심 경제 지표들에 쏠려 있습니다. 각 지표의 결과는 연준의 통화 정책 경로와 시장의 방향성에 큰 영향을 미칠 것입니다.',
    events: [
      {
        date: '2026-02-13',
        label: '1월 소비자물가지수 (CPI)',
        description: '연준의 금리 인하 경로를 가늠할 가장 중요한 잣대',
      },
      {
        date: '이번 주 후반',
        label: '소매판매 & 생산자물가지수 (PPI)',
        description: '소비 건전성 및 선행 인플레이션 흐름 파악',
      },
      {
        date: '2026-02-18',
        label: '1월 FOMC 의사록 공개',
        description: '금리 인하 시점에 대한 연준 위원들의 구체적인 논의 확인',
      },
    ],
  },
  {
    id: 12,
    type: 'closing',
    turnId: 33,
    headline: '신중한 접근이 필요한 최고치 시장',
    tagline: '변동성 확대에 대비하며 투자 원칙을 지킬 때',
    description:
      '시장이 연일 최고치를 경신하고 있지만, 중요한 경제 지표 발표를 앞두고 변동성이 커질 수 있습니다. 단기적인 움직임에 흔들리기보다 장기적인 관점을 유지하고, 일부 대형 기술주에 대한 쏠림 현상도 유의해야 할 시점입니다.',
  },
];