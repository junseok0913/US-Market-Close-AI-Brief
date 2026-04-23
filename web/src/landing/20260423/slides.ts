import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-24',
    nutshell: '테슬라 실적 충격과 유가 급등에 동반 하락',
    description:
      '4월 24일 뉴욕 증시는 테슬라의 예상 하회 실적과 중동 지정학적 리스크로 인한 유가 급등이라는 이중 악재에 주요 지수 모두 하락 마감했습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '테슬라 실적 충격이 기술주 전반의 투자 심리를 위축시켰고, 미국과 이란의 갈등으로 인한 유가 급등이 인플레이션 우려를 재점화하며 시장의 하방 압력을 높였습니다.',
    indices: [
      { name: 'S&P 500', value: 7108.40, change: -29.50, changePercent: -0.41 },
      { name: 'NASDAQ', value: 24438.50, change: -219.07, changePercent: -0.89 },
      { name: 'DOW', value: 49310.32, change: -179.71, changePercent: -0.36 },
      { name: 'Russell 2000', value: 2775.10, change: -10.28, changePercent: -0.37 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 97.00, change: 4.04, changePercent: 4.35 },
      { name: '10-Yr Yield', value: 4.32, change: 0.05, changePercent: 1.17 },
      { name: 'Dollar Index', value: 98.81, change: 0.22, changePercent: 0.22 },
      { name: 'Gold Futures', value: 4708.60, change: -23.90, changePercent: -0.51 },
    ],
    charts: [
      { ticker: 'SP:SPX' },
      { ticker: 'NASDAQ:IXIC' },
      { ticker: 'TVC:RUT' },
      { ticker: 'NYMEX:CL1!' },
      { ticker: 'TVC:US10Y' },
      { ticker: 'TVC:DXY' },
    ],
  },
  {
    id: 2,
    type: 'comparison',
    turnId: 3,
    title: '엇갈린 기술주 실적: TSLA vs TXN',
    description:
      '시장은 테슬라의 실적 부진에 더 크게 반응했지만, 텍사스 인스트루먼츠는 강력한 실적 전망으로 폭등하며 반도체 섹터의 긍정적인 신호를 보여주었습니다.',
    items: [
      {
        label: 'Tesla (TSLA)',
        value: '-3.5%',
        description: '예상 하회 매출과 재고 부담으로 기술주 전반 투자 심리 냉각',
        highlight: false,
      },
      {
        label: 'Texas Instruments (TXN)',
        value: '+19.1%',
        description: '예상 뛰어넘는 강력한 실적 전망으로 주가 폭등',
        highlight: true,
      },
    ],
    charts: [{ ticker: 'NASDAQ:TSLA' }, { ticker: 'NASDAQ:TXN' }],
  },
  {
    id: 3,
    type: 'headline',
    turnId: 6,
    icon: 'zap',
    title: '테슬라 실적 쇼크',
    subtitle: '수요 둔화 우려가 전기차 섹터를 덮치다',
    description:
      '테슬라가 시장 예상치를 밑도는 1분기 실적을 발표하며 주가가 급락했습니다. 특히 생산량과 인도량의 격차가 벌어지면서 수요 둔화에 대한 우려가 커졌고, 이는 전기차 업계 전반으로 확산되었습니다.',
    bullets: [
      '1분기 매출, 월가 예상 하회 ($223.9억 vs $226억)',
      '생산량 대비 저조한 차량 인도 실적 (격차 5만대 이상)',
      '주가 3.5% 이상 하락, 기술주 투자 심리 냉각',
      '전기차 섹터 전반으로 불안감 확산',
    ],
    theme: 'red',
  },
  {
    id: 4,
    type: 'stats',
    turnId: 7,
    title: '테슬라(TSLA) 1분기 실적 주요 지표',
    description:
      '시장의 실망감을 키운 것은 여러 복합적인 요인이었습니다. 매출 부진과 함께 생산과 실제 판매의 괴리가 커지면서 재고 부담에 대한 우려를 증폭시켰습니다.',
    stats: [
      { label: '1분기 매출', value: '$223.9억', subtext: '예상치 $226억 하회', trend: 'down' },
      { label: '생산-인도 격차', value: '5만대+', subtext: '수요 둔화 및 재고 우려', trend: 'down' },
      { label: '주가 등락률', value: '-3.51%', subtext: 'S&P 500 하락폭 상회', trend: 'down' },
    ],
    theme: 'red',
    charts: [{ ticker: 'NASDAQ:TSLA' }, { ticker: 'SP:SPX' }],
  },
  {
    id: 5,
    type: 'ticker-analysis',
    turnId: 9,
    ticker: 'TSLA',
    title: '컨퍼런스 콜, 불확실성 증폭',
    points: [
      '미래 사업(로보택시, 옵티머스)에 대한 이례적으로 신중한 태도',
      '자본 지출 가이던스 대폭 상향($200억→$250억), 현금 흐름 부담',
      '재고 물량 27일치로 증가, 수요 문제 우려 심화',
      '에너지 사업 부문 실적 부진',
    ],
    outlook:
      '투자자들은 실적 자체보다 향후 성장 경로에 대한 불확실성과 재무 부담에 더 크게 반응하며 우려를 표했습니다.',
    outlookColor: 'amber',
  },
  {
    id: 6,
    type: 'stats',
    turnId: 11,
    title: '테슬라 쇼크, 전기차 섹터 덮치다',
    description: '테슬라의 수요 둔화 신호는 업계 전체에 대한 경고등으로 해석되며, 경쟁사 주가 역시 동반 하락했습니다.',
    stats: [
      { label: 'Tesla (TSLA)', value: '-3.51%', trend: 'down' },
      { label: 'Rivian (RIVN)', value: '-4.40%', trend: 'down' },
      { label: 'Lucid (LCID)', value: '-9.21%', trend: 'down' },
      { label: 'Ford (F)', value: '-1.20%', trend: 'down' },
      { label: 'GM (GM)', value: '-0.60%', trend: 'down' },
    ],
    theme: 'red',
    charts: [
      { ticker: 'NASDAQ:TSLA' },
      { ticker: 'NASDAQ:RIVN' },
      { ticker: 'NASDAQ:LCID' },
    ],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 14,
    icon: 'flame',
    title: '지정학적 리스크 부상',
    subtitle: '유가 급등, 인플레이션 우려 재점화',
    description:
      '미국과 이란의 평화 협상이 교착 상태에 빠졌다는 소식이 전해지면서 국제 유가가 급등했습니다. 이는 인플레이션 우려를 다시 자극하며 시장 전반에 악재로 작용했습니다.',
    bullets: [
      '미국-이란 평화 협상 교착 상태',
      'WTI 유가 4.2% 급등, 배럴당 $96 후반 마감',
      '핵심 수송로 호르무즈 해협 통행 차질 우려 증폭',
      '인플레이션 우려로 10년물 국채 금리 상승',
    ],
    theme: 'gold',
  },
  {
    id: 8,
    type: 'stats',
    turnId: 15,
    title: '유가 급등이 시장에 미친 영향',
    description:
      '미-이란 갈등 고조로 인한 유가 급등은 에너지 섹터를 제외한 시장 전반에 부담으로 작용하며 위험자산 회피 심리를 자극했습니다.',
    stats: [
      { label: 'WTI 유가 (CL=F)', value: '+4.35%', subtext: '$96.88 마감', trend: 'up' },
      { label: '10년물 국채금리', value: '4.32%', subtext: '인플레이션 우려 반영', trend: 'up' },
      { label: 'S&P 500', value: '-0.41%', subtext: '시장 전반 악재로 작용', trend: 'down' },
    ],
    theme: 'gold',
    charts: [{ ticker: 'NYMEX:CL1!' }, { ticker: 'TVC:US10Y' }, { ticker: 'SP:SPX' }],
  },
  {
    id: 9,
    type: 'stats',
    turnId: 19,
    title: '원유 재고 지표와 수급 불균형',
    description:
      '미국 원유 재고는 소폭 증가했지만, 휘발유와 정제유 재고가 예상보다 크게 감소하며 견조한 수요를 확인시켜주었습니다. 공급 불안과 맞물려 유가 상승 압력을 가중시켰습니다.',
    stats: [
      { label: '원유 재고', value: '+190만 배럴', subtext: '예상과 달리 소폭 증가', trend: 'neutral' },
      { label: '휘발유 재고', value: '-460만 배럴', subtext: '예상보다 큰 폭 감소', trend: 'down' },
      { label: '정제유 재고', value: '-340만 배럴', subtext: '견조한 수요 시사', trend: 'down' },
    ],
    note: '미국의 석유 제품 수출이 사상 최고치를 기록하는 등 수요가 공급 불안을 압도하는 모습입니다.',
    theme: 'gold',
    charts: [{ ticker: 'NYMEX:CL1!' }, { ticker: 'ICE:BRN1!' }],
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'NOW',
    companyName: 'ServiceNow',
    currentPrice: 84.78,
    dayChange: -18.29,
    dayChangePercent: -17.75,
    description:
      '서비스나우는 중동 지역 계약 지연 소식과 재무 건전성에 대한 우려가 복합적으로 작용하며 하루 만에 17%가 넘는 기록적인 주가 폭락을 경험했습니다.',
    charts: [{ ticker: 'NYSE:NOW' }],
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'NOW',
    title: '주가 폭락의 이면: 엇갈린 신호',
    description:
      '표면적인 악재에도 불구하고 회사는 연간 가이던스를 상향 조정하며 시장에 혼란을 주었습니다. 투자자들은 공시 자료에서 더 깊은 위험 신호를 포착했습니다.',
    points: [
      '악재(뉴스): 중동 지역 대규모 정부 계약 지연',
      '호재(가이던스): 2026년 연간 구독 매출 가이던스 상향 조정',
      '결과: 주가 17% 이상 폭락, 긍정적 전망이 악재를 상쇄하지 못함',
      '핵심: 투자자들은 10-Q 공시에서 숨겨진 위험을 발견',
    ],
    outlook:
      '시장은 회사의 긍정적인 전망보다 재무 보고서에 드러난 구조적 문제와 단기 리스크에 더 민감하게 반응했습니다.',
    outlookColor: 'rose',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'NOW',
    title: '드러난 위험: 수익성 악화와 부채',
    description:
      '10-Q 공시를 통해 확인된 핵심 수익성 지표 하락과 초단기 거액 부채는 시장의 공포를 자극하는 결정적인 요인이 되었습니다.',
    points: [
      '수익성 악화: 1분기 구독 총이익률 하락 (81% → 78%)',
      '부채 리스크: Armis 인수를 위한 $61억 신규 부채 발생',
      '유동성 위기: 부채 중 $40억이 6개월 만기 초단기 대출',
      '신뢰도 문제: 계약 지연 정보가 10-Q 보고서에 명확히 기재되지 않음',
    ],
    outlook: '수익성, 유동성, 신뢰도라는 삼중고가 확인되면서 주가 폭락으로 이어졌습니다.',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'headline',
    turnId: 31,
    icon: 'calendar',
    title: '시장의 시선은 이제 다음 주로',
    subtitle: '빅 이벤트 앞두고 짙어지는 관망세',
    description:
      '개별 기업의 실적보다는 거시 경제 지표와 연준의 통화정책 결정이 시장의 방향성을 결정할 분수령이 될 전망입니다. 주요 이벤트 발표 전까지 시장의 변동성이 커질 수 있습니다.',
    bullets: [
      '시장은 ‘데이터 디펜던트’ 장세로 전환',
      '핵심 이벤트: FOMC 금리 결정 (4/29)',
      '주요 지표: 1분기 GDP, 3월 근원 PCE (4/30)',
      '변동성 확대 가능성, 보수적 접근 필요',
    ],
    theme: 'purple',
  },
  {
    id: 14,
    type: 'events',
    turnId: 33,
    title: '다음 주 주목해야 할 주요 경제 이벤트',
    description:
      '다음 주 발표될 FOMC 회의 결과와 핵심 물가 지표는 향후 시장의 방향성을 결정할 가장 중요한 변수입니다.',
    events: [
      {
        date: '4/29',
        label: 'FOMC 금리 결정',
        description: '파월 의장 기자회견에서 향후 금리 경로에 대한 힌트 주목',
      },
      {
        date: '4/30',
        label: '1분기 GDP 성장률 (속보치)',
        description: '미국 경제의 성장 동력 확인',
      },
      {
        date: '4/30',
        label: '3월 근원 PCE 가격지수',
        description: '연준이 가장 중시하는 물가 지표, 시장 예상치 상회 여부가 관건',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '변동성을 대비하며 리스크를 관리할 때',
    tagline: '거시 지표 확인 후 신중한 접근이 필요한 시점',
    description:
      '주요 경제 지표 발표를 앞두고 시장의 불확실성이 최고조에 달하고 있습니다. 섣부른 추격 매수보다는 거시 지표의 방향성을 확인하고 연준의 정책 기조 변화 가능성을 따져보는 보수적인 관점의 리스크 관리가 중요합니다.',
  },
];