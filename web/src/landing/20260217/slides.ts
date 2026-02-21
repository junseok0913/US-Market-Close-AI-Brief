import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-17',
    nutshell: '연준의 신중론과 AI발 격변 우려 속 혼조 마감',
    description:
      '연준 인사들의 매파적 발언이 금리 인하 기대감을 억누르는 가운데, AI가 가져올 산업 변화에 대한 기대와 우려가 교차하며 시장이 방향성 탐색에 어려움을 겪었습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '주요 지수 혼조 마감',
    description:
      '장 초반 하락 출발했던 증시는 장 막판 반등하며 주요 지수들이 보합권에서 마무리되었습니다. 기술주 중심의 나스닥은 장중 변동성을 보이다 소폭 상승 마감했습니다.',
    indices: [
      { name: 'S&P 500', value: 6843.22, change: 7.05, changePercent: 0.10 },
      { name: 'NASDAQ', value: 22578.38, change: 31.71, changePercent: 0.14 },
      { name: 'DOW', value: 49533.19, change: 32.26, changePercent: 0.07 },
    ],
    commodities: [
      { name: '달러 인덱스', value: null, change: null, changePercent: 0.27 },
      { name: '금 선물', value: null, change: null, changePercent: -2.0 },
      { name: '10년물 국채금리', value: 4.05, change: null, changePercent: 0 },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ Composite' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 6,
    icon: 'bank',
    title: '연준의 신중론, 금리 인하 기대감에 ‘제동’',
    subtitle: '매파적 발언에 시장 관망세 짙어져',
    description:
      '연준 주요 인사들이 인플레이션에 대한 경계심을 늦추지 않으며, 시장이 기대했던 조기 금리 인하 가능성을 일축했습니다.',
    bullets: [
      '마이클 바 부의장: "금리 안정적 유지 신중"',
      '메리 데일리 총재: "인플레이션 억제 여전한 과제"',
      '시장 기대치 후퇴: 상반기 인하 불투명',
      '주요 경제지표 발표 앞두고 방향성 탐색',
    ],
    theme: 'amber',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '연준 발언에 엇갈린 자산 시장 반응',
    description:
      '연준의 긴축 장기화 가능성과 경기 둔화 우려가 맞물리며 주요 자산 가격이 복합적인 움직임을 보였습니다.',
    stats: [
      { label: '달러 인덱스', value: '+0.27%', subtext: '안전자산 선호 심리', trend: 'up' },
      { label: '금 선물', value: '-2.0% 이상', subtext: '달러 강세 부담', trend: 'down' },
      { label: '10년물 국채금리', value: '4.05%', subtext: '소폭 하락', trend: 'down' },
    ],
    note: '연준의 신중론이 경기 둔화 우려를 자극한 복합적인 결과로 해석됩니다.',
    charts: [
      { ticker: 'TVC:DXY', title: 'US Dollar Index' },
      { ticker: 'TVC:US10Y', title: 'US 10-Year Treasury' },
    ],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 9,
    title: '연준이 주시하는 것: ‘지속 가능한’ 2% 인플레이션',
    subtitle: '섣부른 금리 인하 경계',
    description:
      '연준은 인플레이션이 목표치인 2%로 안정적으로 복귀한다는 여러 증거를 확인하기 전까지 현재의 금리 수준을 유지하겠다는 신호를 보냈습니다.',
    bullets: [
      '핵심 목표: 인플레이션 2% 복귀 확신',
      '주시 데이터: 상품 가격 인플레이션의 지속적 후퇴 증거',
      '주요 리스크: 인플레이션 고착화 및 고용 시장 충격',
      '결론: 물가 지표 둔화 추세 확인 전까지 금리 유지',
    ],
    theme: 'amber',
  },
  {
    id: 5,
    type: 'stats',
    turnId: 11,
    title: '후퇴하는 금리 인하 기대감',
    description:
      '연준 인사들의 매파적 발언으로 시장의 금리 인하 기대 시점이 연기되고 있으며, 관심사 또한 인하 시점에서 고금리 유지 기간으로 옮겨가고 있습니다.',
    stats: [
      { label: '연초 기대', value: '3월 인하 가능성', subtext: '공격적인 금리 인하 전망', trend: 'neutral' },
      { label: '현재 시각', value: '상반기 인하 불투명', subtext: '기대치 상당 부분 후퇴', trend: 'down' },
      { label: '시장 관심사', value: '인하 시점 → 유지 기간', subtext: '고금리 장기화 가능성', trend: 'neutral' },
    ],
    note: 'FOMC 의사록과 PCE 물가 지표가 단기적인 시장 방향을 결정할 것입니다.',
    theme: 'amber',
  },
  {
    id: 6,
    type: 'headline',
    turnId: 12,
    icon: 'cpu',
    title: 'AI의 두 얼굴: 기회와 위협',
    subtitle: '기술주 내 극명한 희비 교차',
    description:
      'AI라는 거대한 파도가 특정 기업에는 기회로, 다른 기업에는 파괴적인 위협으로 작용하며 기술주 내 차별화 장세를 이끌었습니다.',
    bullets: [
      'AI 파괴 공포: 장 초반 나스닥 1% 가까이 하락',
      'AI 수혜 기대: 애플 급등하며 지수 반등 견인',
      '시장 반응: 수혜주(애플) 매수 vs 위협주(소프트웨어) 매도',
      '결론: AI 테마 내 옥석 가리기 본격화',
    ],
    theme: 'blue',
  },
  {
    id: 7,
    type: 'comparison',
    turnId: 13,
    title: 'AI발 희비 교차: 승자와 패자',
    description:
      'AI 기술의 실제 수혜자와 피해자를 구분하려는 시장의 움직임이 본격화되면서 관련 기업들의 주가가 극명하게 엇갈렸습니다.',
    items: [
      {
        label: 'AI 수혜주 (WINNER)',
        value: 'Apple (+2% 이상)',
        description: 'AI 기반 웨어러블 기기 개발 소식. 새로운 성장 동력 확보 기대감.',
        highlight: true,
      },
      {
        label: 'AI 위협주 (LOSER)',
        value: '소프트웨어 ETF (-1.4%)',
        description: '에이전트 AI 등장으로 기존 사업 모델 위협 우려. Salesforce, Adobe 등 동반 하락.',
        highlight: false,
      },
      {
        label: '시장 반응',
        value: '차별화 장세',
        description: 'AI 기술의 실제 수혜자와 피해자를 구분하기 시작. 기술주 내 변동성 확대.',
        highlight: false,
      },
    ],
    charts: [
      { ticker: 'AAPL', title: 'Apple Inc.' },
      { ticker: 'AMEX:IGV', title: 'iShares Expanded Tech-Software ETF' },
    ],
  },
  {
    id: 8,
    type: 'stats',
    turnId: 17,
    title: 'AI 파괴 공포에 휩싸인 소프트웨어 섹터',
    description:
      '새로운 AI 모델이 복잡한 업무를 자율적으로 처리하는 단계로 진화하면서 기존 소프트웨어 기업들의 입지가 흔들릴 수 있다는 우려가 투매로 이어졌습니다.',
    stats: [
      { label: '소프트웨어 ETF (IGV)', value: '-1.4%', subtext: '업종 전반 투매 현상', trend: 'down' },
      { label: 'Salesforce (CRM)', value: '-3.5%', subtext: '고객관계관리 SW 위협', trend: 'down' },
      { label: 'Adobe (ADBE)', value: '-1.7%', subtext: '콘텐츠 제작 SW 위협', trend: 'down' },
      { label: 'Datadog (DDOG)', value: '-3.0% 이상', subtext: '데이터 분석 SW 위협', trend: 'down' },
    ],
    theme: 'blue',
  },
  {
    id: 9,
    type: 'headline',
    turnId: 20,
    icon: 'trending-up',
    title: '개별 종목 장세: M&A와 실적에 주목',
    subtitle: '거시 경제 방향성 부재 속 옥석 가리기',
    description:
      '시장 전체를 움직일 동력이 부재한 상황에서, 투자자들은 인수합병이나 실적 전망과 같은 개별 기업의 펀더멘털에 더욱 집중하는 모습을 보였습니다.',
    bullets: [
      '미디어 업계 지각변동: 워너-파라마운트 M&A 협상 재개',
      '소비 심리 위축: 제너럴 밀스, 연간 매출 전망 하향',
      '시장 특징: 뚜렷한 방향성 없이 개별 종목 희비 엇갈림',
      '투자자 동향: 기업 펀더멘털에 더욱 집중',
    ],
    theme: 'green',
  },
  {
    id: 10,
    type: 'comparison',
    turnId: 21,
    title: '엇갈린 기업 실적과 주가 반응',
    description:
      '거시 경제의 불확실성 속에서 개별 기업의 성장성과 생존력이 주가 차별화의 핵심 요인으로 작용하고 있습니다.',
    items: [
      {
        label: 'Paramount (PARA)',
        value: '+3% 이상',
        description: '워너 브라더스와의 M&A 협상 재개 소식에 인수 기대감 반영.',
        highlight: true,
      },
      {
        label: 'General Mills (GIS)',
        value: '-2% 이상',
        description: '소비 심리 위축으로 연간 매출 전망 하향 조정.',
        highlight: false,
      },
      {
        label: '시장 시사점',
        value: '펀더멘털 중요성 부각',
        description: '인수합병 등 호재에는 즉각 반응, 실적 부진 기업은 외면받는 현상 지속 전망.',
        highlight: false,
      },
    ],
    charts: [
      { ticker: 'PARA', title: 'Paramount Global' },
      { ticker: 'GIS', title: 'General Mills' },
    ],
  },
  {
    id: 11,
    type: 'headline',
    turnId: 23,
    icon: 'film',
    title: '미디어 공룡들의 합종연횡',
    subtitle: '스트리밍 전쟁 속 생존 위한 몸집 불리기',
    description:
      '스트리밍 시장 경쟁 격화로 콘텐츠와 가입자 확보를 위한 대형 M&A가 업계의 화두로 떠올랐으며, 그 결과에 따라 산업 판도가 재편될 수 있습니다.',
    bullets: [
      '경쟁 구도: 워너-파라마운트 vs 스카이댄스 등 복잡한 경쟁',
      '워너의 전략: 넷플릭스와의 독점 협상 보류, 유리한 거래 모색',
      '파라마운트 주가: 잠재적 인수 경쟁이 호재로 작용',
      '업계 전망: M&A 결과에 따라 미디어 산업 판도 재편 가능성',
    ],
    theme: 'green',
  },
  {
    id: 12,
    type: 'ticker-intro',
    turnId: 28,
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    currentPrice: 266,
    dayChange: 5.22,
    dayChangePercent: 2.0,
    description:
      'AI 기반 신규 웨어러블 기기 개발 소식과 ‘AI 슈퍼 사이클’ 기대감에 힘입어 시장의 주목을 받으며 강한 상승세를 보였습니다.',
    charts: [{ ticker: 'AAPL' }],
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'AAPL',
    title: '성장 기대감: ‘AI 슈퍼 사이클’의 서막',
    description:
      '시장은 애플이 2026년을 기점으로 AI 기능을 본격 도입하며 아이폰 교체 주기를 촉발하고, 새로운 AI 구독 서비스로 기업 가치를 한 단계 끌어올릴 것으로 기대하고 있습니다.',
    points: [
      '2026년 AI 기능 본격 도입 전망',
      '기존 아이폰 사용자 대규모 교체 주기 촉발 기대',
      '25억 개 활성 기기 기반 신규 AI 구독 서비스 가능성',
      'AI 수익화 모델이 기업 가치 상승의 핵심 동력으로 부상',
    ],
    outlook: '긍정적 전망',
    outlookColor: 'emerald',
  },
  {
    id: 14,
    type: 'ticker-analysis',
    turnId: 31,
    ticker: 'AAPL',
    title: '현재의 위협: 간과된 규제 리스크',
    description:
      '시장이 AI라는 미래 잠재력에 집중하는 동안, 기업이 직접 공시한 SEC 문건에는 EU 디지털 시장법 등 앱스토어를 겨냥한 전방위적 규제 압박이라는 명백한 위협이 기록되어 있습니다.',
    points: [
      'EU 디지털 시장법(DMA) 등 전방위적 규제 압박',
      '핵심 수익원인 앱스토어 생태계 직접 겨냥',
      '최악의 경우 연간 매출 10% 규모의 막대한 과징금 부과 가능',
      'AI 잠재 이익을 상쇄할 수 있는 구체적이고 현존하는 위협',
    ],
    outlook: '잠재적 위험',
    outlookColor: 'rose',
  },
  {
    id: 15,
    type: 'comparison',
    turnId: 33,
    title: 'Apple 주가: 기대와 현실의 괴리',
    description:
      '현재 주가는 AI 성공이라는 최상의 시나리오는 100% 반영하면서, 동시에 SEC 공시를 통해 드러난 수백억 달러 규모의 규제 리스크는 전혀 반영하지 않는 극단적 낙관론에 치우쳐 있다는 분석입니다.',
    items: [
      {
        label: '시장의 시선 (기대)',
        value: 'AI 슈퍼 사이클',
        description: '증명되지 않은 미래의 잠재력에 환호하며 최상의 시나리오를 100% 가격에 반영.',
        highlight: true,
      },
      {
        label: 'SEC 공시 (현실)',
        value: '규제 리스크',
        description: '기업이 직접 인정한 수백억 달러 규모의 구체적 위협은 가격에 미반영.',
        highlight: false,
      },
      {
        label: '전문가 분석',
        value: '고평가 영역',
        description: '극단적 낙관론에 치우쳐 안전마진이 부재한 위험한 선택일 수 있다는 경고.',
        highlight: false,
      },
    ],
  },
  {
    id: 16,
    type: 'headline',
    turnId: 37,
    title: '시장의 딜레마',
    subtitle: '끈질긴 인플레이션 vs 견조한 펀더멘털',
    description:
      '최근 발표된 강한 경제지표들이 연준의 금리 인하 시점을 뒤로 미룰 수 있다는 우려와, 그럼에도 미국 경제가 견조하다는 신뢰가 충돌하며 시장이 관망세에 들어섰습니다.',
    bullets: [
      '강한 경제지표: CPI, 소매판매 데이터 예상 상회',
      '금리 인하 지연 우려: 연준의 긴축 장기화 가능성 부각',
      '투자자 심리: 섣부른 베팅보다 데이터 확인 선호',
      '시장 상황: 다음 힌트를 찾으려는 신중한 관망세',
    ],
    theme: 'purple',
  },
  {
    id: 17,
    type: 'events',
    turnId: 39,
    title: '이번 주 주목해야 할 경제 이벤트',
    description:
      '이번 주 후반에 발표될 FOMC 의사록과 PCE 물가 지표는 향후 연준의 정책 경로와 시장의 방향성을 결정할 중요한 분기점이 될 것입니다.',
    events: [
      {
        date: '2/18 (수)',
        label: 'FOMC 의사록 공개',
        description: '금리 인하 경로에 대한 연준 위원들의 논의 확인',
      },
      {
        date: '2/20 (금)',
        label: '근원 PCE 가격지수 발표',
        description: '연준이 가장 중요하게 여기는 인플레이션 지표',
      },
      {
        date: '2/20 (금)',
        label: 'S&P 글로벌 종합 PMI 예비치',
        description: '제조업 및 서비스업 경기 동향 가늠',
      },
    ],
  },
  {
    id: 18,
    type: 'closing',
    turnId: 43,
    headline: '인플레이션과의 마지막 싸움, 변동성 확대 주의',
    tagline: '데이터를 확인하며 차분하게 대응할 때',
    description:
      '이번 주 발표될 핵심 경제 지표 결과에 따라 시장 변동성이 다시 한번 확대될 수 있는 만큼, 단기적인 움직임보다 데이터의 추세를 확인하며 대응하는 지혜가 필요합니다.',
  },
];