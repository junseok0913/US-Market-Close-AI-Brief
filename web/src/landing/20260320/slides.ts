import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-21',
    nutshell: '중동 지정학적 리스크 부각에 따른 투자심리 위축',
    description:
      '중동의 지정학적 리스크가 유가 급등을 촉발하며 시장 전반의 투자 심리를 위축시켰습니다. 여기에 슈퍼마이크로발 악재가 터지며 AI 관련주가 동반 급락, 3대 지수 모두 큰 폭으로 하락 마감했습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '중동 지정학적 리스크와 AI 관련주 개별 악재가 겹치며 3대 지수 모두 큰 폭으로 하락했습니다. 국제 유가는 공급망 우려에 급등했고, 안전자산 선호 심리에도 불구하고 달러 강세에 금은 하락했습니다.',
    indices: [
      { name: 'S&P 500', value: 6506.48, change: -100.01, changePercent: -1.51 },
      { name: 'NASDAQ', value: 21647.61, change: -443.08, changePercent: -2.01 },
      { name: 'DOW', value: 45577.47, change: -443.96, changePercent: -0.96 },
      { name: 'Russell 2000', value: 2438.45, change: -56.26, changePercent: -2.26 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 97.98, change: 1.84, changePercent: 1.91 },
      { name: 'Gold Futures', value: 4501.70, change: -99.00, changePercent: -2.15 },
      { name: 'Dollar Index', value: 99.54, change: 0.31, changePercent: 0.31 },
      { name: 'VIX', value: 21.8, change: 2.16, changePercent: 11.0 },
    ],
    charts: [
      { ticker: 'SP:SPX' },
      { ticker: 'NASDAQ:IXIC' },
      { ticker: 'TVC:RUT' },
      { ticker: 'CL=F' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 6,
    icon: 'flame',
    title: '중동 리스크, 시장을 삼키다',
    subtitle: '유가 급등과 인플레이션 공포 재점화',
    description:
      '이란 관련 분쟁 격화 우려가 원유 공급 차질 공포로 번지며 시장을 지배했습니다. 유가 급등은 인플레이션 우려를 자극하며 연준의 금리 인하 기대를 후퇴시켰고, 이는 증시에 직격탄이 되었습니다.',
    bullets: [
      '국제 유가 급등 (브렌트유 $105 육박, WTI $97 돌파)',
      '인플레이션 공포 재점화 및 금리 인하 기대 후퇴',
      'S&P 500 1.5%, 나스닥 2% 이상 급락',
      '변동성 지수(VIX) 급등하며 위험 회피 심리 극대화',
    ],
    theme: 'red',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '주요 자산 가격 변동',
    description:
      '지정학적 리스크는 위험자산의 급락과 원자재 가격의 급등을 초래했습니다. 유일하게 에너지 섹터만이 강세를 보였습니다.',
    stats: [
      { label: 'WTI 원유 (CL=F)', value: '배럴당 $97 돌파', subtext: '공급 차질 우려에 급등', trend: 'up' },
      { label: 'S&P 500 (^GSPC)', value: '-1.51%', subtext: '투자 심리 위축', trend: 'down' },
      { label: '에너지 섹터 (XLE)', value: '강세', subtext: '유가 급등의 유일한 수혜', trend: 'up' },
      { label: '금 선물 (GC=F)', value: '하락', subtext: '강달러 영향에 약세', trend: 'down' },
    ],
    theme: 'red',
    charts: [{ ticker: 'CL=F' }, { ticker: 'SP:SPX' }, { ticker: 'XLE' }, { ticker: 'GC=F' }],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 9,
    title: '연준의 딜레마: 다시 고개 드는 인플레이션',
    description:
      '유가 급등은 인플레이션 압력을 재점화하며 연준의 통화정책 경로를 더욱 복잡하게 만들었습니다. 시장은 연내 금리 인하 기대감을 빠르게 되돌렸습니다.',
    stats: [
      { label: '10년물 국채 금리', value: '상승 압력', subtext: '금리 인하 기대 후퇴 반영', trend: 'up' },
      { label: '달러 인덱스', value: '강세', subtext: '위험 회피 심리 강화', trend: 'up' },
      { label: '연내 금리 인하 기대', value: '크게 후퇴', subtext: '유가발 인플레이션 우려', trend: 'down' },
      { label: '스태그플레이션 우려', value: '경고음 발생', subtext: '유가 급등 장기화 시나리오', trend: 'neutral' },
    ],
    theme: 'amber',
    charts: [{ ticker: 'TVC:US10Y' }, { ticker: 'TVC:DXY' }],
  },
  {
    id: 5,
    type: 'comparison',
    turnId: 11,
    title: '엇갈린 업종별 희비: 에너지 vs 항공',
    description:
      '유가 급등은 에너지 기업에게는 호재였지만, 유류비를 핵심 비용으로 하는 항공 업계에는 치명적인 악재로 작용했습니다.',
    items: [
      {
        label: '에너지 (XOM, CVX)',
        value: '강세',
        description: '유가 상승에 따른 직접적인 수혜 기대감으로 주가 견조',
        highlight: true,
      },
      {
        label: '항공 (UAL)',
        value: '약세',
        description: '유류비 부담 증가 및 여행 수요 위축 우려로 주가 2% 이상 하락',
        highlight: false,
      },
    ],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 14,
    icon: 'cpu',
    title: 'AI 섹터, 신뢰의 균열',
    subtitle: '슈퍼마이크로 쇼크와 엔비디아의 수난',
    description:
      '시장을 이끌던 AI 섹터가 슈퍼마이크로 공동창업자의 기소 소식으로 뿌리부터 흔들렸습니다. 충격은 엔비디아를 비롯한 반도체 업계 전반으로 확산되며 기술주 투매를 불렀습니다.',
    bullets: [
      '슈퍼마이크로(SMCI), 공동창업자 기소 소식에 33% 폭락',
      '엔비디아(NVDA), 공급망 및 규제 리스크 부각되며 4% 가까이 하락',
      '필라델피아 반도체 지수(SOXX) 2.2% 이상 하락',
      'AI 관련주 동반 급락하며 나스닥 지수 2% 이상 하락 주도',
    ],
    theme: 'blue',
  },
  {
    id: 7,
    type: 'stats',
    turnId: 17,
    title: '슈퍼마이크로(SMCI) 사태의 파장',
    description:
      '미국의 대중국 수출 통제를 위반하고 엔비디아 칩 서버를 밀수한 혐의는 단순한 개인 비리를 넘어 회사 전체와 AI 공급망의 리스크로 번졌습니다.',
    stats: [
      { label: '주가 하락률', value: '-33%', subtext: '하루 만에 폭락', trend: 'down' },
      { label: '불법 수출 혐의 규모', value: '$25억', subtext: '2024-2025년 추정', trend: 'down' },
      { label: '엔비디아 내 위상', value: '매출 9% 차지', subtext: '핵심 파트너 리스크', trend: 'neutral' },
    ],
    theme: 'blue',
    charts: [{ ticker: 'SMCI' }, { ticker: 'NVDA' }],
  },
  {
    id: 8,
    type: 'headline',
    turnId: 19,
    title: '엔비디아(NVDA), 엎친 데 덮친 격',
    subtitle: '공급망 리스크에 규제 압박까지',
    description:
      '엔비디아는 슈퍼마이크로 사태로 인한 공급망 리스크에 더해, 미 상원의원들이 200억 달러 규모의 그록(Groq) 라이선스 계약에 대한 조사에 착수했다는 소식까지 전해지며 이중고를 겪었습니다.',
    bullets: [
      '핵심 파트너(SMCI)의 법적 리스크로 인한 공급망 우려',
      '엘리자베스 워런 등 상원의원, 그록 계약 관련 조사 착수',
      '독점금지법 회피 의혹 등 정치권의 압박 시작',
      '복합 악재에 주가 3% 이상 하락하며 투자 심리 위축',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NVDA' }],
  },
  {
    id: 9,
    type: 'comparison',
    turnId: 21,
    title: 'AI 섹터, 충격의 여파',
    description:
      '슈퍼마이크로 사태의 충격은 AI 관련주 전반으로 확산되었습니다. 대부분의 기업이 동반 하락한 가운데, 델은 소폭 상승하며 차별화된 모습을 보였습니다.',
    items: [
      {
        label: 'Supermicro (SMCI)',
        value: '폭락 (-33%)',
        description: '공동창업자 기소 혐의로 투매 발생',
        highlight: false,
      },
      {
        label: 'NVIDIA (NVDA)',
        value: '급락 (-3.9%)',
        description: '공급망 및 규제 리스크 부각',
        highlight: false,
      },
      {
        label: 'AMD, HPE',
        value: '동반 하락 (~ -2%)',
        description: '섹터 전반의 투자 심리 위축',
        highlight: false,
      },
      {
        label: 'Dell (DELL)',
        value: '소폭 상승',
        description: '사태와 직접적 연관성이 낮아 상대적 강세',
        highlight: true,
      },
    ],
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'WELL',
    companyName: 'Welltower Inc.',
    currentPrice: 195.94,
    dayChange: -10.15,
    dayChangePercent: -4.93,
    description:
      '미국의 대표적인 헬스케어 리츠(REITs)인 웰타워의 주가가 시장 전반의 투자심리 위축과 함께 큰 폭으로 하락했습니다.',
    charts: [{ ticker: 'WELL' }],
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'WELL',
    title: '웰타워의 그림자: 부채와 의존성 리스크',
    points: [
      '향후 3년간 약 79억 달러에 달하는 막대한 부채 만기 도래',
      '고금리 환경 지속 시 리파이낸싱에 따른 이자 비용 급증 우려',
      '상위 5개 운영사가 순영업이익의 26%를 차지하는 과도한 의존도',
      '핵심 운영사의 재무 악화 시 현금 흐름에 직접적 타격 가능',
    ],
    description:
      '시장은 웰타워의 막대한 부채 규모와 특정 운영사에 대한 높은 의존도라는 구조적 취약점에 주목하며 우려를 표하고 있습니다.',
    outlook: '부채 구조와 금리 변동성은 지속적으로 관찰해야 할 핵심 변수입니다.',
    outlookColor: 'amber',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'WELL',
    title: '압도적 실적: 성장성으로 리스크 돌파',
    points: [
      '2025년 시니어 하우징 부문 순영업이익(NOI) 51% 급증',
      '기존 자산의 성과를 보여주는 동일 자산 NOI 성장률 21% 달성',
      '인구 고령화라는 구조적 순풍 속 강력한 운영 효율성 입증',
      '견고한 현금흐름 창출 능력으로 부채 리스크 상쇄 가능성',
    ],
    description:
      '반면, 긍정론자들은 경이적인 수준의 이익 성장률에 주목합니다. 강력한 펀더멘털이 거시 경제의 불확실성을 충분히 극복할 수 있다는 주장입니다.',
    outlook: '압도적인 운영 성과는 리스크를 관리 가능한 범위 내에 묶어둘 수 있는 강력한 방패입니다.',
    outlookColor: 'emerald',
  },
  {
    id: 13,
    type: 'stats',
    turnId: 27,
    title: '부채 리스크 스트레스 테스트',
    description:
      '최악의 금리 시나리오를 가정하더라도, 웰타워의 이익 성장률은 이자 비용 증가를 감당하고도 남는 수준의 완충 지대를 확보하고 있습니다.',
    stats: [
      { label: '리파이낸싱 대상 부채', value: '$79.4억', subtext: '2026-2028년 만기', trend: 'neutral' },
      {
        label: '필요 NOI 성장률',
        value: '약 5.5%',
        subtext: '이자비용 증가 상쇄 기준 (금리 +3%p 가정)',
        trend: 'down',
      },
      { label: '2025년 실제 성장률', value: '15.1%', subtext: '필요 수준의 약 3배에 달하는 완충력', trend: 'up' },
    ],
    note: '계산 결과, 현재의 주가 하락은 펀더멘털보다 심리적 요인이 크게 작용한 것으로 분석됩니다.',
  },
  {
    id: 14,
    type: 'events',
    turnId: 33,
    title: '다음 주 주요 경제 이벤트',
    description:
      '다음 주는 연준이 가장 중요하게 여기는 물가 지표인 PCE 발표가 예정되어 있어 시장의 관심이 집중될 전망입니다. 특히 휴장일에 발표된다는 점이 변수입니다.',
    events: [
      {
        date: '목요일',
        label: '4분기 GDP 확정치 발표',
        description: '미국 경제의 성장세를 최종적으로 확인할 수 있는 지표',
      },
      {
        date: '금요일',
        label: '2월 개인소비지출(PCE) 가격지수 발표',
        description: '연준이 가장 선호하는 인플레이션 지표로, 금리 정책 향방에 결정적 영향',
      },
      {
        date: '금요일',
        label: '제롬 파월 연준 의장 연설',
        description: 'PCE 지표 발표와 같은 날 예정되어 있어 시장의 주목도 극대화',
      },
      {
        date: '금요일',
        label: '성금요일(Good Friday) 휴장',
        description: '증시는 휴장하지만 주요 이벤트는 예정대로 진행되어 변동성 확대 가능',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '뜨거운 시장, 차분한 대응이 필요한 때',
    tagline: '휴장일에 발표될 PCE, 변동성에 대비하라',
    description:
      '시장이 사상 최고치 랠리를 이어가고 있지만, 금리 인하 기대감이 상당 부분 선반영되었다는 점을 기억해야 합니다. 특히 증시 휴장일에 발표되는 PCE 물가 지표와 파월 의장 연설은 주말 이후 시장의 변동성을 크게 키울 수 있으므로, 섣부른 추격 매수보다는 차분히 시장 반응을 지켜보는 지혜가 필요합니다.',
  },
];