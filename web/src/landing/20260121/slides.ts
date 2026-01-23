import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  // Opening
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-01-21',
    nutshell: '그린란드 관세 완화에 위험자산 동반 반등',
    description:
      '전날 그린란드 관세 충격으로 급락했던 미국 증시가 관세 철회 소식과 AI·방산·스트리밍 이슈가 뒤섞인 가운데 하루 만에 크게 반등한 흐름을 정리합니다.',
  },

  // Market summary
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '주요 지수·자산 하루 만에 되돌림',
    description:
      '트럼프 대통령의 그린란드 관세 철회로 위험자산이 동반 반등했습니다. 중소형주와 경기민감주가 특히 강했고, 금과 국채·달러는 안도 속에 방향을 재조정했습니다.',
    indices: [
      { name: 'S&P 500', value: 6876, change: 79, changePercent: 1.16 },
      { name: 'DOW', value: 49050, change: 590, changePercent: 1.22 },
      { name: 'NASDAQ', value: 23300, change: 250, changePercent: 1.08 },
      { name: 'RUSSELL 2000', value: 2698, change: 53, changePercent: 2.00 },
    ],
    commodities: [
      { name: 'Gold (spot)', value: 4780, change: 55, changePercent: 1.16 },
      { name: 'US 10Y Yield (%)', value: 4.25, change: -0.05, changePercent: -1.16 },
    ],
  },

  // Greenland tariff shock & rebound
  {
    id: 2,
    type: 'headline',
    turnId: 7,
    icon: 'globe',
    title: '그린란드 관세 쇼크, 하루 만에 반전',
    subtitle: '다우 800pt 급락 → 590pt 반등',
    description:
      '그린란드 문제를 둘러싼 미국과 유럽의 관세 전면전 우려가 하루 만에 철회되며, 전날의 패닉 매도가 상당 부분 되돌려졌습니다.',
    bullets: [
      '전일: 다우 -800pt, S&P 500 약 -2%, 나스닥 -2%대 중반 급락',
      '오늘: 다우 +590pt(약 +1%), S&P 500 6797 → 6876(+1%대) 회복',
      '러셀2000 2645 → 2698, 약 +2% 급등하며 위험선호 복귀 상징',
      '트럼프, 다보스 연설과 소셜 글 통해 2월 1일부 유럽 관세 철회 공식화',
    ],
    theme: 'green',
    charts: [
      { ticker: '^DJI', title: 'Dow Jones (1/20–1/21)' },
      { ticker: '^GSPC', title: 'S&P 500 (1/20–1/21)' },
      { ticker: '^IXIC', title: 'Nasdaq (1/20–1/21)' },
      { ticker: '^RUT', title: 'Russell 2000 (1/20–1/21)' },
    ],
  },

  {
    id: 3,
    type: 'comparison',
    turnId: 7,
    title: '전일 급락 vs 오늘 반등',
    description:
      '그린란드발 무역 전면전 우려가 극대화됐다가 철회되며, 주요 지수들이 이틀 연속 롤러코스터 장세를 연출했습니다.',
    items: [
      {
        label: '다우 지수',
        value: '전일 -800pt → 오늘 +590pt',
        description: '10월 이후 최악의 하락 직후 4만9천선 회복, 공포 → 안도로 급반전',
        highlight: true,
      },
      {
        label: 'S&P 500',
        value: '6797 → 6876',
        description: '약 -2% 급락 뒤 +1%대 반등, 낙폭의 상당 부분 만회',
      },
      {
        label: '나스닥',
        value: '약 -2%대 중반 → +1% 초반',
        description: '기술주 중심 성장주가 이틀 연속 방향을 크게 바꾼 구간',
      },
      {
        label: '러셀 2000',
        value: '2645 → 2698',
        description: '관세·금리 부담에 눌렸던 중소형·경기민감주가 가장 강하게 튀어 오른 날',
      },
    ],
  },

  // Cross-asset flows
  {
    id: 4,
    type: 'headline',
    turnId: 11,
    icon: 'chart-line',
    title: '위험자산·안전자산 동시 안정',
    subtitle: '금 사상 최고 근처, 국채·달러는 재조정',
    description:
      '관세 리스크 완화로 주식은 반등했지만, 금은 사상 최고 부근에서 추가 상승하며 안전자산 수요가 완전히 꺼지지 않았음을 보여줍니다.',
    bullets: [
      '금 현물: 온스당 4780달러 돌파, 사상 최고치 영역 유지',
      'GLD: 437달러대 → 443달러대 중반, 하루 +1%대 추가 상승',
      '미 10년물 금리: 전일 4.3% → 4.25%로 소폭 하락(채권 가격 반등)',
      '달러 인덱스: 98.6 → 98.8로 소폭 반등, 위험선호·달러 약세 트레이드 일부 되감김',
    ],
    theme: 'gold',
    charts: [
      { ticker: 'GLD', title: 'GLD (1/20–1/21)' },
      { ticker: '^TNX', title: '미 10년물 금리 (1/20–1/21)' },
      { ticker: 'DX-Y.NYB', title: '달러 인덱스 (1/20–1/21)' },
    ],
  },

  // AI & Big Tech
  {
    id: 5,
    type: 'headline',
    turnId: 15,
    icon: 'cpu',
    title: 'AI 인프라 낙관론 재점화',
    subtitle: '엔비디아·인텔 중심으로 성장주 매수 복귀',
    description:
      '관세 리스크가 한숨 돌자, 다보스에서 나온 엔비디아의 초대형 AI 인프라 발언과 인텔의 데이터센터 턴어라운드 기대가 기술주 심리를 되살렸습니다.',
    bullets: [
      "엔비디아 CEO: 'AI 인프라에 트릴리언(수조 달러) 규모 투자 필요' 발언",
      '엔비디아, 전일 하락분의 상당 부분을 하루 만에 약 +3% 되돌림',
      '인텔: 데이터센터·파운드리 턴어라운드 기대에 두 자릿수 급등',
      'AI 칩 → 서버 CPU → 클라우드·플랫폼까지 밸류체인 전반에 매수세 재유입',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NVDA', title: 'NVIDIA (1/20–1/21)' }],
  },

  {
    id: 6,
    type: 'stats',
    turnId: 17,
    title: '빅테크 AI CAPEX 스케일',
    description:
      '아마존·알파벳·메타·마이크로소프트는 2025~2026년에만 수백억달러씩을 AI·데이터센터 인프라에 투입할 계획입니다.',
    stats: [
      {
        label: '아마존 (AMZN)',
        value: '$1,250억+',
        subtext: '2025년 설비투자 계획, 2026년에는 이보다 확대 예고',
        trend: 'up',
      },
      {
        label: '알파벳 (GOOG)',
        value: '$910억~$930억',
        subtext: '내년 CAPEX 가이던스 상향, 2026년 추가 증액 전망',
        trend: 'up',
      },
      {
        label: '메타 (META)',
        value: '$700억 안팎',
        subtext: '2025년 설비투자, 2026년 인프라·감가상각 중심 비용 가속',
        trend: 'up',
      },
      {
        label: '마이크로소프트 (MSFT)',
        value: '$882억+',
        subtext: '2025년 CAPEX, 1분기만 349억달러 집행하며 AI·클라우드 수요 대응',
        trend: 'up',
      },
    ],
    note:
      '이 정도 CAPEX 덕분에 AWS·애저·구글 클라우드가 20~30%대 성장률을 유지하고 있어, 현재로선 버블보다는 실물 매출이 뒷받침된 인프라 사이클로 보는 시각이 우세합니다.',
    theme: 'blue',
  },

  // Netflix & streaming
  {
    id: 7,
    type: 'headline',
    turnId: 22,
    icon: 'film',
    title: '넷플릭스, 호실적에도 주가 부담',
    subtitle: '워너브라더스 인수·성장 둔화 우려가 발목',
    description:
      '매출·이익·가입자는 모두 컨센서스를 상회했지만, 대형 인수와 성장률 피크 우려, 자사주 매입 중단 이슈가 겹치며 스트리밍 대표주가 흔들렸습니다.',
    bullets: [
      'Q4 매출 약 18% 성장, 순이익 24억달러, EPS 0.56달러로 시장 예상 상회',
      '가입자 3억2천5백만명 돌파, 광고 사업은 2025년 두 배 성장, 2026년 다시 두 배 목표',
      '2026년 매출 성장률 가이던스 12~14%로 시장 기대(16%대)에 미달',
      '워너브라더스 디스커버리 약 70~80억달러 인수 추진, 자사주 매입 전면 중단으로 비용·레버리지 우려 확대',
    ],
    theme: 'red',
    charts: [{ ticker: 'NFLX', title: 'Netflix (1/20–1/21)' }],
  },

  {
    id: 8,
    type: 'stats',
    turnId: 23,
    title: '넷플릭스: 숫자는 양호, 가이던스는 아쉬움',
    description:
      '단기 실적은 견조하지만, 가입자 증가 둔화와 2026년 가이던스, 인수 비용 부담이 멀티플에 압박을 주고 있습니다.',
    stats: [
      {
        label: 'Q4 매출 성장',
        value: '+18% YoY',
        subtext: '약 120억~121억달러, 시장 예상 소폭 상회',
        trend: 'up',
      },
      {
        label: '글로벌 유료 가입자',
        value: '3.25억명+',
        subtext: '연간 순증 2,300만명 수준(전년 4,100만명 대비 둔화)',
        trend: 'neutral',
      },
      {
        label: '2026년 매출 가이던스',
        value: '12~14% 성장',
        subtext: '컨센서스(16%대)에 미달, 성장 피크 우려 재부각',
        trend: 'down',
      },
      {
        label: '워너브라더스 딜 규모',
        value: '$70억~$80억',
        subtext: '브리지론·콘텐츠 상각·통합 비용으로 단기 마진 압박',
        trend: 'down',
      },
    ],
    note:
      '실적 발표 이후 유럽 -7%대, 뉴욕에서 추가 약세를 보이며, 스트리밍 업종 전반의 밸류에이션 눈높이를 다시 낮추는 계기가 됐습니다.',
    theme: 'red',
  },

  // GOOG analysis
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 30,
    ticker: 'GOOG',
    companyName: 'Alphabet (Class C)',
    currentPrice: 328.5,
    dayChange: 6.5,
    dayChangePercent: 2.02,
    description:
      '그린란드 관세 완화 및 애플과의 AI 협업 기대 속에 장중 저점(약 319달러 중반) 대비 강하게 우상향하며 330달러선 근처에 안착했습니다.',
    charts: [{ ticker: 'GOOG', title: 'Alphabet Intraday (1/21)' }],
  },

  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 39,
    ticker: 'GOOG',
    title: '알파벳: 퀄리티는 최상, 가격은 적정',
    action: 'HOLD',
    points: [
      '성장: 2025년 3분기 매출 +16% YoY, Google Cloud +34% 성장으로 그룹 성장의 핵심 축 역할.',
      '투자 여력: 2025년 AI 인프라 중심 CAPEX 636억달러에도 불구, 현금·유동성 약 985억달러로 재무 여력 충분.',
      '비즈니스 구조: 검색·유튜브 광고가 안정적인 캐시카우, 클라우드·AI 플랫폼·지분투자가 장기 성장 옵션으로 겹친 구조.',
      '리스크 ① 규제: EU·미국 중심 반독점·개인정보·앱스토어 구조 개편 이슈로 수십억달러대 벌금·소송이 상존.',
      '리스크 ② CAPEX: AI 인프라 투자 사이클이 길어질 경우, 자유현금흐름·자본 효율성에 구조적 디스카운트 요인이 될 수 있음.',
      "애플 AI 협업: 차세대 시리의 핵심 엔진으로 제미나이 기반 모델을 공급하는 구조로 단기 심리·멀티플에는 호재지만, 장기 계약 재협상·애플 자체 모델 전환 리스크도 내포.",
      '밸류에이션: 12개월 선행 PER 20배 초중반~중반으로, 동종 빅테크 대비 싸지도 비싸지도 않은 수준의 ‘적정가’ 구간.',
      '포지션: 이미 보유한 투자자는 포트폴리오 내 비중 5~7% 선에서 관리, 신규 진입은 규제·투자 이슈로 의미 있는 조정이 올 때 분할 매수 접근 권장.',
    ],
    description:
      'AI 경쟁력과 비즈니스 퀄리티는 분명 최상급이지만, 규제·CAPEX 부담과 이미 반영된 AI 프리미엄을 감안하면 지금은 공격 매수보다는 장기 보유 관점이 합리적이라는 결론입니다.',
    charts: [{ ticker: 'GOOG', title: 'Alphabet (1개월)' }],
  },

  // LMT analysis
  {
    id: 11,
    type: 'ticker-intro',
    turnId: 40,
    ticker: 'LMT',
    companyName: 'Lockheed Martin',
    currentPrice: 586.23,
    dayChange: 10.17,
    dayChangePercent: 1.77,
    description:
      '시가(576.06달러)가 곧 저점이었던 깔끔한 우상향 흐름으로, 뚜렷한 뉴스 없이도 방산 대장주에 대한 조용한 매수 우위가 확인된 하루였습니다.',
    charts: [{ ticker: 'LMT', title: 'Lockheed Martin Intraday (1/21)' }],
  },

  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 49,
    ticker: 'LMT',
    title: '록히드마틴: 좋은 회사, 비싼 가격',
    action: 'SELL',
    points: [
      '펀더멘털: 2024년 매출 710.4억달러, 영업이익 70.1억달러, 순이익 53.4억달러. 백로그는 1,760억달러 수준으로 중장기 매출 파이프라인 견조.',
      '고객 구조: 매출의 약 73%가 미 연방정부(그 중 65% 국방부)에서 발생, F-35 단일 프로그램이 매출의 약 26%를 차지하는 높은 집중도.',
      '손실 리스크: 2024년 항공·미사일 기밀 프로그램에서만 약 19.5억달러 reach forward 손실 인식(영업이익의 ~30% 잠식).',
      '추가 손실 가능성: 2025년에도 헬기(CMHP, TUHP 등) 프로그램에서 손실이 이어지고 있어, 향후 3년간 10~30억달러 추가 손실 시나리오를 배제하기 어려운 상황.',
      '성장 축: 21st Century Security·CJADC2·우주(Next Gen OPIR 등)·극초음속·미사일 경보/추적 등 신사업이 매출 20~30% 비중으로 성장 중, 중장기적으로 성장률·마진 개선 여지.',
      '다만, 신성장 투자와 기존 고정가 대형 프로그램 정리 비용이 동시에 발생해 단기 실적 변동성은 피하기 어려운 구조.',
      '밸류에이션: 종가 586달러 기준, 후행 PER 20배 중반, 손실 정상화 가정해도 20배 초중반으로 역사적 고점대 프리미엄 구간.',
      '리스크 대비 보상: 단일 고객·단일 플랫폼 의존도, 구조적 손실 리스크를 감안하면 현재 수준은 ‘좋은 회사를 싸게’가 아니라 ‘좋은 회사를 비싸게’ 사는 가격대에 가깝다는 판단.',
      '전략: 신규 매수는 관망, 기존 보유자는 포트폴리오 내 비중을 일부 축소해 리스크 관리하는 방향(액션: SELL, 확신도 중간 수준).',
    ],
    description:
      '국방 예산과 지정학 리스크의 수혜를 장기적으로 누릴 수 있는 퀄리티 기업이지만, 최근 공시에서 드러난 고정가 대형 프로그램 손실과 높은 밸류에이션을 고려할 때 단기 리스크·리워드 비율은 매력적이지 않다는 결론입니다.',
    charts: [{ ticker: 'LMT', title: 'Lockheed Martin (1개월)' }],
  },

  // Macro events
  {
    id: 13,
    type: 'events',
    turnId: 53,
    title: '다가오는 핵심 매크로 일정',
    description:
      '연착륙 기대와 금리 경로에 대한 시장의 베팅을 다시 시험할 일정들이 이번 주와 다음 주에 집중돼 있습니다.',
    events: [
      {
        date: '2026-01-22',
        label: '미국 GDP 성장률 확정치 (QoQ)',
        description: '예비치와 큰 차이가 없으면서도 완만한 성장세 유지 여부가 관건.',
      },
      {
        date: '2026-01-22',
        label: '코어 PCE 물가 (MoM)',
        description:
          '연준이 가장 중시하는 근원 물가 지표. 완만한 상승이면 긴축 강화 요인은 제한적.',
      },
      {
        date: '2026-01-22',
        label: '개인 소득·소비 (MoM)',
        description:
          '소득·소비가 견조하면 실적 우려는 줄지만, 금리 인하 시점이 뒤로 밀릴 수 있다는 해석도 가능.',
      },
      {
        date: '2026-01-22',
        label: '신규 실업수당 청구',
        description:
          '고용이 생각보다 빨리 약해지면 성장 둔화 우려로 오늘의 위험선호가 되돌려질 수 있음.',
      },
      {
        date: '2026-01-23',
        label: 'S&P 글로벌 제조업·서비스 PMI 예비치',
        description: '경기 확장/위축 경계선 근처에서 어느 쪽으로 기울지에 따라 섹터 온도차 확대.',
      },
      {
        date: '2026-01-23',
        label: '미시간대 소비자심리 확정치',
        description: '가계의 인플레이션 기대가 다시 꿈틀거릴 경우, 연준의 긴축 유지 압력으로 작용.',
      },
      {
        date: '2026-01-28',
        label: 'FOMC 기준금리 결정',
        description:
          '금리 수준 자체보다 향후 인하 경로(점도표·발언)와 경기 평가가 주식·채권·달러를 동시에 흔들 이벤트.',
      },
      {
        date: '2026-01-28',
        label: '파월 의장 기자회견',
        description: '연착륙·경기둔화·물가에 대한 뉘앙스가 위험자산 선호를 가를 핵심 변수.',
      },
      {
        date: '2026-02-06',
        label: '비농업고용·실업률',
        description: '노동시장 과열/냉각 정도를 가늠할 핵심 고용 지표 세트.',
      },
      {
        date: '2026-02-11',
        label: '소비자물가(CPI)·근원 CPI',
        description: '물가 재가속 여부에 따라 연준 피벗(완화) 타이밍이 조정될 수 있음.',
      },
      {
        date: '2026-02-20',
        label: '코어 PCE·GDP 성장률 예비치',
        description:
          '연준이 보는 물가와 실질 성장의 최신 조합으로, 연착륙 시나리오의 지속 가능성을 시험.',
      },
    ],
  },

  // Closing
  {
    id: 14,
    type: 'closing',
    turnId: 56,
    headline: '단기 뉴스보다 내 포트폴리오 가정 점검',
    tagline: '관세·AI·방산·스트리밍 뉴스 속에서도, 결국 중요한 건 나만의 리스크 허용도와 자산배분입니다.',
    description:
      '그린란드 관세 완화로 위험자산이 급반등한 하루였지만, AI 인프라 투자와 방산 손실, 스트리밍 구조 변화, 그리고 다가오는 물가·고용·FOMC 이벤트까지 변수는 여전히 많습니다. 각 지표와 뉴스가 내가 세워둔 투자 가정과 맞는지 차분히 점검하면서, 단기 변동성에 흔들리기보다는 구조적 성장과 밸류에이션, 리스크를 함께 보는 관점이 필요한 시점입니다.',
  },
];