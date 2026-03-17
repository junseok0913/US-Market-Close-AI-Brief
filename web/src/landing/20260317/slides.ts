import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-18',
    nutshell: '연준 회의 경계감 속 AI 모멘텀 지속',
    description:
      'FOMC 회의를 앞둔 경계감과 엔비디아 GTC 컨퍼런스가 촉발한 AI 기대감이 공존하며 시장이 움직였습니다. 오늘 브리핑에서는 거시 경제의 불확실성과 기술주 모멘텀, 그리고 부킹 홀딩스(BKNG)의 성장과 리스크를 심층 분석합니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '주요 지수는 FOMC 회의에 대한 관망세 속에서도 엔비디아발 AI 모멘텀에 힘입어 이틀 연속 상승 마감했습니다. 유가 상승과 국채금리 상승 등 거시적 압박 요인도 뚜렷했습니다.',
    indices: [
      { name: 'S&P 500', value: 6716.09, change: 16.71, changePercent: 0.25 },
      { name: 'NASDAQ', value: 22479.53, change: 105.35, changePercent: 0.47 },
      { name: 'DOW', value: 46993.26, change: 46.85, changePercent: 0.10 },
      { name: 'Russell 2000', value: 2519.99, change: 16.70, changePercent: 0.67 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 95.31, change: 1.81, changePercent: 1.94 },
      { name: '10Y Treasury', value: 4.2, change: 0.02, changePercent: 0.48 },
      { name: 'Gold Futures', value: 5009.00, change: 15.00, changePercent: 0.30 },
      { name: 'Dollar Index', value: 27.68, change: -0.05, changePercent: -0.18 },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ Composite' },
      { ticker: 'DJ:DJI', title: 'Dow Jones' },
      { ticker: 'TVC:RUT', title: 'Russell 2000' },
    ],
  },
  {
    id: 2,
    type: 'comparison',
    turnId: 3,
    title: '시장을 움직인 상반된 두 힘',
    description:
      '거시 경제의 불확실성과 기술주의 성장 모멘텀이 충돌하며 시장의 방향성을 탐색하는 하루였습니다.',
    items: [
      {
        label: '거시적 압박 (Macro)',
        value: '경계감 확산',
        description: '이란 분쟁으로 인한 유가 상승, 인플레이션 우려, 연준의 긴축 장기화 가능성',
        highlight: false,
      },
      {
        label: '미시적 동력 (Micro)',
        value: '기대감 지속',
        description: '엔비디아 GTC 컨퍼런스, 차세대 AI 칩 공개, 장밋빛 미래 전망에 따른 기술주 투자 심리 자극',
        highlight: true,
      },
    ],
  },
  {
    id: 3,
    type: 'headline',
    turnId: 7,
    icon: 'alert-triangle',
    title: '연준을 압박하는 지정학적 리스크',
    subtitle: '유가 급등과 인플레이션 우려 재점화',
    description:
      '이란 분쟁으로 국제 유가가 급등하면서 인플레이션 우려가 다시 커지고 있습니다. 이는 연준의 금리 인하 결정을 더욱 어렵게 만드는 핵심 변수로 작용하고 있습니다.',
    bullets: [
      '서부 텍사스산 원유(WTI) 배럴당 $95 돌파',
      '10년물 국채금리 4.2% 수준까지 상승',
      '미국 달러 인덱스 강세 (100 근접)',
      'S&P 500 내 에너지 섹터만 두드러진 강세',
    ],
    theme: 'red',
    charts: [
      { ticker: 'NYMEX:CL', title: 'WTI Crude Oil Futures' },
      { ticker: 'TVC:US10Y', title: 'US 10-Year Treasury Yield' },
    ],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 9,
    title: '급격히 식어가는 금리 인하 기대감',
    description:
      '유가 급등으로 스태그플레이션 우려까지 제기되면서, 시장의 금리 인하 전망이 빠르게 후퇴하고 있습니다. 모든 관심은 연준의 새로운 점도표에 집중되고 있습니다.',
    stats: [
      { label: '연내 금리 인하 확률', value: '68%', subtext: '한 달 전 97%에서 급락', trend: 'down' },
      { label: '예상 인하 시점', value: '4분기', subtext: '기존 중반에서 10월/12월로 지연', trend: 'down' },
      { label: '핵심 관전 포인트', value: '점도표', subtext: '연내 인하 횟수 전망치 변화', trend: 'neutral' },
    ],
    theme: 'red',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 11,
    icon: 'shield-check',
    title: '불확실성 속 안전자산으로의 이동',
    subtitle: '위험 회피와 인플레이션 헤지 수요 증가',
    description:
      '시장의 불확실성이 커지자 투자자들은 위험을 회피하고 인플레이션에 대비할 수 있는 자산으로 이동하는 뚜렷한 움직임을 보였습니다.',
    bullets: [
      '에너지 섹터 ETF(XLE) 연중 최고치 경신',
      '금(Gold) 온스당 $5,000선에서 안정적 흐름',
      '변동성 지수(VIX) 22 수준으로 여전히 높은 수준 유지',
      '시장 표면 아래에서 뚜렷한 자산 재분배 발생',
    ],
    theme: 'gold',
    charts: [
      { ticker: 'AMEX:XLE', title: 'Energy Select Sector SPDR Fund' },
      { ticker: 'TVC:VIX', title: 'Volatility Index' },
    ],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 15,
    icon: 'cpu',
    title: 'NVIDIA GTC 2026: AI 혁명의 가속화',
    subtitle: '1조 달러 비전 제시하며 시장의 상상력 자극',
    description:
      '엔비디아는 GTC 컨퍼런스에서 차세대 칩과 AI 생태계 확장 계획을 발표하며, AI 시대의 지배자로서의 위상을 재확인했습니다. 이는 기술주 전반에 긍정적인 영향을 미쳤습니다.',
    bullets: [
      '차세대 아키텍처 \'베라 루빈\' 공개',
      '2027년까지 누적 매출 1조 달러 전망 제시',
      '로보틱스, 자율주행, 헬스케어 등 생태계 확장 계획 발표',
      '기술주 중심의 나스닥 지수 0.47% 상승 견인',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NASDAQ:NVDA', title: 'NVIDIA Corp' }],
  },
  {
    id: 7,
    type: 'stats',
    turnId: 17,
    title: "'뉴스에 팔아라' 현실화된 엔비디아",
    description:
      'GTC의 장밋빛 전망에도 불구하고 엔비디아 주가는 차익 실현 매물에 하락 마감했습니다. 시장의 높은 기대감이 이미 주가에 상당 부분 선반영되었다는 분석입니다.',
    stats: [
      { label: '장중 최고가', value: '+4.8%', subtext: '발표 직후 급등', trend: 'up' },
      { label: '최종 종가', value: '-0.7%', subtext: '차익 실현 매물 출회', trend: 'down' },
      { label: '시장 해석', value: '기대 선반영', subtext: '예상 뛰어넘는 서프라이즈는 부재', trend: 'neutral' },
    ],
    note: '일부에서는 AI 버블에 대한 경계 심리도 작용한 것으로 분석됩니다.',
    theme: 'blue',
  },
  {
    id: 8,
    type: 'comparison',
    turnId: 18,
    title: 'GTC 2026: 기대와 현실',
    description:
      '엔비디아의 주가는 단기 차익 실현으로 하락했지만, 컨퍼런스가 제시한 장기 비전은 AI 생태계 전체에 긍정적인 신호를 보냈습니다.',
    items: [
      {
        label: '단기 주가 반응 (현실)',
        value: '차익 실현',
        description: '뉴스에 파는 전형적 패턴. 장중 급등 후 하락 마감하며 단기 과열에 대한 경계감 반영.',
        highlight: false,
      },
      {
        label: '장기 생태계 영향 (기대)',
        value: '낙수 효과',
        description: '1조 달러 비전 제시. 사운드하운드, 우버 등 파트너사들의 성장 가능성을 부각시키며 산업 전반에 긍정적 파급 효과.',
        highlight: true,
      },
    ],
  },
  {
    id: 9,
    type: 'headline',
    turnId: 19,
    icon: 'share-2',
    title: 'AI 생태계 전반으로 퍼지는 온기',
    subtitle: '엔비디아 발 기술 확산과 낙수효과',
    description:
      '엔비디아의 비전은 칩을 기반으로 사업을 영위하는 다양한 산업의 기업들에게 긍정적인 성장 가능성을 제시하며 생태계 전반에 활력을 불어넣었습니다.',
    bullets: [
      '사운드하운드(SOUN): 차량용 음성 AI 플랫폼 공개 후 주가 3% 상승',
      '우버(UBER): 2028년까지 28개 도시에 로보택시 배포 협력',
      '로슈(RHHBY): 신약 개발 위해 엔비디아 칩 대거 도입',
      '소프트웨어 및 서비스 기업들의 동반 성장 기대감 확산',
    ],
    theme: 'green',
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 20,
    ticker: 'BKNG',
    companyName: 'Booking Holdings',
    currentPrice: 4442.33,
    dayChange: 149.31,
    dayChangePercent: 3.48,
    description:
      '글로벌 온라인 여행사 부킹 홀딩스가 AI 기반 종합 여행 플랫폼으로의 진화 기대감에 3% 이상 상승하며 시장의 주목을 받았습니다.',
    charts: [{ ticker: 'NASDAQ:BKNG', title: 'Booking Holdings Inc.' }],
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 21,
    ticker: 'BKNG',
    title: '성장 스토리: AI 기반 ‘커넥티드 트립’',
    points: [
      '단순 숙박 예약을 넘어 항공, 렌터카, 즐길 거리를 아우르는 종합 여행 플랫폼으로 진화 중',
      '2025년 실적 기준, 항공권 예약 37%, 즐길 거리 예약 80% 폭발적 성장',
      '결제까지 직접 통제하는 \'머천트 모델\'의 총 예약액 24.8% 증가하며 플랫폼 지배력 강화',
      'AI 기술을 활용한 개인화 추천 및 서비스 고도화 기대',
    ],
    outlook: 'AI 기술을 통한 사업 다각화와 수익성 개선이 핵심 성장 동력으로 평가받고 있습니다.',
    outlookColor: 'emerald',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'BKNG',
    title: '숨겨진 리스크: 유럽의 규제 압박',
    points: [
      'EU 디지털 시장법(DMA)이 핵심 경쟁 우위인 \'가격 동등성 조항\'을 직접적으로 위협',
      '스페인 경쟁 당국으로부터 약 4.85억 유로의 거액 벌금 부과',
      '스위스, 프랑스, 그리스 등 유럽 전역에서 유사한 조사가 동시다발적으로 진행 중',
      '규제 리스크가 일회성이 아닌 시스템적 위협으로 번질 가능성',
    ],
    outlook: '단순 벌금을 넘어 사업 모델의 근간을 흔들 수 있는 구조적 위협에 대한 신중한 평가가 필요합니다.',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'comparison',
    turnId: 27,
    title: '부킹 홀딩스: 기대와 우려 사이',
    description:
      '시장은 ‘커넥티드 트립’이라는 미래 성장성에 환호하고 있지만, 그 이면에는 유럽의 규제 강화라는 명백한 위험이 도사리고 있습니다.',
    items: [
      {
        label: '성장 비전 (Bull)',
        value: '미래 가능성',
        description: 'AI 기반 종합 여행 플랫폼으로의 진화, 사업 다각화를 통한 성장 잠재력',
        highlight: true,
      },
      {
        label: '규제 리스크 (Bear)',
        value: '현재의 위협',
        description: 'EU의 DMA, 거액의 벌금, 사업 모델의 근간을 위협하는 구조적 위험',
        highlight: false,
      },
    ],
  },
  {
    id: 14,
    type: 'events',
    turnId: 29,
    title: '이번 주 주요 경제 이벤트',
    description:
      '이번 주는 연준의 통화정책 방향성과 실물 경제의 온도를 확인할 수 있는 중요한 지표 발표가 예정되어 있습니다.',
    events: [
      {
        date: '3/19 (화)',
        label: '2월 주택착공건수',
        description: '금리에 민감한 주택 시장의 건전성 확인',
      },
      {
        date: '3/20 (수)',
        label: 'FOMC 금리 결정 & 점도표 공개',
        description: '연내 금리 인하 경로에 대한 연준의 시각이 최대 관심사',
      },
      {
        date: '3/21 (목)',
        label: '3월 제조업/서비스업 PMI 예비치',
        description: '미국 경제의 성장 동력을 가늠할 수 있는 속보성 지표',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 35,
    headline: '연준의 입에 쏠린 시장의 눈',
    tagline: '변동성 대비하며 큰 흐름에 대응할 때',
    description:
      '최근 시장은 금리 인하 기대감을 선반영하며 상승했지만, 연준이 매파적 신호를 보낼 경우 변동성이 확대될 수 있습니다. 단기 예측보다는 핵심 지표를 확인하며 장기적인 관점에서 대응하는 전략이 필요합니다.',
  },
];