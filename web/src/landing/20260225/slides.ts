import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-26',
    nutshell: '엔비디아 실적 발표 기대감 속 기술주 중심의 랠리',
    description:
      '엔비디아 실적 발표를 앞두고 AI 관련주에 대한 기대감이 시장 전체를 끌어올렸습니다. 오늘 브리핑에서는 시장을 움직인 핵심 동력과 함께 IBM의 성장 스토리 및 잠재 리스크를 심층 분석합니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '3대 지수 모두 엔비디아 실적 발표에 대한 기대감으로 상승 마감했습니다. 특히 기술주 중심의 나스닥 지수가 1.26% 급등하며 랠리를 주도했습니다.',
    indices: [
      { name: 'S&P 500', value: 6946.13, change: 56.06, changePercent: 0.81 },
      { name: 'NASDAQ', value: 23152.08, change: 288.40, changePercent: 1.26 },
      { name: 'DOW', value: 49482.15, change: 307.65, changePercent: 0.63 },
      { name: 'Russell 2000', value: 2663.33, change: 11.00, changePercent: 0.41 },
    ],
    commodities: [
      { name: 'VIX', value: 17.52, change: -1.52, changePercent: -8.0 },
      { name: 'US 10Y', value: 4.25, change: 0.01, changePercent: 0.24 },
      { name: 'Dollar Index', value: 97.70, change: -0.18, changePercent: -0.18 },
      { name: 'WTI Crude', value: 65.48, change: -0.15, changePercent: -0.23 },
      { name: 'Gold Futures', value: 5186.80, change: 31.00, changePercent: 0.60 },
    ],
    charts: [{ ticker: 'SP:SPX' }, { ticker: 'NASDAQ:IXIC' }, { ticker: 'DJ:DJI' }, { ticker: 'TVC:RUT' }],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 6,
    icon: 'cpu',
    title: '엔비디아發 AI 랠리',
    subtitle: '시장의 모든 시선이 한 곳으로',
    description:
      '시장은 장 마감 후 발표될 엔비디아 실적에 모든 초점을 맞췄습니다. AI 붐의 지속 가능성을 확인하려는 투자 심리가 기술주 전반의 상승을 이끌었습니다.',
    bullets: [
      '기술주 중심 나스닥 지수 1.26% 급등',
      '주인공 엔비디아(NVDA) 장중 2% 이상 상승',
      '필라델피아 반도체 지수(SOXX) 동반 강세',
      'VIX 지수 8% 이상 하락하며 투자 심리 안정',
    ],
    theme: 'blue',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '랠리를 뒷받침한 안정적 지표들',
    description:
      '거시 경제 지표가 안정적인 흐름을 보이면서 기술주 랠리에 우호적인 환경을 제공했습니다. 특히 변동성 지수가 크게 하락하며 위험 선호 심리가 살아났음을 보여주었습니다.',
    stats: [
      { label: '나스닥 지수', value: '+1.26%', trend: 'up' },
      { label: 'VIX 변동성 지수', value: '-8% 이상', subtext: '투자 심리 안정', trend: 'down' },
      { label: '10년물 국채금리', value: '4.2%대', subtext: '안정적 흐름', trend: 'neutral' },
    ],
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'TVC:VIX' }, { ticker: 'TVC:US10Y' }],
    theme: 'blue',
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 9,
    title: '시장의 기대 vs. 잠재적 리스크',
    description:
      '시장은 엔비디아의 폭발적인 성장을 기정사실로 받아들이면서도, 한편으로는 과열된 기대감에 대한 불안감을 동시에 드러냈습니다.',
    items: [
      {
        label: '기대 (Bull Case)',
        value: '미래 성장 가이던스',
        description: 'AI 칩 수요 지속성, 공급망 안정, 중국 수출 영향 등 미래 청사진에 대한 기대',
        highlight: true,
      },
      {
        label: '우려 (Bear Case)',
        value: '과열 경고음',
        description: '작은 흠결에도 주가 급락 가능성 (팔로알토 네트웍스 -28% 급락 사례)',
        highlight: false,
      },
      {
        label: '시장 반응',
        value: '옵션 시장 변동성',
        description: '실적 발표 이후 주가가 어느 방향이든 10% 이상 움직일 가능성을 가격에 반영',
        highlight: false,
      },
    ],
  },
  {
    id: 5,
    type: 'headline',
    turnId: 11,
    icon: 'alert-triangle',
    title: '과열된 기대감, 커지는 불안감',
    subtitle: 'AI 랠리의 이면에 숨겨진 경고 신호들',
    description:
      '시장 한편에서는 AI 랠리가 과열됐다는 경고음이 계속해서 나왔습니다. 높은 기대를 받는 기술주가 아주 작은 흠결에도 얼마나 취약할 수 있는지를 보여주는 사례들이 등장했습니다.',
    bullets: [
      '팔로알토 네트웍스(PANW), 전망 하향에 주가 28% 폭락',
      '옵션 시장, 엔비디아 실적 발표 후 10% 이상 변동성 가격에 반영',
      'AI 랠리가 중대한 시험대에 올랐음을 보여주는 분명한 신호',
    ],
    theme: 'amber',
  },
  {
    id: 6,
    type: 'headline',
    turnId: 13,
    icon: 'landmark',
    title: '정치적 불확실성은 뒷전',
    subtitle: '관세 리스크보다 엔비디아 실적에 집중',
    description:
      '트럼프 대통령이 국정연설에서 강경한 관세 정책을 옹호했음에도 불구하고, 시장은 거시적 변수보다 눈앞의 기업 펀더멘털에 모든 것을 거는 모습을 보였습니다.',
    bullets: [
      '대통령, 국정연설에서 관세 정책 강력 옹호',
      '글로벌 관세 10% → 15% 인상 가능성 위협',
      '시장은 잠재적 무역 분쟁 리스크를 외면',
      'AI 성장 서사에 대한 강한 믿음이 시장 지배',
    ],
    theme: 'purple',
  },
  {
    id: 7,
    type: 'stats',
    turnId: 14,
    title: '정치 리스크를 외면한 시장 지표',
    description:
      '대통령의 강경한 관세 정책 발언에도 불구하고, 주요 시장 지표들은 AI 랠리에 대한 기대감을 반영하며 강세를 보였습니다. 이는 투자자들이 당장의 성장 동력에 더 집중하고 있음을 보여줍니다.',
    stats: [
      { label: '나스닥 지수', value: '+1.26%', trend: 'up' },
      { label: 'S&P 500 지수', value: '+0.81%', trend: 'up' },
      { label: 'VIX 변동성 지수', value: '-8% 이상', subtext: '공포 심리 완화', trend: 'down' },
      { label: '10년물 국채금리', value: '소폭 상승', subtext: '안정적 흐름 유지', trend: 'neutral' },
    ],
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'TVC:VIX' }, { ticker: 'TVC:US10Y' }],
    theme: 'purple',
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 19,
    ticker: 'IBM',
    companyName: 'International Business Machines',
    currentPrice: 237.54,
    dayChange: 8.22,
    dayChangePercent: 3.58,
    description:
      'IBM 주가가 1.87% 상승 마감했습니다. 시장은 최근 제출된 연차보고서(10-K)를 긍정적으로 해석하며, IBM이 하이브리드 클라우드와 AI 플랫폼 기업으로 성공적으로 전환하고 있다는 내러티브에 베팅하는 모습을 보였습니다.',
    charts: [{ ticker: 'IBM' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 20,
    ticker: 'IBM',
    title: '성장 내러티브: AI와 하이브리드 클라우드',
    description:
      '시장은 IBM이 과거의 하드웨어 기업 이미지를 벗고, Red Hat과 watsonx를 중심으로 하이브리드 클라우드 및 AI 시장을 선점하려는 전략에 높은 기대감을 보이고 있습니다.',
    points: [
      '과거 하드웨어 기업에서 AI 플랫폼 기업으로의 전환 기대',
      'Red Hat OpenShift를 중심으로 멀티 클라우드 수요 공략',
      'watsonx 플랫폼을 통해 기업용 AI 시장 선점 전략',
      '시장은 IBM의 근본적인 변화에 대한 기대감에 베팅 중',
    ],
    outlook: '긍정적 기대감 형성',
    outlookColor: 'blue',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 22,
    ticker: 'IBM',
    title: '숨겨진 리스크 ①: 격화되는 경쟁 환경',
    description:
      '성장 스토리의 이면에는 치열한 경쟁 환경이 존재합니다. IBM의 소프트웨어 부문 성장률은 주요 경쟁사에 비해 현저히 낮아, 시장 점유율 하락에 대한 우려를 낳고 있습니다.',
    points: [
      '주요 경쟁사(AWS, MS, Google)는 연 20-30%의 고성장 지속',
      '반면 IBM의 성장률은 6%에 그쳐, 사실상 시장 점유율을 잃고 있다는 해석 가능',
      'AI와 클라우드라는 핵심 성장 동력에서 압도적 우위를 점하지 못하고 있음을 시사',
    ],
    outlook: '경쟁 심화 우려',
    outlookColor: 'amber',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 24,
    ticker: 'IBM',
    title: '숨겨진 리스크 ②: 거대한 연금 부채',
    description:
      '대차대조표에 숨겨진 거대한 연금 부채는 잠재적인 시한폭탄과 같습니다. 특정 금융 충격 발생 시, 핵심 사업에 투자되어야 할 현금흐름을 잠식시킬 수 있는 중대한 리스크입니다.',
    points: [
      '금융 충격(증시 하락+금리 인하) 발생 시 이중고에 직면 가능',
      '수십억 달러 현금을 연금에 즉시 투입해야 할 의무 발생 우려',
      'AI 전환 등 핵심 성장 동력에 대한 투자 여력 잠식 가능성',
    ],
    outlook: '중대한 재무 리스크',
    outlookColor: 'rose',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 26,
    ticker: 'IBM',
    title: '종합 평가: 기대와 현실의 괴리',
    description:
      'IBM의 AI 전환 노력은 올바른 방향이지만, 성과는 아직 기대감에 머물러 있습니다. 반면 경쟁 심화와 연금 부채 리스크는 매우 현실적입니다.',
    points: [
      '방향성: AI 및 하이브리드 클라우드 전환은 긍정적',
      '현실: 성과는 아직 숫자로 증명되지 않은 기대감 단계',
      '리스크: 경쟁 심화, 거대 연금 부채는 매우 현실적',
      '결론: 현재 주가는 리스크를 충분히 반영하지 않은 것으로 보임',
    ],
    outlook: '신중한 접근 필요',
    outlookColor: 'amber',
  },
  {
    id: 13,
    type: 'events',
    turnId: 29,
    title: '향후 시장 방향을 결정할 주요 경제 지표',
    description:
      '시장은 연준의 금리 정책 향방을 가늠하기 위해 주요 경제 지표 발표를 앞두고 관망세에 들어갔습니다. 다음 지표들이 단기적인 시장 방향성을 결정할 분수령이 될 것입니다.',
    events: [
      {
        date: '2026-02-27',
        label: '2월 생산자물가지수 (PPI)',
        description: '근원 PPI 둔화 여부가 인플레이션 압력 완화의 신호',
      },
      {
        date: '2026-03-02',
        label: 'ISM 제조업 구매관리자지수 (PMI)',
        description: '미국 실물 경제의 확장세 지속 여부 확인',
      },
      {
        date: '2026-03-04',
        label: 'ISM 서비스업 구매관리자지수 (PMI)',
        description: '서비스업 경기의 활력을 보여주는 선행 지표',
      },
      {
        date: '2026-03-06',
        label: '2월 고용보고서',
        description: '연준이 가장 중시하는 지표로, 시장이 가장 민감하게 반응할 전망',
      },
    ],
  },
  {
    id: 14,
    type: 'closing',
    turnId: 34,
    headline: '관망세 속, 거시 지표를 확인하라',
    tagline: '2026년 2월 26일 장마감 브리핑',
    description:
      '엔비디아 실적 기대감이 시장을 이끌었지만, 향후 며칠간은 주요 경제 지표 발표에 따라 시장의 방향성이 결정될 것입니다. 섣부른 판단보다는 확인하고 대응하는 신중한 전략이 필요한 시점입니다.',
  },
];