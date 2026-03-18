import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-19',
    nutshell: 'FOMC 경계감 속 기술주 중심의 차익 실현',
    description:
      '3월 19일 미국 증시는 연준의 FOMC 회의 결과를 앞두고 3대 지수 모두 하락했습니다. 특히 엔비디아 GTC 컨퍼런스라는 대형 이벤트에도 불구하고 기술주 중심의 차익 실현 매물이 출회되며 시장의 하방 압력을 높였습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '연방공개시장위원회(FOMC) 회의 결과를 앞두고 시장은 위험자산 비중을 줄이는 모습을 보였습니다. 최근 발표된 인플레이션 지표에 대한 부담감으로 3대 지수 모두 1% 이상 하락 마감했습니다.',
    indices: [
      { name: 'S&P 500', value: 6624.70, change: -91.39, changePercent: -1.36 },
      { name: 'NASDAQ', value: 22152.42, change: -327.11, changePercent: -1.46 },
      { name: 'DOW', value: 46225.15, change: -768.11, changePercent: -1.63 },
      { name: 'Russell 2000', value: 2478.64, change: -41.35, changePercent: -1.64 },
    ],
    commodities: [
      { name: '미 10년물 국채금리', value: 4.26, change: 0.06, changePercent: 1.36 },
      { name: '달러 인덱스', value: 100.28, change: 0.69, changePercent: 0.70 },
      { name: 'WTI 유가', value: 99.20, change: 2.99, changePercent: 3.11 },
      { name: '금 선물', value: 4824.10, change: -176.90, changePercent: -3.54 },
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
    turnId: 6,
    icon: 'trending-down',
    title: 'FOMC 경계감 최고조',
    subtitle: '인플레이션 우려가 시장을 짓누르다',
    description:
      '최근 발표된 생산자물가지수(PPI)가 예상치를 크게 상회하면서, 연준이 매파적으로 돌아설 수 있다는 우려가 시장 전반의 위험 회피 심리를 자극했습니다.',
    bullets: [
      '3대 지수 전방위적 하락 (다우 4개월래 최저)',
      '2월 생산자물가지수(PPI) 예상치 상회, 인플레 공포 자극',
      '10년물 국채금리 4.2%대 재진입, 달러 강세',
      'WTI 유가 배럴당 $98 육박, 에너지 가격 불안 가중',
    ],
    theme: 'red',
    charts: [{ ticker: 'DJ:DJI' }, { ticker: 'TVC:US10Y' }],
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '시장의 위험 회피 심리 지표',
    description:
      '인플레이션과 금리 인상에 대한 우려가 주요 경제 지표에 반영되며 투자 심리가 위축되었습니다. 국채금리와 달러, 유가 모두 상승하며 안전자산 선호 및 비용 압박 우려를 키웠습니다.',
    stats: [
      { label: '다우존스 지수', value: '-1.63%', subtext: '4개월 만에 최저 수준', trend: 'down' },
      { label: '10년물 국채금리', value: '4.2%대', subtext: '금리 인하 기대 후퇴', trend: 'up' },
      { label: '달러 인덱스', value: '100 상회', subtext: '안전자산 선호 심리', trend: 'up' },
      { label: 'WTI 유가', value: '$98 육박', subtext: '지정학적 긴장 고조', trend: 'up' },
    ],
    theme: 'red',
    charts: [{ ticker: 'TVC:US10Y' }, { ticker: 'TVC:DXY' }],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 9,
    icon: 'chart-dots',
    title: '시장의 눈은 \'점도표\'로',
    subtitle: '연준의 금리 인하 횟수 전망이 최대 관심사',
    description:
      '시장의 가장 큰 두려움은 연준이 올해 금리 인하 횟수 전망을 기존 3회에서 2회나 그 이하로 줄이는 것입니다. 파월 의장의 발언 톤과 점도표의 변화가 향후 시장의 방향을 결정할 것입니다.',
    bullets: [
      '시장 최대 우려: 연내 금리 인하 횟수 3회 → 2회 이하로 축소',
      '끈적한 인플레이션 데이터가 매파적 스탠스 압박',
      '파월 의장의 기자회견 발언 톤에 촉각',
      '불확실성 회피 위한 선제적 자산 매도 움직임',
    ],
    theme: 'amber',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 11,
    icon: 'activity',
    title: '고금리, 기술주에 직격탄',
    subtitle: '미래가치 할인 부담에 나스닥 급락',
    description:
      '고금리 환경은 미래 성장성에 대한 기대로 높은 가치를 인정받는 기술주에 특히 불리하게 작용합니다. 거시 경제의 금리 압박이 개별 기업의 호재를 압도할 수 있음을 보여준 하루였습니다.',
    bullets: [
      '고금리 환경은 미래 현금흐름 가치를 할인',
      '미래 성장 기대가 높은 기술주에 특히 불리',
      '자금 조달 비용 증가 & 안전자산(채권) 매력도 상승',
      '거시 경제 압박이 NVDA 같은 개별 기업 호재를 압도',
    ],
    theme: 'amber',
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'TVC:US10Y' }, { ticker: 'NASDAQ:NVDA' }],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 14,
    icon: 'cpu',
    title: 'NVIDIA GTC 2026',
    subtitle: '기대 속 차익 실현, \'뉴스에 팔아라\'',
    description:
      '시장의 기대를 한 몸에 받았던 엔비디아의 GTC 컨퍼런스가 오히려 차익실현의 신호탄이 되었습니다. 차세대 칩 공개에도 불구하고 주가가 하락하며 관련 기술주들의 동반 하락을 이끌었습니다.',
    bullets: [
      '차세대 AI 칩 \'블랙웰\' 공개에도 주가 하락',
      '필라델피아 반도체 지수 1.5% 이상 하락',
      '슈퍼마이크로컴퓨터(SMCI) 9% 가까이 급락',
      '거시경제 불확실성이 개별 기업 호재 압도',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NASDAQ:NVDA' }, { ticker: 'NASDAQ:SMCI' }, { ticker: 'SOX:SOX' }],
  },
  {
    id: 7,
    type: 'stats',
    turnId: 17,
    title: '차세대 AI 칩 \'블랙웰\' 공개',
    description:
      '기술적으로는 기대를 훨씬 웃도는 수준의 발표였습니다. 엔비디아는 압도적인 성능의 B200 칩과 함께 추론 시장으로의 확장 전략을 제시하며 장기 성장 비전을 과시했습니다.',
    stats: [
      { label: 'AI 훈련 성능', value: '최대 4배', subtext: 'vs H100', trend: 'up' },
      { label: 'AI 추론 성능', value: '최대 30배', subtext: 'vs H100', trend: 'up' },
      { label: '데이터센터 매출 비전', value: '$1조', subtext: '2027년까지', trend: 'up' },
    ],
    note: '추론 전용칩 스타트업 그록(Grok) 기술 인수, \'그록 3\' 프로세서 공개',
    theme: 'blue',
  },
  {
    id: 8,
    type: 'comparison',
    turnId: 19,
    title: '기대와 현실: NVDA 주가 하락 요인',
    description:
      '엔비디아의 주가 하락은 혁신적인 신제품 발표에도 불구하고, 이미 주가에 과도하게 반영된 기대감과 시장 전반을 짓누르는 거시경제적 불안감이 복합적으로 작용한 결과입니다.',
    items: [
      {
        label: '긍정적 요인 (기대)',
        value: '혁신적 신제품',
        description: '블랙웰 칩의 압도적 성능과 장기 성장 비전 제시',
        highlight: false,
      },
      {
        label: '부정적 요인 (현실)',
        value: '과도한 선반영',
        description: '컨퍼런스 기대감으로 연초 이후 80% 가까이 급등한 주가 부담',
        highlight: true,
      },
      {
        label: '거시경제 압박',
        value: 'FOMC 경계감',
        description: '금리 우려가 기술주 전반의 투자 심리를 위축시키며 차익 실현 빌미 제공',
        highlight: true,
      },
    ],
    charts: [{ ticker: 'NASDAQ:NVDA' }, { ticker: 'NASDAQ:MRVL' }],
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 20,
    ticker: 'SBUX',
    companyName: 'Starbucks',
    currentPrice: 92.66,
    dayChange: -4.91,
    dayChangePercent: -5.03,
    description:
      '스타벅스는 장중 한때 96달러를 넘어서기도 했으나, 장 후반으로 갈수록 낙폭을 키우며 3.6% 넘게 하락 마감했습니다. 회사의 비용 구조에 대한 시장의 우려가 부각되었습니다.',
    charts: [{ ticker: 'NASDAQ:SBUX' }],
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 21,
    ticker: 'SBUX',
    title: '비용 구조 악화에 대한 우려 (Bear Case)',
    points: [
      '북미 사업부 영업이익률 급락 (16.7% → 11.9%)',
      '이익률 하락의 주원인은 인건비 투자 (260bp 영향)',
      '일회성이 아닌 구조적, 영구적 비용 증가로 해석',
      '가격 인상만으로 비용 압박 상쇄에 한계 봉착 가능성',
    ],
    outlook: '구조적 비용 압박이 주가에 부담으로 작용하고 있으며, 시장은 수익성 악화 가능성을 주시하고 있습니다.',
    outlookColor: 'rose',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'SBUX',
    title: '성장을 위한 \'J커브\' 투자 (Bull Case)',
    points: [
      '현재의 비용 증가는 미래 성장을 위한 투자 구간으로 해석',
      '노동 집약적 모델 → 기술 집약적 모델로 전환 중',
      '\'사이렌 시스템\', \'딥브루\' AI 등 자동화 기술 도입',
      '장기적 마진 확장 및 글로벌 음료 플랫폼 기업으로의 재탄생 기대',
    ],
    outlook: '기술 투자를 통한 장기적인 효율성 개선과 새로운 성장 동력 확보에 대한 기대감이 존재합니다.',
    outlookColor: 'emerald',
  },
  {
    id: 12,
    type: 'comparison',
    turnId: 25,
    title: '스타벅스 투자 논쟁: 현실 vs 미래',
    description:
      '현재 스타벅스는 구조적으로 높아진 인건비라는 명확한 현실과, 기술 혁신을 통한 턴어라운드라는 불확실한 미래 사이에서 줄다리기를 하고 있는 형국입니다.',
    items: [
      {
        label: '현실 (Bear)',
        value: '명확한 비용 증가',
        description: '구조적으로 높아진 인건비가 현재 수익성을 명백히 훼손하고 있음',
        highlight: true,
      },
      {
        label: '미래 (Bull)',
        value: '불확실한 기술 혁신',
        description: '자동화/AI를 통한 턴어라운드 스토리는 아직 숫자로 증명되지 않은 기대',
        highlight: false,
      },
      {
        label: '안전판',
        value: '강력한 브랜드 파워',
        description: '글로벌 동일 매장 매출 4% 성장이 주가 급락을 방어하는 요인',
        highlight: false,
      },
    ],
    charts: [{ ticker: 'NASDAQ:SBUX' }],
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'SBUX',
    title: '투자 판단: 균형점에서의 관망',
    points: [
      '강력한 브랜드 파워와 4%대 동일매장 매출 성장은 주가 하방 지지',
      '악화된 비용 구조와 턴어라운드 전략의 불확실성은 주가 상방 제약',
      '긍정적 요인과 부정적 요인이 팽팽하게 맞서는 균형점에 근접',
    ],
    outlook: '\'Back to Starbucks\' 전략이 실제 숫자로 증명되는지 확인하며 신중한 접근이 필요한 시점입니다.',
    outlookColor: 'amber',
  },
  {
    id: 14,
    type: 'events',
    turnId: 29,
    title: '이번 주 주목해야 할 주요 이벤트',
    description:
      '모든 관심은 FOMC 결과에 쏠려있지만, 이후 발표될 고용 및 제조업 지표 역시 미국 경제의 건전성을 가늠하고 시장에 영향을 줄 수 있는 중요한 변수입니다.',
    events: [
      {
        date: '3/20',
        label: 'FOMC 금리 결정 및 경제전망요약(SEP)',
        description: '점도표를 통해 연준의 향후 금리 경로 확인',
      },
      {
        date: '3/20',
        label: '파월 연준 의장 기자회견',
        description: '기자회견 발언 톤이 시장 방향성 결정',
      },
      {
        date: '3/21',
        label: '주간 신규 실업수당 청구 건수',
        description: '고용 시장 건전성 확인',
      },
      {
        date: '3/21',
        label: 'S&P 글로벌 PMI 예비치',
        description: '제조업 및 서비스업 경기 동향 파악',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 33,
    headline: '변동성 장세, 거시 경제의 큰 그림을 보라',
    tagline: '섣부른 예측보다 차분한 해석과 대응이 필요한 시점',
    description:
      '연준의 통화정책이라는 큰 이벤트를 앞두고 시장의 변동성이 확대될 수 있습니다. 단기적인 결과에 일희일비하기보다는, 연준이 제시하는 거시 경제 전망과 정책의 큰 그림을 이해하고 자신의 투자 전략을 재점검하는 기회로 삼는 것이 중요합니다.',
  },
];