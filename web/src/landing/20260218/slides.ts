import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-18',
    nutshell: '연준의 신중론 속, 기업 실적에 따른 차별화 장세',
    description:
      '연준의 금리 인하 신중론이 재확인되었지만 시장은 사상 최고치를 경신했습니다. 투자자들의 관심이 거시 경제에서 개별 기업의 실적으로 이동하며, AI 테마 내에서도 실적에 따라 주가가 극명하게 엇갈리는 차별화 장세가 나타났습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '연준의 FOMC 의사록 공개 이후 불확실성이 해소되었다는 인식이 확산되며 주요 지수는 상승 마감했습니다. 투자자들의 관심은 거시 경제 지표에서 개별 기업의 실적으로 옮겨가는 모습이었습니다.',
    indices: [
      { name: 'S&P 500', value: 6881.31, change: 38.09, changePercent: 0.56 },
      { name: 'NASDAQ', value: 22753.63, change: 175.25, changePercent: 0.78 },
      { name: 'DOW', value: 49662.66, change: 129.47, changePercent: 0.26 },
      { name: 'Russell 2000', value: 2658.61, change: 12.02, changePercent: 0.45 },
    ],
    commodities: [
      { name: '미 10년물 국채금리', value: 4.08, change: 0.03, changePercent: 0.67 },
      { name: '달러 인덱스 (DXY)', value: 97.70, change: 0.54, changePercent: 0.56 },
      { name: 'WTI 원유', value: 65.19, change: 2.86, changePercent: 4.59 },
      { name: '금 선물', value: 4986.50, change: 103.60, changePercent: 2.12 },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ' },
      { ticker: 'DJ:DJI', title: 'DOW' },
      { ticker: 'TVC:RUT', title: 'Russell 2000' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 3,
    icon: 'trending-up',
    title: '실적이 시장을 지배하다',
    subtitle: 'AI 테마 내 희비 교차',
    description:
      '연준 의사록의 영향력이 제한적인 가운데, 시장의 관심은 온전히 기업들의 성적표로 쏠렸습니다. 특히 AI 분야에서 실적에 따라 주가가 극명하게 엇갈렸습니다.',
    bullets: [
      '연준 의사록, 시장 예상과 부합해 영향력 제한적',
      '투자자 관심, 거시 경제에서 개별 기업 실적으로 이동',
      '아날로그 디바이스: 강력한 AI 칩 수요로 실적 호조 및 주가 상승',
      '팔로알토 네트웍스: 실망스러운 가이던스로 주가 6% 이상 하락',
    ],
    theme: 'purple',
  },
  {
    id: 3,
    type: 'headline',
    turnId: 7,
    icon: 'bank',
    title: '연준, 금리 인하 \'신중론\' 재확인',
    subtitle: '1월 FOMC 의사록 공개',
    description:
      '연준 위원 대다수는 인플레이션 둔화에 대한 더 큰 확신을 얻기 전까지 금리 인하를 서두를 필요가 없다는 데 동의했습니다. 시장은 이를 불확실성 해소로 받아들이며 상승했습니다.',
    bullets: [
      '인플레이션 2% 목표 확신 전까지 금리 인하 보류',
      '시장은 불확실성 해소로 받아들이며 상승 마감',
      '10년물 국채금리 소폭 상승 (4.08%), 달러 인덱스 강세',
      '예상된 수준의 매파적 기조로 시장 충격은 제한적',
    ],
    theme: 'blue',
    charts: [{ ticker: 'TVC:US10Y' }, { ticker: 'TVC:DXY' }],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 9,
    title: '연준 위원들, 통화정책 시각차 뚜렷',
    description:
      '의사록에서 연준 위원들 간의 다양한 시각이 확인되면서, 향후 정책이 특정 방향으로 급격하게 쏠리기보다 데이터에 기반할 것이라는 예측이 강화되었습니다.',
    stats: [
      { label: '다수 의견', value: '점진적 인하', subtext: '인플레이션 둔화 시', trend: 'neutral' },
      { label: '일부 의견', value: '금리 동결', subtext: '당분간 현 수준 유지', trend: 'neutral' },
      { label: '소수 강경론', value: '추가 인상 가능성', subtext: '인플레이션 재가속 대비', trend: 'neutral' },
    ],
    note: '다양한 시각 공존은 급격한 정책 변화 가능성을 낮춰 시장에 안도감을 제공했습니다.',
    theme: 'blue',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 11,
    icon: 'search',
    title: '거시경제에서 개별 기업으로',
    subtitle: '시장의 관심, \'옥석 가리기\'로 이동',
    description:
      '거시 경제의 불확실성이 어느 정도 걷히자, 투자자들은 개별 기업의 펀더멘털에 더욱 집중하기 시작했습니다. 실제 실적으로 성장성을 증명하는 기업을 선별하는 장세가 본격화되었습니다.',
    bullets: [
      '연준 금리 인하 시점보다 기업의 분기 실적이 주가에 더 큰 영향',
      'S&P 500 종목 20% 이상이 연초 이후 ±20% 변동, 극심한 차별화',
      '단순 테마가 아닌 실제 실적으로 성장성을 증명하는 기업 선별',
      '\'옥석 가리기\' 장세 본격화',
    ],
    theme: 'purple',
  },
  {
    id: 6,
    type: 'comparison',
    turnId: 13,
    title: 'AI 테마의 명암: 실적이 가른 희비',
    description:
      '동일한 AI 테마에 속해 있지만, 아날로그 디바이스와 팔로알토 네트웍스는 실적 발표 이후 시장의 평가가 극명하게 엇갈리며 주가 향방이 달랐습니다.',
    items: [
      {
        label: 'Analog Devices (ADI)',
        value: '주가 ▲ 8%',
        description: 'AI 데이터센터 수요에 힘입어 시장 예상을 뛰어넘는 2분기 실적 전망 제시',
        highlight: true,
      },
      {
        label: 'Palo Alto Networks (PANW)',
        value: '주가 ▼ 6%',
        description: '인수 기업 통합 비용 증가를 이유로 연간 이익 전망치를 하향 조정',
        highlight: false,
      },
      {
        label: '시장 메시지',
        value: '실적 증명',
        description: 'AI 기대감을 넘어 실제 수익으로 연결되는 구체적인 성과 요구',
      },
    ],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 15,
    icon: 'cpu',
    title: 'AI 옥석 가리기 본격화',
    subtitle: '실적 증명이 관건',
    description:
      'AI라는 이름표만으로 주가가 오르던 시대는 끝나고, 이제는 실제 AI를 통해 누가, 어떻게, 얼마나 많은 돈을 버는지를 증명해야 하는 냉정한 현실이 도래했습니다.',
    bullets: [
      '주요 지수, 거시 환경 부담에도 사상 최고치 경신',
      '시장의 시선은 개별 기업 펀더멘털로 집중',
      '반도체 섹터(+1.2%) 강세 속 팔로알토 네트웍스(-6.8%) 급락',
      '\'누가, 어떻게, 얼마나 버는가\'를 증명해야 하는 시대',
    ],
    theme: 'gold',
    charts: [{ ticker: 'SMH' }, { ticker: 'PANW' }],
  },
  {
    id: 8,
    type: 'stats',
    turnId: 17,
    title: '팔로알토 네트웍스 급락 배경',
    description:
      '2분기 실적 자체는 예상치를 상회했지만, 장기 성장을 위한 전략적 비용 증가로 연간 이익 가이던스를 하향 조정한 것이 투자자들의 우려를 샀습니다.',
    stats: [
      { label: '2분기 실적', value: '예상 상회', subtext: '단기 실적은 양호', trend: 'up' },
      { label: '연간 가이던스', value: '하향 조정', subtext: '수익성 악화 우려', trend: 'down' },
      { label: '하향 원인', value: '전략적 비용 증가', subtext: 'M&A 통합, 무료 제품 제공 등' },
    ],
    note: '경쟁사 주가에 미친 영향은 제한적, 업계 전반이 아닌 개별 기업 이슈로 판단됩니다.',
    charts: [{ ticker: 'PANW' }, { ticker: 'CRWD' }],
  },
  {
    id: 9,
    type: 'stats',
    turnId: 19,
    title: '아날로그 디바이스 강세 요인',
    description:
      '아날로그 디바이스는 AI 열풍이 실제 매출과 이익으로 연결되고 있다는 증거를 구체적인 숫자로 보여주며 시장의 긍정적인 반응을 이끌어냈습니다.',
    stats: [
      { label: '1분기 실적', value: '예상 상회', subtext: '어닝 서프라이즈 기록', trend: 'up' },
      { label: '2분기 가이던스', value: '기대 상회', subtext: '월가 전망치를 크게 웃돔', trend: 'up' },
      { label: '성장 동력', value: 'AI 인프라 수요', subtext: '데이터센터 및 산업용 칩' },
    ],
    note: 'AI 열풍의 직접적인 수혜자임을 구체적인 숫자로 증명했습니다.',
    charts: [{ ticker: 'ADI' }],
  },
  {
    id: 10,
    type: 'headline',
    turnId: 21,
    icon: 'check-circle',
    title: '수익성 증명의 시대 도래',
    subtitle: 'AI 테마, 성숙기로 접어들다',
    description:
      'AI 혁명 초기의 \'묻지마 투자\'가 끝나고, 이제 시장은 AI를 통해 실제 수익을 창출하는지에 대한 구체적인 결과물을 요구하는 성숙기로 접어들고 있습니다.',
    bullets: [
      '초기 기대감 투자에서 성과 기반 투자로 전환',
      '투자자, 구체적인 비용 절감 및 수익 창출 증거 요구',
      '견조한 경제(산업생산 +0.7%)가 실적 증명 기회 제공',
      '성공적인 비즈니스 모델 접목 기업만이 시장의 선택을 받을 것',
    ],
    theme: 'gold',
  },
  {
    id: 11,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'FIG',
    companyName: 'Figma',
    currentPrice: 24.19,
    dayChange: 1.09,
    dayChangePercent: 4.72,
    description:
      '피그마는 별다른 소식 없이 4.69% 급등했습니다. 시장은 AI를 통해 협업 운영체제로 진화할 것이라는 성장 스토리에 베팅하고 있지만, 재무제표에는 심각한 경고 신호가 존재합니다.',
    charts: [{ ticker: 'FIG' }],
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'FIG',
    title: '화려한 성장 스토리 이면의 경고: 과도한 주식 보상',
    description:
      '가장 핵심적인 문제는 매출을 초과하는 막대한 규모의 주식 기반 보상(SBC)입니다. 이는 GAAP 기준 순손실을 키우고 기존 주주들의 가치를 심각하게 희석시키고 있습니다.',
    points: [
      '매출(7.5억 달러)의 152%를 주식 보상(11.4억 달러)으로 지급 (2025년 1~3분기)',
      'GAAP 기준 순손실 10억 달러 초과',
      '1년 만에 유통 주식 수 46.5% 폭증',
      '기업 성장의 과실이 기존 주주에게 돌아가지 않는 구조적 문제',
    ],
    outlook: '주주가치 희석은 기업의 펀더멘털을 위협하는 핵심 리스크입니다.',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'FIG',
    title: 'AI의 양날의 검: 성장 동력 vs 자기잠식 리스크',
    description:
      '시장은 AI를 통한 새로운 수익 모델을 기대하지만, 회사 스스로 AI가 기존 핵심 수익원을 감소시킬 수 있다는 \'자기잠식\' 리스크를 인정하고 있습니다.',
    points: [
      '기대: AI 기능 기반의 새로운 \'사용량 과금\' 모델로 시장 확장',
      '현실: 막대한 주식 보상은 AI 인재 확보를 위한 \'전략적 투자\'로 포장',
      '리스크: AI가 디자이너 효율성을 높여 핵심 수익원인 \'유료 좌석 수\'를 감소시킬 가능성',
      '결론: 새로운 수익 모델이 자리 잡기 전, 기존 사업 기반이 붕괴될 위험 내포',
    ],
    outlook: '미래의 불확실한 희망과 현재의 명확한 리스크가 충돌하는 상황입니다.',
    outlookColor: 'amber',
  },
  {
    id: 14,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'FIG',
    title: '피그마 투자 판단: 기대와 현실',
    description:
      '피그마의 미래 성장 잠재력은 존재하지만, 그 대가로 현재 주주들이 감당해야 할 비용과 리스크가 과도하게 큰 상황으로 판단됩니다.',
    points: [
      '미래 성장 잠재력 대비 현재 주주가 감당할 리스크 과도',
      '주가 급등은 실질 가치 개선보다 AI 서사에 대한 투기적 기대감 반영',
      '매출을 초과하는 주식 보상은 구조적 결함',
      '검증되지 않은 미래보다 명확한 현재의 재무 리스크에 기반한 신중한 접근 필요',
    ],
    outlook: '주주가치 희석 문제가 해결되기 전까지는 보수적인 관점 유지가 바람직해 보입니다.',
    outlookColor: 'amber',
  },
  {
    id: 15,
    type: 'events',
    turnId: 33,
    title: '이번 주 주목해야 할 주요 경제 지표',
    description:
      '연준이 데이터 기반 결정을 강조하는 만큼, 향후 발표될 고용 및 물가 지표가 시장의 단기적인 방향성을 결정할 중요한 변수가 될 것입니다.',
    events: [
      { date: '내일 (2/19)', label: '주간 신규 실업수당 청구건수', description: '고용 시장 건전성 확인 (예상: 22.5만 건)' },
      { date: '내일 (2/19)', label: '필라델피아 연은 제조업 지수', description: '제조업 경기 현황 파악' },
      { date: '금요일 (2/20)', label: '근원 개인소비지출(PCE) 가격지수', description: '연준이 가장 중시하는 물가 지표 (예상: 전월비 +0.3%)' },
    ],
  },
  {
    id: 16,
    type: 'closing',
    turnId: 37,
    headline: '데이터에 민감한 변동성 장세 대비',
    tagline: '종합적인 추세 파악이 중요',
    description:
      '시장은 당분간 경제지표 하나하나에 민감하게 반응하는 변동성 장세를 이어갈 가능성이 높습니다. 개별 지표에 일희일비하기보다 여러 지표가 보여주는 종합적인 추세를 파악하고 차분하게 대응하는 지혜가 필요한 시점입니다.',
  },
];