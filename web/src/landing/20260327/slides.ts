import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-28',
    nutshell: '이란 전쟁 위기 고조에 따른 유가 급등과 증시 급락',
    description:
      '중동의 지정학적 리스크가 유가 급등을 촉발하며 시장 전반에 큰 충격을 주었습니다. 인플레이션 재점화 우려가 커지며 기술주를 중심으로 큰 폭의 하락세가 나타났습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '이란 전쟁 위기 고조로 모든 지수가 큰 폭으로 하락했습니다. 다우존스는 1.7%, S&P 500은 1.67% 하락했으며, 특히 기술주 중심의 나스닥은 2.1% 이상 급락하며 힘든 하루를 보냈습니다.',
    indices: [
      { name: 'S&P 500', value: 6368.85, change: -108.31, changePercent: -1.67 },
      { name: 'NASDAQ', value: 20948.36, change: -459.72, changePercent: -2.15 },
      { name: 'DOW', value: 45166.64, change: -793.47, changePercent: -1.73 },
      { name: 'Russell 2000', value: 2449.70, change: -43.62, changePercent: -1.75 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 100.87, change: 6.39, changePercent: 6.76 },
      { name: 'Gold Futures', value: 4521.30, change: 145.80, changePercent: 3.33 },
      { name: 'Dollar Index', value: 100.17, change: 0.27, changePercent: 0.27 },
      { name: 'VIX', value: 20.9, change: 2.4, changePercent: 13.0 },
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
    turnId: 3,
    icon: 'flame',
    title: '지정학적 리스크, 시장을 덮치다',
    subtitle: '이란 전쟁 위기 고조와 유가 쇼크',
    bullets: [
      '이란과의 분쟁 격화 우려로 WTI 유가 6% 이상 폭등',
      '유가, 배럴당 100달러 돌파하며 시장 충격',
      '인플레이션 재점화 공포 확산',
      '연준 금리 인하 기대감 후퇴하며 기술주 매도세 촉발',
    ],
    theme: 'red',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '시장을 뒤흔든 주요 지표',
    description:
      '중동발 지정학적 충격이 모든 자산 가격을 뒤흔든 전형적인 위험 회피 장세였습니다. 공포 심리가 극에 달하며 시장 변동성이 크게 확대되었습니다.',
    stats: [
      { label: 'WTI 유가 (CL=F)', value: '+6.6%', subtext: '배럴당 $100 돌파', trend: 'up' },
      { label: 'VIX 지수', value: '+13%', subtext: '공포 심리 극대화', trend: 'up' },
      { label: '나스닥 지수', value: '-2.1%', subtext: '기술주 중심 급락', trend: 'down' },
      { label: '에너지 섹터 (XLE)', value: '+1.6%', subtext: '유일한 상승 섹터', trend: 'up' },
    ],
    theme: 'red',
    charts: [{ ticker: 'CL=F' }, { ticker: 'TVC:VIX' }],
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 9,
    title: '극명한 섹터별 온도차',
    description:
      '유가 급등이 에너지 섹터에는 호재로, 기술주에는 금리 부담이라는 악재로 작용하며 명암이 엇갈렸습니다.',
    items: [
      {
        label: '에너지 섹터 (XLE)',
        value: '상승',
        description: '유가 급등에 따른 수익성 개선 기대감',
        highlight: true,
      },
      {
        label: '기술주 섹터 (XLK)',
        value: '하락',
        description: '금리 상승 우려로 미래 이익 가치 하락',
        highlight: false,
      },
      {
        label: '항공/크루즈',
        value: '하락',
        description: '유류비 부담 증가로 수익 전망 하향',
        highlight: false,
      },
    ],
    charts: [{ ticker: 'XLE' }, { ticker: 'XLK' }],
  },
  {
    id: 5,
    type: 'headline',
    turnId: 11,
    icon: 'bank',
    title: '연준의 후퇴, 금리 인하 기대감 소멸',
    subtitle: '스태그플레이션 공포 자극',
    bullets: [
      '필립 제퍼슨 연준 부의장, "단기 인플레이션 상승 예상"',
      '현 정책 기조 유지 발언으로 금리 인하 기대감 사실상 차단',
      '일부 IB, 분쟁 장기화 시 유가 200달러 시나리오 제시',
      '고물가+경기침체(스태그플레이션) 우려로 투자 심리 위축',
    ],
    theme: 'amber',
  },
  {
    id: 6,
    type: 'stats',
    turnId: 13,
    title: '유가 200달러 시나리오',
    description:
      '일부 투자은행에서는 이란과의 분쟁이 장기화될 경우 유가가 200달러까지 치솟을 수 있다는 극단적인 시나리오를 제시하고 있습니다.',
    stats: [
      { label: '현재 WTI 유가', value: '$100+', subtext: '6% 이상 급등', trend: 'up' },
      { label: 'IB 비관적 전망', value: '$200', subtext: '분쟁 장기화 시', trend: 'up' },
      { label: '맥쿼리 그룹 확률', value: '40%', subtext: '$200 시나리오 도달 확률', trend: 'neutral' },
    ],
    note: '시장이 느끼는 불확실성이 매우 크다는 점을 보여줍니다.',
    theme: 'amber',
  },
  {
    id: 7,
    type: 'ticker-intro',
    turnId: 14,
    ticker: 'CRWD',
    companyName: 'CrowdStrike',
    currentPrice: 369.58,
    dayChange: -23.04,
    dayChangePercent: -5.87,
    description:
      '장 초반 급등 후 급락하는 극심한 변동성 끝에 약보합으로 마감했습니다. 현재 크라우드스트라이크는 강력한 성장세와 심각한 규제 리스크 사이의 팽팽한 줄다리기를 보여주고 있습니다.',
    charts: [{ ticker: 'CRWD' }],
  },
  {
    id: 8,
    type: 'stats',
    turnId: 15,
    title: '크라우드스트라이크의 성장 지표',
    description:
      '규제 리스크에도 불구하고, 회사의 펀더멘털 성장세는 매우 강력합니다. 이는 투자자들이 리스크를 감수하면서도 주목하는 이유입니다.',
    stats: [
      { label: '연간 반복 매출 (ARR)', value: '$52억+', subtext: '전년 대비 24% 성장', trend: 'up' },
      { label: '순 유지율 (NRR)', value: '115%', subtext: '기존 고객 지출 증가', trend: 'up' },
      { label: '영업 현금흐름', value: '$16억', subtext: '연간 기준, 강력한 재무 체력', trend: 'up' },
    ],
    theme: 'green',
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 17,
    ticker: 'CRWD',
    title: '핵심 리스크: 신뢰성의 위기',
    points: [
      '주요 고객사(델타항공 등)로부터 시스템 장애 관련 소송 피소',
      '미 법무부(DOJ)와 증권거래위원회(SEC)의 ARR 산정 방식 조사 착수',
      'SaaS 기업 가치평가의 핵심인 ARR 지표의 신뢰성 자체에 의문 제기',
      '기업 성장 서사 전체를 흔들 수 있는 중대한 리스크로 부상',
    ],
    description:
      '최근 공시된 10-K 보고서에서 밝혀진 두 가지 사안이 주가의 발목을 잡고 있습니다. 이는 단순한 재무적 문제를 넘어 기업의 근본적인 신뢰도에 대한 질문을 던지고 있습니다.',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 19,
    ticker: 'CRWD',
    title: '투자자 신뢰 붕괴 가능성',
    points: [
      '강력한 현금 창출 능력은 긍정적이나, 문제의 본질은 돈이 아님',
      'ARR 회계 조사 결과에 따라 과거 실적 재작성 시, 신뢰 붕괴 가능',
      '회사 스스로 잠재적 손실 규모 추정 불가, 리스크 크기 가늠 불가',
      "'부정적 반사성' 악순환 진입 우려 (주가 하락 → 펀더멘털 의심 증폭)",
    ],
    outlook: '핵심적인 불확실성이 해소되기 전까지는 리스크 관리가 매우 중요한 시점입니다.',
    outlookColor: 'amber',
  },
  {
    id: 11,
    type: 'headline',
    turnId: 21,
    title: '결론: 리스크 관리의 중요성',
    subtitle: '뛰어난 펀더멘털 vs 측정 불가능한 리스크',
    bullets: [
      '기술적 우위와 강력한 성장세는 분명한 강점',
      '회계 신뢰성에 대한 근본적인 의문이 주가 발목',
      '예측 불가능한 법적 리스크가 온전히 반영되지 않았을 가능성',
      '핵심 불확실성 해소 전까지 보수적 접근 필요',
    ],
    theme: 'amber',
  },
  {
    id: 12,
    type: 'headline',
    turnId: 23,
    icon: 'trending-up',
    title: '성공적인 1분기 마무리',
    subtitle: '강세장의 전형, S&P 500 사상 최고치 경신',
    bullets: [
      'AI 낙관론과 연준 금리 인하 기대감이 1분기 랠리 견인',
      '개인소비지출(PCE) 물가지수 예상 부합, 인플레이션 둔화 확신',
      '골디락스 시나리오(성장+물가안정)에 대한 베팅 지속',
      '투자자들은 성공적으로 1분기를 마무리',
    ],
    theme: 'green',
  },
  {
    id: 13,
    type: 'events',
    turnId: 25,
    title: '다음 주 시장의 향방을 가를 이벤트',
    description:
      '1분기 랠리의 타당성을 검증할 핵심 경제 지표들이 연이어 발표됩니다. 시장의 모든 관심이 집중될 것입니다.',
    events: [
      {
        date: '2026-03-30',
        label: '제롬 파월 연준 의장 연설',
        description: '금리 정책에 대한 추가 힌트 제공 가능',
      },
      {
        date: '2026-04-01',
        label: 'ISM 제조업 구매관리자지수(PMI)',
        description: '2분기 제조업 경기를 가늠할 첫 선행지표',
      },
      {
        date: '2026-04-03',
        label: '3월 고용보고서',
        description: '연준의 금리 인하 결정을 좌우할 가장 중요한 분수령',
      },
    ],
  },
  {
    id: 14,
    type: 'stats',
    turnId: 27,
    title: '2분기 경제 바로미터',
    description:
      '다음 주 발표될 지표들은 2분기 시장의 투자 심리를 좌우할 수 있습니다. 특히 고용보고서의 세부 내용이 중요합니다.',
    stats: [
      { label: 'ISM 제조업 PMI', value: '선행지표', subtext: '제조업 경기 확장/위축 판단', trend: 'neutral' },
      { label: '비농업 고용', value: '고용시장 열기', subtext: '연준의 핵심 판단 근거', trend: 'neutral' },
      { label: '시간당 임금', value: '인플레이션 압력', subtext: '물가와 직결되는 지표', trend: 'neutral' },
    ],
    theme: 'blue',
  },
  {
    id: 15,
    type: 'closing',
    turnId: 29,
    headline: '기대와 현실의 첫 시험대',
    tagline: '1분기 랠리 이후, 데이터 확인이 필요한 시점',
    description:
      "1분기 시장을 이끈 '골디락스' 기대가 현실과 부합하는지 다음 주 경제 지표를 통해 확인해야 합니다. 변동성 확대에 대비하며 차분하게 대응 전략을 세우는 지혜가 필요합니다.",
  },
];