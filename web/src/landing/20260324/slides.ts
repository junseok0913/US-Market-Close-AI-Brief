import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-25',
    nutshell: '이란 관련 지정학적 리스크 부각에 따른 기술주 하락',
    description:
      '이란 관련 지정학적 불확실성이 심화되고 유가가 급등하면서 시장이 하락했습니다. 특히 기술 인프라에 대한 직접적인 위협이 부각되며 기술주 중심의 나스닥이 큰 폭으로 내렸습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '주요 지수 현황',
    description:
      '이란 관련 지정학적 리스크가 부각되며 3대 지수 모두 하락 마감했습니다. 특히 기술주 중심의 나스닥 지수가 가장 큰 낙폭을 기록했습니다.',
    indices: [
      { name: 'S&P 500', value: 6556.37, change: -24.63, changePercent: -0.37 },
      { name: 'NASDAQ', value: 21761.89, change: -184.87, changePercent: -0.84 },
      { name: 'DOW', value: 46124.06, change: -84.41, changePercent: -0.18 },
      { name: 'Russell 2000', value: 2505.44, change: 11.21, changePercent: 0.45 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 88.26, change: 0.13, changePercent: 0.15 },
      { name: '10-Year Yield', value: 4.39, change: 0.06, changePercent: 1.34 },
      { name: 'Dollar Index', value: 99.21, change: 0.26, changePercent: 0.26 },
      { name: 'Gold Futures', value: 4480.90, change: 76.80, changePercent: 1.74 },
    ],
    charts: [
      { ticker: 'SP:SPX' },
      { ticker: 'NASDAQ:IXIC' },
      { ticker: 'DJ:DJI' },
      { ticker: 'TVC:RUT' },
      { ticker: 'TVC:DXY' },
      { ticker: 'COMEX:GC1!' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 7,
    icon: 'alert-triangle',
    title: '이란 지정학적 리스크',
    subtitle: '엇갈린 신호 속 유가 급등',
    description:
      '트럼프 대통령의 대화 언급에도 불구하고, 이란 측의 부인과 미군의 추가 파병 소식이 전해지며 투자 심리가 급격히 냉각되었습니다.',
    bullets: [
      '트럼프 "생산적 대화" 언급 vs 이란 측 협상 공식 부인',
      '미 국방부, 중동에 정예 병력 3천 명 추가 파병 결정',
      'WTI 유가 4% 가까이 급등하며 배럴당 $91 돌파',
      'VIX 지수 급등, 달러화 강세 등 전형적 위험 회피 장세',
    ],
    theme: 'red',
    charts: [{ ticker: 'TVC:USOIL' }, { ticker: 'TVC:VIX' }],
  },
  {
    id: 3,
    type: 'stats',
    turnId: 9,
    title: '유가 급등과 시장 충격',
    description:
      '세계 원유 공급의 동맥인 호르무즈 해협의 통행 차질이 현실화되면서 유가가 급등하고, 이는 시장 전반에 큰 충격을 주고 있습니다.',
    stats: [
      {
        label: '호르무즈 해협 통과량',
        value: '전세계 20%',
        subtext: '해상 원유 수송량 기준',
        trend: 'down',
      },
      {
        label: '브렌트유 상승률',
        value: '~40%↑',
        subtext: '분쟁 시작 이후, $104 육박',
        trend: 'up',
      },
      {
        label: '에너지 섹터(XLE)',
        value: '강세',
        subtext: '시장 하락 속 차별화 흐름',
        trend: 'up',
      },
    ],
    theme: 'red',
    charts: [{ ticker: 'TVC:UKOIL' }, { ticker: 'AMEX:XLE' }],
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 11,
    title: '유가 급등의 산업별 영향',
    description:
      '유가 급등은 경제 전반의 비용을 상승시키며 산업별로 명암이 엇갈렸습니다. 특히 항공업계와 빅테크 인프라가 직접적인 타격을 받았습니다.',
    items: [
      {
        label: '항공 업계 (JETS)',
        value: '주가 하락',
        description: '유류비 부담 증가 우려 (AAL, DAL 등)',
        highlight: false,
      },
      {
        label: '빅테크 (AMZN)',
        value: '인프라 리스크',
        description: 'AWS 바레인 데이터센터 운영 차질 발생',
        highlight: false,
      },
      {
        label: '에너지 기업 (XLE)',
        value: '반사 이익',
        description: '유가 상승에 따른 실적 개선 기대감',
        highlight: true,
      },
    ],
    charts: [{ ticker: 'AMEX:JETS' }, { ticker: 'NASDAQ:AAL' }],
  },
  {
    id: 5,
    type: 'headline',
    turnId: 15,
    icon: 'cpu',
    title: '기술주 하락 심화',
    subtitle: '지정학적 리스크, 빅테크를 직접 타격하다',
    description:
      '아마존 웹 서비스(AWS)의 데이터센터가 물리적 위협에 노출되었다는 소식이 전해지며, 지정학적 리스크가 기술 인프라의 취약성을 드러냈습니다.',
    bullets: [
      'AWS 바레인 데이터센터, 드론 활동으로 운영 차질',
      '글로벌 기술 인프라의 물리적 취약성 부각',
      '나스닥(-0.84%), S&P 500(-0.37%) 대비 2배 이상 하락',
      '기술주 ETF(XLK) 1% 이상 하락하며 시장 하락 주도',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'AMEX:XLK' }],
  },
  {
    id: 6,
    type: 'stats',
    turnId: 17,
    title: '아마존 데이터센터 피격의 파장',
    description:
      '아마존의 핵심 자산인 클라우드 인프라가 물리적 공격에 노출되었다는 사실은, 그동안 시장이 인지하지 못했던 새로운 리스크를 부각시켰습니다.',
    stats: [
      {
        label: '아마존(AMZN) 주가',
        value: '-0.3%↓',
        subtext: '핵심 자산의 물리적 리스크 부각',
        trend: 'down',
      },
      {
        label: '소프트웨어 ETF(IGV)',
        value: '-3.6%↓',
        subtext: '클라우드 의존 기업 전반 우려 확산',
        trend: 'down',
      },
      {
        label: '피해 시설',
        value: 'AWS 바레인 리전',
        subtext: '드론 활동으로 인한 운영 중단',
        trend: 'neutral',
      },
    ],
    theme: 'blue',
    charts: [{ ticker: 'NASDAQ:AMZN' }, { ticker: 'NASDAQ:IGV' }],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 19,
    icon: 'brain-circuit',
    title: 'AI의 양면성',
    subtitle: '엔비디아 CEO의 AGI 달성 주장',
    description:
      '엔비디아 CEO 젠슨 황의 AGI 달성 주장은 AI의 파괴적 잠재력을 상기시키며, 지정학적 리스크로 불안한 시장에 또 다른 불확실성을 더했습니다.',
    bullets: [
      '젠슨 황 CEO, "AGI는 이미 달성되었다" 주장',
      '"AI가 10억 달러 규모 회사 운영 가능" 발언',
      '엔비디아(NVDA) 칩 수요에는 긍정적 신호',
      '기존 소프트웨어 기업의 \'창조적 파괴\' 공포 자극',
    ],
    theme: 'purple',
    charts: [{ ticker: 'NASDAQ:NVDA' }, { ticker: 'NASDAQ:SOXX' }],
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 20,
    ticker: 'GLW',
    companyName: 'Corning Inc.',
    currentPrice: 142.01,
    dayChange: 11.04,
    dayChangePercent: 8.43,
    description:
      '코닝(Corning)이 특별한 개별 뉴스 없이 8% 가까이 급등했습니다. 시장은 코닝을 AI 데이터센터 혁명의 핵심 수혜주로 재평가하기 시작했습니다.',
    charts: [{ ticker: 'NYSE:GLW' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 21,
    ticker: 'GLW',
    title: 'Bull Case: AI 데이터센터의 신경망',
    points: [
      '시장의 재평가: 전통 유리 제조사 → AI 인프라 공급사',
      '광통신 부문 매출 전년 대비 35% 급증',
      '광통신 부문 순이익 71% 경이적인 성장 기록',
      'AI 데이터센터 수요 폭증의 직접적인 수혜',
    ],
    description:
      '시장은 코닝을 AI 데이터센터 혁명의 핵심 수혜주로 인식하며, 폭발적인 광통신 부문 성장에 주목하고 있습니다.',
    outlook: '긍정적 성장 기대',
    outlookColor: 'emerald',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'GLW',
    title: 'Bear Case: 성장 이면의 리스크',
    points: [
      '사업부 불균형: 디스플레이, 자동차 부문은 역성장 기록',
      '고평가 우려: 주가수익비율(PER) 77배 초과',
      '과도한 낙관론: 미래의 가장 긍정적인 시나리오까지 선반영',
      '전체 매출에서 부진한 사업부 비중이 여전히 상당함',
    ],
    description:
      '폭발적으로 성장하는 광통신 부문과 달리 다른 주요 사업부는 부진하며, 현재 주가는 밸류에이션 부담이 큰 상황입니다.',
    outlook: '밸류에이션 및 사업 불균형 우려',
    outlookColor: 'rose',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'GLW',
    title: '핵심 리스크: 소수 고객 집중',
    points: [
      '광통신 부문 매출의 28%가 단 2개 고객사에서 발생',
      '소수 대형 데이터센터 운영사에 대한 절대적 의존도',
      '주요 고객의 투자 축소/변경 시 성장 엔진 급정거 가능성',
      '재무적 관점에서 심각한 단일 장애점으로 평가 가능',
    ],
    description:
      '가장 강력한 성장 동력인 광통신 사업이 소수 고객에 집중되어 있어, 회사 전체의 운명이 소수 고객의 결정에 좌우될 수 있습니다.',
    outlook: '고객 집중 리스크',
    outlookColor: 'amber',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'GLW',
    title: '종합 평가: 투기적 영역 진입',
    points: [
      '현재 주가는 내재 가치를 현저히 초과했다는 분석',
      '낙관적 성장 가정도 현재 시가총액에 미치지 못함',
      'FOMO(소외 공포) 심리가 시장을 지배하고 있다는 신호',
      '장기적 관점에서 매력적인 안전마진 부재',
    ],
    description:
      '시장이 AI 스토리에만 집중한 나머지, 부진한 사업부와 고객 집중 리스크를 간과하고 있다는 평가가 지배적입니다.',
    outlook: '장기 투자 관점 주의 필요',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'events',
    turnId: 31,
    title: '이번 주 주요 경제 지표',
    description:
      '연준의 금리 인하 경로를 가늠할 수 있는 중요한 경제 지표들이 연이어 발표될 예정입니다. 특히 금요일 PCE 지표가 핵심입니다.',
    events: [
      {
        date: '3/26 (화)',
        label: '소비자신뢰지수',
        description: '미국 소비 심리 확인',
      },
      {
        date: '3/28 (목)',
        label: '4분기 GDP 확정치',
        description: '미국 경제 성장세 최종 확인',
      },
      {
        date: '3/29 (금)',
        label: '2월 개인소비지출(PCE) 가격지수',
        description: '연준이 가장 중시하는 물가 지표',
      },
    ],
  },
  {
    id: 14,
    type: 'headline',
    turnId: 33,
    icon: 'calendar-stats',
    title: '시장의 눈, PCE로 쏠린다',
    subtitle: '연준 통화정책의 핵심 변수',
    description:
      '이번 주 가장 중요한 지표는 금요일에 발표되는 2월 PCE 가격지수입니다. 시장 예상치를 벗어날 경우 다음 주 시장 변동성이 커질 수 있습니다.',
    bullets: [
      '발표일: 3월 29일 (금)',
      '중요성: 연준이 가장 선호하는 인플레이션 척도',
      '시장 예상치: 근원 PCE 전월 대비 0.3% 상승',
      '특이사항: \'성금요일\' 휴장일에 발표, 시장은 다음 주 월요일에 반응',
    ],
    theme: 'gold',
  },
  {
    id: 15,
    type: 'closing',
    turnId: 34,
    headline: '지정학적 리스크 부각, 숨 고르기 장세',
    tagline: '3월 25일 장마감 브리핑',
    description:
      '이란 관련 불확실성과 유가 급등이 기술주를 중심으로 시장을 압박했습니다. 이번 주 발표될 PCE 물가 지표가 향후 시장의 방향성을 결정할 핵심 변수가 될 전망입니다.',
  },
];