import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-14',
    nutshell: '지정학적 리스크와 기업 실적 우려에 하락한 시장',
    description:
      '중동의 지정학적 긴장 고조로 인한 유가 급등과 어도비, 울타 뷰티 등 주요 기업의 미래 성장성에 대한 우려가 겹치며 시장이 전반적으로 하락했습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '주요 지수가 모두 하락 마감했습니다. 중동 긴장 고조로 인한 유가 급등이 인플레이션 우려를 자극했고, 일부 기업들의 실망스러운 소식이 투자 심리를 위축시켰습니다.',
    indices: [
      { name: 'S&P 500', value: 6632.19, change: -40.43, changePercent: -0.61 },
      { name: 'NASDAQ', value: 22105.36, change: -206.62, changePercent: -0.93 },
      { name: 'DOW', value: 46558.47, change: -119.38, changePercent: -0.26 },
      { name: 'Russell 2000', value: 2480.05, change: -8.94, changePercent: -0.36 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 98.68, change: 2.95, changePercent: 3.08 },
      { name: 'Gold Futures', value: 5026.10, change: -89.70, changePercent: -1.75 },
      { name: 'Dollar Index', value: 27.89, change: 0.21, changePercent: 0.76 },
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
    turnId: 3,
    icon: 'alert-triangle',
    title: '실적은 좋았지만, 미래가 불안했다',
    subtitle: '어도비(ADBE) & 울타 뷰티(ULTA) 주가 급락',
    description:
      '예상치를 웃도는 실적에도 불구하고, 어도비는 CEO 사임 소식에, 울타 뷰티는 미래 수익성 전망 하향에 주가가 급락하며 시장에 부담으로 작용했습니다.',
    bullets: [
      '어도비(ADBE): 18년간 회사를 이끈 CEO 사임 소식에 -7% 급락',
      '울타 뷰티(ULTA): 수익성 전망 하향 조정에 -14% 폭락',
      '양호한 실적에도 불구, 미래 불확실성에 투자자 매도세 집중',
    ],
    theme: 'amber',
    charts: [{ ticker: 'ADBE' }, { ticker: 'ULTA' }],
  },
  {
    id: 3,
    type: 'headline',
    turnId: 6,
    icon: 'flame',
    title: '중동 지정학적 리스크',
    subtitle: '유가 100달러 위협, 시장 공포 확산',
    description:
      '미국과 이란의 군사적 긴장이 최고조에 달하며 이란이 호르무즈 해협 봉쇄를 위협하자, 국제 유가가 2022년 이후 최고 수준으로 치솟으며 시장 전체에 직격탄이 됐습니다.',
    bullets: [
      '미-이란 군사적 긴장 최고조, 강경 발언 지속',
      '이란, 글로벌 원유 핵심 통로 호르무즈 해협 봉쇄 위협',
      'WTI 유가, 배럴당 99달러 육박 (2022년 이후 최고)',
      'VIX 지수 27 돌파, 투자자 불안감 증폭',
    ],
    theme: 'red',
    charts: [{ ticker: 'CL=F' }, { ticker: 'TVC:VIX' }],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 7,
    title: '지정학적 리스크가 시장에 미친 영향',
    description:
      '유가 급등은 인플레이션 우려를 자극하며 주식, 채권 시장 모두에 부담으로 작용했고, 시장 변동성은 크게 확대되었습니다.',
    stats: [
      { label: '브렌트유 (Brent)', value: '$103 돌파', subtext: '장중 최고가', trend: 'up' },
      { label: 'WTI 유가 (WTI)', value: '$99 육박', subtext: '2022년 이후 최고', trend: 'up' },
      { label: 'VIX 지수', value: '27 초과', subtext: '시장 공포 심리 극대화', trend: 'up' },
      { label: '미 10년물 국채금리', value: '4.28% 상회', subtext: '인플레이션 압력 반영', trend: 'up' },
    ],
    theme: 'red',
    charts: [{ ticker: 'BZ=F' }, { ticker: 'TVC:US10Y' }],
  },
  {
    id: 5,
    type: 'comparison',
    turnId: 9,
    title: '유가 급등에 엇갈린 섹터별 희비',
    description:
      '호르무즈 해협 봉쇄 우려로 인한 공급 충격은 에너지 섹터에는 호재로, 연료비 부담이 커지는 운송 및 소비 관련 섹터에는 악재로 작용했습니다.',
    items: [
      {
        label: '에너지 (XLE)',
        value: '상승',
        description: '유가 급등의 직접적 수혜. 엑손모빌(XOM) 등 주가 강세.',
        highlight: true,
      },
      {
        label: '항공/운송',
        value: '하락',
        description: '연료비 부담 증가 우려. 유나이티드 항공(UAL) 등 큰 폭 하락.',
      },
      {
        label: '소비재',
        value: '하락',
        description: '소비 위축 우려로 투자 심리 악화.',
      },
    ],
    charts: [{ ticker: 'XOM' }, { ticker: 'UAL' }],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 11,
    icon: 'bank',
    title: '연준의 딜레마',
    subtitle: '유가 쇼크, 통화정책 경로에 불확실성 가중',
    description:
      '유가 급등이 기존의 높은 인플레이션에 기름을 붓는 격이 되면서, 연준은 인플레이션 억제와 경기 침체 방어라는 어려운 과제에 직면했습니다.',
    bullets: [
      '유가 급등, 기존 인플레이션 압력에 추가 부담',
      '인플레이션 억제(긴축 유지) vs 경기 침체 방어(완화) 딜레마',
      '시장의 금리 인하 기대감 후퇴, 국채 금리 상승',
      '다음 주 FOMC 금리 동결 확실시, 향후 정책 방향은 불투명',
    ],
    theme: 'red',
    charts: [{ ticker: 'TVC:US10Y' }],
  },
  {
    id: 7,
    type: 'stats',
    turnId: 15,
    title: '어도비(ADBE): 리더십 공백 우려',
    description:
      '1분기 매출과 이익 모두 월가 예상을 뛰어넘는 호실적을 기록했으나, 18년간 회사를 이끈 CEO의 갑작스러운 사임 발표가 주가 급락을 불렀습니다.',
    stats: [
      { label: '1분기 매출', value: '$64억', subtext: '예상치($62.8억) 상회', trend: 'up' },
      { label: '1분기 EPS', value: '$6.06', subtext: '예상치($5.87) 상회', trend: 'up' },
      { label: '핵심 이슈', value: 'CEO 사임', subtext: '18년 재임한 상징적 인물', trend: 'down' },
      { label: '주가 반응', value: '-7%', subtext: '리더십 공백 우려에 급락', trend: 'down' },
    ],
    theme: 'amber',
    charts: [{ ticker: 'ADBE' }],
  },
  {
    id: 8,
    type: 'stats',
    turnId: 19,
    title: '울타 뷰티(ULTA): 가이던스 실망',
    description:
      '4분기 실적은 양호했으나, 올해 연간 주당 순이익 전망치가 월가 컨센서스를 하회하면서 향후 수익성 둔화 우려를 자극했습니다.',
    stats: [
      { label: '4분기 매출', value: '$39억', subtext: '시장 예상치 상회', trend: 'up' },
      { label: '4분기 EPS', value: '$8.01', subtext: '시장 예상치 부합', trend: 'neutral' },
      { label: '2026년 EPS 전망', value: '$28.05~$28.55', subtext: '컨센서스($28.57) 하회', trend: 'down' },
      { label: '주가 반응', value: '-14%', subtext: '수익성 둔화 우려에 폭락', trend: 'down' },
    ],
    theme: 'amber',
    charts: [{ ticker: 'ULTA' }],
  },
  {
    id: 9,
    type: 'headline',
    turnId: 21,
    icon: 'search-check',
    title: '미래 성장 가시성이 관건',
    subtitle: '호실적에도 외면받은 기술주와 소비재주',
    description:
      '시장은 과거의 성과나 현재 실적보다 미래 성장 가시성을 얼마나 중요하게 여기는지를 명확히 보여주었습니다. 향후 성장세에 대한 확신을 주지 못하면 외면받을 수 있습니다.',
    bullets: [
      '어도비: 리더십 교체와 AI 경쟁 심화 우려',
      '울타 뷰티: 소비 둔화와 비용 증가에 따른 수익성 악화 우려',
      '현재 실적보다 미래 성장 스토리가 주가 결정',
    ],
    theme: 'purple',
    charts: [{ ticker: 'XLK' }, { ticker: 'XLY' }],
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'WDC',
    companyName: 'Western Digital',
    currentPrice: 272.29,
    dayChange: 11.11,
    dayChangePercent: 4.25,
    description:
      'AI 시대의 핵심 인프라 공급자로 주목받으며 주가가 상승 마감했습니다. 다만 장중 큰 변동성을 보이며 시장의 기대와 우려가 공존함을 드러냈습니다.',
    charts: [{ ticker: 'WDC' }],
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'WDC',
    title: '성장 스토리: AI 데이터 폭증의 수혜주',
    points: [
      '클라우드 부문 매출 28% 급증',
      '전체 매출 전년 동기 대비 25% 성장',
      '영업이익 90% 폭증',
      '지난 6개월간 주가 155% 상승',
    ],
    description:
      'AI 데이터 폭증의 직접적인 수혜를 받으며 폭발적인 실적 성장을 기록했습니다. 시장은 웨스턴 디지털을 AI 시대의 핵심 인프라 공급자로 평가하고 있습니다.',
    outlook: 'AI 인프라 확장과 함께 강력한 성장 모멘텀을 보이고 있습니다.',
    outlookColor: 'emerald',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'WDC',
    title: '숨겨진 리스크: 극심한 고객 집중도',
    points: [
      '단 3개 고객사가 전체 매출의 43% 차지',
      '소수 거대 클라우드 기업의 투자 계획에 운명이 좌우되는 구조',
      '고객사 한 곳의 주문 30% 감소 시, 전체 영업이익 4% 이상 감소 가능',
      '사업부 분할 이벤트 역시 실행 리스크 내포',
    ],
    description:
      '화려한 성장세 이면에는 소수 고객에 대한 높은 매출 의존도라는 리스크가 존재합니다. 이는 단일 고객의 변심이 회사 전체 수익성을 크게 흔들 수 있는 취약점입니다.',
    outlook: '현재 주가는 장밋빛 전망에 집중되어 있어, 잠재적 충격에 대한 안전마진이 부족해 보입니다. 리스크 관리가 필요한 시점입니다.',
    outlookColor: 'amber',
  },
  {
    id: 13,
    type: 'headline',
    turnId: 30,
    icon: 'cloud-fog',
    title: '안갯속 장세',
    subtitle: '뜨거운 물가와 차가운 소비의 충돌',
    description:
      '생산자물가지수는 예상보다 높게 나오며 인플레이션 우려를 키운 반면, 소매판매는 예상을 밑돌며 경기 둔화 가능성을 부각시켜 시장의 방향성을 혼란스럽게 했습니다.',
    bullets: [
      '생산자물가지수(PPI): 예상 상회, 인플레이션 우려 지속',
      '소매판매: 예상 하회, 경기 둔화 가능성 부각',
      '상반된 경제 지표에 시장 방향성 상실, 혼조세 마감',
    ],
    theme: 'blue',
  },
  {
    id: 14,
    type: 'events',
    turnId: 33,
    title: '향후 주요 경제 이벤트',
    description:
      '시장의 관심은 이제 소비 심리와 연준의 통화정책 방향에 집중되고 있습니다. 특히 다음 주 FOMC에서 공개될 점도표가 시장의 단기 방향을 결정할 것입니다.',
    events: [
      {
        date: '3월 15일',
        label: '미시간대 소비자심리지수',
        description: '소비자 체감 경기 및 기대 인플레이션 수치 발표',
      },
      {
        date: '3월 20일',
        label: 'FOMC 회의 결과 및 점도표 공개',
        description: '연내 금리 인하 횟수 전망이 3회에서 2회로 수정될지 여부가 최대 관심사',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '줄다리기 장세, 차분한 대응이 필요한 시점',
    tagline: '인플레이션 현실과 금리 인하 기대감 사이에서',
    description:
      '섣부른 예측보다 발표되는 경제 지표와 다음 주 FOMC의 신호를 확인하며, 거시 경제의 큰 흐름 속에서 자신의 투자 전략을 점검하는 지혜가 필요합니다.',
  },
];