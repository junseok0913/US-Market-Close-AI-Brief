import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-13',
    nutshell: '이란 리스크에 따른 유가 급등과 시장 전반의 하락',
    description:
      '중동의 지정학적 위기가 유가를 10% 넘게 폭등시키며 시장 전체에 충격을 주었습니다. 오늘 브리핑에서는 시장을 강타한 유가 쇼크의 배경과 그 속에서 나 홀로 강세를 보인 에너지 섹터를 분석하고, 주목할 만한 개별 종목의 움직임도 함께 살펴봅니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '이란 리스크가 증폭되며 3대 지수 모두 큰 폭으로 하락했습니다. 국제 유가가 10% 넘게 폭등하며 인플레이션 우려를 재점화시킨 것이 위험자산 회피 심리를 극대화시켰습니다.',
    indices: [
      { name: 'S&P 500', value: 6672.62, change: -103.18, changePercent: -1.52 },
      { name: 'NASDAQ', value: 22311.98, change: -404.15, changePercent: -1.78 },
      { name: 'DOW', value: 46677.85, change: -739.42, changePercent: -1.56 },
      { name: 'Russell 2000', value: 2488.99, change: -53.91, changePercent: -2.12 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 96.40, change: 9.15, changePercent: 10.49 },
      { name: 'Brent Crude', value: 96.40, change: 9.15, changePercent: 10.49 },
      { name: 'Gold Futures', value: 5084.40, change: -83.00, changePercent: -1.61 },
      { name: 'Dollar Index', value: 99.75, change: 0.52, changePercent: 0.53 },
    ],
    charts: [{ ticker: 'SP:SPX' }, { ticker: 'NASDAQ:IXIC' }, { ticker: 'DJ:DJI' }, { ticker: 'CL=F' }],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 7,
    icon: 'alert-triangle',
    title: '이란발 지정학적 리스크',
    subtitle: '유가 폭등과 시장 공포 확산',
    description:
      '국제에너지기구(IEA)가 역사상 최대 규모의 공급 차질을 경고하면서 시장은 공포감에 휩싸였습니다. 유가 급등이 인플레이션 압력을 재점화시키면서 주식과 같은 위험자산의 투매 현상으로 이어졌습니다.',
    bullets: [
      'IEA, "역사상 최대 규모 공급 차질" 경고',
      'WTI 유가, 하루 만에 8% 가까이 폭등하며 배럴당 $96 돌파',
      '브렌트유 역시 7% 넘게 급등하며 배럴당 $97 선 돌파',
      '3대 지수 모두 1.5% 안팎으로 급락하며 투매 현상 발생',
    ],
    theme: 'red',
    charts: [{ ticker: 'CL=F' }, { ticker: 'BZ=F' }],
  },
  {
    id: 3,
    type: 'stats',
    turnId: 9,
    title: 'IEA: 역사상 최대 공급 차질',
    description:
      'IEA 보고서에 따르면 이번 사태로 전 세계 석유 공급망이 심각한 타격을 입었습니다. 호르무즈 해협이 사실상 봉쇄 상태에 들어가면서 공급 충격이 현실화되었습니다.',
    stats: [
      { label: '글로벌 공급 타격', value: '약 7.5%', subtext: '직접 영향권', trend: 'down' },
      { label: '호르무즈 해협 통행량', value: '-90% 이상', subtext: '사실상 봉쇄', trend: 'down' },
      { label: '걸프만 생산 차질', value: '일 1천만 배럴', subtext: '생산 중단 규모', trend: 'down' },
    ],
    note: 'IEA 회원국들의 기록적인 비축유 방출 결정에도 불구하고, 이란의 추가 도발로 시장 불안감은 해소되지 않고 있습니다.',
    theme: 'red',
  },
  {
    id: 4,
    type: 'comparison',
    turnId: 11,
    title: '스태그플레이션 공포와 월가 전망',
    description:
      '유가 급등이 경기 침체와 물가 상승이 동반되는 스태그플레이션 우려를 키우면서, 월가에서도 비관적인 유가 전망이 잇따라 나오고 있습니다.',
    items: [
      {
        label: 'Macquarie',
        value: '$150 이상',
        description: '호르무즈 해협이 몇 주만 폐쇄되어도 유가가 150달러 이상으로 치솟을 수 있다고 전망',
        highlight: true,
      },
      {
        label: 'Oxford Economics',
        value: '$140',
        description: '유가가 배럴당 140달러까지 치솟을 경우 세계 경제가 완만한 침체에 빠질 수 있다고 경고',
      },
      {
        label: 'Goldman Sachs',
        value: '$93',
        description: '분쟁이 60일간 지속될 경우 브렌트유 가격이 배럴당 93달러에 이를 것으로 전망',
      },
    ],
  },
  {
    id: 5,
    type: 'headline',
    turnId: 15,
    icon: 'trending-up',
    title: '에너지 섹터: 나 홀로 강세',
    subtitle: '시장 하락 속 뚜렷한 디커플링 현상',
    description:
      '이란의 호르무즈 해협 봉쇄 위협이 현실화되면서 시장 전체가 공포에 휩싸인 가운데, 유일하게 에너지 섹터만이 강세를 보이며 완벽한 대조를 이뤘습니다.',
    bullets: [
      'S&P 500 -1.52%, 나스닥 -1.78% 등 주요 지수 급락',
      '공포지수(VIX) 하루 만에 12% 넘게 치솟음',
      '안전자산인 달러화 가치 상승',
      '유일하게 에너지 ETF(XLE)는 1% 가까이 상승 마감',
    ],
    theme: 'green',
    charts: [{ ticker: 'SP:SPX' }, { ticker: 'XLE' }],
  },
  {
    id: 6,
    type: 'stats',
    turnId: 19,
    title: '주요 에너지 기업 주가 강세',
    description:
      '시장 전반의 투매 속에서도 유가 급등의 수혜가 예상되는 에너지 기업들은 일제히 상승했습니다. 이는 에너지 안보 프리미엄이 반영된 결과로 분석됩니다.',
    stats: [
      { label: 'Occidental (OXY)', value: '+5.15%', trend: 'up' },
      { label: 'ConocoPhillips (COP)', value: '+2.76%', trend: 'up' },
      { label: 'Chevron (CVX)', value: '+2.70%', trend: 'up' },
      { label: 'ExxonMobil (XOM)', value: '+1.29%', trend: 'up' },
    ],
    note: '에너지 섹터 ETF(XLE)는 이틀 연속 강세를 보이며 사상 최고치를 경신했습니다.',
    theme: 'green',
    charts: [{ ticker: 'OXY' }, { ticker: 'XOM' }],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 21,
    icon: 'trending-down',
    title: '유가 쇼크에 타격받은 업종',
    subtitle: '에너지 비용 증가 직격탄',
    description:
      '에너지 섹터를 제외한 S&P 500의 10개 섹터가 모두 하락했습니다. 특히 유가 상승이 곧 비용 증가로 이어지는 산업들이 큰 타격을 입었습니다.',
    bullets: [
      '항공주 및 크루즈 관련주 동반 하락',
      '기술주 섹터 ETF(XLK) 1.84% 하락',
      '금융주 섹터 ETF(XLF) 1.63% 하락',
      '특이점: 인플레이션 우려로 안전자산인 국채 금리도 동반 상승',
    ],
    theme: 'amber',
    charts: [{ ticker: 'XLK' }, { ticker: 'XLF' }, { ticker: 'TVC:US10Y' }],
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'SCCO',
    companyName: 'Southern Copper',
    currentPrice: 180.56,
    dayChange: -11.46,
    dayChangePercent: -5.97,
    description:
      '구리 수요 증가 기대감에도 불구하고, 오늘 하루에만 6% 가까이 하락하며 시장의 우려를 반영했습니다. 불과 2주 전 기록적인 실적을 발표했음에도 주가는 약세를 보였습니다.',
    charts: [{ ticker: 'SCCO' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 25,
    ticker: 'SCCO',
    title: '견고한 실적 vs 지정학적 리스크',
    points: [
      '2025년 기록적 실적: 순매출 17%↑, 순이익 28%↑',
      '52%에 달하는 높은 영업이익률로 강력한 비용 경쟁력 입증',
      '모든 자산이 페루, 멕시코 단 2개국에 100% 집중',
      '페루의 정치적 불안정, 멕시코의 광업법 개정 등 사업 환경 불확실성 증대',
    ],
    outlook: '시장의 우려는 기업의 뛰어난 펀더멘털이 아닌, 자산이 위치한 "장소"의 리스크에 집중되고 있습니다.',
    outlookColor: 'amber',
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'SCCO',
    title: '구체화되는 리스크 요인',
    points: [
      '페루 핵심 성장 동력인 티아 마리아 프로젝트, 7개 소송에 직면하며 무기한 지연 가능성',
      '멕시코에서 10년 전 발생한 광산 유출 사고 관련 법적 책임 지속',
      '10-K 보고서: 국유화 등 정치적 리스크는 보험으로 보장되지 않음을 명시',
      '투자자들은 장기 성장성보다 당장의 통제 불가능한 리스크를 가격에 반영하기 시작',
    ],
    outlook: '세계 최고 수준의 자산이라도 그 기반이 불안정하다면 충분한 안전마진을 확보하기 어렵다는 판단이 확산된 결과로 해석됩니다.',
    outlookColor: 'rose',
  },
  {
    id: 11,
    type: 'events',
    turnId: 33,
    title: '향후 시장 방향을 결정할 주요 지표',
    description:
      '오늘 시장은 인플레이션 우려와 기술주 성장성 사이에서 줄다리기를 했습니다. 이번 주 남은 기간 동안 발표될 경제지표들이 연준의 다음 행보를 가늠하는 중요한 단서가 될 것입니다.',
    events: [
      {
        date: '내일',
        label: '생산자물가지수 (PPI)',
        description: '인플레이션 고착화 여부를 판단할 핵심 지표',
      },
      {
        date: '내일',
        label: '소매판매',
        description: '미국 경제의 70%를 차지하는 소비 건전성 확인',
      },
      {
        date: '다음 주',
        label: '연방공개시장위원회 (FOMC)',
        description: '연준의 금리 인하 시점 결정에 대한 힌트 제공',
      },
    ],
  },
  {
    id: 12,
    type: 'headline',
    turnId: 35,
    icon: 'calendar-dots',
    title: '다음 주 FOMC 관전 포인트',
    subtitle: '시장의 관심은 "점도표"에 집중',
    description:
      '시장은 이번 FOMC 회의에서 금리 동결을 기정사실화하고 있지만, 진짜 관심사는 연준 위원들의 금리 전망을 보여주는 점도표의 변화 여부입니다.',
    bullets: [
      '금리 동결은 기정사실화된 분위기',
      '핵심은 연준 위원들의 금리 전망을 담은 점도표',
      '기존 "연내 3회 금리 인하" 전망 유지 여부 불확실',
      '인하 횟수가 2회로 축소될 경우, 시장에 매파적 신호로 작용 가능',
    ],
    theme: 'purple',
  },
  {
    id: 13,
    type: 'closing',
    turnId: 37,
    headline: '펀더멘털에 집중하되 변동성에 대비하라',
    tagline: 'AI 성장 동력과 연준 통화정책 불확실성 사이, 균형 잡힌 시각이 필요한 시점입니다.',
    description:
      '시장이 사상 최고가 부근에서 움직이고 있지만, 인플레이션이라는 복병은 여전히 남아있습니다. 섣부른 추격 매수보다는 앞으로 발표될 경제 지표와 연준의 신호를 차분히 확인하며 대응 전략을 세우시길 권합니다.',
  },
];