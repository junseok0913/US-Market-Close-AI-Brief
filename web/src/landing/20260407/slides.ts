import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-08',
    nutshell: '이란 리스크 부각 속 FOMC 회의록 발표 대기',
    description:
      '다우지수는 하락했지만 S&P 500과 나스닥은 소폭 상승하며 혼조세로 마감했습니다. 트럼프 대통령의 대이란 강경 발언으로 인한 지정학적 긴장과 FOMC 회의록 발표를 앞둔 관망세가 시장을 지배했습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '장 초반 지정학적 리스크로 하방 압력을 받았으나, 장 막판 협상 연장 가능성이 제기되며 낙폭을 회복했습니다. 투자자들은 FOMC 회의록을 기다리며 관망하는 모습을 보였습니다.',
    indices: [
      { name: 'S&P 500', value: 6616.85, change: 5.02, changePercent: 0.08 },
      { name: 'NASDAQ', value: 22017.85, change: 21.51, changePercent: 0.10 },
      { name: 'DOW', value: 46584.46, change: -85.42, changePercent: -0.18 },
      { name: 'Russell 2000', value: 2544.95, change: 4.31, changePercent: 0.17 },
      { name: 'Dollar Index', value: 99.67, change: -0.31, changePercent: -0.31 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 110.34, change: -2.07, changePercent: -1.84 },
      { name: 'Gold', value: 4733.30, change: 76.50, changePercent: 1.64 },
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
    turnId: 6,
    icon: 'alert-triangle',
    title: '지정학적 리스크 부상',
    subtitle: '이란 리스크, 시장을 뒤흔들다',
    description:
      '트럼프 대통령의 강경 발언으로 지정학적 리스크가 모든 자산 시장을 뒤흔들었습니다. S&P 500은 장중 1.2% 넘게 급락했으나 막판에 극적으로 반등하며 엄청난 변동성을 보였습니다.',
    bullets: [
      '트럼프 대통령, 대이란 강경 발언으로 긴장 고조',
      'S&P 500 장중 1.2% 급락 후 강보합 마감',
      '국제 유가(WTI) 장중 4% 이상 폭등 후 하락 반전',
      '안전자산 금(Gold) 1.6% 이상 상승하며 온스당 $4700 돌파',
    ],
    theme: 'red',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '이란 리스크에 대한 자산별 반응',
    description:
      '하루 동안 이란 관련 뉴스 헤드라인에 따라 주요 자산 가격이 롤러코스터를 탔습니다. 주식, 원자재, 안전자산 모두 극심한 변동성을 경험했습니다.',
    stats: [
      { label: 'WTI 유가 (CL=F)', value: '장중 4% 이상 폭등', subtext: '배럴당 $117 돌파 후 하락', trend: 'neutral' },
      { label: '금 가격 (GC=F)', value: '+1.6% 이상 상승', subtext: '대표 안전자산으로 자금 유입', trend: 'up' },
      { label: '에너지 섹터 (XLE)', value: '급등세 시현', subtext: '유가 급등에 동조화', trend: 'up' },
      { label: '美 10년물 국채금리', value: '4.34% 수준', subtext: '비교적 안정적인 흐름', trend: 'neutral' },
    ],
    theme: 'red',
    charts: [{ ticker: 'CL=F' }, { ticker: 'GC=F' }],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 9,
    title: '트럼프의 "석기 시대" 위협',
    subtitle: '최후통첩에 얼어붙은 투자 심리',
    description:
      '트럼프 대통령이 소셜미디어를 통해 사실상의 최후통첩을 날리면서 투자 심리가 극도로 악화되었습니다. 호르무즈 해협 봉쇄는 글로벌 경제에 직접적인 타격을 줄 수 있습니다.',
    bullets: [
      '이란이 호르무즈 해협을 개방하지 않을 시 "석기 시대로 되돌릴 것" 위협',
      '뉴욕타임스, 이란의 협상 중단 의사 보도하며 위기감 증폭',
      '굴스비 시카고 연은 총재, 이란발 에너지 충격이 스태그플레이션 유발 가능성 경고',
      '전 세계 원유 수송량 핵심 통로 봉쇄 우려에 시장 공포 확산',
    ],
    theme: 'red',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 11,
    title: '파키스탄의 중재안',
    subtitle: '장 막판 극적인 반전',
    description:
      '장 마감을 앞두고 파키스탄이 중재안을 제시했다는 소식이 전해지며, 최악의 군사적 충돌은 피할 수 있다는 안도감이 시장을 V자 반등으로 이끌었습니다.',
    bullets: [
      '파키스탄, 트럼프 대통령이 설정한 마감 시한 2주 연장 제안',
      '최악의 시나리오 회피 기대감에 시장 급속도로 안정',
      'S&P 500, 장중 저점 대비 1.3% 가까이 치솟으며 하락분 만회',
      'WTI 유가, 장중 고점 대비 8달러 이상 폭락하며 진정세',
    ],
    theme: 'green',
    charts: [{ ticker: 'SP:SPX' }, { ticker: 'CL=F' }],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 14,
    icon: 'landmark',
    title: 'FOMC 회의록 대기',
    subtitle: '시장의 초점, 통화정책으로 이동',
    description:
      '이란 관련 지정학적 리스크가 잠시 소강상태에 접어들자, 투자자들의 시선은 다시 연준의 통화정책으로 향하고 있습니다. 내일 공개될 3월 FOMC 회의록이 핵심 변수입니다.',
    bullets: [
      '지정학적 리스크 완화 후 통화정책에 관심 집중',
      '내일(4/8) 오후 2시, 3월 FOMC 회의록 공개 예정',
      '인플레이션 및 지정학적 변수에 대한 연준 위원들의 시각이 관건',
      '변동성지수(VIX) 6% 넘게 급등, 시장의 경계감 반영',
    ],
    theme: 'blue',
  },
  {
    id: 7,
    type: 'stats',
    turnId: 15,
    title: '관망세 짙은 시장 지표',
    description:
      '주요 지수의 혼조세, 변동성지수 급등, 안정적인 국채금리는 투자자들이 뚜렷한 방향성 없이 FOMC 회의록이라는 핵심 이벤트를 기다리고 있음을 보여줍니다.',
    stats: [
      { label: '주요 지수', value: '혼조세 마감', subtext: '다우 하락, S&P/나스닥 상승', trend: 'neutral' },
      { label: '변동성지수 (VIX)', value: '6% 이상 상승', subtext: '25선 돌파, 불안 심리 반영', trend: 'up' },
      { label: '美 10년물 국채금리', value: '4.34% 수준', subtext: '큰 변동 없이 안정세', trend: 'neutral' },
    ],
    theme: 'blue',
    charts: [{ ticker: '^VIX' }, { ticker: 'TVC:US10Y' }],
  },
  {
    id: 8,
    type: 'headline',
    turnId: 17,
    icon: 'dollar-sign',
    title: '연준의 딜레마',
    subtitle: '지정학적 리스크와 인플레이션',
    description:
      '오스탄 굴스비 시카고 연은 총재는 이란 사태로 인한 에너지 충격이 스태그플레이션을 유발할 수 있다고 경고했습니다. 이는 지정학적 리스크가 연준의 통화정책 결정에 직접적인 변수임을 시사합니다.',
    bullets: [
      'WTI 유가, 장중 급등하며 인플레이션 재점화 우려 자극',
      '굴스비 총재, 에너지 충격이 스태그플레이션형 물가 상승 유발 가능성 경고',
      '지정학적 리스크가 단순 변동성 요인을 넘어 인플레이션 변수로 부상',
      '투자자들은 회의록에서 공급망 충격에 대한 연준 위원들의 우려 수위를 확인하고자 함',
    ],
    theme: 'blue',
  },
  {
    id: 9,
    type: 'comparison',
    turnId: 19,
    title: 'FOMC 의사록 관전 포인트',
    description:
      '투자자들은 이번 회의록을 통해 연준의 자신감 수준과 내부 논의의 깊이를 확인하고자 합니다. 특히 다음 세 가지 포인트가 향후 금리 경로를 예측하는 데 결정적인 단서가 될 것입니다.',
    items: [
      {
        label: '컨센서스 강도',
        value: '의견 일치 수준',
        description: '연내 3회 금리 인하 전망에 대한 위원들 간의 이견 여부 확인.',
        highlight: false,
      },
      {
        label: '소수 의견',
        value: '매파적 시각',
        description: '일부 위원들이 더 매파적인 의견을 냈는지, 인플레이션 둔화 지연을 우려했는지 확인.',
        highlight: true,
      },
      {
        label: '외부 변수 인식',
        value: '공급망 충격',
        description: '에너지 가격 상승 등 외부 충격을 일시적 현상으로 보는지, 구조적 위험으로 보는지 파악.',
        highlight: false,
      },
    ],
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 20,
    ticker: 'UNH',
    companyName: 'UnitedHealth Group',
    currentPrice: 307.73,
    dayChange: 26.37,
    dayChangePercent: 9.37,
    description:
      '유나이티드헬스 그룹이 9% 넘게 급등하며 시장의 주목을 받았습니다. 주가를 짓누르던 규제 관련 불확실성이 해소된 것이 결정적인 호재로 작용했습니다.',
    charts: [{ ticker: 'UNH' }],
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 21,
    ticker: 'UNH',
    title: '호재: 메디케어 리스크 해소',
    points: [
      '2027년 메디케어 어드밴티지 지급률 2.48% 인상 최종 합의',
      '시장의 우려보다 높은 수준으로, 단기 수익성 불확실성 완화',
      '투자 심리가 급격히 회복되며 주가 폭발적 반응',
      '이번 인상으로 약 42억 5천만 달러의 추가 수익 기대',
    ],
    outlook: '단기 불확실성 해소',
    outlookColor: 'emerald',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'UNH',
    title: '리스크 ①: 악화된 펀더멘털',
    points: [
      '2025년 영업이익 190억 달러로 전년 대비 41% 급감',
      '메디케어 추가 수익(42.5억)은 영업이익 감소분(133억)을 메우기엔 역부족',
      '핵심 성장 동력으로 여겨졌던 옵텀 헬스(Optum Health) 부문 적자 전환',
      '현재 주가 급등은 실적 개선보다 안도감이 과도하게 반영되었을 가능성 제기',
    ],
    outlook: '펀더멘털 우려',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'UNH',
    title: '리스크 ②: 반독점 소송',
    points: [
      '미국 법무부(DOJ)가 진행 중인 반독점 소송이 가장 큰 잠재적 리스크',
      '소송은 회사의 핵심 경쟁력인 수직적 통합 모델 자체를 겨냥',
      '패소 시 옵텀(Optum)의 강제 분할 매각 가능성 존재',
      '회사의 근본적인 투자 논리를 파괴할 수 있는 실존적 위협으로 판단',
    ],
    outlook: '구조적 위협 상존',
    outlookColor: 'rose',
  },
  {
    id: 14,
    type: 'events',
    turnId: 31,
    title: '이번 주 주목해야 할 주요 경제 일정',
    description:
      '지난주 강력한 고용 보고서 이후 시장의 모든 시선은 인플레이션 데이터로 향하고 있습니다. 이번 주 발표될 지표들이 연준의 다음 행보에 대한 단서를 제공할 것입니다.',
    events: [
      {
        date: '4월 8일 (수)',
        label: 'FOMC 의사록 공개',
        description: '3월 회의에서의 인플레이션 및 경제 전망에 대한 위원들의 논의 확인.',
      },
      {
        date: '4월 10일 (금)',
        label: '3월 소비자물가지수(CPI) 발표',
        description: '연준의 금리 인하 경로에 결정적 영향을 미칠 핵심 인플레이션 지표.',
      },
      {
        date: '4월 10일 (금)',
        label: '미시간대 소비자심리지수',
        description: '향후 1년 및 5년 기대 인플레이션 수치 포함.',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 36,
    headline: '조용한 시장, 거대한 변수를 기다리다',
    tagline: '4월 8일 장마감 브리핑',
    description:
      '이란 리스크와 FOMC 회의록이라는 두 가지 변수 속에서 시장은 신중한 흐름을 보였습니다. 이번 주 후반 발표될 CPI가 시장의 단기 방향성을 결정할 분수령이 될 전망입니다.',
  },
];