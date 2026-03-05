import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  // Opening
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-25',
    nutshell: 'AI발 반등 장세 속 관세 우려 지속',
    description:
      '새로운 관세가 발효되었음에도 불구하고 AI 관련 호재가 시장 반등을 이끌었습니다. 오늘 브리핑에서는 관세 정책의 영향과 AI를 둘러싼 시장 심리 변화를 집중 분석하고, 메타와의 대규모 계약으로 급등한 AMD의 명과 암을 심층 진단합니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '트럼프 대통령의 새로운 10% 관세가 발효되었음에도 불구하고, AI 분야의 긍정적인 소식이 투자 심리를 회복시키며 3대 지수 모두 반등에 성공했습니다.',
    indices: [
      { name: 'S&P 500', value: 6890.07, change: 52.32, changePercent: 0.77 },
      { name: 'NASDAQ', value: 22863.68, change: 236.41, changePercent: 1.04 },
      { name: 'DOW', value: 49174.50, change: 370.44, changePercent: 0.76 },
      { name: 'Russell 2000', value: 2652.33, change: 31.34, changePercent: 1.20 },
    ],
    commodities: [
      { name: '10년물 국채금리', value: 4.03, change: 0.00, changePercent: 0.10 },
      { name: '달러 인덱스', value: 97.88, change: 0.18, changePercent: 0.18 },
      { name: 'WTI Crude', value: 66.29, change: -0.02, changePercent: -0.03 },
      { name: 'Gold Futures', value: 5174.50, change: -30.20, changePercent: -0.58 },
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
    icon: 'zap',
    title: 'AI, 시장의 방향키를 쥐다',
    subtitle: '공포에서 안도로, 하루 만에 뒤바뀐 투심',
    description:
      '어제 AI 기술의 파괴력에 대한 공포로 하락했던 시장이, 오늘은 AI 스타트업 앤스로픽의 파트너십 발표에 안도 랠리를 펼치며 극적인 반전을 보였습니다. 이는 AI가 시장의 핵심 변수임을 다시 한번 증명했습니다.',
    bullets: [
      '어제: AI가 기존 소프트웨어 기업을 위협할 것이라는 공포 확산',
      '오늘: 앤스로픽, 파괴가 아닌 ‘협력’ 모델 제시하며 반전',
      '소프트웨어 관련주 일제히 안도 랠리, 시장 반등 견인',
      '내일 엔비디아 실적 발표에 대한 기대감까지 더해지며 기술주 강세',
    ],
    theme: 'blue',
  },
  // Theme: Tariffs
  {
    id: 3,
    type: 'headline',
    turnId: 6,
    icon: 'shield-alert',
    title: '관세 리스크 현실화',
    subtitle: '불확실성 속 안도 랠리, 배경은?',
    description:
      '새로운 10% 관세가 발효되었지만, 시장은 우려와 달리 반등했습니다. 대통령 국정연설에서 추가적인 강경 발언이 나오지 않은 점이 최악의 시나리오를 피했다는 안도감을 주었습니다.',
    bullets: [
      '관세 우려로 월요일 S&P 500 1% 이상 하락, VIX 지수 급등',
      '관세 발효 당일, 시장은 오히려 반등에 성공',
      '국정연설에서 추가 관세 인상 등 강경 발언 부재',
      'AI 관련주 강세가 관세 악재를 상쇄하며 투자 심리 회복',
    ],
    theme: 'amber',
    charts: [{ ticker: 'SP:SPX' }, { ticker: 'TVC:VIX' }],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 7,
    title: '관세 정책의 나비효과',
    description:
      '관세 정책은 주식 시장뿐만 아니라 채권, 외환시장까지 연쇄적인 영향을 미치고 있습니다. 특히 수입 의존도가 높은 섹터의 타격이 두드러졌습니다.',
    stats: [
      { label: 'VIX 지수', value: '22 돌파', subtext: '2월 들어 최고 수준', trend: 'up' },
      { label: '10년물 국채금리', value: '4.03%까지 하락', subtext: '안전자산 선호 심리', trend: 'down' },
      { label: '달러 인덱스', value: '97선 유지', subtext: '외환시장 경계감 지속', trend: 'neutral' },
    ],
    note: '산업재(XLI), 소비재(XLY) 섹터가 관세 정책에 가장 큰 타격을 받았습니다.',
    theme: 'amber',
    charts: [{ ticker: 'XLI' }, { ticker: 'XLY' }],
  },
  {
    id: 5,
    type: 'comparison',
    turnId: 11,
    title: '관세 정책의 장기적 영향',
    description:
      '시장은 단기적으로 안도했지만, 관세 정책은 중장기적으로 미국 경제와 기업에 상당한 부담으로 작용할 수 있는 여러 불씨를 안고 있습니다.',
    items: [
      {
        label: '단기적 안도',
        value: '최악 시나리오 회피',
        description: '국정연설에서 추가 세율 인상 미언급으로 불확실성 일부 해소',
        highlight: false,
      },
      {
        label: '중장기적 부담',
        value: '비용 증가 및 물가 상승',
        description: '기업 비용 부담이 최종 소비자가격에 전가되어 인플레이션 압력 가중',
        highlight: true,
      },
      {
        label: '법적 불확실성',
        value: '정책 지속 가능성 의문',
        description: '무역법 122조의 150일 시한, 위헌 소송 등 법적 분쟁 소지 다분',
        highlight: true,
      },
    ],
  },
  // Theme: AI
  {
    id: 6,
    type: 'comparison',
    turnId: 16,
    title: 'AI의 두 얼굴: 파괴자인가, 조력자인가?',
    description:
      'AI 스타트업 앤스로픽의 발표는 AI가 기존 산업을 파괴할 것이라는 공포(SaaS-pocalypse)와 새로운 협력의 기회가 될 것이라는 기대를 동시에 보여주었습니다.',
    items: [
      {
        label: '파괴자 (Fear)',
        value: 'SaaS-pocalypse',
        description: 'AI가 코딩, 보안 등 기존 소프트웨어 업무를 대체 (IBM, CrowdStrike 급락)',
        highlight: false,
      },
      {
        label: '조력자 (Relief)',
        value: '플러그인 협력 모델',
        description: '기존 기업 업무 환경에 AI 통합, 생산성 향상 지원 (Salesforce, Docusign 협력)',
        highlight: true,
      },
      {
        label: '시장 반응',
        value: '공포 → 안도',
        description: '하루 만에 투매에서 안도 랠리로 급반전, 변동성 지수(VIX) 6% 이상 하락',
        highlight: false,
      },
    ],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 20,
    icon: 'bar-chart',
    title: '시장의 모든 눈, 엔비디아로',
    subtitle: 'AI 산업의 바로미터, 실적 발표 임박',
    description:
      'AI를 둘러싼 시장의 높은 변동성은 엔비디아 실적 발표의 중요성을 더욱 부각시키고 있습니다. 엔비디아의 결과가 향후 AI 산업과 시장 전체의 방향을 결정할 전망입니다.',
    bullets: [
      'AI 인프라 투자 지속 여부 확인의 기회',
      '핵심 관전 포인트: 데이터센터 매출 성장세와 향후 가이던스',
      '옵션 시장, 실적 발표 후 주가 6% 이상 변동 가능성 반영',
      '엔비디아 실적은 AI 섹터 전체의 투자심리를 좌우할 중대 변수',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NVDA' }],
  },
  // Ticker: AMD
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 21,
    ticker: 'AMD',
    companyName: 'Advanced Micro Devices',
    currentPrice: 213.84,
    dayChange: 17.24,
    dayChangePercent: 8.77,
    description:
      '엔비디아의 경쟁사 AMD가 메타(Meta)와의 대규모 AI 칩 공급 계약 소식에 주가가 8% 넘게 급등하며 시장의 주목을 받았습니다.',
    charts: [{ ticker: 'AMD' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 22,
    ticker: 'AMD',
    title: '기회: 게임 체인저가 된 메타와의 계약',
    points: [
      '단순 매출 증가를 넘어 메타가 AMD의 기술력을 공인한 효과',
      '엔비디아의 유일한 대안이라는 전략적 입지 강화',
      '다른 대형 클라우드 기업들의 AMD 칩 도입 가속화 기대',
      'AI 가속기 시장에서 점유율을 확대할 결정적 계기 마련',
    ],
    outlook: '이번 계약은 AMD의 미래 성장성을 근본적으로 바꿀 수 있는 잠재력을 지니고 있습니다.',
    outlookColor: 'emerald',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 24,
    ticker: 'AMD',
    title: '리스크: 독이 든 성배인가?',
    points: [
      '소수 고객 의존도 심화: 연간 매출의 절반 이상을 메타 한 곳에 의존할 가능성',
      '공급망 종속 리스크: 핵심 제품 생산을 TSMC 한 곳에 전적으로 의존',
      '주주가치 희석: 메타에 부여한 워런트가 기존 주주가치를 최대 10% 희석시킬 수 있음',
      '열위의 협상력: 경쟁사 엔비디아와 달리 미래 주주가치를 담보로 계약 체결',
    ],
    outlook: '화려한 계약 이면에는 고객 및 공급망 집중, 주주가치 희석이라는 구조적 취약점이 존재합니다.',
    outlookColor: 'rose',
  },
  {
    id: 11,
    type: 'headline',
    turnId: 28,
    icon: 'trending-up',
    title: 'AMD 주가: 기대감인가, 과열인가?',
    subtitle: '시장은 ‘탐욕’ 구간 진입, 리스크는 미반영',
    description:
      '오늘 주가 급등은 계약의 긍정적인 측면만을 반영한 결과로 보입니다. 시장은 잠재적 리스크를 간과한 채 비이성적 과열 양상을 보이고 있다는 우려가 제기됩니다.',
    bullets: [
      '시장은 ‘1000억 달러’ 등 자극적 헤드라인에만 열광',
      '고객 집중, 공급망, 주주가치 희석 리스크는 주가에 미반영',
      '최상의 시나리오만을 가정한 기대감이 주가를 견인',
      '현재 주가는 내재 가치보다 단기 호재에 대한 과열 반응에 가깝다는 분석',
    ],
    theme: 'purple',
  },
  // Closing
  {
    id: 12,
    type: 'events',
    turnId: 30,
    title: '향후 시장 향방을 결정할 주요 경제 지표',
    description:
      '향후 시장은 개별 기업 실적보다 거시 경제 지표에 따라 움직이는 데이터 의존적 장세를 보일 것입니다. 특히 고용과 물가 관련 지표가 중요합니다.',
    events: [
      { date: '2/26', label: '주간 신규 실업수당 청구건수', description: '고용 시장의 온도를 가늠할 단기 지표' },
      { date: '2/27', label: '생산자물가지수 (PPI)', description: 'CPI의 선행지표로 인플레이션 압력 확인' },
      { date: '3/2', label: 'ISM 제조업 구매관리자지수', description: '제조업 경기 동향 파악' },
      { date: '3/6', label: '비농업 부문 고용보고서', description: '연준이 가장 중시하는 고용 시장 핵심 데이터' },
    ],
  },
  {
    id: 13,
    type: 'stats',
    turnId: 32,
    title: '물가 지표 미리보기: 2월 PPI',
    description:
      '지난달 예상을 상회하며 인플레이션 우려를 키웠던 PPI가 이번에는 둔화될 것으로 예상됩니다. 결과에 따라 연준의 긴축 장기화 우려가 완화되거나 재점화될 수 있습니다.',
    stats: [
      { label: '지난달 근원 PPI', value: '0.7%', subtext: '예상 상회', trend: 'up' },
      { label: '이번달 컨센서스', value: '0.3%', subtext: '둔화 예상', trend: 'down' },
      { label: '결과가 예상 상회 시', value: '긴축 우려↑', subtext: '시장 압박 요인', trend: 'up' },
    ],
    note: 'PPI는 기업의 생산 비용을 보여주는 인플레이션의 중요한 선행 지표입니다.',
  },
  {
    id: 14,
    type: 'stats',
    turnId: 34,
    title: '연준의 시선: 3월 고용보고서',
    description:
      '연준의 통화정책 결정에 가장 큰 영향을 미치는 고용보고서가 3월 초 발표됩니다. 고용 시장의 과열 여부가 향후 금리 경로를 결정할 핵심 변수입니다.',
    stats: [
      { label: '주요 지표', value: '비농업 고용자 수', subtext: '고용 시장 강도 측정', trend: 'neutral' },
      { label: '주요 지표', value: '실업률', subtext: '노동 시장의 여력 판단', trend: 'neutral' },
      { label: '지난달 고용자 수', value: '13만 명 증가', subtext: '둔화 흐름', trend: 'down' },
    ],
    note: '고용 시장의 둔화는 인플레이션 압력을 낮추는 긍정적 신호로 해석될 수 있습니다.',
  },
  {
    id: 15,
    type: 'closing',
    turnId: 36,
    headline: '데이터를 확인하며 나아갈 때',
    tagline: '거시 지표에 따라 움직이는 시장, 추세적 흐름에 주목해야',
    description:
      '단기 변동성에 일희일비하기보다, 발표되는 고용 및 물가 지표가 경기 연착륙이라는 큰 그림에 부합하는지 차분히 지켜보는 지혜가 필요한 시점입니다.',
  },
];