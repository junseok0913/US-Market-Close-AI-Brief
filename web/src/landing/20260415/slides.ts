import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-16',
    nutshell: 'AI 기술주 랠리 속 다우 지수 나홀로 하락',
    description:
      '기술주 중심의 나스닥은 AI 열풍에 힘입어 급등했지만, 다우 지수는 경기 민감주의 부진으로 하락하며 시장이 엇갈린 모습을 보였습니다. 오늘의 브리핑에서는 시장의 차별화 요인과 뉴몬트(NEM)의 리스크를 심층 분석합니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      'S&P 500과 나스닥은 AI 기술주 랠리에 힘입어 상승했으나, 다우존스 산업평균지수와 러셀 2000은 경기 민감주 약세로 하락하며 혼조세로 마감했습니다.',
    indices: [
      { name: 'S&P 500', value: 7022.95, change: 55.57, changePercent: 0.80 },
      { name: 'NASDAQ', value: 24016.02, change: 376.94, changePercent: 1.59 },
      { name: 'DOW', value: 48463.72, change: -72.27, changePercent: -0.15 },
      { name: 'Russell 2000', value: 2713.66, change: 7.99, changePercent: 0.30 },
    ],
    commodities: [
      { name: '10년물 국채금리', value: 4.28, change: 0.03, changePercent: 0.61 },
      { name: 'WTI 원유', value: 91.39, change: 0.11, changePercent: 0.12 },
      { name: 'Dollar Index', value: 98.08, change: -0.04, changePercent: -0.04 },
      { name: 'Gold Futures', value: 4813.90, change: -11.10, changePercent: -0.23 },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: '나스닥' },
      { ticker: 'DJ:DJI', title: '다우존스' },
      { ticker: 'TVC:RUT', title: '러셀 2000' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 6,
    icon: 'cpu',
    title: '시장을 휩쓴 AI 열풍',
    subtitle: '기술주 랠리 vs. 전통 산업 부진',
    description:
      '시장은 AI라는 단일 키워드를 중심으로 움직였습니다. 기술주는 강한 랠리를 보인 반면, 부진한 경제 지표의 영향으로 전통 산업 비중이 높은 다우 지수는 하락하며 뚜렷한 대조를 보였습니다.',
    bullets: [
      '나스닥 1.6% 급등, 다우 0.15% 하락하며 탈동조화',
      '신발회사 올버즈(BIRD), AI 전환 선언 후 600% 이상 폭등',
      '부진한 제조업 지표로 경기 민감주 투자 심리 위축',
      'AI 테마, 거시 경제 불확실성 속 독자적 모멘텀 형성',
    ],
    theme: 'blue',
    charts: [
      { ticker: 'NASDAQ:IXIC', title: '나스닥' },
      { ticker: 'DJ:DJI', title: '다우존스' },
    ],
  },
  {
    id: 3,
    type: 'comparison',
    turnId: 9,
    title: 'AI 랠리의 두 얼굴: 펀더멘털 vs. 투기',
    description:
      '현재 AI 랠리는 견조한 펀더멘털에 기반한 성장 기대감과 AI 키워드에 대한 맹목적인 투기 심리가 공존하는 복합적인 양상을 보이고 있습니다.',
    items: [
      {
        label: '펀더멘털 기반 성장',
        value: '구조적 성장세',
        description: '엔비디아, 슈퍼마이크로 등 선도 기업의 견조한 흐름. 데이터센터 및 고성능 컴퓨팅 수요가 뒷받침.',
        highlight: true,
      },
      {
        label: '투기적 과열',
        value: '맹목적 열기',
        description: '신발 제조업체 올버즈(BIRD), AI 전환 선언만으로 주가 600% 이상 폭등. 펀더멘털과 무관한 움직임.',
        highlight: false,
      },
      {
        label: '빅테크의 역할',
        value: '생태계 확장',
        description: 'MS, 구글 등 AI 기술을 클라우드/소프트웨어에 통합. 실제 소비와 연결되며 장기 성장 동력 확보.',
        highlight: true,
      },
    ],
    charts: [
      { ticker: 'NVDA', title: '엔비디아' },
      { ticker: 'BIRD', title: '올버즈' },
    ],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 13,
    title: 'AI 열풍 속 잠재된 위험',
    description:
      '강력한 AI 테마가 거시 경제의 불확실성을 덮고 있는 가운데, 시장 쏠림 현상과 정책 불확실성 등 잠재적인 위험 요인에 대한 경계가 필요합니다.',
    stats: [
      { label: '시장 쏠림 현상', value: '집중 리스크', subtext: 'S&P 500 상승이 소수 기술주에 의존', trend: 'down' },
      { label: 'VIX 지수', value: '15선 유지', subtext: '투자자 경계심 완화 가능성', trend: 'neutral' },
      { label: '연준 정책 불확실성', value: '금리 전망', subtext: '연준 관계자 발언에 따라 변동 가능', trend: 'neutral' },
    ],
    note: 'AI 기대감이 꺾이거나 규제 변수 발생 시 시장 전체가 흔들릴 수 있습니다.',
    theme: 'amber',
  },
  {
    id: 5,
    type: 'headline',
    turnId: 14,
    icon: 'bank',
    title: '견조한 은행 실적과 엇갈린 경제 신호',
    subtitle: '뱅크오브아메리카, 예상 상회 실적 발표',
    description:
      '뱅크오브아메리카가 시장 예상을 뛰어넘는 실적을 발표하며 미국 경제의 회복력에 대한 기대감을 높였지만, 시장 반응은 전반적인 랠리로 이어지지 못했습니다.',
    bullets: [
      '뱅크오브아메리카(BAC) 매출/이익 모두 전망치 상회, 주가 1.8% 상승',
      'CEO "미국 경제 탄력적" 평가',
      '긍정적 실적에도 다우 지수는 하락, 시장 전체 확산 실패',
      '10년물 국채금리 상승, 금리 인하 기대 후퇴 우려 반영',
    ],
    theme: 'green',
    charts: [
      { ticker: 'BAC', title: '뱅크오브아메리카' },
      { ticker: 'XLF', title: '금융 섹터 ETF' },
    ],
  },
  {
    id: 6,
    type: 'stats',
    turnId: 17,
    title: '엇갈린 경제 지표, 커지는 불확실성',
    description:
      '은행 실적의 긍정적 신호와 달리, 주요 경제 지표들은 제조업 부문의 둔화를 시사하며 혼재된 신호를 보내 투자자들의 신중론을 키웠습니다.',
    stats: [
      { label: '필라델피아 연은 제조업 지수', value: '예상 하회', subtext: '제조업 위축 국면 지속', trend: 'down' },
      { label: '산업 생산', value: '전망치 하회', subtext: '부진한 모습으로 경기 둔화 우려', trend: 'down' },
      { label: '주간 실업수당 청구건수', value: '예상 부합', subtext: '견조한 고용 시장 유지', trend: 'up' },
    ],
    note: '소비는 강하지만 제조업은 약한, 이중 속도 경제의 특징이 나타나고 있습니다.',
    theme: 'amber',
  },
  {
    id: 7,
    type: 'comparison',
    turnId: 19,
    title: '미국 경제의 두 얼굴: 강한 소비 vs. 약한 제조업',
    description: '견조한 고용 시장이 소비를 뒷받침하는 반면, 주요 산업 지표는 둔화 신호를 보내며 미국 경제가 이중적 속도를 보이고 있음을 시사합니다.',
    items: [
      {
        label: '강한 부문 (소비)',
        value: '견조한 고용',
        description: '주간 실업수당 청구건수가 낮은 수준을 유지하며 강력한 소비를 뒷받침. 뱅크오브아메리카 역시 견조한 소비자 지출을 언급.',
        highlight: true,
      },
      {
        label: '약한 부문 (제조업)',
        value: '산업 둔화',
        description: '필라델피아 연은 제조업 지수와 산업 생산 지표가 예상을 밑돌며 제조업 부문의 위축 가능성을 시사.',
        highlight: false,
      },
    ],
  },
  {
    id: 8,
    type: 'headline',
    turnId: 22,
    icon: 'split',
    title: '다우 지수, 나홀로 하락',
    subtitle: 'AI 쏠림 속 선별적 장세 심화',
    description:
      '투자자들이 거시 경제 상황과 개별 기업 펀더멘털을 꼼꼼하게 따지면서, AI라는 강력한 성장 테마에만 자금이 집중되고 경기 민감 업종은 소외되는 선별적 장세가 펼쳐졌습니다.',
    bullets: [
      '나스닥(+1.6%) vs. 다우(-0.15%) 탈동조화 현상',
      '안정된 국채금리는 기술주에 긍정적 환경 제공',
      '유나이티드헬스(UNH), 캐터필러(CAT) 등 다우 구성 대형주 부진',
      'AI 외 경기 민감 업종에 대한 투자 심리 상대적 위축',
    ],
    theme: 'purple',
  },
  {
    id: 9,
    type: 'stats',
    turnId: 25,
    title: '다우 지수를 끌어내린 종목들',
    description: '다우 지수를 구성하는 전통 산업 및 헬스케어 대형주들의 부진이 두드러지며 지수 전체에 부담으로 작용했습니다.',
    stats: [
      { label: '캐터필러 (CAT)', value: '-3.5%', subtext: '대표적인 경기 민감주', trend: 'down' },
      { label: '유나이티드헬스 (UNH)', value: '-0.6%', subtext: '미국 최대 건강보험사', trend: 'down' },
      { label: '존슨앤드존슨 (JNJ)', value: '-0.5%', subtext: '대표 제약주', trend: 'down' },
    ],
    note: '명확한 성장 스토리가 없는 분야에 대한 투자자들의 신중한 태도를 반영합니다.',
    theme: 'red',
    charts: [
      { ticker: 'CAT', title: '캐터필러' },
      { ticker: 'UNH', title: '유나이티드헬스' },
    ],
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 30,
    ticker: 'NEM',
    companyName: '뉴몬트 (Newmont Corporation)',
    currentPrice: 113.04,
    dayChange: -6.26,
    dayChangePercent: -5.25,
    description:
      '세계 최대 금광 업체 뉴몬트의 주가가 5% 넘게 급락했습니다. 이는 특정 악재보다는 그동안 수면 아래에 있던 비용 증가와 지정학적 리스크가 본격적으로 부각된 결과로 분석됩니다.',
    charts: [{ ticker: 'NEM', title: '뉴몬트' }],
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 33,
    ticker: 'NEM',
    title: '뉴몬트 투자론 (Bull): 기술 기반 자원 플랫폼',
    points: [
      'AI 활용 지질 모델링으로 탐사 성공률 증대',
      '자율 주행 채굴 시스템 도입으로 운영 효율성 극대화',
      '에너지 전환 시대 핵심 자원인 구리 생산 비중 확대',
      '현재의 비용 증가는 미래 경쟁력을 위한 과도기적 투자',
    ],
    outlook: '장기적으로 압도적인 비용 경쟁력을 갖출 것이라는 기대감이 존재합니다.',
    outlookColor: 'emerald',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 35,
    ticker: 'NEM',
    title: '뉴몬트 투자론 (Bear): 통제 불능의 리스크',
    points: [
      '비용 통제 실패: 호주 타나미 광산 비용 34% 폭증 등 운영 비용 급증',
      '이익 잠식: 사상 최고 금 가격에도 불구하고 이익이 비용에 잠식',
      '관할권 리스크: 총 생산량의 44.3%가 정치적 불안정 국가에 집중',
      '실존적 위협: 멕시코 정부의 \'노천 채굴 금지\' 헌법 개혁 추진 등',
    ],
    outlook: '증명되지 않은 미래 기술보다 당장의 비용 문제와 지정학적 리스크가 더 큰 부담으로 작용하고 있습니다.',
    outlookColor: 'rose',
  },
  {
    id: 13,
    type: 'headline',
    turnId: 38,
    icon: 'megaphone',
    title: '파월의 경고, 시장을 강타하다',
    subtitle: '금리 인하 기대감 급격히 후퇴',
    description:
      '제롬 파월 연준 의장이 인플레이션 둔화세가 부족하다며 긴축 정책을 더 길게 유지할 필요가 있다고 언급하자, 금리 인하 기대감이 크게 후퇴하며 투자 심리가 급격히 위축되었습니다.',
    bullets: [
      '파월 의장 "인플레이션 둔화 진전 부족, 긴축 장기화 필요"',
      '금리 인하 기대감 후퇴, 9월 이후로 밀려나는 분위기',
      '2년물 국채금리 장중 5% 돌파 등 채권시장 불안',
      '3대 지수(다우, S&P 500, 나스닥) 모두 하락 마감',
    ],
    theme: 'red',
  },
  {
    id: 14,
    type: 'stats',
    turnId: 39,
    title: '파월 발언에 요동친 채권 시장',
    description: '파월 의장의 매파적 발언은 금리 인하 기대를 후퇴시키며 채권 시장에 즉각적인 충격을 주었습니다.',
    stats: [
      { label: '2년물 국채금리', value: '5% 재돌파', subtext: '단기 금리 급등', trend: 'up' },
      { label: '금리 인하 기대 시점', value: '9월 이후로 후퇴', subtext: '연내 인하 불확실성 증대', trend: 'down' },
      { label: '시장 심리', value: '급격히 위축', subtext: '안전 자산 선호 심리 강화', trend: 'down' },
    ],
    note: '시장의 관심은 이제 다른 연준 위원들의 발언으로 이동하고 있습니다.',
    theme: 'amber',
    charts: [{ ticker: 'TVC:US02Y', title: '미국 2년물 국채금리' }],
  },
  {
    id: 15,
    type: 'events',
    turnId: 41,
    title: '향후 시장 방향을 결정할 주요 이벤트',
    description:
      '파월 의장의 매파적 발언 이후, 시장의 관심은 연준 내 다른 위원들의 발언과 핵심 경제 지표로 이동하며 향후 정책 방향에 대한 힌트를 찾을 것입니다.',
    events: [
      {
        date: '4월 17일',
        label: '연준 위원 연설',
        description: '토마스 바킨(리치먼드 연은), 크리스토퍼 월러(연준 이사) 연설. 연준 내 컨센서스 확인이 중요.',
      },
      {
        date: '4월 21일',
        label: '소매판매 지표 발표',
        description: '미국 경제의 3분의 2를 차지하는 소비 건전성을 보여주는 핵심 지표.',
      },
      {
        date: '4월 29일',
        label: '연준 금리 결정 (FOMC)',
        description: '금리 동결이 유력하나, 향후 정책에 대한 힌트가 나올지 주목.',
      },
    ],
  },
  {
    id: 16,
    type: 'closing',
    turnId: 45,
    headline: '금리 인하 기대에서 실적 중심으로',
    tagline: '옥석 가리기가 중요해진 시장',
    description:
      '시장의 패러다임이 유동성 기대감에서 기업 본연의 가치로 이동하고 있습니다. 고금리 환경이 길어질 가능성이 커진 만큼, 꾸준한 현금 흐름을 창출하는 기업에 대한 선별적 접근이 그 어느 때보다 중요해졌습니다.',
  },
];