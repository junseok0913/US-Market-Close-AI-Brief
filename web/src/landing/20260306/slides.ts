import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-07',
    nutshell: '경기 침체 공포와 유가 급등, 스태그플레이션 우려에 시장 급락',
    description:
      '예상보다 훨씬 부진한 고용 지표와 중동의 지정학적 리스크로 인한 유가 폭등이라는 두 가지 악재가 동시에 시장을 덮쳤습니다. 오늘 브리핑에서는 시장을 강타한 핵심 요인들을 분석하고, 어플라이드 머티리얼즈(AMAT)의 변동성을 심층 진단합니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '모든 지수가 큰 폭으로 하락하며 시장 전반에 걸쳐 매도세가 뚜렷한 하루였습니다. 경기 침체 공포와 유가 급등이 스태그플레이션 우려를 자극하며 투자 심리를 급격히 위축시켰습니다.',
    indices: [
      { name: 'S&P 500', value: 6740.02, change: -90.69, changePercent: -1.33 },
      { name: 'NASDAQ', value: 22387.68, change: -361.31, changePercent: -1.59 },
      { name: 'DOW', value: 47501.55, change: -453.19, changePercent: -0.95 },
      { name: 'Russell 2000', value: 2525.30, change: -60.27, changePercent: -2.33 },
    ],
    commodities: [
      { name: 'WTI Crude (CL=F)', value: 90.90, change: 9.89, changePercent: 12.21 },
      { name: 'Gold Futures', value: 5146.10, change: 80.80, changePercent: 1.60 },
      { name: 'Dollar Index', value: 98.99, change: -0.33, changePercent: -0.33 },
      { name: 'VIX', value: 29.15, change: 7.15, changePercent: 32.5 },
    ],
    charts: [
      { ticker: 'SP:SPX' },
      { ticker: 'NASDAQ:IXIC' },
      { ticker: 'DJ:DJI' },
      { ticker: 'TVC:RUT' },
      { ticker: 'NYMEX:CL1!' },
      { ticker: 'COMEX:GC1!' },
      { ticker: 'TVC:DXY' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 3,
    icon: 'zap-off',
    title: '최악의 조합: 고용 쇼크 & 유가 급등',
    subtitle: '스태그플레이션 공포, 시장을 지배하다',
    description:
      '충격적인 고용 감소와 중동 분쟁으로 인한 유가 폭등이 동시에 발생하며, 경기는 둔화하는데 물가만 오르는 최악의 시나리오에 대한 우려가 시장을 완전히 지배했습니다.',
    bullets: [
      '2월 비농업 일자리: 예상(+5.9만) 깨고 9.2만 개 감소',
      '국제 유가(WTI): 중동 분쟁으로 10% 이상 폭등, 배럴당 $91 돌파',
      '시장 반응: 다우존스 장중 700pt 급락, VIX 지수 29 돌파',
      '핵심 우려: 경기 둔화 + 물가 상승 = 스태그플레이션 현실화',
    ],
    theme: 'red',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 9,
    title: '고용 쇼크: 세부 지표 분석',
    description:
      '단순한 숫자 충격을 넘어, 고용 보고서의 세부 내용에서 구조적인 약점이 드러나며 경기 경착륙에 대한 공포를 키웠습니다.',
    stats: [
      { label: '2월 비농업 일자리', value: '-9.2만 개', subtext: '시장 예상치 대폭 하회', trend: 'down' },
      { label: '실업률', value: '4.4%', subtext: '노동 시장 냉각 명확화', trend: 'up' },
      { label: '장기 실업자 수', value: '190만 명', subtext: '1년 전 대비 40만 명 급증', trend: 'up' },
      { label: '과거 고용 수치', value: '-6.9만 개', subtext: '12월, 1월 수치 하향 수정', trend: 'down' },
    ],
    theme: 'red',
  },
  {
    id: 4,
    type: 'headline',
    turnId: 11,
    icon: 'landmark',
    title: '연준의 딜레마',
    subtitle: "'나쁜 뉴스는 그냥 나쁜 뉴스'로",
    description:
      '고용 충격의 강도가 너무 커서 연준의 정책 변화에 대한 기대를 압도했습니다. 시장은 연준의 구원을 기대하기보다, 정책 대응이 어려운 상황 자체를 가격에 반영하기 시작했습니다.',
    bullets: [
      '고용 약화: 경기 부양을 위한 금리 인하 필요성 시사',
      '유가 급등: 인플레이션 재발 위험으로 금리 인하 제약',
      '주요 IB 분석: "연준, 진퇴양난에 빠졌다" (JP모건, 모건스탠리)',
      '메리 데일리 총재: "노동 시장 약화와 유가 충격, 양면적 위험에 직면"',
    ],
    theme: 'amber',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 13,
    icon: 'flame',
    title: '설상가상: 유가 급등, 공포를 증폭시키다',
    subtitle: '중동 지정학적 위기, 글로벌 공급망 강타',
    description:
      '고용 충격에 더해 중동발 유가 쇼크가 겹치면서 스태그플레이션 시나리오가 시장의 핵심 의제로 부상했습니다. 세계 원유 공급의 동맥이 막히면서 인플레이션 공포가 재점화되었습니다.',
    bullets: [
      '호르무즈 해협 통행 사실상 중단, WTI 주간 38% 폭등',
      '1985년 이후 최대 주간 상승폭 기록하며 배럴당 $92 돌파',
      '성장 둔화와 물가 급등이 동시에 나타나는 최악의 시나리오 부상',
    ],
    theme: 'gold',
  },
  {
    id: 6,
    type: 'stats',
    turnId: 16,
    title: '유가 쇼크: 공급망 마비',
    description:
      '단순한 위협이 아닌 물리적 봉쇄 수준의 공급망 차질이 발생하며, 주요 산유국들이 감산을 시작했고 추가 유가 급등에 대한 경고가 이어지고 있습니다.',
    stats: [
      { label: 'WTI 주간 상승폭', value: '+38%', subtext: '1985년 이후 최대', trend: 'up' },
      { label: '호르무즈 해협', value: '통행 중단', subtext: '세계 원유 공급 20% 통과', trend: 'down' },
      { label: '페르시아만 원유', value: '1,600만 배럴', subtext: '수출길 막힘', trend: 'neutral' },
      { label: '카타르 에너지 장관 경고', value: '$150/배럴', subtext: '수출 전면 중단 시 유가 전망', trend: 'up' },
    ],
    theme: 'gold',
    charts: [{ ticker: 'NYMEX:CL1!' }, { ticker: 'ICEEUR:BRN1!' }],
  },
  {
    id: 7,
    type: 'comparison',
    turnId: 18,
    title: '유가 급등의 연쇄 파급 효과',
    description:
      '유가 급등은 단순한 인플레이션 자극을 넘어, 소비자, 산업, 그리고 식량 안보에 이르기까지 경제 전반에 걸쳐 실질적인 위협으로 확산되고 있습니다.',
    items: [
      {
        label: '소비자',
        value: '휘발유 가격 급등',
        description: '갤런당 $3.32 기록, 2024년 이후 최고 수준으로 치솟으며 가계 부담 가중',
      },
      {
        label: '항공 산업',
        value: '항공료 인상 불가피',
        description: '제트유 가격 50% 이상 폭등, 유나이티드 항공 등 직격탄',
        highlight: true,
      },
      {
        label: '식량 안보',
        value: '식량 가격 급등 우려',
        description: '호르무즈 해협 비료 공급 차질, 수개월 후 전 세계 농작물 생산 감소로 연결 가능',
      },
    ],
  },
  {
    id: 8,
    type: 'comparison',
    turnId: 24,
    title: '연준의 딜레마: 진퇴양난에 빠진 통화정책',
    description:
      '급격한 고용 시장 냉각과 유가 급등으로 인한 인플레이션 재점화 위험 사이에서 연준은 섣불리 움직일 수 없는 상황에 처했습니다.',
    items: [
      {
        label: '금리 인하 압력',
        value: '경기 부양',
        description: '심각한 고용 충격과 경기 경착륙 가능성 증대',
        highlight: true,
      },
      {
        label: '금리 동결/인상 압력',
        value: '물가 안정',
        description: '유가 급등으로 인한 인플레이션 재발 위험',
        highlight: true,
      },
      {
        label: '시장 전망',
        value: '관망세 유지',
        description: '3월 FOMC에서 뚜렷한 방향 제시 어려울 것이라는 비관론 확산',
      },
    ],
  },
  {
    id: 9,
    type: 'headline',
    turnId: 26,
    icon: 'shield-alert',
    title: '혼돈의 자산 시장',
    subtitle: '스태그플레이션 공포 속 극심한 위험 회피',
    description:
      '투자자들은 주식 등 위험자산을 매도하고 안전자산으로 몰려들었습니다. 채권 시장마저 방향성을 잃는 등, 시장 전체가 극심한 불확실성에 휩싸였습니다.',
    bullets: [
      '주식 시장: 다우 -0.95%, 나스닥 -1.59% 등 전반적 매도세',
      '항공주: 델타, 유나이티드 등 비용 압박 우려에 3% 이상 급락',
      '안전자산: 금 선물 1% 이상 상승, 달러화 강세',
      '채권 시장: 10년물 국채 금리, 경기 침체와 인플레 우려 사이에서 혼조세',
    ],
    theme: 'purple',
    charts: [{ ticker: 'TVC:DXY' }, { ticker: 'TVC:US10Y' }],
  },
  {
    id: 10,
    type: 'events',
    turnId: 28,
    title: '향후 주요 관전 포인트',
    description:
      '시장은 경기 침체와 인플레이션이라는 두려움 사이에서, 다가오는 경제 지표와 뉴스 헤드라인 하나하나에 극도로 민감하게 반응하는 장세를 이어갈 것으로 보입니다.',
    events: [
      {
        date: '상시',
        label: '중동 지정학적 상황',
        description: '호르무즈 해협 통행 정상화 여부가 유가 안정의 핵심 변수',
      },
      {
        date: '2026-03-11',
        label: '2월 소비자물가지수(CPI) 발표',
        description: '유가 급등세가 인플레이션 지표에 미치는 영향 확인',
      },
      {
        date: '2026-03-18',
        label: '연방공개시장위원회(FOMC) 회의',
        description: '연준의 정책 딜레마 속에서 어떤 신호를 보낼지 주목',
      },
    ],
  },
  {
    id: 11,
    type: 'ticker-intro',
    turnId: 29,
    ticker: 'AMAT',
    companyName: 'Applied Materials',
    currentPrice: 324.74,
    dayChange: -21.79,
    dayChangePercent: -6.29,
    description:
      '장 초반 강세를 보이다 급락하며 6% 넘게 하락 마감했습니다. AI 성장 기대감과 미중 수출 통제라는 지정학적 리스크가 정면으로 충돌하며 높은 변동성을 보였습니다.',
    charts: [{ ticker: 'AMAT' }],
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 32,
    ticker: 'AMAT',
    title: '성장 스토리 (Bull Case)',
    points: [
      'AI 칩 생산에 필수적인 차세대 공정(GAA, HBM) 장비 시장에서 독보적 기술력 보유',
      'DRAM 고객사 투자 증가 등 최근 실적에서 견조한 펀더멘털 확인',
      '$2.5억 법률 합의금은 일회성 비용으로 불확실성을 해소한 측면',
      '$72억 달러의 풍부한 현금과 안정적인 서비스 매출이 완충 역할',
    ],
    outlook: 'AI 시대의 핵심 수혜주',
    outlookColor: 'emerald',
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 34,
    ticker: 'AMAT',
    title: '지정학적 리스크 (Bear Case)',
    points: [
      '미 상무부와 합의한 벌금($2.53억)이 끝이 아닐 수 있다는 우려 존재',
      "합의 조건에 '유예된 수출 거부 명령' 포함, 향후 규정 위반 시 중국 수출 즉시 중단 가능",
      "전체 매출의 30%를 차지하는 중국 사업 전체가 '다모클레스의 칼'과 같은 리스크에 노출",
      '주가 하락은 현실화된 규제 리스크를 시장이 가격에 반영하는 과정으로 해석',
    ],
    outlook: '통제 불가능한 외부 변수',
    outlookColor: 'rose',
  },
  {
    id: 14,
    type: 'comparison',
    turnId: 36,
    title: 'AMAT 투자포인트: 기회 vs. 위협',
    description:
      '어플라이드 머티리얼즈는 AI라는 거대한 기회와 지정학적 리스크라는 암초 사이에서 위태로운 균형을 이루고 있어, 투자자의 신중한 판단이 요구됩니다.',
    items: [
      {
        label: '기회 (Opportunity)',
        value: 'AI 기술 해자',
        description: 'GAA, HBM 등 차세대 공정 장비 시장의 독보적 리더십. 강력한 펀더멘털과 성장 잠재력.',
      },
      {
        label: '위협 (Threat)',
        value: '수출 통제 리스크',
        description: "매출 30%를 차지하는 중국 사업의 불확실성. '유예된 수출 거부 명령'이 지속적인 족쇄로 작용.",
        highlight: true,
      },
      {
        label: '현재 주가',
        value: '위태로운 균형',
        description: '상반된 두 힘이 팽팽하게 맞서며 높은 변동성을 보임. 리스크 관리가 필요한 시점.',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 44,
    headline: '스태그플레이션 공포, 시장을 덮치다',
    tagline: '고용 쇼크와 유가 급등, 연준의 딜레마는 깊어집니다.',
    description:
      '오늘은 경기 침체 우려와 인플레이션 압력이 동시에 시장을 강타한 어려운 하루였습니다. 투자자들은 시장의 긍정적인 분위기에만 편승하기보다는, 앞으로 발표될 주요 경제 지표들을 면밀히 살피면서 미묘한 온도 변화에 대응할 수 있는 신중한 자세를 유지하는 것이 중요하겠습니다.',
  },
];