import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-24',
    nutshell: '대법원 관세 판결에 따른 무역전쟁 우려 부각',
    description:
      '대법원의 관세 위헌 판결에도 불구하고 트럼프 행정부가 새로운 글로벌 관세를 발표하며 시장이 급락했습니다. 연준 인사의 매파적 발언까지 더해지며 투자 심리가 크게 위축된 하루였습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '트럼프 대통령의 새로운 관세 부과 발표와 연준의 매파적 발언이라는 이중 악재에 3대 지수 모두 1% 이상 하락했습니다. 지정학적 불확실성이 고조되며 안전자산 선호 심리가 뚜렷해졌습니다.',
    indices: [
      { name: 'S&P 500', value: 6837.75, change: -71.76, changePercent: -1.04 },
      { name: 'NASDAQ', value: 22627.27, change: -258.80, changePercent: -1.13 },
      { name: 'DOW', value: 48804.06, change: -821.91, changePercent: -1.66 },
      { name: 'Russell 2000', value: 2620.99, change: -42.79, changePercent: -1.61 },
    ],
    commodities: [
      { name: 'VIX', value: 21.6, change: 2.5, changePercent: 13.09 },
      { name: 'Gold', value: 5249.00, change: 189.70, changePercent: 3.75 },
      { name: 'WTI Crude', value: 66.39, change: 0.00, changePercent: 0.00 },
      { name: 'Dollar Index', value: 97.73, change: -0.07, changePercent: -0.07 },
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
    turnId: 7,
    icon: 'alert-triangle',
    title: '무역전쟁 공포 재점화',
    subtitle: '트럼프, 대법원 판결 뒤집는 새 관세 발표',
    description:
      '대법원이 기존 관세에 위헌 결정을 내렸음에도, 트럼프 대통령이 즉각 새로운 글로벌 관세를 부과하겠다고 발표하며 시장은 예측 불가능한 무역전쟁의 공포에 휩싸였습니다.',
    bullets: [
      'VIX 지수 13% 급등하며 21.6 포인트 돌파',
      '안전자산으로 자금 이동 (금 +3.8%)',
      '10년물 국채 금리 하락하며 채권 가격 강세',
      '수입 의존도 높은 소매업종 지수(XRT) 2%대 하락',
    ],
    theme: 'red',
    charts: [
      { ticker: 'TVC:VIX', title: 'VIX' },
      { ticker: 'COMEX:GC1!', title: 'Gold' },
      { ticker: 'AMEX:XRT', title: 'Retail ETF' },
    ],
  },
  {
    id: 3,
    type: 'comparison',
    turnId: 9,
    title: '관세 전쟁: 법적 근거의 변화',
    description:
      '행정부는 대법원 판결을 무력화하기 위해 기존과 다른 법적 근거를 내세워 새로운 관세를 부과하며 사법부 견제를 우회하려는 시도를 보였습니다.',
    items: [
      {
        label: '기존 관세',
        value: '위헌 판결',
        description: '법적 근거: 국제긴급경제권한법. 대법원이 대통령의 권한 남용으로 판단.',
        highlight: false,
      },
      {
        label: '신규 관세',
        value: '15% 부과',
        description: '법적 근거: 1974년 무역법 122조. 모든 수입품 대상, 150일간 의회 승인 불필요.',
        highlight: true,
      },
      {
        label: '시장 우려',
        value: '불확실성 증폭',
        description: '더 즉각적이고 광범위한 무역 장벽이 현실화될 수 있다는 공포가 시장을 지배.',
        highlight: false,
      },
    ],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 11,
    icon: 'dollar-sign',
    title: '경제 전반에 미칠 파급 효과',
    subtitle: '인플레이션 재점화 및 기업 이익률 하락 우려',
    description:
      '모든 수입품에 대한 15% 관세는 가계와 기업 모두에게 비용 부담을 가중시켜 실물 경제의 회복세를 꺾을 수 있는 강력한 악재로 평가됩니다.',
    bullets: [
      '15% 관세 → 수입 물가 상승 → 인플레이션 재점화',
      '연준의 금리 인하 기대감 더욱 후퇴',
      '기업 원자재/부품 비용 증가로 이익률 압박 직면',
      '공급망 재편과 비용 증가 문제로 내부적 혼란 가중',
    ],
    theme: 'amber',
    charts: [
      { ticker: 'AMEX:XRT', title: 'Retail ETF' },
      { ticker: 'AMEX:XLI', title: 'Industrial ETF' },
    ],
  },
  {
    id: 5,
    type: 'stats',
    turnId: 13,
    title: '주요 교역국, 즉각 반발',
    description:
      '미국의 일방적 조치에 중국, 유럽연합 등 주요 교역 파트너들이 강하게 반발하며 글로벌 무역 갈등이 전면전으로 확산될 위험이 커졌습니다.',
    stats: [
      { label: '중국 상무부', value: '철회 촉구', subtext: '일방적 관세 조치 비판', trend: 'down' },
      { label: 'EU 집행위원회', value: '합의 준수', subtext: '기존 무역 합의 이행 요구', trend: 'down' },
      {
        label: '크리스틴 라가르드 (ECB)',
        value: '깊은 우려',
        subtext: '새로운 혼란 야기 가능성 경고',
        trend: 'down',
      },
    ],
    theme: 'blue',
  },
  {
    id: 6,
    type: 'headline',
    turnId: 19,
    icon: 'bar-chart-2',
    title: '설상가상, 연준의 매파적 선회',
    subtitle: '월러 이사, 3월 금리인하 기대감 일축',
    description:
      '대표적인 비둘기파로 분류되던 크리스토퍼 월러 연준 이사가 매파적 발언을 내놓으며, 관세 충격으로 불안한 투자 심리에 찬물을 끼얹었습니다.',
    bullets: [
      '“2월 고용지표 견고 시 3월 금리 동결 가능”',
      '3월 금리 인하 가능성을 ‘동전 던지기’에 비유',
      '대표적 비둘기파의 예상 밖 태세 전환',
      '고금리 장기화 우려 증폭시키며 하방 압력 가중',
    ],
    theme: 'purple',
    charts: [{ ticker: 'TVC:US10Y', title: '미 10년물 국채금리' }],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 21,
    icon: 'help-circle',
    title: '시장의 딜레마: 스태그플레이션 공포',
    subtitle: '관세발 인플레이션 vs 경기 둔화 위험',
    description:
      '투자자들은 인플레이션과 경기 둔화라는 상충된 위험 사이에서 방향을 잃고, 일단 위험자산 비중을 줄이는 선택을 할 수밖에 없었습니다.',
    bullets: [
      '관세 → 인플레이션 압력 → 금리 인하 지연',
      '관세 → 교역 위축/불확실성 → 경기 침체 위험',
      '연준의 현재 스탠스: 경기보다 인플레이션 중시',
      '상충된 위험 속 투자자들의 위험 회피 심리 확산',
    ],
    theme: 'amber',
    charts: [
      { ticker: 'TVC:VIX', title: 'VIX' },
      { ticker: 'TVC:DXY', title: 'Dollar Index' },
    ],
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'IONQ',
    companyName: 'IonQ, Inc.',
    currentPrice: 30.78,
    dayChange: -1.12,
    dayChangePercent: -3.51,
    description:
      '양자컴퓨팅 기업 아이온큐는 시장 전반의 하락세 속에 장 초반 상승분을 반납하고 약 0.7% 하락한 30.80달러에 마감했습니다.',
    charts: [{ ticker: 'IONQ' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'IONQ',
    title: 'IONQ 분석 (1): 성장과 비전',
    points: [
      '2025년 3분기 매출, 전년 동기 대비 222% 급증하며 인상적인 외형 성장',
      '위성, 보안, 네트워킹 기업 인수를 통해 ‘풀스택 양자 생태계’ 구축 추진',
      '미래 기술에 대한 대담한 비전이 투자자들의 높은 기대감 형성',
    ],
    description:
      '아이온큐는 폭발적인 매출 성장과 양자 생태계 구축이라는 거대한 비전을 제시하며 미래 잠재력을 어필하고 있습니다.',
    outlook: 'emerald',
  },
  {
    id: 10,
    type: 'stats',
    turnId: 25,
    ticker: 'IONQ',
    title: 'IONQ 재무 현황 (2025년 3분기 누적)',
    description:
      '화려한 성장 이면에는 현금 소진과 주주가치 희석이라는 심각한 재무적 압박이 존재합니다.',
    stats: [
      {
        label: '영업 현금흐름',
        value: '-$2.08억',
        subtext: '전년 동기 대비 3배 이상 급증',
        trend: 'down',
      },
      { label: '발행 주식 수 증가', value: '+47%', subtext: '불과 9개월 만에 급증', trend: 'down' },
      { label: '3분기 매출 성장률', value: '+222%', subtext: '전년 동기 대비', trend: 'up' },
    ],
    theme: 'purple',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'IONQ',
    title: 'IONQ 분석 (2): 흔들리는 리더십',
    points: [
      '3분기 보고서에 ‘경영진과 이사회에 중대한 이직’이 있었다고 직접 명시',
      '‘제도적 지식의 손실’이 발생할 수 있다는 위험을 스스로 인정',
      '핵심 리더십 이탈로 ‘사업 전략 실행 능력 저해’ 가능성 언급',
      '기업의 존립 자체에 대한 의문을 제기하는 심각한 신호',
    ],
    description:
      '회사가 직접 인정한 핵심 경영진의 이탈은 기술과 비전의 실행 가능성에 대한 근본적인 신뢰도를 훼손하는 가장 큰 위험 요소입니다.',
    outlook: 'rose',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'IONQ',
    title: 'IONQ 투자 요약: 기회와 위험의 줄타기',
    points: [
      '미래의 불확실한 성공 가능성과 현재의 명확한 위험 사이의 아슬아슬한 균형',
      '3대 핵심 위험: 가속화되는 현금 소진, 심각한 주주가치 희석, 리더십 공백',
      '지속 가능한 사업 모델을 숫자로 증명하기 전까지 높은 불확실성 내포',
    ],
    description:
      '투자자는 파괴적 혁신의 잠재력과 함께 세 가지 명백한 위험 요인을 신중하게 평가해야 할 시점입니다.',
    outlook: 'amber',
  },
  {
    id: 13,
    type: 'events',
    turnId: 33,
    title: '다음 주 주요 경제 지표',
    description:
      '다음 주에는 소비, 고용, 물가 관련 핵심 지표들이 연이어 발표되며 시장의 방향성을 시험할 예정입니다.',
    events: [
      {
        date: '2/24 (화)',
        label: '소비자 신뢰지수',
        description: '미국 경제의 3분의 2를 차지하는 소비 심리 확인',
      },
      {
        date: '2/26 (목)',
        label: '주간 신규 실업수당 청구건수',
        description: '견조한 고용시장의 지속 여부 판단',
      },
      {
        date: '2/27 (금)',
        label: '생산자물가지수 (PPI)',
        description: 'CPI 선행지표로 연준 정책에 중요 단서 제공',
      },
    ],
  },
  {
    id: 14,
    type: 'closing',
    turnId: 37,
    headline: '펀더멘털에 집중해야 할 시점',
    tagline: '사상 최고치 경신 속, 높은 밸류에이션 정당성 확인 필요',
    description:
      '시장의 낙관론에 편승하기보다는, 발표되는 경제 지표들을 차분히 분석하며 현재의 높은 가치가 펀더멘털에 의해 뒷받침되는지 신중하게 점검해야 합니다.',
  },
];