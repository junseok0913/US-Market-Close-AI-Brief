import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-01',
    nutshell: '지정학적 긴장 완화 기대감에 유가 급락 및 증시 급등',
    description:
      '이란 관련 지정학적 리스크 완화 기대감이 유가 급락을 이끌며 투자 심리를 되살렸습니다. 여기에 AI 인프라 관련 대규모 자금 조달 소식이 더해지며 기술주 중심의 강한 반등 장세가 연출되었습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '미국과 이란의 유화적 신호에 지정학적 긴장이 완화되면서 3대 지수 모두 급등했습니다. 특히 기술주 중심의 나스닥은 3.8% 넘게 치솟으며 시장 상승을 주도했습니다.',
    indices: [
      { name: 'S&P 500', value: 6528.52, change: 184.80, changePercent: 2.91 },
      { name: 'NASDAQ', value: 21590.63, change: 795.99, changePercent: 3.83 },
      { name: 'DOW', value: 46341.51, change: 1125.37, changePercent: 2.49 },
      { name: 'Russell 2000', value: 2496.37, change: 82.36, changePercent: 3.41 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 101.56, change: -1.32, changePercent: -1.28 },
      { name: 'Brent Crude', value: 101.56, change: -1.32, changePercent: -1.28 },
      { name: 'Gold Futures', value: 4699.60, change: 173.60, changePercent: 3.84 },
      { name: 'Dollar Index', value: 99.89, change: -0.62, changePercent: -0.61 },
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
    turnId: 7,
    icon: 'globe',
    title: '지정학적 리스크 완화',
    subtitle: '유가 급락, 증시 급등',
    description:
      '미국과 이란 양측에서 동시에 유화적인 신호가 나오면서 시장을 짓누르던 전쟁의 공포가 크게 완화되었습니다. 유가 급락이 증시 급등으로 이어지는 전형적인 안도 랠리가 펼쳐졌습니다.',
    bullets: [
      '미-이란, 협상을 통한 전쟁 종식 의지 표명',
      'WTI 유가 100달러 선까지 하락하며 2% 이상 급락',
      '나스닥 지수 3.8% 급등하며 랠리 주도',
      '위험자산 선호 심리 회복, 안전자산(금)은 소폭 반등',
    ],
    theme: 'green',
    charts: [
      { ticker: 'CL=F', title: 'WTI Crude Oil' },
      { ticker: 'GC=F', title: 'Gold' },
    ],
  },
  {
    id: 3,
    type: 'stats',
    turnId: 9,
    title: '엇갈린 경제 지표 신호',
    description:
      '유가 안정 기대감이 소비 위축 우려를 덮었지만, 동시에 발표된 경제 지표들은 소비 심리와 고용 시장에 대해 서로 다른 신호를 보내며 향후 경제 방향성에 대한 불확실성을 남겼습니다.',
    stats: [
      {
        label: '3월 소비자신뢰지수',
        value: '91.8',
        subtext: '시장 예상치 상회',
        trend: 'up',
      },
      {
        label: '2월 구인·이직 보고서',
        value: '채용률 최저',
        subtext: '2020년 4월 이후',
        trend: 'down',
      },
      {
        label: '미국 평균 휘발유 가격',
        value: '$4/갤런 상회',
        subtext: '소비 위축 우려 요인',
        trend: 'up',
      },
    ],
    note: '고용 시장의 미묘한 변화는 앞으로 경제 방향성을 가늠할 중요한 변수가 될 전망입니다.',
    theme: 'amber',
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 11,
    title: '업종별 명암: 에너지 vs 기술',
    description:
      '시장의 위험 회피 심리가 완화되자 자금이 에너지와 같은 원자재 관련주에서 빠져나와 성장주 중심으로 빠르게 이동하는 모습을 보였습니다.',
    items: [
      {
        label: '에너지 (XLE)',
        value: '유일하게 하락',
        description: '국제 유가 하락의 직격탄',
        highlight: false,
      },
      {
        label: '기술 (XLK)',
        value: '3% 이상 급등',
        description: '비용 부담 감소 및 경기 회복 기대감',
        highlight: true,
      },
      {
        label: '소비재 (XLY)',
        value: '동반 상승 주도',
        description: '지정학적 리스크 완화 수혜',
        highlight: false,
      },
    ],
    charts: [
      { ticker: 'XLE', title: 'Energy Select Sector SPDR Fund' },
      { ticker: 'XLK', title: 'Technology Select Sector SPDR Fund' },
    ],
  },
  {
    id: 5,
    type: 'stats',
    turnId: 13,
    title: '불안과 안도의 공존: VIX 지수',
    description:
      '시장의 공포지수로 불리는 VIX가 25 아래로 내려오며 크게 안정되었지만, 여전히 20선을 상회하고 있어 투자자들이 완전히 안심하지 못하고 있음을 보여줍니다.',
    stats: [
      {
        label: 'VIX 지수',
        value: '24.5',
        subtext: '25 하회, 여전히 20 상회',
        trend: 'down',
      },
      {
        label: '시장 심리',
        value: '안도 랠리 속 경계감',
        subtext: '확정된 사실이 아닌 기대감에 기반',
        trend: 'neutral',
      },
    ],
    note: '시장의 관심은 이제 지정학적 리스크에서 벗어나 경제 펀더멘털 지표로 이동할 것입니다.',
    theme: 'purple',
    charts: [{ ticker: 'TVC:VIX', title: 'CBOE Volatility Index' }],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 15,
    icon: 'cpu',
    title: 'AI 인프라 투자 열풍',
    subtitle: 'CoreWeave 자금 조달이 촉발한 기술주 랠리',
    description:
      '엔비디아가 지원하는 AI 데이터센터 기업 코어위브가 85억 달러 규모의 자금 조달에 성공했다는 소식은 기술주에 대한 강력한 매수세를 유입시키는 기폭제가 되었습니다.',
    bullets: [
      'AI 데이터센터 기업 CoreWeave, 85억 달러 자금 조달 성공',
      'NVIDIA 주가 5% 이상 급등하며 관련주 랠리 견인',
      '필라델피아 반도체 지수 큰 폭으로 상승',
      '거시적 순풍(유가 하락)과 산업 호재의 완벽한 조화',
    ],
    theme: 'blue',
    charts: [
      { ticker: 'NVDA', title: 'NVIDIA Corp.' },
      { ticker: 'SOXX', title: 'PHLX Semiconductor Index' },
    ],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 17,
    title: 'GPU, 새로운 담보 자산으로 부상',
    subtitle: 'CoreWeave 딜의 상징적 의미',
    description:
      '이번 자금 조달은 AI 연산의 핵심인 GPU 자체가 투자 등급의 우량 담보물로 인정받기 시작했다는 의미를 가지며, AI 산업의 구조적 성장성을 증명하는 상징적인 사건으로 평가됩니다.',
    bullets: [
      'Blackstone, Carlyle 등 대형 기관 투자 주도',
      'CoreWeave 보유 NVIDIA GPU를 담보로 자금 조달',
      'AI 인프라 수요의 확실성을 금융 시장이 인정한 사례',
      'GPU 공급망 정점인 NVIDIA의 독보적 지배력 재확인',
    ],
    theme: 'blue',
  },
  {
    id: 8,
    type: 'stats',
    turnId: 19,
    title: '확장되는 NVIDIA의 AI 동맹',
    description:
      '엔비디아는 칩 판매를 넘어, 파트너십과 투자를 통해 자신들의 기술을 중심으로 한 거대한 AI 생태계를 구축하며 영향력을 확대하고 있습니다.',
    stats: [
      {
        label: 'NVIDIA → Marvell',
        value: '$20억 투자',
        subtext: 'AI 파트너십 체결',
        trend: 'up',
      },
      {
        label: 'Marvell (MRVL) 주가',
        value: '+7% 급등',
        subtext: '파트너십 발표 후',
        trend: 'up',
      },
      {
        label: '기타 AI 관련주',
        value: '동반 강세',
        subtext: 'AMD, SMCI 등',
        trend: 'up',
      },
    ],
    note: 'ISM 제조업 지수가 예상치를 하회하며 경제 과열 우려를 덜어준 점도 기술주에 호재로 작용했습니다.',
    theme: 'blue',
    charts: [
      { ticker: 'MRVL', title: 'Marvell Technology, Inc.' },
      { ticker: 'AMD', title: 'Advanced Micro Devices, Inc.' },
    ],
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'SCCO',
    companyName: 'Southern Copper Corporation',
    currentPrice: 172.06,
    dayChange: 12.78,
    dayChangePercent: 8.02,
    description:
      '서던 코퍼의 주가가 5.59% 급등했습니다. 시장이 이 기업을 단순한 구리 광산업체를 넘어, AI 혁명과 에너지 전환의 핵심 공급자로 재평가하기 시작했다는 신호로 해석됩니다.',
    charts: [{ ticker: 'SCCO', title: 'Southern Copper Corporation' }],
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'SCCO',
    title: '강점: 압도적인 원가 경쟁력',
    points: [
      '업계 최저 수준의 현금 비용 구조 (파운드당 $0.58)',
      '구리 가격 상승 시 이익이 기하급수적으로 증가',
      'AI 데이터센터, 전기차 확산에 따른 구조적 수요 증가',
      '‘디지털 시대의 원유’ 공급처로 부각되는 전략적 가치',
    ],
    outlook: '긍정적 펀더멘털',
    outlookColor: 'emerald',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'SCCO',
    title: '약점: 통제 불가능한 지정학적 리스크',
    points: [
      '사업장이 대부분 페루와 멕시코에 집중',
      '극심한 정치적 불안정성 (자산 몰수, 국유화 가능성)',
      '2026년 4월 페루 총선 등 리스크 이벤트 상존',
      '정치적 리스크로 인한 손실은 대부분 보험으로 보장 불가',
    ],
    outlook: '치명적 외부 변수',
    outlookColor: 'rose',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'SCCO',
    title: '종합 평가: High-Risk, High-Return',
    points: [
      '세계 최고 수준의 펀더멘털과 최악의 지정학적 리스크가 공존',
      '가치 평가 시 높은 국가 리스크 할인율 적용이 합리적',
      '최근 주가 급등으로 미래 성장 잠재력을 상당 부분 반영',
      '영구적 자본 손실의 가능성을 무시할 수 없는 상황',
    ],
    description:
      '기업의 펀더멘털은 훌륭하지만, 그 가치를 훼손할 수 있는 외부 변수의 불확실성이 너무 큽니다. 공격적인 접근보다는 잠재된 리스크에 대한 충분한 경계가 필요합니다.',
    outlook: '신중한 접근 필요',
    outlookColor: 'amber',
  },
  {
    id: 13,
    type: 'stats',
    turnId: 31,
    title: '시장의 초점, 고용 지표로 이동',
    description:
      '예상보다 강한 ISM 제조업 지표는 미국 경제의 견조함을 보여주며 연준의 금리 인하 기대감을 후퇴시켰습니다. 이제 시장의 관심은 고용 시장의 온도를 확인할 수 있는 지표들로 향하고 있습니다.',
    stats: [
      {
        label: 'ISM 제조업 PMI',
        value: '50.3',
        subtext: '2022년 9월 이후 첫 확장 국면',
        trend: 'up',
      },
      {
        label: '시장 반응',
        value: '금리 인하 지연 우려',
        subtext: '국채 금리 상승, 증시 부담',
        trend: 'down',
      },
      {
        label: '다음 관심사',
        value: '고용 시장 데이터',
        subtext: '연준의 통화정책 결정 핵심 단서',
        trend: 'neutral',
      },
    ],
    note: '연준이 금리 인하를 결정하기 위해서는 인플레이션 둔화와 함께 고용 시장 과열 완화 증거가 필요합니다.',
    theme: 'purple',
  },
  {
    id: 14,
    type: 'events',
    turnId: 33,
    title: '이번 주 주목할 경제 지표',
    description:
      '이번 주와 다음 주 초에 발표될 주요 고용 및 서비스업 지표는 연준의 통화정책 경로에 대한 중요한 단서를 제공하며 시장의 방향성을 결정할 전망입니다.',
    events: [
      {
        date: '4월 2일',
        label: '챌린저 감원 보고서',
        description: '고용 시장의 온도를 가늠할 수 있는 선행 지표',
      },
      {
        date: '4월 3일',
        label: '3월 고용보고서 (NFP)',
        description: '비농업 고용, 실업률, 시간당 임금 등 핵심 데이터',
      },
      {
        date: '4월 6일',
        label: 'ISM 서비스업 PMI',
        description: '미국 경제의 큰 비중을 차지하는 서비스업 경기 동향',
      },
    ],
    charts: [{ ticker: 'TVC:US10Y', title: '미국 10년물 국채 금리' }],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: 'Good News is Bad News',
    tagline: '견조한 경제와 금리 인하 기대의 줄다리기',
    description:
      '시장은 현재 연준의 통화정책 전환 시점에 모든 신경을 곤두세우고 있습니다. 당분간 발표되는 주요 경제 지표 하나하나에 따라 시장의 기대치가 어떻게 변하는지 면밀히 관찰하며 신중하게 대응할 필요가 있겠습니다.',
  },
];