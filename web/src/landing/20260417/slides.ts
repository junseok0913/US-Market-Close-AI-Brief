import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-18',
    nutshell: '지정학적 긴장 완화에 따른 위험자산 선호 심리 회복',
    description:
      '이란의 호르무즈 해협 통행 재개 소식에 국제 유가가 폭락하며 시장의 인플레이션 우려를 잠재웠습니다. 이에 힘입어 주요 지수는 일제히 급등했으며, 기술주 랠리가 반도체를 넘어 소프트웨어 분야로 확산되는 등 긍정적인 모습을 보였습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '시장 요약: 안도 랠리 펼친 하루',
    description:
      '지정학적 긴장 완화 소식이 전해지자 투자 심리가 급격히 회복되며 모든 주요 지수가 1% 이상 상승 마감했습니다. 특히 유가 급락이 인플레이션 우려를 완화시키며 시장 전반에 훈풍을 불어넣었습니다.',
    indices: [
      { name: 'S&P 500', value: 7126.06, change: 84.78, changePercent: 1.20 },
      { name: 'NASDAQ', value: 24468.48, change: 365.78, changePercent: 1.52 },
      { name: 'DOW', value: 49447.43, change: 868.71, changePercent: 1.79 },
      { name: 'Russell 2000', value: 2776.90, change: 57.30, changePercent: 2.11 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 83.84, change: -10.85, changePercent: -11.46 },
      { name: 'Gold Futures', value: 4853.40, change: 68.00, changePercent: 1.42 },
      { name: 'Dollar Index', value: 98.22, change: -0.00, changePercent: -0.00 },
      { name: '10-Yr Yield', value: 4.612, change: -0.039, changePercent: -0.85 },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ' },
      { ticker: 'DJ:DJI', title: 'DOW' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 3,
    title: '기술주 랠리, 저변 확대',
    subtitle: '반도체를 넘어 소프트웨어까지',
    description:
      '이번 상승은 일부 반도체 주식에 편중되지 않고 소프트웨어 관련주까지 동반 상승하며 랠리의 기반이 넓어졌다는 점에서 긍정적입니다. 이는 시장이 더욱 건강해지고 있다는 신호로 해석될 수 있습니다.',
    bullets: [
      '반도체 주도 랠리에서 소프트웨어 동반 상승으로 확산',
      '일부 종목에 편중되지 않은 전반적인 기술주 강세',
      '시장의 건전성 강화 신호로 해석',
      '조정 우려를 딛고 V자 반등하며 사상 최고치 경신',
    ],
    theme: 'blue',
    charts: [{ ticker: 'SP:SPX', title: 'S&P 500 V자 반등' }],
  },
  {
    id: 3,
    type: 'headline',
    turnId: 5,
    icon: 'key',
    title: '오늘 시장을 움직인 두 가지 핵심 동력',
    subtitle: '지정학적 리스크 완화 & 기술주 랠리 확산',
    description:
      '오늘은 크게 두 가지 요인이 시장의 강한 반등을 이끌었습니다. 이란발 지정학적 리스크 완화에 따른 유가 급락, 그리고 기술주 랠리가 소프트웨어 분야로까지 확산된 점입니다.',
    bullets: ['Key 1: 지정학적 리스크 완화와 유가 급락', 'Key 2: 기술주 랠리의 저변 확대'],
    theme: 'gold',
  },
  {
    id: 4,
    type: 'headline',
    turnId: 7,
    icon: 'tanker',
    title: '지정학적 리스크 완화',
    subtitle: '이란, 호르무즈 해협 통행 재개',
    description:
      '전 세계 원유 수송의 핵심 통로인 호르무즈 해협의 통행이 재개된다는 소식은 유가에 반영되었던 전쟁 프리미엄을 순식간에 걷어냈습니다. 유가 안정은 인플레이션 우려를 해소하며 시장 전반에 안도감을 주었습니다.',
    bullets: [
      '이란 외무장관, 호르무즈 해협 전면 개방 발표',
      '전쟁 프리미엄 소멸로 국제 유가 10% 이상 폭락',
      '인플레이션 최대 불안 요인 해소',
      '주식, 채권 시장 동반 안도 랠리 전개',
    ],
    theme: 'green',
    charts: [
      { ticker: 'CL=F', title: 'WTI 원유 선물' },
      { ticker: 'BZ=F', title: '브렌트유 선물' },
    ],
  },
  {
    id: 5,
    type: 'stats',
    turnId: 8,
    title: '유가 급락의 시장 파급 효과',
    description:
      '유가 급락은 원자재 시장을 넘어 주식, 채권, 변동성 지수 등 시장 전반에 걸쳐 연쇄적인 반응을 일으켰습니다.',
    stats: [
      { label: 'WTI 유가 (CL=F)', value: '-11.5%', subtext: '배럴당 $83선', trend: 'down' },
      { label: 'S&P 500 (SPX)', value: '+1.2%', subtext: '위험자산 선호 심리 회복', trend: 'up' },
      { label: '변동성 지수 (VIX)', value: '급락', subtext: '시장 공포 완화', trend: 'down' },
      { label: '10년물 국채금리', value: '-3.9bp', subtext: '4.612% 마감', trend: 'down' },
    ],
    charts: [
      { ticker: 'TVC:VIX', title: '변동성 지수' },
      { ticker: 'TVC:US10Y', title: '미 10년물 국채금리' },
    ],
  },
  {
    id: 6,
    type: 'comparison',
    turnId: 9,
    title: '유가 하락에 따른 업종별 명암',
    description:
      '유가라는 단일 변수가 시장 내 자금 흐름을 완전히 뒤바꾸며 업종별로 극명한 희비를 갈랐습니다. 에너지주에서 항공주 등 수혜주로 자금이 이동하는 모습이 명확히 나타났습니다.',
    items: [
      {
        label: '에너지 (XLE)',
        value: '부진',
        description: '유가 하락 직격탄. 엑슨모빌(XOM), 셰브론(CVX) 등 주가 하락 압력.',
        highlight: false,
      },
      {
        label: '항공 (JETS)',
        value: '강세',
        description: '비용 절감 효과에 대한 기대로 강력한 호재로 작용. 항공주 전반 상승.',
        highlight: true,
      },
    ],
    charts: [
      { ticker: 'XLE', title: '에너지 섹터 ETF' },
      { ticker: 'JETS', title: '항공주 ETF' },
    ],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 11,
    icon: 'bank',
    title: '연준 정책 방향에 대한 시사점',
    subtitle: '긴축 강도 조절 여력 확보',
    description:
      '이번 유가 급락은 연준에게 인플레이션 둔화 신호를 제공하며 향후 긴축 강도를 조절할 수 있는 여유를 주었습니다. 시장이 이번 소식에 환호한 근본적인 이유도 바로 여기에 있습니다.',
    bullets: [
      '주요 인플레이션 지표의 상방 압력 완화 기대',
      '연준의 공격적 금리 인상 사이클 막바지 기대감 증폭',
      '정책 기조의 즉각적 변화는 아니나, 유연성 확보',
      '시장의 금리 인상 공포 완화',
    ],
    theme: 'purple',
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 13,
    ticker: 'NFLX',
    companyName: 'Netflix, Inc.',
    currentPrice: 97.31,
    dayChange: -10.48,
    dayChangePercent: -9.72,
    description:
      '실적 발표 충격으로 급락했던 넷플릭스가 오늘 시장 전반의 훈풍에 힘입어 소폭 반등했습니다. 겉으로 보이는 순이익 급증 이면에 숨겨진 리스크 요인들을 자세히 분석합니다.',
    charts: [{ ticker: 'NFLX' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 14,
    ticker: 'NFLX',
    title: '실적의 착시: 일회성 이익과 비용 증가',
    description:
      '1분기 순이익 83% 급증이라는 헤드라인 뒤에는 일회성 수수료와 핵심 사업의 비용 증가라는 두 가지 상반된 현실이 존재합니다. 시장은 부풀려진 이익보다 비용 구조 악화에 더 주목했습니다.',
    points: [
      '순이익에 워너 브라더스 인수 파기 수수료 $28억 포함',
      '일회성 요인을 제외하면 핵심 사업 수익성 둔화 신호',
      '판매관리비 43% 급증 등 비용 통제 문제 부각',
      '시장은 회계적 착시 효과 너머의 본질을 간파',
    ],
    outlook: '단기 이익의 질에 대한 의문',
    outlookColor: 'amber',
  },
  {
    id: 10,
    type: 'stats',
    turnId: 16,
    ticker: 'NFLX',
    title: '자사주 매입 축소: 자신감의 부재?',
    description:
      '투자자들은 막대한 현금 유입이 자사주 매입 확대로 이어질 것을 기대했지만, 넷플릭스의 선택은 정반대였습니다. 이는 경영진 스스로 현재 주가 수준에 대한 자신감이 부족하다는 신호로 해석되었습니다.',
    stats: [
      { label: '1분기 자사주 매입', value: '$13억', subtext: '기대치 하회', trend: 'down' },
      { label: '이전 분기 평균', value: '$23억', subtext: '평균 대비 43% 감소', trend: 'down' },
      {
        label: '시장 해석',
        value: '부정적 신호',
        subtext: '경영진의 자신감 부재로 판단',
        trend: 'neutral',
      },
    ],
    note: '경영진의 자본 배분 결정이 투자 심리를 급격히 위축시킨 결정적인 요인으로 작용했습니다.',
    theme: 'red',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 18,
    ticker: 'NFLX',
    title: '재무 건전성 우려 부상',
    description:
      '신사업 투자를 위한 전략적 판단이라는 시각도 있지만, 재무제표는 단기 유동성 압박 가능성을 시사하고 있습니다. 보유 현금보다 단기적으로 지급해야 할 계약 의무가 더 큰 아슬아슬한 상황입니다.',
    points: [
      '보유 현금 및 단기 투자자산: 약 $123억',
      '1년 내 지급 의무(콘텐츠): 약 $140억',
      '보유 현금을 초과하는 단기 채무 구조',
      '자사주 매입 축소는 유동성 확보를 위한 방어적 조치일 가능성',
    ],
    outlook: '재무적 취약성 노출',
    outlookColor: 'rose',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 20,
    ticker: 'NFLX',
    title: '종합 평가: 기대 vs 현실',
    description:
      '광고, 라이브 이벤트 등 미래 성장 가능성은 존재하지만, 현재 시장은 숫자로 증명되지 않은 기대보다 명확하게 드러난 현실의 리스크에 더 무게를 두고 있습니다.',
    points: [
      '기대 영역: 광고 및 라이브 이벤트를 통한 장기 성장 잠재력',
      '현실 영역: 비용 구조 악화, 재무적 취약성, 시장 신뢰 훼손',
      '잠재적 기회보다 당면한 단기 리스크 관리가 더 중요해진 시점',
      '숫자로 증명될 때까지 보수적인 접근 필요',
    ],
    outlook: '단기 리스크 관리 필요',
    outlookColor: 'amber',
  },
  {
    id: 13,
    type: 'headline',
    turnId: 22,
    icon: 'crosshair',
    title: '랠리 이후, 시장의 시선은 경제 지표로',
    subtitle: '지정학적 호재 소화 후, 이제는 펀더멘털',
    description:
      '지정학적 리스크 완화라는 강력한 호재로 시장이 급반등했지만, 투자자들의 시선은 다시 연준의 정책에 영향을 미칠 핵심 경제 지표로 향하고 있습니다. 랠리의 지속 가능성을 확인해야 하는 구간입니다.',
    bullets: [
      '강력한 단기 반등 모멘텀 형성',
      '인플레이션 및 성장 지표 발표 예정',
      '연준의 정책 경로에 대한 불확실성은 여전',
      '데이터 확인 후 대응 전략 필요',
    ],
    theme: 'amber',
  },
  {
    id: 14,
    type: 'events',
    turnId: 24,
    title: '다음 주 주목해야 할 경제 지표',
    description:
      '오늘의 랠리는 지정학적 변수에 의한 것이었습니다. 이제 시장의 지속 가능성은 다음 주 발표될 핵심 경제 지표, 특히 연준이 주시하는 인플레이션 데이터에 달려있습니다.',
    events: [
      {
        date: '4월 23일',
        label: 'S&P 글로벌 종합 PMI 예비치',
        description: '제조업/서비스업 활동 속보치, 경제 활력 수준 파악',
      },
      {
        date: '4월 30일',
        label: '1분기 GDP 성장률 속보치',
        description: '미국 경제의 성장세와 둔화 여부 확인',
      },
      {
        date: '4월 30일',
        label: '근원 PCE 가격지수',
        description: '연준이 가장 중시하는 핵심 인플레이션 지표',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 28,
    headline: '안도 랠리를 즐기되, 펀더멘털을 확인하라',
    tagline: '유가 안정은 단기 호재, 시장의 추세는 경제 데이터가 결정',
    description:
      '지정학적 리스크 완화로 인한 유가 급락은 시장에 강력한 반등 모멘텀을 제공했습니다. 그러나 연준의 정책 기조를 결정할 인플레이션과 성장 지표가 다음 주 발표를 앞두고 있습니다. 섣부른 추격 매수보다는 핵심 지표를 확인하고 대응하는 신중한 전략이 필요한 시점입니다.',
  },
];