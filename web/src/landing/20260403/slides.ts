import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-04',
    nutshell: '유가 급등과 고용보고서 경계감 속 혼조세',
    description:
      '중동의 지정학적 리스크로 인한 유가 급등과 미국 고용보고서 발표를 앞둔 경계감이 맞물리며 시장이 방향성을 잃었습니다. 오늘 브리핑에서는 시장을 움직인 핵심 동인과 함께 인텔(INTC)의 미래를 심층 분석합니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '유가 급등과 고용보고서 발표를 앞둔 경계감 속에서 주요 지수는 혼조세로 마감했습니다. 다우지수는 하락했으나, 기술주 중심의 나스닥은 소폭 상승했습니다.',
    indices: [
      { name: 'S&P 500', value: 6582.69, change: 7.37, changePercent: 0.11 },
      { name: 'NASDAQ', value: 21879.18, change: 38.23, changePercent: 0.18 },
      { name: 'DOW', value: 46504.67, change: -61.07, changePercent: -0.13 },
      { name: 'Russell 2000', value: 2530.04, change: 17.67, changePercent: 0.70 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 111.54, change: 11.42, changePercent: 11.41 },
      { name: '10-Yr Yield', value: 4.31, change: 0.01, changePercent: 0.23 },
      { name: 'Dollar Index', value: 100.19, change: 0.16, changePercent: 0.16 },
      { name: 'Gold Futures', value: 4651.50, change: -131.70, changePercent: -2.75 },
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
    turnId: 7,
    title: '시장을 지배한 두 가지 변수',
    subtitle: '유가 쇼크와 고용보고서 경계감',
    description:
      '오늘 시장은 중동발 유가 충격이라는 돌발 변수와 연준의 정책 향방을 결정할 고용보고서라는 핵심 이벤트를 앞두고 극심한 눈치 보기 장세를 보였습니다.',
    bullets: [
      '중동 지정학적 리스크로 국제 유가 11% 이상 폭등',
      '유가 급등발 인플레이션 재점화 우려 부상',
      '3월 비농업 고용보고서 발표 앞두고 관망 심리 팽배',
      '연준의 금리 인하 경로 불확실성 최고조',
    ],
    theme: 'amber',
  },
  {
    id: 3,
    type: 'headline',
    turnId: 8,
    icon: 'flame',
    title: '유가 급등 쇼크',
    subtitle: '호르무즈 해협 긴장 고조, 공급망 우려 확산',
    description:
      '호르무즈 해협의 긴장감이 고조되면서 원유 공급 차질 우려가 시장을 덮쳤습니다. 유가 폭등은 인플레이션 우려를 자극하며 시장 전반의 투자 심리를 위축시켰습니다.',
    bullets: [
      'WTI 유가, 하루 만에 11.4% 폭등하며 배럴당 $111 돌파',
      '시장 공포지수(VIX) 장중 28선 육박하며 급등',
      '美 10년물 국채금리 4.3%대 높은 수준 유지',
      '에너지 섹터 강세 vs 항공/소비 업종 약세 극명한 대조',
    ],
    theme: 'red',
    charts: [{ ticker: 'TVC:USOIL' }, { ticker: 'TVC:VIX' }],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 9,
    title: '유가 급등이 시장에 미친 영향',
    description:
      '유가 급등은 원자재 시장뿐만 아니라 채권, 주식 시장 전반에 걸쳐 연쇄 반응을 일으켰습니다.',
    stats: [
      {
        label: 'WTI 원유 (USOIL)',
        value: '+11.4%',
        subtext: '배럴당 $111 돌파',
        trend: 'up',
      },
      {
        label: '브렌트유 (UKOIL)',
        value: '+7% 이상',
        subtext: '공급 충격 우려 반영',
        trend: 'up',
      },
      {
        label: '변동성 지수 (VIX)',
        value: '장중 28선 육박',
        subtext: '시장 불안감 증폭',
        trend: 'up',
      },
    ],
    note: '유가 급등이 인플레이션 우려를 자극하며 국채금리는 높은 수준을 유지했습니다.',
    theme: 'red',
  },
  {
    id: 5,
    type: 'comparison',
    turnId: 13,
    title: '유가 급등의 명과 암: 업종별 희비 교차',
    description:
      '유가 급등은 에너지 기업에는 호재로 작용했지만, 비용 부담이 커지는 항공 및 소비재 업종에는 직격탄이 되었습니다.',
    items: [
      {
        label: '수혜 업종 (Winners)',
        value: '에너지 (XLE)',
        description:
          '유가 상승으로 직접적 수혜. 셰브론(CVX) +0.8%, 옥시덴탈(OXY) +1% 이상 상승.',
        highlight: true,
      },
      {
        label: '피해 업종 (Losers)',
        value: '항공 (JETS)',
        description:
          '유류비 부담 급증으로 수익성 악화 우려. JETS ETF -1.3% 하락.',
        highlight: false,
      },
      {
        label: '피해 업종 (Losers)',
        value: '소비재 (XLY)',
        description:
          '휘발유 가격 상승에 따른 가계 구매력 감소 우려. XLY ETF -1.5% 하락.',
        highlight: false,
      },
    ],
    charts: [{ ticker: 'XLE' }, { ticker: 'JETS' }],
  },
  {
    id: 6,
    type: 'headline',
    turnId: 16,
    icon: 'briefcase',
    title: '고용보고서 경계감 최고조',
    subtitle: '연준의 금리 경로, 안갯속으로',
    description:
      '유가발 인플레이션 우려 속에서 시장의 모든 관심은 내일 발표될 3월 고용보고서에 집중되고 있습니다. 보고서 결과에 따라 연준의 금리 인하 기대감이 크게 흔들릴 수 있습니다.',
    bullets: [
      "시장, 3월 비농업 고용보고서 발표 앞두고 '폭풍 전야'",
      '주간 실업수당 청구건수 예상 하회, 견조한 노동시장 재확인',
      "닐 카시카리 연은 총재, '올해 금리 인하 불필요' 매파적 발언",
      '최근 ISM 제조업 지수도 확장 국면 전환, 경기 둔화 신호 부재',
    ],
    theme: 'blue',
    charts: [{ ticker: 'TVC:US10Y' }, { ticker: 'TVC:DXY' }],
  },
  {
    id: 7,
    type: 'stats',
    turnId: 19,
    title: '강력한 경제지표, 후퇴하는 금리인하 기대',
    description:
      '최근 발표된 경제 지표들이 연이어 강한 모습을 보이면서, 연준이 금리 인하를 서두를 필요가 없다는 주장에 힘이 실리고 있습니다.',
    stats: [
      {
        label: '주간 실업수당 청구건수',
        value: '21만 건',
        subtext: '예상치 하회, 견조한 고용',
        trend: 'down',
      },
      {
        label: '닐 카시카리 발언',
        value: '금리인하 불필요',
        subtext: '인플레이션 정체 시',
        trend: 'neutral',
      },
      {
        label: 'ISM 제조업 PMI',
        value: '확장 국면',
        subtext: '경기 둔화 우려 완화',
        trend: 'up',
      },
    ],
    note: '강한 경제 데이터가 연준의 금리 인하를 서두를 필요가 없다는 논리에 힘을 싣고 있습니다.',
    theme: 'blue',
  },
  {
    id: 8,
    type: 'comparison',
    turnId: 21,
    title: '3월 고용보고서 시나리오 분석',
    description:
      '시장은 고용이 너무 뜨겁지도, 차갑지도 않은 적절한 수준으로 나오기를 기대하고 있습니다. 결과에 따라 시장의 단기 방향성이 결정될 것입니다.',
    items: [
      {
        label: '시장 컨센서스',
        value: '일자리 +20만',
        description: '실업률 3.8%, 시간당 임금 상승률 둔화 기대.',
        highlight: false,
      },
      {
        label: '최상의 시나리오 (Goldilocks)',
        value: '고용 둔화 + 임금 안정',
        description:
          '고용 증가세는 둔화되고 임금 압력은 약화되어 연준에 금리 인하 명분 제공.',
        highlight: true,
      },
      {
        label: '최악의 시나리오 (Too Hot)',
        value: '고용 서프라이즈 + 임금 급등',
        description:
          '예상보다 강한 고용과 높은 임금 상승률은 금리 인하 기대를 후퇴시켜 시장에 부담.',
        highlight: false,
      },
    ],
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 24,
    ticker: 'INTC',
    companyName: 'Intel Corporation',
    currentPrice: 50.38,
    dayChange: 2.35,
    dayChangePercent: 4.89,
    description:
      '인텔(INTC)이 파운드리 사업에 대한 미래 기대감이 반영되며 5% 가까이 급등, 50달러 선을 넘어서며 시장의 주목을 받았습니다.',
    charts: [{ ticker: 'INTC' }],
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'INTC',
    title: '인텔의 두 얼굴: 현금 창출원 vs 미래 투자',
    description:
      '인텔의 재무구조는 견조한 이익을 내는 기존 사업부와 막대한 손실을 기록 중인 신규 파운드리 사업부로 명확히 나뉩니다.',
    points: [
      '**인텔 프로덕츠 (기존 사업):** 연 127억 달러의 견조한 영업이익을 기록하는 핵심 현금 창출원.',
      '**인텔 파운드리 (신규 사업):** 연 103억 달러의 막대한 영업손실을 기록하며 전체 현금 흐름을 잠식.',
      '현재 주가 상승은 파운드리 사업의 성공 가능성에 대한 시장의 낙관적 베팅을 반영.',
    ],
    outlook: '기대와 우려가 공존하는 구조적 전환기',
    outlookColor: 'amber',
  },
  {
    id: 11,
    type: 'stats',
    turnId: 26,
    title: '인텔 사업부별 실적 비교 (FY 2025)',
    description:
      '인텔의 사업부는 수익성이 높은 기존 사업과 대규모 투자가 진행 중인 파운드리 사업으로 나뉩니다.',
    stats: [
      { label: '인텔 프로덕츠 매출', value: '$491억', trend: 'neutral' },
      {
        label: '인텔 프로덕츠 영업이익',
        value: '$127억',
        subtext: '견조한 현금 창출원',
        trend: 'up',
      },
      {
        label: '인텔 파운드리 영업손실',
        value: '-$103억',
        subtext: '대규모 투자 비용 발생',
        trend: 'down',
      },
    ],
    note: '파운드리 사업부의 막대한 손실이 회사 전체의 현금 흐름에 부담으로 작용하고 있습니다.',
    theme: 'purple',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'INTC',
    title: '파운드리 성공의 조건과 기대 요인',
    description:
      "시장은 현재의 막대한 손실을 'J-커브'의 바닥 구간으로 해석하며, 인텔이 서구권 AI 인프라의 핵심으로 부상할 가능성에 주목하고 있습니다.",
    points: [
      '**기술 리더십:** 18A 공정에 RibbonFET, PowerVia 등 차세대 기술 최초 적용.',
      '**정부 지원:** 미국 칩스법(CHIPS Act)에 따른 막대한 보조금 수혜.',
      '**전략적 투자:** 엔비디아 등 주요 기업들의 잠재적 파트너십 및 투자 가능성.',
      '**지정학적 수혜:** 글로벌 반도체 공급망 재편의 최대 수혜주로 부상.',
    ],
    outlook: '거대한 전환을 위한 필수 투자 비용',
    outlookColor: 'blue',
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'INTC',
    title: '현실적 과제: 막대한 손실 극복과 실행 리스크',
    description:
      '장밋빛 청사진에도 불구하고, 파운드리 사업이 흑자로 돌아서기 위해서는 천문학적인 규모의 신규 매출 확보와 안정적인 공정 수율 달성이라는 어려운 과제를 해결해야 합니다.',
    points: [
      '**손익분기점:** 흑자 전환을 위해 연간 최소 500억~670억 달러의 신규 외부 고객 매출 필요.',
      '**실행 리스크:** 과거 신규 공정 개발 지연 전례. 18A 공정의 안정적 수율 확보가 관건.',
      '**재무 리스크:** 신규 고객 확보 실패 시 1,000억 달러 이상 자산에 대한 손상차손 가능성.',
    ],
    outlook: "회사가 인정한 '매우 위험하고 성공이 불확실한' 전략",
    outlookColor: 'rose',
  },
  {
    id: 14,
    type: 'events',
    turnId: 37,
    title: '향후 시장 향방을 가를 주요 이벤트',
    description:
      '고용보고서를 시작으로 다음 주까지 연준의 정책 결정에 직접적인 영향을 미칠 핵심 경제지표 발표가 예정되어 있습니다.',
    events: [
      {
        date: '4/5',
        label: '3월 비농업 고용보고서',
        description: '노동시장의 열기를 확인할 핵심 지표. 임금 상승률이 관건.',
      },
      {
        date: '4/8',
        label: '3월 FOMC 의사록 공개',
        description: '금리 인하에 대한 연준 위원들 내부의 논의를 파악할 기회.',
      },
      {
        date: '4/10',
        label: '3월 소비자물가지수(CPI)',
        description: '인플레이션의 방향성을 직접적으로 보여주는 가장 중요한 데이터.',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 39,
    headline: '데이터를 확인하라: 변동성 장세 대비',
    tagline: '섣부른 기대보다 기업의 본질 가치에 집중할 때',
    description:
      '연준의 금리 인하 기대에 균열이 생긴 만큼, 투자자들은 단기 등락에 일희일비하기보다 발표되는 경제 지표를 냉정하게 분석하고 기업의 펀더멘털에 기반한 신중한 투자 전략을 세워야 할 시점입니다.',
  },
];