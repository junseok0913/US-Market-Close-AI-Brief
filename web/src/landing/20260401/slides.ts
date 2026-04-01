import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-02',
    nutshell: '이란 지정학적 우려 완화에 따른 안도 랠리',
    description:
      '미국과 이란 간의 갈등 완화 기대감에 시장이 이틀 연속 강하게 반등했습니다. 유가가 안정되고 위험자산 선호 심리가 회복되었지만, 나이키의 급락에서 보듯 기업별 펀더멘털에 따른 차별화 장세가 뚜렷해지고 있습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '트럼프 대통령의 이란 철군 가능성 언급에 지정학적 리스크가 완화되면서 3대 지수 모두 상승했습니다. 유가는 하락하고 위험자산 선호 심리가 되살아났습니다.',
    indices: [
      { name: 'S&P 500', value: 6575.32, change: 46.80, changePercent: 0.72 },
      { name: 'NASDAQ', value: 21840.95, change: 250.32, changePercent: 1.16 },
      { name: 'DOW', value: 46565.74, change: 224.23, changePercent: 0.48 },
      { name: 'Russell 2000', value: 2512.37, change: 16.00, changePercent: 0.64 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 98.91, change: -2.47, changePercent: -2.44 },
      { name: 'Gold', value: 4784.60, change: 137.00, changePercent: 2.95 },
      { name: 'Dollar Index', value: 99.58, change: -0.38, changePercent: -0.38 },
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
    icon: 'globe',
    title: '지정학적 안도 랠리',
    subtitle: '이란 리스크 완화에 시장 환호',
    description:
      '지난 한 달간 시장을 짓눌렀던 이란과의 군사적 충돌 가능성이 크게 낮아지면서 위험자산 선호 심리가 뚜렷하게 회복되었습니다. 각종 자산 가격이 전쟁 위험 감소라는 하나의 방향을 가리켰습니다.',
    bullets: [
      'S&P 500, 나스닥 이틀 연속 상승폭 확대',
      'VIX 지수 7% 이상 하락하며 20선 하회',
      'WTI 유가 2.3% 하락, 배럴당 $99선',
      '10년물 국채 금리 상승, 금 가격 하락',
    ],
    theme: 'green',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '리스크-온 시그널',
    description:
      '이란과의 긴장 완화 소식에 안전자산에서 위험자산으로 자금이 이동하는 모습이 명확하게 나타났습니다.',
    stats: [
      { label: 'VIX 지수', value: '-7.1%', subtext: '변동성 완화', trend: 'down' },
      { label: 'WTI 유가', value: '-2.3%', subtext: '전쟁 프리미엄 해소', trend: 'down' },
      { label: '10년물 국채금리', value: '4.4%대', subtext: '안전자산 매도', trend: 'up' },
      { label: '금 가격', value: '$2,500 하회', subtext: '안전자산 선호 감소', trend: 'down' },
    ],
    theme: 'green',
    charts: [
      { ticker: 'TVC:VIX', title: 'VIX Index' },
      { ticker: 'NYMEX:CL1!', title: 'WTI Crude Oil' },
    ],
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 9,
    title: '유가 하락의 명과 암',
    description:
      '유가 안정은 업종별로 희비를 갈랐습니다. 비용 부담이 줄어든 항공주는 급등한 반면, 그동안 수혜를 봤던 에너지와 방산주는 약세를 보였습니다.',
    items: [
      {
        label: '수혜 업종 (Winners)',
        value: '항공/운송',
        description: '유나이티드(+3%), 델타(+3%), 아메리칸(+4%) 등 비용 부담 감소 기대로 강세',
        highlight: true,
      },
      {
        label: '피해 업종 (Losers)',
        value: '에너지',
        description: '엑슨모빌, 셰브론 등 유가 하락과 함께 동반 하락. XLE ETF 1% 이상 하락',
        highlight: false,
      },
      {
        label: '피해 업종 (Losers)',
        value: '방위산업',
        description: '록히드마틴, 노스롭그루먼 등 지정학적 긴장 완화로 프리미엄 해소',
        highlight: false,
      },
    ],
  },
  {
    id: 5,
    type: 'stats',
    turnId: 13,
    title: '견조한 경제 지표',
    description:
      '오늘 발표된 경제 지표들은 미국 경제의 견조함을 재확인시켜 주었으나, 지정학적 호재에 묻혀 시장에 큰 영향을 주지는 못했습니다.',
    stats: [
      { label: '주간 신규 실업수당 청구', value: '예상치 하회', subtext: '견조한 고용시장 재확인', trend: 'up' },
      { label: '무역수지 적자', value: '예상보다 감소', subtext: '긍정적 경제 신호', trend: 'up' },
      { label: '시장의 반응', value: '미미함', subtext: '지정학적 호재에 쏠림', trend: 'neutral' },
    ],
    note: '현재 시장은 거시 경제 펀더멘털보다 중동 지역의 지정학적 변수에 훨씬 더 민감하게 반응하고 있습니다.',
    theme: 'blue',
  },
  {
    id: 6,
    type: 'headline',
    turnId: 14,
    icon: 'git-compare',
    title: '엇갈린 기업들의 희비',
    subtitle: '거시 훈풍 속 종목 장세 심화',
    description:
      '시장은 전반적으로 안도 랠리를 펼쳤지만, 모든 종목이 상승한 것은 아니었습니다. 개별 기업의 기초 체력, 즉 펀더멘털에 따라 주가 흐름이 극명하게 갈리는 모습이었습니다.',
    bullets: [
      '헬스케어: 일라이 릴리 호재로 상승 주도',
      '소비재: 나이키 부진으로 상대적 약세',
      '금리 부담: 10년물 국채금리 높은 수준 유지',
      '시장 관심: 개별 기업 펀더멘털로 이동',
    ],
    theme: 'purple',
  },
  {
    id: 7,
    type: 'headline',
    turnId: 17,
    title: 'Eli Lilly (LLY)',
    subtitle: '경구용 비만약 승인에 5% 급등',
    description:
      '일라이 릴리는 먹는 형태의 비만 치료제 ‘파운대요’가 FDA 승인을 받았다는 소식에 5% 넘게 급등했습니다. 복용 편의성을 획기적으로 개선해 시장의 판도를 바꿀 ‘게임 체인저’로 평가받고 있습니다.',
    bullets: [
      'FDA, 경구용 비만 치료제 ‘파운대요’ 승인',
      '주사제 대비 획기적인 복용 편의성 확보',
      '더 넓은 환자층 공략 가능성 부각',
      '강력한 신약 파이프라인의 성장 동력 입증',
    ],
    theme: 'green',
    charts: [
      { ticker: 'LLY', title: 'Eli Lilly' },
      { ticker: 'XLV', title: 'Health Care Sector ETF' },
    ],
  },
  {
    id: 8,
    type: 'headline',
    turnId: 19,
    title: 'Nike (NKE)',
    subtitle: '실망스러운 전망에 13% 급락',
    description:
      '나이키는 시장 훈풍에도 불구하고 13% 넘게 급락하며 11년 만의 최저 수준으로 주저앉았습니다. 핵심 시장인 중국에서의 부진과 유가 상승에 따른 원가 부담이 악재로 작용했습니다.',
    bullets: [
      '핵심 시장인 중국 매출 부진 심화',
      '차기 분기 중국 매출 20% 급감 예상',
      '유가 상승, 공급망 불안으로 원가 부담 가중',
      '구조적 문제와 거시적 악재 동시 노출',
    ],
    theme: 'red',
    charts: [
      { ticker: 'NKE', title: 'Nike Inc.' },
      { ticker: 'XLY', title: 'Consumer Discretionary ETF' },
    ],
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'NEM',
    companyName: 'Newmont Corporation',
    currentPrice: 113.79,
    dayChange: 5.54,
    dayChangePercent: 5.12,
    description:
      '세계 최대 금광 업체 뉴몬트가 특별한 개별 뉴스 없이 5% 넘게 급등하며 시장의 주목을 받았습니다. 시장은 뉴몬트를 단순한 원자재 기업이 아닌 AI 산업의 숨은 수혜주로 주목하고 있습니다.',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'NEM',
    title: '성장 스토리: ‘리소스 테크’로의 변모',
    points: [
      'AI 데이터센터/에너지 전환에 필수적인 구리 자산 확보 (뉴크레스트 인수)',
      '금 가격 상승으로 창출된 현금흐름을 기술 혁신에 투자',
      '자율 주행 채굴 시스템 등 첨단 기술 도입으로 효율성 증대',
      '전통 원자재 기업을 넘어 성장주로 재평가되는 내러티브 형성',
    ],
    outlook: '투자자들은 뉴몬트가 전통적인 원자재 기업의 한계를 넘어 ‘리소스 테크’ 기업으로 변모하고 있다는 성장 스토리에 베팅하고 있습니다.',
    outlookColor: 'amber',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'NEM',
    title: '숨겨진 리스크: 간과된 운영 문제',
    points: [
      '가나 정부, 로열티 최대 12% 인상 법안 추진 (수익성 직접 타격)',
      '호주 카디아 광산, 분진 배출 문제로 다수 소송 진행 중',
      '예측 불가능한 벌금 및 생산 차질로 이어질 수 있는 잠재적 리스크',
      '현재 주가는 연차보고서에 명시된 리스크들을 충분히 반영하지 않음',
    ],
    outlook: '화려한 성장 스토리 이면에는 투자자들이 간과하고 있는 구체적인 비용 증가 요인과 규제 리스크가 존재합니다.',
    outlookColor: 'rose',
  },
  {
    id: 12,
    type: 'stats',
    turnId: 27,
    ticker: 'NEM',
    title: '리스크의 정량적 분석',
    description:
      '시장의 낙관론은 구체적인 숫자로 계산 가능한 실질적인 가치 훼손 가능성을 외면하고 있습니다.',
    stats: [
      { label: '가나 로열티 인상 시', value: 'EPS $0.09 감소', subtext: '매출 기준 추정치', trend: 'down' },
      { label: '2025년 보고된 EPS', value: '$6.39', subtext: '자산 매각 일회성 이익 포함', trend: 'neutral' },
      { label: '매출 본질', value: '85%', subtext: '금(Gold)에서 발생', trend: 'neutral' },
    ],
    note: '일회성 이익을 제외하면 실제 이익 창출 능력은 시장 기대에 미치지 못할 수 있으며, 주가 고평가 가능성이 제기됩니다.',
    theme: 'red',
  },
  {
    id: 13,
    type: 'events',
    turnId: 33,
    title: '향후 주요 경제 지표',
    description:
      '지정학적 리스크가 완화된 가운데, 시장의 관심은 다시 거시 경제 펀더멘털로 이동할 것입니다. 향후 발표될 주요 지표들이 연준의 통화정책 경로에 대한 단서를 제공할 전망입니다.',
    events: [
      {
        date: '4월 3일',
        label: '3월 고용보고서',
        description: '비농업 고용, 실업률, 시간당 임금 상승률 주목',
      },
      {
        date: '4월 6일',
        label: 'ISM 서비스업 PMI',
        description: '서비스업 경기 동향 파악',
      },
      {
        date: '4월 10일',
        label: '3월 소비자물가지수(CPI)',
        description: '연준 통화정책 경로를 결정할 핵심 단서',
      },
    ],
  },
  {
    id: 14,
    type: 'closing',
    turnId: 37,
    headline: '안도 랠리 속 옥석 가리기',
    tagline: '거시 훈풍 속 펀더멘털 차별화 심화',
    description:
      '이란 리스크 완화로 시장은 안도 랠리를 보였지만, 모든 종목이 함께 오르는 장은 아니었습니다. 일라이 릴리와 나이키의 사례에서 보듯, 이제는 기업 고유의 펀더멘털과 성장 동력이 주가를 결정하는 핵심 요인입니다. 거시적 안도감에 편승하기보다 개별 기업의 기초 체력을 꼼꼼히 분석해야 할 시점입니다.',
  },
];