import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-22',
    nutshell: '애플 충격과 지정학적 리스크에 따른 투자심리 위축',
    description:
      '오늘 미국 증시는 애플의 갑작스러운 리더십 교체 소식과 중동 긴장 고조에 따른 유가 상승이라는 두 가지 악재가 겹치며 주요 지수가 일제히 하락했습니다. 기술주를 중심으로 투자 심리가 위축된 가운데, 시장의 변동성이 확대되는 모습을 보였습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '애플 충격과 지정학적 리스크 부각으로 투자심리가 위축되며 3대 지수가 모두 하락 마감했습니다. 유가 상승은 에너지 섹터에 호재였으나 시장 전반에는 인플레이션 우려를 자극했습니다.',
    indices: [
      { name: 'S&P 500', value: 7064.01, change: -45.13, changePercent: -0.63 },
      { name: 'NASDAQ', value: 24259.96, change: -144.43, changePercent: -0.59 },
      { name: 'DOW', value: 49149.38, change: -293.18, changePercent: -0.59 },
      { name: 'Russell 2000', value: 2764.97, change: -27.99, changePercent: -1.00 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 90.22, change: 0.61, changePercent: 0.68 },
      { name: 'Gold', value: 4738.50, change: -68.10, changePercent: -1.42 },
      { name: 'Dollar Index', value: 98.35, change: 0.30, changePercent: 0.30 },
      { name: 'US 10-Yr', value: 4.29, change: 0.04, changePercent: 0.94 },
    ],
    charts: [
      { ticker: 'SP:SPX' },
      { ticker: 'NASDAQ:IXIC' },
      { ticker: 'DJ:DJI' },
      { ticker: 'TVC:RUT' },
      { ticker: 'NYMEX:CL1!' },
      { ticker: 'TVC:DXY' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 3,
    icon: 'users',
    title: '애플(AAPL) 리더십 교체 충격',
    subtitle: '팀 쿡 CEO 사임, 기술주 전반 투자심리 냉각',
    description:
      '장 마감 후 팀 쿡 CEO의 사임 소식이 전해지면서 애플 주가가 2.5% 이상 하락했습니다. 거대 기술 기업의 리더십 불확실성은 차기 성장 동력인 AI 전략에 대한 우려로 번지며 기술주 전반의 매도세를 이끌었습니다.',
    bullets: [
      '팀 쿡 CEO 사임 소식에 주가 2.5% 이상 하락',
      '차기 성장 동력인 AI 전략에 대한 불확실성 부각',
      '기술주 중심의 나스닥 지수 0.59% 하락 주도',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NASDAQ:AAPL' }, { ticker: 'NASDAQ:IXIC' }],
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '시장에 번진 애플 쇼크',
    description:
      '애플의 리더십 불확실성은 기술주 섹터를 넘어 시장 전반의 위험 회피 심리를 자극했습니다. 국채 금리와 변동성 지수가 동반 상승하며 투자자들의 불안감을 반영했습니다.',
    stats: [
      { label: '나스닥 지수', value: '-0.59%', subtext: '기술주 중심 약세', trend: 'down' },
      { label: '10년물 국채금리', value: '상승', subtext: '성장주 부담 가중', trend: 'up' },
      { label: 'VIX 지수', value: '상승', subtext: '시장 변동성 확대', trend: 'up' },
    ],
    note: '웨드부시 증권은 AI 전략의 중대한 전환점에서 발표된 갑작스러운 인사라며 타이밍에 의문을 제기했습니다.',
    theme: 'blue',
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'TVC:US10Y' }, { ticker: 'TVC:VIX' }],
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 9,
    title: '신임 CEO 존 터너스, 기대와 우려',
    description:
      '차기 CEO로 지목된 존 터너스는 하드웨어 전문가로서의 역량은 입증되었으나, 시장의 화두인 AI 시대에 애플을 이끌 적임자인지에 대한 의문이 제기되고 있습니다.',
    items: [
      {
        label: '강점 (경력)',
        value: '하드웨어 전문가',
        description: '아이폰, 아이패드 등 핵심 제품 개발을 이끈 하드웨어 엔지니어링 수석 부사장',
      },
      {
        label: '약점 (시장 우려)',
        value: 'AI 전략 불확실성',
        description: 'MS, 구글 등 경쟁사는 AI/소프트웨어에 집중. 하드웨어 전문가 리더십에 대한 의문 제기',
        highlight: true,
      },
      {
        label: '시장 반응',
        value: '주가 하락',
        description: 'AI 시대 대응 및 미래 성장 동력 확보에 대한 의문부호가 주가에 반영',
      },
    ],
    charts: [{ ticker: 'NASDAQ:MSFT' }, { ticker: 'NASDAQ:GOOGL' }],
  },
  {
    id: 5,
    type: 'headline',
    turnId: 14,
    icon: 'flame',
    title: '지정학적 리스크와 유가 급등',
    subtitle: '러시아 감산 소식에 WTI 유가 90달러 돌파',
    description:
      '우크라이나의 공격으로 러시아의 원유 생산이 차질을 빚을 것이라는 소식이 전해지며 공급 충격 우려가 현실화됐습니다. 유가 급등은 인플레이션 우려를 다시 자극하며 시장 전반에 부담으로 작용했습니다.',
    bullets: [
      '러시아 4월 원유 생산량 감소 우려 현실화',
      'WTI 유가 1.3% 이상 상승, 배럴당 90달러 선 돌파',
      '10년물 국채금리 4.29% 수준까지 상승하며 기술주 압박',
      '유가 상승에 에너지 섹터(XLE)는 1.4% 이상 강세',
    ],
    theme: 'amber',
    charts: [{ ticker: 'NYMEX:CL1!' }, { ticker: 'AMEX:XLE' }],
  },
  {
    id: 6,
    type: 'stats',
    turnId: 17,
    title: '유가 상승의 명과 암',
    description:
      '유가 상승은 에너지 기업에는 호재였지만, 유류비를 직접적인 비용으로 부담해야 하는 항공업계 등에는 직격탄이 되었습니다.',
    stats: [
      { label: '에너지 섹터 (XLE)', value: '+1.4%', subtext: '유가 상승의 직접적 수혜', trend: 'up' },
      { label: '항공주 ETF (JETS)', value: '-2.9%', subtext: '유류비 증가에 따른 비용 압박', trend: 'down' },
      {
        label: '장거리 항공편 비용',
        value: '1인당 $100↑',
        subtext: '중동 분쟁으로 인한 유류비 증가 분석',
        trend: 'down',
      },
    ],
    note: '장 마감 후 발표될 미국석유협회(API) 주간 원유 재고 지표가 단기 방향성을 결정할 전망입니다.',
    theme: 'amber',
    charts: [{ ticker: 'AMEX:XLE' }, { ticker: 'AMEX:JETS' }],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 19,
    title: '끈적한 인플레이션과 연준의 딜레마',
    subtitle: '유가발 물가 압력, 통화정책 경로 복잡성 가중',
    description:
      '유가 상승은 연준의 금리 인하 시점을 늦출 수 있다는 우려로 이어졌습니다. 이러한 불확실성은 위험 회피 심리를 자극해 대표적인 안전자산인 달러화의 강세를 이끌었습니다.',
    bullets: [
      '유가 상승이 연준의 금리 인하 결정에 부담으로 작용',
      '위험 회피 심리 확산으로 안전자산 선호 현상 발생',
      '달러 인덱스(DXY) 강세, 98.3선 위로 상승',
      '금(Gold) 가격은 달러 강세와 국채 금리 상승 영향으로 1.5% 이상 하락',
    ],
    theme: 'red',
    charts: [{ ticker: 'TVC:DXY' }, { ticker: 'COMEX:GC1!' }],
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 20,
    ticker: 'UNH',
    companyName: 'UnitedHealth Group',
    currentPrice: 346.01,
    dayChange: 22.53,
    dayChangePercent: 6.96,
    description:
      '1분기 호실적과 연간 전망 상향 조정에 장 초반 급등했으나, 차익 실현 매물과 규제 리스크 우려가 부각되며 상승분을 대부분 반납하고 마감했습니다. 하루 동안 높은 변동성을 보였습니다.',
    charts: [{ ticker: 'NYSE:UNH' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'UNH',
    title: '성장 동력: 옵텀(Optum) 부문의 약진',
    description:
      '시장은 유나이티드헬스의 헬스케어 서비스 부문인 옵텀의 성장성에 주목하고 있습니다. 옵텀은 회사를 단순 보험사에서 종합 헬스케어 플랫폼 기업으로 변모시키는 핵심 동력입니다.',
    points: [
      '헬스케어 서비스 부문 ‘옵텀’이 핵심 성장 동력으로 부상',
      '2025년 기준 옵텀 영업이익(95억 달러)이 보험 부문을 추월',
      '데이터 분석, 약국 혜택 관리(PBM), 직접 의료 서비스를 제공하는 종합 플랫폼으로 진화',
      '시장은 옵텀의 데이터 기반 사업 모델의 가치를 높게 평가',
    ],
    outlook: '옵텀의 성장이 유나이티드헬스의 기업 가치를 재평가하는 핵심 요인으로 작용하고 있습니다.',
    outlookColor: 'emerald',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'UNH',
    title: '핵심 리스크: 반독점 규제',
    description:
      '회사의 강력한 경쟁 우위인 수직 통합 모델이 역설적으로 미국 법무부의 반독점 조사의 표적이 되면서 장기적인 리스크로 부상하고 있습니다.',
    points: [
      '강력한 경쟁 우위인 ‘수직 통합 모델’이 반독점 조사의 표적이 됨',
      '미국 법무부의 조사가 현실화될 경우 기업 가치 훼손 우려',
      '특히 핵심 사업부인 옵텀 알엑스(Optum Rx)의 이익 구조에 대한 우려 존재',
      '회사의 10-K 보고서에서도 반독점법 집행 변화를 주요 사업 위험으로 명시',
    ],
    outlook: '1분기 호실적이라는 단기 호재가 장기적인 규제 리스크를 간과하게 만들 수 있다는 우려가 제기됩니다.',
    outlookColor: 'rose',
  },
  {
    id: 11,
    type: 'headline',
    turnId: 27,
    title: '유나이티드헬스(UNH)의 줄다리기',
    subtitle: '단기 호재 vs 장기 리스크',
    description:
      '오늘 주가 움직임은 1분기 호실적이라는 명확한 호재와 반독점 규제라는 구조적 리스크 사이에서 투자자들이 균형점을 찾아가는 과정을 보여주었습니다.',
    bullets: [
      '긍정론: 1분기 호실적과 가이던스 상향 조정',
      '부정론: 법무부의 반독점 규제라는 ‘꼬리 위험(Tail Risk)’',
      '장중 움직임: 장 초반 급등(낙관론) 후 하락 마감(리스크 인지)',
      '향후 전망: 성장 비전과 규제 위협 사이에서 방향성 탐색 예상',
    ],
    theme: 'purple',
    charts: [{ ticker: 'NYSE:UNH' }],
  },
  {
    id: 12,
    type: 'events',
    turnId: 31,
    title: '이번 주 및 다음 주 주요 경제 지표',
    description:
      '시장의 시선은 이제 기업 실적과 거시 경제 지표로 이동하고 있습니다. 특히 연준의 금리 경로에 대한 단서를 제공할 물가와 성장률 지표에 관심이 집중될 전망입니다.',
    events: [
      {
        date: '4/23',
        label: 'S&P 글로벌 PMI 속보치',
        description: '제조업 및 서비스업 경기의 선행 지표. 경제 견조함 확인 시 금리 인하 지연 요인.',
      },
      {
        date: '4/30',
        label: '1분기 GDP 성장률 예비치',
        description: '시장 예측 1.5%. 이전 분기(0.5%)보다 높을 것으로 예상.',
      },
      {
        date: '4/30',
        label: '3월 근원 PCE 가격지수',
        description: '연준이 가장 중시하는 물가 지표. 월간 상승률 둔화 여부가 관건.',
      },
    ],
  },
  {
    id: 13,
    type: 'stats',
    turnId: 33,
    title: '주요 경제 지표 전망치',
    description: '다음 주 발표될 GDP와 PCE 지표는 시장의 방향성을 결정할 중요한 분수령이 될 것입니다. 시장은 견조한 성장과 물가 둔화를 동시에 기대하고 있습니다.',
    stats: [
        { label: '1분기 GDP 성장률 (QoQ)', value: '1.5%', subtext: '이전(0.5%) 대비 개선 예상', trend: 'up' },
        { label: '3월 근원 PCE (MoM)', value: '0.3%', subtext: '이전(0.4%) 대비 둔화 기대', trend: 'down' },
    ],
    note: '예상과 다른 지표가 나올 경우 시장 변동성이 확대될 수 있습니다.',
    theme: 'green',
  },
  {
    id: 14,
    type: 'closing',
    turnId: 35,
    headline: '변동성 장세, 데이터 확인이 먼저',
    tagline: '섣부른 추격 매수보다 차분한 대응이 필요한 시점',
    description:
      '오늘의 반등에도 불구하고 시장 방향성은 아직 불확실합니다. 빅테크 실적 발표와 핵심 경제 지표 결과에 따라 변동성이 커질 수 있으므로, 데이터를 확인하며 신중한 투자 전략을 세우는 것이 중요합니다.',
  },
];