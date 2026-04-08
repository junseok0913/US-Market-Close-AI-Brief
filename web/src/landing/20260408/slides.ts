import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-09',
    nutshell: '미-이란 휴전 합의에 따른 유가 급락과 증시 랠리',
    description:
      '미국과 이란의 휴전 합의 소식이 지정학적 리스크를 완화시키며 유가 급락을 촉발했습니다. 이는 인플레이션 우려를 잠재우고 시장 전반에 강력한 안도 랠리를 불러왔습니다. 오늘 브리핑에서는 시장을 움직인 핵심 동력과 개별 종목 인텔(INTC)에 대해 심층 분석합니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '미-이란 휴전 합의 소식에 3대 지수 모두 2.5% 이상 급등했습니다. 지정학적 리스크 완화로 유가가 14% 이상 폭락하며 투자 심리가 크게 개선되었습니다.',
    indices: [
      { name: 'S&P 500', value: 6782.81, change: 165.96, changePercent: 2.51 },
      { name: 'NASDAQ', value: 22634.99, change: 617.14, changePercent: 2.80 },
      { name: 'DOW', value: 47909.92, change: 1325.46, changePercent: 2.85 },
      { name: 'Russell 2000', value: 2620.46, change: 75.51, changePercent: 2.97 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 96.50, change: -16.45, changePercent: -14.56 },
      { name: '10-Yr Yield', value: 4.251, change: -0.092, changePercent: -2.12 },
      { name: 'Dollar Index', value: 99.05, change: -0.59, changePercent: -0.59 },
      { name: 'Gold Futures', value: 4745.00, change: 87.90, changePercent: 1.89 },
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
    turnId: 4,
    icon: 'gavel',
    title: '지정학적 리스크 완화',
    subtitle: '미-이란 휴전 합의가 촉발한 연쇄 효과',
    description:
      '미국과 이란의 2주간 휴전 합의는 시장을 짓누르던 핵심 위협 요인을 제거하는 신호로 작용했습니다. 유가, 금리, 환율 3대 거시 변수가 모두 증시에 우호적으로 변하며 투자 심리가 폭발했습니다.',
    bullets: [
      '미-이란 2주간 휴전 합의 소식',
      'WTI 유가 14% 폭락, 배럴당 $96선',
      '10년물 국채 금리 9bp 하락, 4.25% 기록',
      '달러 인덱스 1.2% 급락, 100선 하회',
    ],
    theme: 'green',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '주요 자산 시장 반응',
    description:
      '휴전 합의 소식은 원유 시장을 시작으로 채권, 외환, 주식 시장 전반에 걸쳐 즉각적인 안도 랠리를 이끌어냈습니다.',
    stats: [
      { label: 'WTI 유가 (CL=F)', value: '-14.6%', subtext: '배럴당 $96선', trend: 'down' },
      { label: '10년물 국채금리', value: '-9.2bp', subtext: '4.25% 기록', trend: 'down' },
      { label: '달러 인덱스 (DXY)', value: '-1.2%', subtext: '100선 하회', trend: 'down' },
      { label: 'S&P 500', value: '+2.5%', subtext: '전반적인 안도 랠리', trend: 'up' },
    ],
    charts: [{ ticker: 'CL=F' }, { ticker: 'TVC:US10Y' }, { ticker: 'TVC:DXY' }, { ticker: 'SP:SPX' }],
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 8,
    title: '유가 급락에 따른 업종별 명암',
    description:
      '유가 급락은 업종별로 희비를 갈랐습니다. 에너지 섹터는 직격탄을 맞았지만, 유류비 부담이 큰 운송, 여행, 소비 업종은 가장 큰 수혜를 받았습니다.',
    items: [
      {
        label: '수혜 업종',
        value: '운송/여행/소비',
        description: '유류비 부담 감소로 이익 개선 기대. 델타항공 +12%, 다우 운송지수 사상 최고치.',
        highlight: true,
      },
      {
        label: '피해 업종',
        value: '에너지',
        description: '유가 하락으로 수익성 악화 우려. 엑슨모빌 -5.5%, 쉘 -4%.',
        highlight: false,
      },
    ],
  },
  {
    id: 5,
    type: 'stats',
    turnId: 11,
    title: '유가 하락 수혜주',
    description:
      '유류비는 운송 및 여행 기업의 주요 비용 항목으로, 유가 하락은 이익률 개선에 대한 기대로 이어져 관련 주가 급등을 이끌었습니다.',
    stats: [
      { label: '델타 항공 (DAL)', value: '+12%', subtext: '1분기 실적 예상 상회', trend: 'up' },
      { label: '다우 운송 지수', value: '+4%', subtext: '사상 최고치 경신', trend: 'up' },
      { label: '여행 관련주 (ABNB)', value: '강세', subtext: '소비 여력 확대 기대감', trend: 'up' },
      { label: '소비재 (ROST)', value: '강세', subtext: '소비자 유류비 부담 완화', trend: 'up' },
    ],
    theme: 'green',
    charts: [{ ticker: 'DAL' }, { ticker: 'ABNB' }],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 13,
    icon: 'monetization_on',
    title: '연준 통화정책 기대감 변화',
    subtitle: '유가 급락, 금리 인하 경로를 열다',
    description:
      '불과 하루 전까지 유가 상승을 우려했던 연준의 입장은 휴전 합의로 무색해졌습니다. 시장은 연준의 가장 큰 골칫거리가 해소되면서 금리 인하 가능성이 다시 높아졌다고 해석했습니다.',
    bullets: [
      '과거 우려: FOMC 의사록, 유가 상승을 인플레이션 리스크로 지목',
      '현재 현실: 휴전 합의로 유가 급락, 인플레이션 우려 완화',
      '시장 해석: 연준의 금리 인하 명분과 공간 확보',
      'CME FedWatch: 연내 금리 인하 가능성에 대한 베팅 증가',
    ],
    theme: 'blue',
  },
  {
    id: 7,
    type: 'stats',
    turnId: 19,
    title: '글로벌 자산 시장 동향',
    description:
      '전쟁 프리미엄 소멸로 달러화가 급격한 약세로 전환되자, 그동안 억눌렸던 신흥국 자산과 원자재 가격이 일제히 급등했습니다.',
    stats: [
      { label: '달러 인덱스', value: '연중 상승분 반납', subtext: '안전자산 선호 심리 약화', trend: 'down' },
      { label: '이머징 ETF (EEM)', value: '작년 4월 이후 최대폭 상승', subtext: '달러 약세 수혜', trend: 'up' },
      { label: '금 (Gold)', value: '+3.1%', subtext: '달러 약세에 힘입어 상승', trend: 'up' },
      { label: '구리 (Copper)', value: '+3% 이상', subtext: '경기 민감 원자재 강세', trend: 'up' },
    ],
    charts: [{ ticker: 'TVC:DXY' }, { ticker: 'EEM' }, { ticker: 'GC=F' }, { ticker: 'HG=F' }],
  },
  {
    id: 8,
    type: 'headline',
    turnId: 21,
    icon: 'warning',
    title: '남아있는 불확실성',
    subtitle: '휴전 합의, 아직은 불안정',
    description:
      '시장은 안도 랠리를 펼쳤지만, 휴전의 지속 가능성에 대한 의구심은 여전합니다. 이란 측에서 합의 파기 가능성을 언급하는 등 불확실성이 남아있어 향후 변동성에 유의해야 합니다.',
    bullets: [
      '이란 측, 이스라엘 군사 행동 문제 삼으며 합의 파기 가능성 언급',
      '리스타드 에너지: "유가는 여전히 분쟁 이전보다 높은 수준"',
      '시장은 휴전의 지속 가능성을 완전히 신뢰하지 않는 모습',
      '향후 2주간 협상 과정에서 변동성 확대 가능성 상존',
    ],
    theme: 'amber',
    charts: [{ ticker: 'CL=F' }],
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'INTC',
    companyName: 'Intel Corporation',
    currentPrice: 58.95,
    dayChange: 6.04,
    dayChangePercent: 11.42,
    description:
      '인텔은 엔비디아와의 파트너십 등 긍정적 서사로 하루 만에 11% 폭등했습니다. 하지만 장밋빛 기대감 이면에는 심각한 재무 리스크가 존재하여 신중한 접근이 필요합니다.',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'INTC',
    title: '재무 리스크 분석: 막대한 현금 소진',
    points: [
      '2025 회계연도 잉여현금흐름(FCF) 적자: 약 $49억',
      '파운드리 사업부에서만 $103억 영업손실 발생',
      '천문학적인 설비투자(CAPEX): $146억',
      '벌어들이는 돈보다 훨씬 많은 돈을 쏟아붓는 구조',
    ],
    description:
      '연차보고서에 따르면 인텔은 막대한 설비투자와 파운드리 사업부의 손실로 인해 심각한 현금 소진을 겪고 있습니다. 이는 외부 자금 지원 없이는 생존하기 어려운 구조임을 시사합니다.',
    outlook: '외부 자금 지원에 대한 의존도가 매우 높은 상황이며, 자체적인 현금 창출 능력 회복이 시급한 과제입니다.',
    outlookColor: 'amber',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'INTC',
    title: '기대와 현실의 괴리',
    points: [
      '정부/엔비디아 투자는 "인공호흡기"에 가깝다는 분석',
      '전략적 투자자 추정 단가($20-23) 대비 현재 주가는 2.5배 이상',
      '10-K 보고서: "핵심 고객 확보 실패 시 차세대 공정 개발 중단" 가능성 명시',
      '최악의 경우 $1000억 이상의 자산 손상 처리 위험',
    ],
    description:
      '미국 정부의 칩스법 지원이나 엔비디아의 투자는 안전장치라기보다 위태로운 구조를 연장하는 조치에 가깝습니다. 회사가 직접 인정한 사업 리스크가 현재 주가에는 전혀 반영되지 않고 있습니다.',
    outlook: '성장 스토리는 매력적이나, 내재된 리스크가 주가에 충분히 반영되지 않아 변동성 관리가 중요합니다.',
    outlookColor: 'rose',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 28,
    ticker: 'INTC',
    title: '투자 결론: 투기적 기대감 vs 펀더멘털',
    points: [
      '현재 주가는 가장 낙관적인 시나리오를 선반영',
      '기술적, 재무적 허들이 높고 불확실성이 큼',
      '내재된 실패 리스크에 대한 안전마진 부족',
      '펀더멘털 개선보다는 미래 성공 가능성에 대한 투기적 심리 작용',
    ],
    description:
      '인텔의 성장 스토리는 매우 매력적이지만, 그 비전을 실현하기 위해 넘어야 할 장벽이 많습니다. 현재 주가는 성공에 대한 기대감을 과도하게 반영하고 있어, 리스크 관리가 그 어느 때보다 중요해 보입니다.',
    outlook: '단기 변동성에 유의하고, 펀더멘털 개선 여부를 지속적으로 확인할 필요가 있습니다.',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'events',
    turnId: 32,
    title: '향후 주요 경제 일정',
    description:
      '오늘의 랠리 이후, 시장의 관심은 다시 인플레이션 데이터로 향하고 있습니다. 향후 발표될 주요 경제 지표들이 연준의 금리 경로에 대한 단서를 제공할 것입니다.',
    events: [
      {
        date: '4월 10일',
        label: '3월 소비자물가지수 (CPI)',
        description: '연준의 다음 행보를 결정지을 핵심 데이터. 시장 예상치(3.3%) 상회 여부가 관건.',
      },
      {
        date: '4월 14일',
        label: '생산자물가지수 (PPI)',
        description: '소비자물가의 선행 지표로 인플레이션의 향방을 미리 엿볼 수 있습니다.',
      },
      {
        date: '4월 15일',
        label: '연준 베이지북 공개',
        description: '미국 12개 지역 연은의 경제 동향 보고서로, 경제의 세부 상황을 파악할 수 있습니다.',
      },
    ],
  },
  {
    id: 14,
    type: 'headline',
    turnId: 36,
    icon: 'checklist',
    title: '투자 전략 제언',
    subtitle: '변동성 장세, 어떻게 대응할까?',
    description:
      '중요 지표 발표를 앞두고 시장의 단기 변동성이 커질 수 있습니다. 이럴 때일수록 단기 흐름에 편승하기보다 장기적인 관점에서 포트폴리오를 점검하는 것이 중요합니다.',
    bullets: [
      '단기 변동성에 대비한 리스크 관리',
      '섣부른 추격 매수 및 투매 지양',
      '포트폴리오 점검 및 리밸런싱 기회로 활용',
      '견고한 펀더멘털을 가진 기업에 집중',
    ],
    theme: 'purple',
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '변동성에 대비하며 본질에 집중할 때',
    tagline: '거시 지표보다 중요한 것은 기업의 내재 가치',
    description:
      '주요 지표 발표를 앞두고 단기적인 시장 출렁임이 예상됩니다. 섣부른 추격 매수나 투매를 지양하고, 이번 기회를 통해 시장의 변동성을 이겨낼 수 있는 견고한 기업에 집중하는 포트폴리오 점검이 필요한 시점입니다.',
  },
];