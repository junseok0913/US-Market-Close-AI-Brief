import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-02-20',
    nutshell: '대법원의 관세 제동에 불확실성 걷히며 증시 랠리',
    description:
      '장 초반 부진한 경제 지표의 영향으로 하락 출발했던 시장이, 대통령의 관세 부과 권한에 제동을 건 대법원 판결 소식에 극적으로 반등하며 강한 상승세로 마감했습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '예상보다 낮은 GDP와 높은 물가 지표에 대한 우려로 하락 출발했으나, 대법원 판결이 투자 심리를 급격히 회복시키며 주요 지수가 모두 상승 마감했습니다.',
    indices: [
      { name: 'S&P 500', value: 6909.51, change: 47.62, changePercent: 0.69 },
      { name: 'NASDAQ', value: 22886.07, change: 203.34, changePercent: 0.90 },
      { name: 'DOW', value: 49625.97, change: 230.81, changePercent: 0.47 },
      { name: 'Russell 2000', value: 2663.78, change: -1.31, changePercent: -0.05 },
    ],
    commodities: [
      { name: '10년물 국채금리', value: 4.09, change: 0.01, changePercent: 0.27 },
      { name: '달러 인덱스', value: 97.71, change: -0.22, changePercent: -0.23 },
      { name: 'WTI Crude', value: 66.32, change: -0.11, changePercent: -0.17 },
      { name: 'Gold Futures', value: 5116.00, change: 140.10, changePercent: 2.82 },
    ],
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'NASDAQ:IXIC', title: 'NASDAQ' },
      { ticker: 'DJ:DJI', title: 'DOW' },
      { ticker: 'TVC:RUT', title: 'Russell 2000' },
    ],
  },
  {
    id: 2,
    type: 'headline',
    turnId: 3,
    icon: 'gavel',
    title: '대법원, 관세 부과 권한에 제동',
    subtitle: '시장의 방향을 바꾼 결정적 판결',
    description:
      '대법원은 행정부가 의회 승인 없이 비상경제권법(IEEPA)을 근거로 광범위한 관세를 부과하는 것은 위헌이라고 판결했습니다. 이는 기업 비용 부담과 미래 불확실성을 크게 해소할 것이라는 기대를 낳았습니다.',
    bullets: [
      '행정부의 광범위한 관세 부과 ‘위헌’ 판결',
      '기업 비용 부담 및 미래 불확실성 해소 기대',
      '소매, 소비재, 자동차 부품 등 수입 의존도 높은 업종 수혜',
      '인플레이션 완화에도 긍정적 영향 기대감 형성',
    ],
    theme: 'blue',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 7,
    title: '관세 판결의 시장 파급 효과',
    description:
      '대법원 판결 소식에 시장은 즉각적으로 환호했습니다. 주식 등 위험자산 선호 심리가 강해졌고, 특히 관세에 민감한 소매업종이 강한 상승세를 보였습니다.',
    stats: [
      { label: 'S&P 500', value: '+0.69%', subtext: '극적인 V자 반등', trend: 'up' },
      { label: '소매업종 ETF (XRT)', value: '강세', subtext: '주요 지수 상회', trend: 'up' },
      { label: '예상 관세 환급액', value: '$1,750억', subtext: '펜실베이니아 와튼 스쿨 추산', trend: 'up' },
    ],
    note: '10년물 국채금리는 위험자산 선호 심리에 소폭 상승, 달러화는 약세를 보였습니다.',
    theme: 'green',
    charts: [
      { ticker: 'SP:SPX', title: 'S&P 500' },
      { ticker: 'XRT', title: '소매업종 ETF' },
      { ticker: 'TVC:US10Y', title: '10년물 국채금리' },
    ],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 9,
    title: '관세 철폐 수혜주 부상',
    subtitle: '소매 및 소비재 기업 중심 강세',
    description:
      '해외에서 상품을 수입해 판매하는 기업들의 수입 원가 절감 기대감이 커지면서 관련 주가들이 즉각적으로 반응했습니다. 이는 기업 실적과 소비자 후생에 동시에 긍정적인 영향을 줄 수 있습니다.',
    bullets: [
      '아마존 (AMZN): 대형 온라인 소매업체',
      '태피스트리 (TPR): 의류 브랜드',
      '윌리엄스 소노마 (WSM): 가구 및 생활용품',
      '이마케터 분석: 美 소매 판매 성장률 전망치 $130억 상향 조정 효과',
    ],
    theme: 'green',
  },
  {
    id: 5,
    type: 'comparison',
    turnId: 11,
    title: '호재 속 잠재된 리스크',
    description:
      '시장의 환호에도 불구하고, 행정부가 다른 법적 수단을 통해 무역 장벽을 유지할 수 있다는 우려는 여전히 남아있습니다. 근본적인 무역 정책의 긴장감은 지속될 가능성이 있습니다.',
    items: [
      {
        label: '단기적 기대 (시장 반응)',
        value: '관세 철폐',
        description: 'IEEPA 기반 관세 위헌 판결로 비용 감소 및 불확실성 해소 기대',
        highlight: true,
      },
      {
        label: '장기적 우려 (행정부 대응)',
        value: '대체 관세 부과',
        description: '판결 직후 ‘1974년 무역법 122조’ 발동, 10% 글로벌 관세 부과 발표',
        highlight: false,
      },
      {
        label: '남아있는 카드',
        value: '기타 무역법',
        description: '무역확장법 232조(국가 안보), 무역법 301조(불공정 무역) 등은 유효',
        highlight: false,
      },
    ],
  },
  {
    id: 6,
    type: 'stats',
    turnId: 14,
    title: '엇갈린 경제 지표 발표',
    description:
      '개장 전 발표된 주요 경제 지표들은 경기 둔화와 인플레이션 우려를 동시에 자극하며 시장에 부담으로 작용했습니다. 하지만 대법원 판결이라는 더 큰 변수가 이를 압도했습니다.',
    stats: [
      { label: '4분기 GDP 성장률 (예비치)', value: '1.4%', subtext: '예상치 3.0% 크게 하회', trend: 'down' },
      { label: '12월 근원 PCE 가격지수 (MoM)', value: '+0.4%', subtext: '예상치 0.3% 상회', trend: 'up' },
      { label: 'S&P 500 장중 흐름', value: 'V자 반등', subtext: '개장 직후 6836 → 장중 6915 돌파', trend: 'up' },
    ],
    note: '장 초반 스태그플레이션 우려를 대법원 판결 호재가 압도하며 시장이 급반전했습니다.',
    theme: 'amber',
    charts: [{ ticker: 'SP:SPX', title: 'S&P 500 장중 흐름' }],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 16,
    title: 'GDP 쇼크, 세부 내용은?',
    subtitle: '성장 둔화 우려 속 긍정적 신호도 존재',
    description:
      'GDP 헤드라인 숫자는 시장에 충격을 주었지만, 세부적으로는 기업 투자 가속화 등 긍정적인 내용도 포함되어 있어 미국 내수 경제의 기반이 완전히 무너지지 않았음을 보여주었습니다.',
    bullets: [
      '부정적 요인: 정부 지출 및 수출 감소세 전환',
      '부정적 요인: 소비지출 증가세 둔화',
      '긍정적 요인: 기업 설비 투자 등 민간 고정 투자 가속',
      '긍정적 요인: 실질 최종 판매 2.4% 증가 (견조한 내수)',
    ],
    theme: 'amber',
  },
  {
    id: 8,
    type: 'headline',
    turnId: 18,
    title: '끈적한 물가, 연준의 고민은 계속된다',
    subtitle: '예상 상회한 PCE 지표, 매파적 기조 강화',
    description:
      '연준이 가장 중요하게 여기는 근원 PCE 가격지수가 예상을 웃돌면서 인플레이션 둔화세가 순탄치 않음을 시사했습니다. 이는 연준의 금리 인하 신중론을 더욱 강화할 수 있는 요인입니다.',
    bullets: [
      '근원 PCE 가격지수 0.4% 상승 (예상 0.3%, 전월 0.2%)',
      '인플레이션 둔화세가 순탄치 않음을 시사',
      '1월 FOMC 의사록의 ‘금리 인하 신중론’ 재확인',
      '관세 철폐 기대감이 단기 물가 지표 충격 흡수',
    ],
    theme: 'red',
  },
  {
    id: 9,
    type: 'ticker-intro',
    turnId: 21,
    ticker: 'BLK',
    companyName: 'BlackRock, Inc.',
    currentPrice: 1093.64,
    dayChange: 12.36,
    dayChangePercent: 1.14,
    description:
      '세계 최대 자산운용사 블랙록이 시장의 전반적인 상승세 속에서 장 초반 저점을 딛고 1.77% 강하게 반등하며 마감했습니다.',
    charts: [{ ticker: 'BLK' }],
  },
  {
    id: 10,
    type: 'ticker-analysis',
    turnId: 22,
    ticker: 'BLK',
    title: '성장 스토리: 기술 플랫폼으로의 진화',
    points: [
      '핵심 리스크 관리 플랫폼 ‘알라딘’의 고마진 구독 서비스화',
      '비트코인 현물 ETF 출시로 디지털 자산 시장 선점',
      '공격적 M&A를 통한 사모 시장 등 신성장 동력 확보',
      '시장은 블랙록을 단순 자산운용사를 넘어 금융 기술 기업으로 평가',
    ],
    description:
      '시장은 블랙록의 미래 성장 스토리에 주목하며, 저성장 시대의 한계를 극복하기 위한 전략적 투자를 긍정적으로 평가하는 분위기입니다.',
    outlook: '긍정적 기대감',
    outlookColor: 'emerald',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 24,
    ticker: 'BLK',
    title: '현실의 벽: 악화되는 수익성',
    points: [
      '2025년 3분기, 매출 25% 증가에도 영업이익은 오히려 감소',
      '대규모 M&A와 관련된 비용 43% 급증이 원인',
      '영업이익률 38.6% → 30.0%로 8.6%p 급락',
      '핵심 성장 동력 ‘알라딘’의 매출 비중은 아직 8%에 불과',
    ],
    description:
      '대규모 M&A로 인한 비용 증가가 전체적인 마진을 훼손하고 있으며, 알라딘의 성장이 이를 상쇄하기에는 아직 역부족이라는 냉정한 평가가 나오고 있습니다.',
    outlook: '수익성 악화 우려',
    outlookColor: 'rose',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 26,
    ticker: 'BLK',
    title: '밸류에이션 및 잠재 리스크',
    points: [
      '부분가치합(SOTP) 분석 시, 현재 주가가 내재가치보다 높다는 평가 존재',
      '시스템적으로 중요한 금융기관(SIFI) 지정 가능성에 따른 규제 리스크',
      '대규모로 인수한 기업들을 성공적으로 통합하지 못할 운영 리스크',
      '현재 주가에 이러한 리스크들이 충분히 반영되지 않았다는 시각',
    ],
    description:
      '성장 기대감이 선반영된 주가에는 규제 및 운영 리스크가 충분히 고려되지 않았을 수 있다는 점을 유의해야 합니다.',
    outlook: '잠재 리스크 상존',
    outlookColor: 'amber',
  },
  {
    id: 13,
    type: 'ticker-analysis',
    turnId: 28,
    ticker: 'BLK',
    title: '종합 투자 판단',
    points: [
      '미래 성장 잠재력과 현재의 수익성 악화가 충돌하는 변곡점',
      '현재 주가는 성장 스토리를 상당 부분 선반영하여 부담 존재',
      'M&A 시너지 및 마진 안정화 여부 확인 필요',
      '신사업 성장이 전체 이익 감소를 상쇄할 만큼 가속화되는지 관찰',
    ],
    description:
      '공격적인 접근보다는 향후 실적 발표를 통해 펀더멘털 개선을 확인하는 신중한 관점이 필요한 시점입니다.',
    outlook: '관망 및 확인 필요',
    outlookColor: 'blue',
  },
  {
    id: 14,
    type: 'events',
    turnId: 32,
    title: '다음 주 주요 경제 일정',
    description:
      '다음 주 발표될 주요 경제 지표들이 시장의 방향성을 결정할 중요한 변수가 될 전망입니다. 특히 부동산, 소비, 물가 관련 지표에 주목해야 합니다.',
    events: [
      { date: '2026-02-24', label: '주택가격지수', description: '부동산 시장 건전성 판단 지표' },
      { date: '2026-02-24', label: 'CB 소비자신뢰지수', description: '미국 경제의 핵심인 소비 심리 바로미터' },
      { date: '2026-02-27', label: '근원 생산자물가지수 (Core PPI)', description: '인플레이션 향방을 가늠할 핵심 선행 지표' },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 36,
    headline: '변동성 장세, 본질 가치에 집중',
    tagline: '2026년 2월 20일 장마감 브리핑',
    description:
      '시장이 방향성을 탐색하는 구간에서는 단기 예측보다 기업의 펀더멘털과 실적에 집중하고, 경제 지표가 연준의 정책에 미칠 영향을 큰 그림에서 분석하며 차분하게 대응하는 전략이 유효합니다.',
  },
];