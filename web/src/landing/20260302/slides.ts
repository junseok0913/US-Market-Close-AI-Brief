import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-03',
    nutshell: '중동 지정학적 충격과 인플레이션 우려의 충돌',
    description:
      '미국 증시는 중동 분쟁 격화로 인한 유가 급등과 인플레이션 재점화 우려가 충돌하며 혼조세로 마감했습니다. 다우는 하락했지만 나스닥과 S&P 500은 소폭 상승했습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '장 초반 이란 공습 소식에 급락했던 시장은 장중 낙폭을 만회했으나, 유가 급등이 인플레이션 우려를 자극하며 방향성을 잃고 혼조세로 마감했습니다.',
    indices: [
      { name: 'S&P 500', value: 6881.62, change: 2.74, changePercent: 0.04 },
      { name: 'NASDAQ', value: 22748.86, change: 80.65, changePercent: 0.36 },
      { name: 'DOW', value: 48904.78, change: -73.14, changePercent: -0.15 },
      { name: 'Russell 2000', value: 2655.94, change: 23.58, changePercent: 0.90 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 71.45, change: 4.43, changePercent: 6.61 },
      { name: 'Gold Futures', value: 5343.70, change: 113.20, changePercent: 2.16 },
      { name: 'Dollar Index', value: 98.54, change: 0.93, changePercent: 0.96 },
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
    icon: 'flame',
    title: '중동 분쟁 격화',
    subtitle: '이란 공습, 금융 시장 강타',
    description:
      '미국과 이스라엘의 이란 공습 소식이 전해지면서 금융 시장은 즉각적인 충격에 휩싸였습니다. 유가와 변동성 지수가 급등하고 안전자산으로 자금이 몰리는 전형적인 위험회피 현상이 나타났습니다.',
    bullets: [
      'WTI 유가 장중 8%, 브렌트유 13% 폭등',
      'VIX 지수 장중 18% 이상 치솟으며 3개월래 최고',
      '금 가격 온스당 5,400달러 돌파',
      '달러화 가치 5주 만에 최고치 기록',
    ],
    theme: 'red',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '시장 반응: 위험 회피 심리 극대화',
    description:
      '이란 공습 소식은 원자재부터 외환까지 시장 전반에 걸쳐 극심한 불안감을 조성하며 가격 변동성을 키웠습니다.',
    stats: [
      { label: 'WTI 유가 (CL=F)', value: '+6.8%', subtext: '장중 8% 가까이 폭등', trend: 'up' },
      { label: 'VIX 지수 (^VIX)', value: '+18% 이상', subtext: '3개월 만에 최고치', trend: 'up' },
      { label: '금 가격 (GC=F)', value: '$5,400 돌파', subtext: '안전자산 선호 심리', trend: 'up' },
    ],
    charts: [{ ticker: 'CL=F' }, { ticker: '^VIX' }],
    theme: 'red',
  },
  {
    id: 4,
    type: 'headline',
    turnId: 9,
    icon: 'ship',
    title: '세계 경제의 동맥: 호르무즈 해협',
    subtitle: '공급망 마비 우려 현실화',
    description:
      '이번 사태의 핵심은 세계 원유 수송량의 20%가 지나는 호르무즈 해협의 봉쇄 가능성입니다. 실제 운항 중단으로 이어지며 공급망에 대한 물리적 타격 우려가 커지고 있습니다.',
    bullets: [
      '이란, 해협 통과 선박 운항 금지 경고',
      '유조선 통행 사실상 마비 상태',
      '물류 비용 및 전쟁 위험 할증 급등',
      '유럽 천연가스 가격 40% 이상 폭등',
    ],
    theme: 'amber',
  },
  {
    id: 5,
    type: 'comparison',
    turnId: 11,
    title: '유가 급등에 엇갈린 업종별 희비',
    description:
      '유가 충격은 에너지, 방산 업종에는 호재로, 항공 업종에는 직격탄으로 작용하며 주가 흐름을 극명하게 갈랐습니다.',
    items: [
      {
        label: '에너지 (XLE)',
        value: '강세',
        description: '엑슨모빌, 셰브론 등 정유주 동반 상승. XLE ETF 장 초반 +3.5% 급등.',
        highlight: true,
      },
      {
        label: '방산',
        value: '강세',
        description: '록히드마틴, 노스롭그루먼 등 분쟁 격화에 따른 수혜 기대로 일제히 상승.',
        highlight: true,
      },
      {
        label: '항공 (JETS)',
        value: '급락',
        description: '유류비 부담 증가 우려. 아메리칸 항공 -7%, 델타 -4%, 유나이티드 -6% 등 급락.',
        highlight: false,
      },
    ],
    charts: [{ ticker: 'XLE' }, { ticker: 'JETS' }],
  },
  {
    id: 6,
    type: 'stats',
    turnId: 13,
    title: '시장의 딜레마: 지정학적 리스크 vs 인플레이션',
    description:
      '통상적인 위기 상황과 달리, 안전자산인 국채 금리가 오히려 상승하며 시장의 복잡한 심리를 드러냈습니다.',
    stats: [
      { label: '10년물 국채 금리', value: '상승', subtext: '4%선 재돌파', trend: 'up' },
      { label: '전통적 반응', value: '금리 하락', subtext: '안전자산 선호로 국채 매수', trend: 'down' },
      { label: '이번 시장 해석', value: '인플레 우려', subtext: '유가 급등이 금리 인하 기대 후퇴', trend: 'up' },
    ],
    note: '시장은 중동발 공급망 충격과 인플레이션 재점화 우려 사이에서 방향성을 상실했습니다.',
    charts: [{ ticker: 'TVC:US10Y' }],
  },
  {
    id: 7,
    type: 'ticker-intro',
    turnId: 14,
    ticker: 'BRK.A',
    companyName: 'Berkshire Hathaway',
    currentPrice: 720000.00,
    dayChange: -37000.00,
    dayChangePercent: -4.89,
    description:
      '워런 버핏 이후 시대를 맞아 그렉 아벨 신임 CEO의 첫 연례 서한이 공개되며, 버크셔의 미래 방향성에 대한 시장의 관심이 집중되고 있습니다.',
  },
  {
    id: 8,
    type: 'ticker-analysis',
    turnId: 17,
    ticker: 'BRK.A',
    title: 'Bull Case: 흔들림 없는 펀더멘털',
    points: [
      '경이적인 보험 결합 비율: 2025년 재산/상해 보험 결합 비율 87.1%로 업계 최고 수준의 리스크 관리 능력 입증.',
      '막대한 현금흐름: 연간 460억 달러에 달하는 영업 현금흐름은 자본 창출 능력이 건재함을 보여줌.',
      '장기적 안정성: 4분기 실적 악화는 단기적 소음일 뿐, 장기적인 관점에서 펀더멘털은 여전히 견고하다는 평가.',
    ],
    outlook: '버크셔의 핵심 경쟁력은 단기 변동성에도 훼손되지 않았다는 긍정론이 존재합니다.',
    outlookColor: 'emerald',
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 19,
    ticker: 'BRK.A',
    title: 'Bear Case: ‘가치 함정’ 리스크',
    points: [
      '‘좌초자산’ 리스크: BNSF(자율주행 트럭), BHE(분산형 에너지) 등 핵심 자회사가 미래 기술 변화의 희생양이 될 가능성.',
      '자본 배분 능력 의문: 3,730억 달러의 현금은 성장 동력 부재의 증거라는 비판. 2025년 자사주 매입 전무.',
      '혁신 부재 우려: 그렉 아벨의 ‘연속성’ 메시지가 ‘혁신 부재’로 해석되며 부정적 시장 심리 형성.',
    ],
    outlook: '과거의 영광만으로 미래의 구조적 위협을 상쇄하기 어려울 수 있다는 경계심이 필요한 시점입니다.',
    outlookColor: 'rose',
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'COIN',
    companyName: 'Coinbase',
    currentPrice: 185.24,
    dayChange: 9.39,
    dayChangePercent: 5.34,
    description:
      '펀더멘털보다는 미래 성장성에 대한 시장의 기대감이 주가를 견인하며, 특별한 소식 없이 7% 이상 급등했습니다.',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'COIN',
    title: 'Bull Case: 미래 디지털 경제의 OS',
    points: [
      '거래소를 넘어선 비전: 단순 암호화폐 거래소가 아닌, ‘모든 것의 거래소’로 진화하는 성장 서사 보유.',
      '자체 생태계 확장: 레이어2 블록체인 ‘베이스’를 통해 디지털 경제의 운영체제(OS)를 구축 중.',
      '수익 구조 다각화: 구독/서비스 매출 비중이 2025년 기준 41%까지 성장하며 거래 수수료 의존도 감소.',
    ],
    outlook: '미래 금융 인프라를 장악할 플랫폼 기업이라는 강력한 성장 스토리가 주가 상승의 핵심 동력입니다.',
    outlookColor: 'emerald',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'COIN',
    title: 'Bear Case: 취약한 재무와 규제 리스크',
    points: [
      '수익성 구조 악화: 2025년 매출 9.4% 증가 시 운영비용 35% 폭증. 순이익은 51% 급감.',
      '비용 통제 실패: 수익 1달러 증가 시 비용 3.8달러 증가하는 구조적 문제 노출.',
      '실존적 규제 리스크: 주요 수익원이 미등록 증권으로 분류될 경우 사업 모델의 근간이 흔들릴 수 있는 불확실성 상존.',
    ],
    outlook: '재무적 현실과 규제적 허들이라는 명확한 리스크가 성장 잠재력 실현의 큰 장애물로 작용하고 있습니다.',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'events',
    turnId: 33,
    title: '이번 주 주요 경제 지표',
    description:
      '이번 주는 고용 시장의 건전성을 확인할 수 있는 핵심 지표들이 연이어 발표되어 시장의 방향성을 결정할 전망입니다.',
    events: [
      {
        date: '3/4 (수)',
        label: 'ADP 민간고용 보고서',
        description: '공식 고용보고서의 선행 지표.',
      },
      {
        date: '3/4 (수)',
        label: 'ISM 서비스업 PMI',
        description: '미국 경제의 대부분을 차지하는 서비스업 경기 동향.',
      },
      {
        date: '3/4 (수)',
        label: '연준 베이지북',
        description: '각 지역별 경제 동향에 대한 연준의 종합 평가.',
      },
      {
        date: '3/6 (금)',
        label: '2월 고용보고서 (하이라이트)',
        description: '신규 고용, 실업률, 임금 상승률 등 핵심 데이터 발표.',
      },
    ],
  },
  {
    id: 14,
    type: 'stats',
    turnId: 35,
    title: '금주의 하이라이트: 2월 고용보고서',
    description:
      '시장은 고용 시장의 냉각 신호를 기다리고 있으며, 결과에 따라 연준의 금리 정책 기대가 크게 달라질 수 있습니다.',
    stats: [
      { label: '비농업 신규고용', value: '6만 명 예상', subtext: '지난달(13만) 대비 급감', trend: 'down' },
      { label: '실업률', value: '4.3% 예상', subtext: '이전과 동일', trend: 'neutral' },
      {
        label: '시간당 평균임금',
        value: '+0.3% 예상',
        subtext: '상승세 둔화 (이전 0.4%)',
        trend: 'down',
      },
    ],
    note: '예상대로 둔화 시 금리 인상 중단 명분 강화, 예상 상회 시 긴축 우려 재점화 가능성이 있습니다.',
    theme: 'blue',
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '데이터를 확인하며 신중하게 대응할 때',
    tagline: '연착륙 기대와 침체 우려의 팽팽한 줄다리기',
    description:
      '이번 주 발표될 고용 지표들이 연준의 정책 경로에 대한 중요한 단서를 제공할 것입니다. 지표 결과에 따른 변동성 확대에 대비하며, 성급한 판단보다 차분한 분석을 통해 대응하는 지혜가 필요합니다.',
  },
];