import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-17',
    nutshell: '호르무즈 해협 긴장 완화에 따른 유가 급락과 증시 반등',
    description:
      '중동의 지정학적 리스크가 완화되며 유가가 급락하고 투자 심리가 개선되었습니다. 엔비디아 GTC 컨퍼런스에 대한 기대감은 기술주 랠리를 이끌었습니다. 오늘 브리핑에서는 시장을 움직인 두 가지 핵심 동력과 함께 웨스턴디지털(WDC)을 심층 분석합니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '미국 정부가 이란의 원유 수출을 일부 용인하겠다는 소식에 유가가 5% 가까이 급락하며 시장 전반에 훈풍이 불었습니다. 모든 주요 지수가 긍정적인 투자 심리에 힘입어 강하게 상승 마감했습니다.',
    indices: [
      { name: 'S&P 500', value: 6699.38, change: 67.19, changePercent: 1.01 },
      { name: 'NASDAQ', value: 22374.18, change: 268.82, changePercent: 1.22 },
      { name: 'DOW', value: 46946.41, change: 387.94, changePercent: 0.83 },
      { name: 'Russell 2000', value: 2503.29, change: 23.24, changePercent: 0.94 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 94.28, change: -4.43, changePercent: -4.49 },
      { name: 'Gold Futures', value: 5015.20, change: -37.30, changePercent: -0.74 },
      { name: 'Dollar Index', value: 27.73, change: -0.16, changePercent: -0.57 },
      { name: 'VIX', value: 23.52, change: -2.48, changePercent: -9.54 },
    ],
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
    turnId: 6,
    icon: 'anchor',
    title: '호르무즈 리스크 완화',
    subtitle: '유가 급락과 시장의 안도 랠리',
    description:
      '미 재무장관이 이란 유조선의 호르무즈 해협 통과를 사실상 용인하고 있다고 밝히면서, 시장을 짓누르던 지정학적 불확실성이 크게 해소되었습니다.',
    bullets: [
      '美 재무장관, 이란 유조선 통과 용인 발언',
      'WTI 유가, 지정학적 리스크 프리미엄 해소되며 5% 급락',
      '변동성 지수(VIX) 9% 이상 하락하며 23선 진입',
      '인플레이션 완화 기대감에 투자 심리 급격히 개선',
    ],
    theme: 'green',
    charts: [{ ticker: 'NYMEX:CL' }, { ticker: 'TVC:VIX' }],
  },
  {
    id: 3,
    type: 'comparison',
    turnId: 8,
    title: '유가 하락의 명암: 업종별 반응',
    description:
      '유가 하락이라는 동일한 재료에 대해 업종별로 명암이 뚜렷하게 엇갈렸습니다. 항공주는 직접적인 수혜를 입었고, 에너지주는 시장 전반의 랠리에 힘입어 선방했습니다.',
    items: [
      {
        label: '항공 (DAL)',
        value: '+2.5%',
        description: '유류비 부담 감소 기대감에 직접적 수혜를 입으며 강세',
        highlight: true,
      },
      {
        label: '에너지 (XOM, CVX)',
        value: '소폭 상승',
        description: '유가 하락 악재에도 불구, 시장 전반의 위험 선호 심리에 힘입어 하락 방어',
        highlight: false,
      },
      {
        label: '시장 전반',
        value: '광범위한 랠리',
        description: '에너지 비용 감소로 인한 소비 여력 증대 및 기업 비용 절감 기대',
        highlight: false,
      },
    ],
    charts: [{ ticker: 'DAL' }, { ticker: 'XOM' }, { ticker: 'CVX' }],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 11,
    title: '연준의 통화정책에 미칠 영향',
    description:
      '이번 유가 안정은 인플레이션 안정을 위해 원유 공급을 늘리겠다는 미국 행정부의 의지로 해석되며, 연준에게 상당한 정책적 여유를 줄 수 있습니다.',
    stats: [
      { label: '인플레이션 압력', value: '완화', subtext: '에너지 가격 하향 안정세', trend: 'down' },
      { label: '금리 인상 명분', value: '약화', subtext: '연준의 긴축 서두를 필요성 감소', trend: 'down' },
      { label: '시장 기대 심리', value: '개선', subtext: '연준 부담 감소 신호로 해석', trend: 'up' },
    ],
    note: '헤드라인 인플레이션 둔화가 시장의 기대 심리를 바꾸는 데 결정적인 역할을 합니다.',
    theme: 'green',
    charts: [{ ticker: 'TVC:US10Y' }],
  },
  {
    id: 5,
    type: 'headline',
    turnId: 14,
    icon: 'cpu',
    title: '식지 않는 AI 투자 열풍',
    subtitle: 'NVIDIA GTC 2026 컨퍼런스 개막',
    description:
      '엔비디아의 연례 개발자 컨퍼런스 개막은 단순한 기업 행사를 넘어, 차세대 칩과 소프트웨어에 대한 기대로 기술주 전반의 랠리를 이끄는 핵심 동력이었습니다.',
    bullets: [
      'NVIDIA 연례 개발자 컨퍼런스(GTC) 개막',
      '차세대 AI 칩 및 기술에 대한 기대감 최고조',
      '반도체 관련주 동반 상승하며 나스닥 랠리 견인',
      '유가 하락 및 국채 금리 안정도 성장주에 우호적 환경 조성',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NVDA' }, { ticker: 'NASDAQ:IXIC' }],
  },
  {
    id: 6,
    type: 'stats',
    turnId: 17,
    title: 'NVIDIA GTC 2026 주요 발표',
    description:
      '엔비디아는 AI 추론 시장을 겨냥한 신규 칩과 데이터센터 CPU 시장에 도전하는 신규 서버를 공개하며 종합 AI 플랫폼 기업으로의 청사진을 제시했습니다.',
    stats: [
      { label: '신규 칩', value: 'Groq 3', subtext: 'AI 추론 특화 언어 처리 장치', trend: 'up' },
      { label: '신규 서버', value: 'Vera CPU', subtext: '데이터센터용 CPU 시장 겨냥', trend: 'up' },
      { label: 'AI 추론 시장 전망', value: '$2,500억', subtext: '2030년까지의 시장 규모', trend: 'up' },
    ],
    note: '단순 칩 제조사를 넘어 종합 AI 플랫폼 기업으로의 비전 제시.',
    theme: 'blue',
    charts: [{ ticker: 'NVDA' }, { ticker: 'INTC' }, { ticker: 'AMD' }],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 19,
    title: 'AI 생태계 동반 성장',
    subtitle: 'NVIDIA 발 낙수효과 확산',
    description:
      '엔비디아의 기술 로드맵이 공개되자 인공지능 생태계 전반에 온기가 퍼졌습니다. 서버, 메모리 등 관련 기업들의 주가가 동반 상승하며 기대감을 반영했습니다.',
    bullets: [
      'SMCI (+1%): NVIDIA 칩 탑재 고성능 서버 공급 기대감',
      'MU (+5%): AI 연산용 고대역폭 메모리(HBM) 수요 증가 기대',
      'META: 수천억 달러 규모 AI 인프라 투자 계획 발표',
      '생태계 전반: 하드웨어, 소프트웨어, 데이터센터 동반 성장 확인',
    ],
    theme: 'blue',
    charts: [{ ticker: 'SMCI' }, { ticker: 'MU' }],
  },
  {
    id: 8,
    type: 'ticker-analysis',
    turnId: 21,
    ticker: 'NVDA',
    title: 'NVIDIA의 장기 비전: AI 생태계 장악',
    points: [
      '강력한 소프트웨어 생태계 \'CUDA\'로 고객 락인(Lock-in) 효과',
      '경쟁사가 모방하기 힘든 핵심 경쟁력으로 자리매김',
      '데이터센터, 통신 등 다양한 산업으로 기술 확장 파트너십 전략',
    ],
    description:
      '단순 칩 제조사를 넘어, AI 개발 및 운영에 필요한 모든 것을 제공하는 \'종합 솔루션 기업\'으로의 도약을 목표로 하고 있습니다.',
    outlook: '산업 표준 형성',
    outlookColor: 'blue',
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'WDC',
    companyName: 'Western Digital',
    currentPrice: 286.21,
    dayChange: 13.92,
    dayChangePercent: 5.11,
    description:
      '단순 저장장치 제조업체를 넘어 AI 데이터 인프라의 핵심 수혜주로 재평가받으며 1.5% 상승 마감했습니다.',
    charts: [{ ticker: 'WDC' }],
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'WDC',
    title: '투자 포인트 (Bull Case)',
    points: [
      '클라우드 부문 매출 전년 대비 28% 급증 (AI 데이터 저장 수요 폭발)',
      '플래시 사업부 분사로 고수익 HDD 사업에 집중',
      '6개월간 11억 달러 규모의 강력한 자사주 매입',
    ],
    description:
      '시장은 웨스턴디지털을 AI 데이터 인프라의 핵심 수혜주로 평가하며, 회사의 강한 자신감에 긍정적으로 반응하고 있습니다.',
    outlook: '긍정적 모멘텀',
    outlookColor: 'emerald',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'WDC',
    title: '리스크 요인 (Bear Case)',
    points: [
      '극심한 고객 집중도: 단 3개 고객사가 전체 매출의 46% 차지',
      '주요 고객의 자체 스토리지 솔루션 개발 가능성 (회사 인정 리스크)',
      '소수 클라우드 기업의 투자 계획에 운명이 좌우되는 불안정한 구조',
    ],
    description:
      '화려한 성장세 이면에는 소수 고객에 대한 높은 의존도라는 구조적 리스크가 존재하며, 이는 단순한 우려가 아닌 현실적인 위협입니다.',
    outlook: '구조적 위험',
    outlookColor: 'rose',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'WDC',
    title: '밸류에이션 분석',
    points: [
      '순이익에 17억 달러 규모의 일회성, 비현금성 평가 이익 포함',
      '일회성 요인을 제외한 조정 주가수익비율(PER)은 41배를 상회',
      '전통적 하드웨어 제조업체에 부여하기에는 상당히 높은 수준',
    ],
    description:
      '회계적 착시를 제외하면 현재 주가는 AI에 대한 기대감을 과도하게 반영하고 있다는 분석이 제기됩니다.',
    outlook: '고평가 우려',
    outlookColor: 'amber',
  },
  {
    id: 13,
    type: 'headline',
    turnId: 29,
    title: 'Western Digital 종합 평가',
    subtitle: '성장 서사와 리스크의 충돌',
    description:
      'AI 데이터 폭증에 따른 수혜 기대감은 유효하지만, 극단적인 고객 리스크와 고평가 논란이 정면으로 충돌하는 비대칭적 위험 구조를 보이고 있습니다.',
    bullets: [
      '기회: AI 데이터 폭증에 따른 명확한 수혜 기대감',
      '위협: 소수 고객에 대한 절대적 의존도 및 이탈 리스크',
      '밸류에이션: 일회성 이익 제외 시 상당한 부담',
      '결론: 리스크 현실화 시 상당한 주가 조정 가능성 내포',
    ],
    theme: 'purple',
  },
  {
    id: 14,
    type: 'events',
    turnId: 33,
    title: '다음 주 주요 경제 이벤트',
    description:
      '다음 주는 연준의 통화정책 방향을 가늠할 수 있는 중요한 경제지표들이 발표될 예정이므로, 결과에 따라 시장 변동성이 확대될 수 있습니다.',
    events: [
      {
        date: '주 후반',
        label: '주택시장 지표 발표',
        description: '미국 경제의 건전성을 직접적으로 보여주는 지표',
      },
      {
        date: '주 후반',
        label: '제조업 PMI 속보치 발표',
        description: '연준의 긴축 기조 유지 여부 판단 단서',
      },
      {
        date: '주 후반',
        label: '서비스업 PMI 속보치 발표',
        description: '경기 둔화 신호 확인 시 시장 안도감 확산 가능',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '확인된 지표와 펀더멘털에 집중할 시기',
    tagline: '거시 경제 불확실성 속 신중한 접근 필요',
    description:
      '단기적인 시장 등락에 흔들리기보다는, 긴 호흡으로 우량 자산을 분할 매수하고 현금 비중을 유지하며 다음 기회를 대비하는 위험 관리가 중요합니다.',
  },
];