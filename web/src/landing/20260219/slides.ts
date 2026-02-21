import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-19',
    nutshell: '견조한 실적에도 신중한 기업 전망에 하락',
    description:
      '주요 기업들의 4분기 실적은 양호했으나, 월마트 등이 향후 경기에 대한 보수적인 전망을 내놓으며 투자 심리가 위축되었습니다. 연준의 엇갈린 통화정책 신호 또한 시장의 불확실성을 더했습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '미국 주요 3대 지수가 일제히 하락 마감했습니다. 기업들의 신중한 미래 전망과 연준의 통화정책 불확실성이 시장의 하방 압력을 높였습니다.',
    indices: [
      { name: 'S&P 500', value: 6861.89, change: -19.42, changePercent: -0.28 },
      { name: 'NASDAQ', value: 22682.73, change: -70.90, changePercent: -0.31 },
      { name: 'DOW', value: 49395.16, change: -267.50, changePercent: -0.54 },
      { name: 'Russell 2000', value: 2665.09, change: 6.48, changePercent: 0.24 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 66.36, change: 1.17, changePercent: 1.79 },
      { name: 'Gold Futures', value: 5014.50, change: 28.00, changePercent: 0.56 },
      { name: '10-Yr Yield', value: 4.06, change: -0.01, changePercent: -0.25 },
      { name: 'Dollar Index', value: 97.84, change: 0.14, changePercent: 0.14 },
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
    turnId: 5,
    icon: 'briefcase',
    title: '실적은 \'선방\', 전망은 \'흐림\'',
    subtitle: '대형 소매업체, 소비 둔화 경고',
    description:
      '견조한 4분기 실적에도 불구하고 월마트, 홈디포 등 주요 기업들이 향후 실적에 대한 보수적인 전망을 내놓으며 투자 심리가 위축되었습니다.',
    bullets: [
      '월마트(WMT): 예상 상회 실적, 그러나 보수적 가이던스 제시',
      '홈디포(HD): 주택 시장 둔화에 따른 수요 감소 우려',
      '소비 둔화 우려 확산, S&P 500 필수소비재 섹터 압박',
      '\'어닝 리세션\' 우려 부각, 개별 종목 차별화 심화',
    ],
    theme: 'amber',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '소비 둔화 우려에 따른 시장 반응',
    description:
      '월마트와 홈디포의 주가 하락이 다우 지수를 끌어내렸으며, 경기 불확실성을 반영해 안전자산 선호 심리가 나타났습니다.',
    stats: [
      { label: 'Walmart (WMT)', value: '-1.38%', subtext: '다우 지수 하락 주도', trend: 'down' },
      { label: 'Home Depot (HD)', value: '-1.29%', subtext: '동반 약세', trend: 'down' },
      { label: '10년물 국채 금리', value: '소폭 하락', subtext: '위험회피 심리', trend: 'down' },
      { label: '달러 인덱스', value: '강세', subtext: '안전자산 선호', trend: 'up' },
    ],
    charts: [{ ticker: 'WMT' }, { ticker: 'HD' }, { ticker: 'TVC:US10Y' }],
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 10,
    title: '엇갈리는 경제 신호: 경기 둔화 vs 견조한 고용',
    description:
      '기업들은 경기 둔화를 우려하고 있지만, 고용 지표는 여전히 강력해 투자자들의 방향성 판단을 어렵게 만들고 있습니다.',
    items: [
      {
        label: '경기 둔화 신호',
        value: '기업 체감',
        description: '월마트/홈디포: 소비 지출 신중. 필라델피아 연은 제조업 지수 예상 하회.',
      },
      {
        label: '경기 확장 신호',
        value: '고용 시장',
        description: '주간 신규 실업수당 청구건수 예상보다 적게 나오며 강력한 노동 시장 증명.',
        highlight: true,
      },
      {
        label: '연준에 대한 함의',
        value: '금리 인하 지연',
        description: '견조한 고용은 연준이 금리 인하를 서두를 필요가 없다는 근거로 작용.',
      },
    ],
  },
  {
    id: 5,
    type: 'headline',
    turnId: 13,
    icon: 'arrows-split',
    title: '실적 따라 희비 엇갈린 \'차별화 장세\'',
    subtitle: '거시 경제 불확실성 속 개별 종목 성과에 주목',
    description:
      '시장은 개별 기업의 성과보다는 거시 경제의 향방에 더 무게를 두는 모습입니다. 실적과 전망에 따라 주가가 극명하게 엇갈리는 장세는 당분간 계속될 전망입니다.',
    bullets: [
      '긍정적 실적/전망 기업: 주가 급등',
      '보수적 전망 제시 기업: 주가 하락 (예: 월마트)',
      '시장 관심사: 개별 성과 → 거시 경제 방향성으로 이동',
      '향후 변수: 팔로알토 네트웍스(PANW) 실적 발표',
    ],
    theme: 'purple',
    charts: [{ ticker: 'PANW' }],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 14,
    icon: 'bank',
    title: '연준의 상반된 신호, 혼란 속 시장',
    subtitle: '매파적 의사록 vs 완화적 발언',
    description:
      '어제 공개된 매파적 FOMC 의사록과 오늘 나온 닐 카시카리 총재의 완화적 발언이 하루 사이에 교차하며, 금리 경로에 대한 불확실성이 증폭되었습니다.',
    bullets: [
      '어제 (매파): 1월 FOMC 의사록, 금리 \'인상\' 가능성까지 고려',
      '오늘 (완화): 닐 카시카리 총재, "현재 금리는 중립적 수준"',
      '결과: 투자자 관망세, 변동성 지수(VIX) 3% 이상 급등',
      '향방: 시장의 시선은 PCE 물가 지표로 집중',
    ],
    theme: 'blue',
  },
  {
    id: 7,
    type: 'stats',
    turnId: 15,
    title: '연준발 불확실성에 시장은 \'출렁\'',
    description: '매파적 의사록과 완화적 발언이 충돌하며, 시장의 불안 심리가 주요 지표에 그대로 반영되었습니다.',
    stats: [
      { label: 'VIX 지수', value: '+3.1%', subtext: '불안 심리 증폭', trend: 'up' },
      { label: 'S&P 500', value: '-0.28%', subtext: '관망세 속 하락', trend: 'down' },
      { label: '금 선물', value: '소폭 상승', subtext: '안전자산 선호', trend: 'up' },
      { label: '10년물 국채금리', value: '혼조 후 하락', subtext: '방향성 탐색', trend: 'neutral' },
    ],
    charts: [{ ticker: 'TVC:VIX' }, { ticker: 'SP:SPX' }],
  },
  {
    id: 8,
    type: 'comparison',
    turnId: 17,
    title: '연준의 두 목소리: 의사록 vs 카시카리',
    description:
      '시장은 연준의 상반된 메시지 사이에서 방향을 잃었습니다. 매파적 의사록이 금리 인하 기대를 후퇴시킨 반면, 카시카리 총재의 발언은 속도 조절을 시사했습니다.',
    items: [
      {
        label: 'FOMC 의사록 (매파)',
        value: '금리 인상 가능성',
        description: '인플레이션 상방 위험 경계. 시장의 금리 인하 기대에 찬물.',
        highlight: true,
      },
      {
        label: '닐 카시카리 (완화)',
        value: '중립 금리 근접',
        description: '추가 긴축 필요성 크지 않다는 뉘앙스. 시장 무게추 되돌리기 시도.',
      },
      {
        label: '뒷받침 데이터',
        value: '매파적',
        description: '견조한 고용/제조업 지표는 오히려 의사록의 매파적 주장을 지지.',
      },
    ],
  },
  {
    id: 9,
    type: 'stats',
    turnId: 19,
    title: '매파적 연준을 뒷받침하는 경제지표',
    description:
      '닐 카시카리 총재의 완화적 발언에도 불구하고, 당일 발표된 경제 지표들은 오히려 연준이 금리 인하를 서두를 필요가 없다는 주장에 힘을 실어주었습니다.',
    stats: [
      { label: '신규 실업수당 청구', value: '20.6만 건', subtext: '예상(22.5만) 하회', trend: 'down' },
      { label: '필라델피아 연은 지수', value: '16.3', subtext: '예상(8.5) 상회', trend: 'up' },
      { label: '결론', value: '강력한 경제', subtext: '금리 인하 지연 가능성↑', trend: 'neutral' },
    ],
    theme: 'blue',
    charts: [{ ticker: 'TVC:DXY' }, { ticker: 'TVC:US02Y' }],
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'CPNG',
    companyName: 'Coupang',
    currentPrice: 18.45,
    dayChange: 0.40,
    dayChangePercent: 2.22,
    description:
      '쿠팡은 시장 전반의 불확실성을 반영하듯 변동성 큰 하루를 보냈습니다. 장 초반 18.93달러까지 상승했으나, 이내 하락 반전하며 장을 마감했습니다.',
    charts: [{ ticker: 'CPNG' }],
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'CPNG',
    title: '쿠팡 분석 (1): 견고한 본업과 현금 창출력',
    points: [
      '2025년 3분기 누적 매출 전년 대비 15% 이상 성장',
      '순이익 흑자 전환 성공',
      '9개월간 약 8억 달러의 잉여현금흐름(FCF) 창출',
      '강력한 한국 핵심 사업이 긍정적 기대의 주된 요인',
    ],
    outlook: '긍정적 펀더멘털',
    outlookColor: 'emerald',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'CPNG',
    title: '쿠팡 분석 (2): 두 가지 핵심 리스크',
    points: [
      '파페치 불확실성: 인수한 파페치 재무 보고 내부 통제에 \'중대한 취약점\' 존재',
      '예측 불가능한 규제: 공정위 과징금(약 1.2억 달러) 및 형사 기소 진행 중',
      '추가 비용 가능성: 진행 중인 다른 조사에 대해 \'합리적 손실 추정 불가\' 공시',
      '견고한 본업의 현금흐름이 리스크 방어에 소진될 우려',
    ],
    outlook: '재무 및 규제 리스크 상존',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'CPNG',
    title: '쿠팡 투자 포인트: 현금흐름 vs 리스크',
    description:
      '연간 10억 달러 수준의 잉여현금흐름 창출 능력은 긍정적이나, 이 현금이 파페치 손실과 규제 비용으로 잠식될 가능성이 핵심 변수입니다.',
    points: [
      '기회: 강력한 본업의 현금 창출 능력과 파페치를 통한 글로벌 성장 잠재력',
      '위협: 파페치의 재무적 불확실성과 예측 불가능한 한국 내 규제 리스크',
      '결론: 성장 스토리와 함께 공시된 리스크가 기업 가치를 훼손할 가능성을 면밀히 검토해야 할 시점',
    ],
    outlook: '리스크 관리 유의',
    outlookColor: 'amber',
  },
  {
    id: 14,
    type: 'events',
    turnId: 33,
    title: '시장의 시선이 집중될 다음 이벤트',
    description:
      '시장은 연준의 정책 방향에 대한 단서를 찾기 위해 다음 주 발표될 주요 경제 지표들을 기다리고 있습니다.',
    events: [
      {
        date: '2/20',
        label: '1월 근원 PCE 가격지수',
        description: '연준이 가장 중요하게 여기는 인플레이션 지표 (예상: +0.3% MoM)',
      },
      {
        date: '2/20',
        label: 'S&P 글로벌 종합 PMI 예비치',
        description: '제조업/서비스업 활동을 보여주는 경제 속보',
      },
      {
        date: '2/24',
        label: '2월 CB 소비자신뢰지수',
        description: '미국 경제의 70%를 차지하는 소비 심리 파악',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '데이터 의존적 장세 본격화',
    tagline: '단기 변동성 속 장기적 펀더멘털에 집중',
    description:
      '시장은 경제 지표 하나하나에 민감하게 반응할 것입니다. 강한 경제와 끈적한 물가는 금리 인하 기대를 늦추지만, 연착륙 가능성을 시사하기도 합니다. 인플레이션 통제 여부와 기업 실적 성장세를 꾸준히 확인하며 균형 잡힌 시각으로 대응하는 지혜가 필요합니다.',
  },
];