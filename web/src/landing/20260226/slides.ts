import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-27',
    nutshell: '엔비디아 실적 발표 후 차익실현, 기술주 하락 속 혼조 마감',
    description:
      '예상을 뛰어넘는 엔비디아의 실적에도 불구하고 차익실현 매물이 쏟아지며 기술주 중심의 나스닥 지수가 하락했습니다. 시장의 자금은 기술주에서 경기민감주로 이동하며 지수별 혼조세를 보였습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '다우지수는 소폭 상승했으나, 엔비디아발 차익실현 매물에 기술주가 하락하며 나스닥과 S&P 500 지수는 하락 마감했습니다. 중소형주 중심의 러셀 2000은 상승하며 지수별 등락이 뚜렷하게 엇갈린 하루였습니다.',
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ Composite' },
      { ticker: 'DJ:DJI', title: 'Dow Jones Industrial Average' },
      { ticker: 'TVC:RUT', title: 'Russell 2000' },
    ],
    indices: [
      { name: 'S&P 500', value: 6908.86, change: -37.27, changePercent: -0.54 },
      { name: 'NASDAQ', value: 22878.38, change: -273.70, changePercent: -1.18 },
      { name: 'DOW', value: 49499.20, change: 17.05, changePercent: 0.03 },
      { name: 'Russell 2000', value: 2677.29, change: 13.96, changePercent: 0.52 },
    ],
    commodities: [
      { name: 'Dollar Index', value: 97.81, change: 0.11, changePercent: 0.11 },
      { name: 'WTI Crude', value: 65.47, change: 0.05, changePercent: 0.08 },
      { name: 'Gold Futures', value: 5201.50, change: -4.90, changePercent: -0.09 },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 3,
    icon: 'trending-down',
    title: '뉴스에 팔아라: 엔비디아의 역설',
    subtitle: '예상 뛰어넘는 실적에도 주가 5% 급락',
    description:
      '엔비디아는 시장의 예상을 뛰어넘는 실적을 발표했지만, 주가는 오히려 급락했습니다. 이는 실적 발표 전까지의 가파른 상승에 따른 이익을 확정하려는 전형적인 \'뉴스에 파는\' 현상으로 분석됩니다.',
    bullets: [
      'AI 기대감으로 실적 발표 전 주가 급등',
      '예상 상회 실적이 차익실현의 빌미로 작용',
      '엔비디아 주가 하루 만에 5% 이상 하락',
      '단기 과열 경계심 및 섹터 로테이션 가능성 시사',
    ],
    theme: 'red',
    charts: [{ ticker: 'NASDAQ:NVDA', title: 'NVIDIA' }],
  },
  {
    id: 3,
    type: 'headline',
    turnId: 7,
    icon: 'cpu',
    title: 'AI 랠리의 경고등',
    subtitle: '엔비디아 쇼크, 반도체 섹터 동반 하락',
    description:
      '엔비디아의 급락은 반도체 섹터 전반에 찬물을 끼얹는 효과를 낳았습니다. AI 랠리에 대한 기대감이 최고조에 달한 상황에서, 어떤 호실적도 차익실현의 빌미가 될 수 있음을 보여주었습니다.',
    bullets: [
      '엔비디아 5% 급락, 나스닥 1.2% 하락 주도',
      'iShares 반도체 ETF(SOXX) 3.5% 하락',
      '10년물 국채금리 하락, 시장 경계심리 반영',
      'AMD, 브로드컴 등 주요 반도체주 동반 약세',
    ],
    theme: 'red',
    charts: [
      { ticker: 'NASDAQ:NVDA', title: 'NVIDIA' },
      { ticker: 'NASDAQ:SOXX', title: 'iShares Semiconductor ETF' },
    ],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 9,
    title: '엔비디아, 완벽했지만 부족했던 실적',
    description:
      '숫자만 보면 흠잡을 데 없는 실적이었습니다. 하지만 시장의 눈높이가 상상 이상으로 높아져 있어, 이 정도의 서프라이즈로는 주가 상승 피로감을 잠재우기엔 역부족이었습니다.',
    stats: [
      { label: '4분기 매출', value: '$681억', subtext: '월가 예상 상회', trend: 'up' },
      { label: '데이터센터 매출', value: '$623억', subtext: '폭발적 성장세', trend: 'up' },
      { label: '차분기 가이던스', value: '~$780억', subtext: '시장 기대치($728억) 상회', trend: 'up' },
    ],
    note: '일부에서는 800억 달러에 육박하는 가이던스를 기대하는 목소리도 있었습니다.',
    theme: 'blue',
  },
  {
    id: 5,
    type: 'comparison',
    turnId: 11,
    title: '반도체 섹터 동반 약세',
    description:
      'AI 랠리의 대장주인 엔비디아가 흔들리자 다른 반도체 기업들의 주가도 동반 하락을 피하지 못했습니다. 이는 섹터 전체에 대한 투자 심리가 위축되었음을 의미합니다.',
    items: [
      {
        label: 'Broadcom (AVGO)',
        value: '-6% 이상',
        description: '주요 반도체 종목 중 가장 큰 하락폭 기록',
        highlight: true,
      },
      {
        label: 'NVIDIA (NVDA)',
        value: '-5% 이상',
        description: 'AI 랠리 대장주의 급락, 섹터 투자 심리 위축 주도',
        highlight: false,
      },
      {
        label: 'AMD (AMD)',
        value: '-4% 이상',
        description: '엔비디아의 강력한 경쟁자도 하락세 동참',
        highlight: false,
      },
    ],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 15,
    icon: 'switch-horizontal',
    title: '시장의 무게중심 이동',
    subtitle: '기술주 ↓ 경기민감주 ↑, 뚜렷한 순환매',
    description:
      '엔비디아발 차익실현 매물이 기술주를 압박하는 동안, 자금은 산업재나 금융주 같은 경기 순환 섹터로 이동했습니다. 나스닥과 다우 지수의 엇갈린 흐름이 이를 명확히 보여줍니다.',
    bullets: [
      '나스닥(-1.18%) vs 다우(+0.03%), 러셀 2000(+0.55%)',
      '자금, 기술주(XLK)에서 산업재(XLI)/금융주(XLF)로 이동',
      '기술주 ETF(XLK) -1.4% vs 산업재 ETF(XLI) +1.2%',
      '견조한 고용지표가 경기민감주에 긍정적 작용',
    ],
    theme: 'green',
    charts: [
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ' },
      { ticker: 'DJ:DJI', title: 'DOW' },
      { ticker: 'TVC:RUT', title: 'Russell 2000' },
    ],
  },
  {
    id: 7,
    type: 'stats',
    turnId: 17,
    title: '섹터별 ETF 등락 비교',
    description:
      '투자자들이 과열된 기술주를 벗어나 안정적인 경제 성장의 수혜를 볼 수 있는 가치주로 눈을 돌리고 있다는 명백한 증거가 섹터별 ETF 성과에서 나타났습니다.',
    stats: [
      { label: '산업재 (XLI)', value: '+1.2% 이상', subtext: '경기 순환주 강세', trend: 'up' },
      { label: '금융 (XLF)', value: '강세', subtext: '골드만삭스 등 상승 주도', trend: 'up' },
      { label: '기술 (XLK)', value: '-1.4%', subtext: '차익실현 매물 출회', trend: 'down' },
    ],
    note: '과열된 기술주를 벗어나 안정적인 가치주로 자금이 이동하는 명백한 증거입니다.',
    theme: 'green',
  },
  {
    id: 8,
    type: 'headline',
    turnId: 19,
    title: '순환매, 계속될까?',
    subtitle: '시장의 저변 확대 가능성',
    description:
      '그동안 소수 기술주에 집중됐던 시장 상승에 대한 경계심이 커진 가운데, 중소형주 중심의 러셀 2000 지수 강세는 시장 저변이 넓어지고 있다는 긍정적인 신호로 해석됩니다.',
    bullets: [
      '소수 기술주 집중 현상에 대한 경계심 확산',
      '러셀 2000 강세는 시장 저변 확대의 긍정적 신호',
      '향후 경제 지표가 순환매 흐름의 지속 여부 결정',
      '기술주 조정 후 저가 매수세 유입 가능성도 존재',
    ],
    charts: [{ ticker: 'TVC:RUT', title: 'Russell 2000' }],
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 21,
    ticker: 'NASDAQ:MU',
    companyName: 'Micron Technology',
    currentPrice: 415.56,
    dayChange: -13.44,
    dayChangePercent: -3.13,
    description:
      '마이크론은 장 초반 고점을 찍은 뒤 급락했다가 낙폭을 일부 만회하며 결국 2% 넘게 하락 마감했습니다. 하루 동안 상당한 변동성을 보였습니다.',
    charts: [{ ticker: 'NASDAQ:MU', title: 'Micron Technology' }],
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 22,
    ticker: 'NASDAQ:MU',
    title: '성장 스토리 vs 경기 순환 공포',
    description:
      '오늘 마이크론의 움직임은 AI 혁명이 가져온 성장 스토리와 메모리 산업의 고질적인 경기 순환 공포라는 두 거대 서사가 충돌한 결과로 보입니다.',
    points: [
      '성장 동력 (AI 수혜): AI 서버 수요로 컴퓨팅/네트워킹 매출이 전년 대비 100% 급증했으며, 전체 매출 총이익률은 56%에 달하는 경이로운 실적을 기록했습니다.',
      '리스크 요인 (공급 과잉 우려): 높은 이익률이 경쟁사들의 과잉 투자를 유발할 수 있습니다. 특히 정부 보조금이 2027년경 공급 과잉 리스크를 키울 수 있습니다.',
      '지정학적 변수: DRAM 생산의 과반이 대만에 집중되어 있어 지정학적 리스크가 여전히 중요한 변수로 남아있습니다.',
    ],
    outlook: 'AI 시대의 핵심 수혜주라는 점은 명확하지만, 잠재적 공급 과잉 리스크 또한 무시할 수 없는 상황입니다.',
    outlookColor: 'amber',
  },
  {
    id: 11,
    type: 'comparison',
    turnId: 26,
    title: '마이크론, 과거와 현재의 체력 비교',
    description:
      'AI 시대의 도래로 메모리 산업 사이클의 \'저점\' 자체가 과거보다 훨씬 높아질 것이라는 분석이 나옵니다. 기업의 기초 체력이 완전히 달라졌다는 평가입니다.',
    items: [
      {
        label: '현재 사이클 고점',
        value: '56%',
        description: '최근 분기 AI 수요에 힘입은 경이로운 매출 총이익률',
        highlight: true,
      },
      {
        label: '미래 사이클 저점 (전망)',
        value: '25% ~ 30%',
        description: '향후 하강기에도 HBM 등 고부가가치 제품이 이익률을 방어할 것으로 기대',
        highlight: false,
      },
      {
        label: '과거 사이클 저점',
        value: '-9%',
        description: '과거 최악의 시기 매출 총이익률',
        highlight: false,
      },
    ],
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 28,
    ticker: 'NASDAQ:MU',
    title: '투자자 관점: 신중한 접근 필요',
    description:
      '결론적으로 마이크론은 단기적인 시장의 공포와 장기적인 구조적 성장의 가치가 공존하는 상황에 놓여 있습니다. 섣부른 판단보다는 신중한 접근이 요구됩니다.',
    points: [
      '단기적 관점: 현재 주가는 시장의 공포를 반영하고 있어 리스크 관리가 필요한 시점입니다.',
      '장기적 관점: AI가 가져온 구조적 성장의 가치를 고려하면 섣부른 매도 판단은 경계해야 합니다.',
      '결론: 시장의 불확실성이 해소되고 방향성이 명확해질 때까지 신중한 접근이 요구되는 국면입니다.',
    ],
    outlook: '단기 변동성 vs 장기 성장성 사이에서 균형 잡힌 시각이 중요합니다.',
    outlookColor: 'blue',
  },
  {
    id: 13,
    type: 'headline',
    turnId: 30,
    title: '숨 고르기 장세',
    subtitle: '주요 경제 지표 발표 앞두고 관망 심리 짙어져',
    description:
      '투자자들은 다음 주에 발표될 중요한 경제 지표들을 앞두고 관망세로 돌아섰습니다. 연준의 통화정책 향방을 가늠해볼 수 있는 핵심 데이터 발표를 앞두고 섣부른 베팅을 자제하는 모습입니다.',
    bullets: [
      '주요 지수 혼조세 마감, 뚜렷한 방향성 부재',
      '연준 통화정책 향방 가늠할 핵심 데이터 대기',
      '\'확인하고 가자\'는 심리 우세, 섣부른 베팅 자제',
      '작은 뉴스에도 변동성 커질 수 있어 주의 필요',
    ],
  },
  {
    id: 14,
    type: 'events',
    turnId: 32,
    title: '다음 주 주요 경제 이벤트',
    description:
      '다음 주는 시장의 방향성을 결정할 중요한 경제 지표 발표가 연이어 예정되어 있습니다. 특히 고용보고서는 연준의 금리 정책에 직접적인 영향을 미칠 수 있습니다.',
    events: [
      {
        date: '3/2 (월)',
        label: 'ISM 제조업 구매관리자지수 (PMI)',
        description: '대표적인 경기 선행 지표로, 제조업 경기를 파악합니다.',
      },
      {
        date: '3/4 (수)',
        label: 'ISM 서비스업 PMI & 연준 베이지북',
        description: '미국 경제의 3분의 2를 차지하는 서비스업 동향과 지역별 경제 동향 보고서입니다.',
      },
      {
        date: '3/6 (금)',
        label: '2월 고용보고서',
        description: '비농업 고용, 실업률 등 연준이 가장 중시하는 지표로 금리 결정에 직접적 영향을 미칩니다.',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '변곡점 앞둔 시장, 경제 지표에 쏠린 눈',
    tagline: '2026년 2월 27일 장마감 브리핑',
    description:
      '엔비디아발 기술주 조정과 섹터 순환매가 나타난 하루였습니다. 다음 주 발표될 제조업, 서비스업, 고용 지표가 향후 시장의 방향성을 결정할 중요한 분수령이 될 것입니다.',
  },
];