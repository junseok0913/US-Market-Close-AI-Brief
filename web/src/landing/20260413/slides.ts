import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-04-14',
    nutshell: '지정학적 리스크와 경기 둔화 우려에도 기술주 반등',
    description:
      '중동의 지정학적 긴장과 부진한 경제 지표에도 불구하고, 시장은 대형 기술주 중심의 저가 매수세에 힘입어 강한 반등을 보였습니다. 오늘 브리핑에서는 상반된 시장 흐름과 KKR의 급등 배경을 심층 분석합니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '장 초반 지정학적 리스크로 위축되었던 투자 심리가 생산자물가지수 둔화 소식에 힘입어 회복되며 기술주 중심으로 상승 마감했습니다.',
    indices: [
      { name: 'S&P 500', value: 6886.24, change: 69.35, changePercent: 1.02 },
      { name: 'NASDAQ', value: 23183.74, change: 280.85, changePercent: 1.23 },
      { name: 'DOW', value: 48218.25, change: 301.68, changePercent: 0.63 },
      { name: 'Russell 2000', value: 2670.49, change: 39.90, changePercent: 1.52 },
      { name: 'Dollar Index', value: 98.41, change: -0.24, changePercent: -0.25 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 98.01, change: 1.44, changePercent: 1.49 },
      { name: 'Gold Futures', value: 4766.60, change: 4.70, changePercent: 0.10 },
      { name: '10Y-Yield', value: 4.35, change: -0.05, changePercent: -1.13 },
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
    icon: 'anchor',
    title: '지정학적 리스크와 시장의 회복력',
    subtitle: '유가 100달러 돌파 충격 흡수',
    description:
      '이란의 호르무즈 해협 봉쇄 위협과 트럼프 대통령의 강경 발언으로 국제 유가가 급등했으나, 시장은 장 초반의 충격을 모두 흡수하고 놀라운 회복력을 보이며 반등에 성공했습니다.',
    bullets: [
      '이란, 호르무즈 해협 봉쇄 위협으로 긴장 고조',
      'WTI 유가, 장중 배럴당 100달러 돌파',
      '장 초반 하락세 딛고 주요 3대 지수 모두 상승 마감',
      '미 10년물 국채 금리, 하락 후 상승 전환하며 위험회피 심리 완화',
    ],
    theme: 'amber',
    charts: [{ ticker: 'NYMEX:CL1!' }, { ticker: 'TVC:US10Y' }],
  },
  {
    id: 3,
    type: 'headline',
    turnId: 9,
    icon: 'cpu',
    title: '기술주, 반등을 이끌다',
    subtitle: '저가 매수세 유입과 성장주 선호 현상',
    description:
      '투자자들은 지정학적 불확실성보다 AI와 같은 명확한 성장 스토리를 가진 대형 기술주에 집중했습니다. 부진한 경제지표가 오히려 금리 인상 사이클 종료 기대로 이어지며 기술주에 긍정적으로 작용했습니다.',
    bullets: [
      '나스닥, 주요 지수 중 가장 높은 1.23% 상승률 기록',
      '투자자, 거시 경제 노이즈보다 AI 등 성장 스토리에 집중',
      '부진한 기존주택판매 지표, 역설적으로 금리 인상 종료 기대로 작용',
      '생산자물가지수(PPI) 둔화 기대감 선반영',
    ],
    theme: 'blue',
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'NASDAQ:NVDA' }],
  },
  {
    id: 4,
    type: 'stats',
    turnId: 11,
    title: '잠재된 시한폭탄: 고유가 리스크',
    description:
      '시장은 유가 급등을 외면했지만, 이는 사라진 악재가 아닙니다. 물류 교란이 장기화될 경우 소비 위축과 기업 비용 증가로 이어져 증시 전반에 부담을 줄 수 있습니다.',
    stats: [
      {
        label: '호르무즈 해협 봉쇄',
        value: '장기화 우려',
        subtext: '유가 100달러 이상 고착화 가능성',
        trend: 'up',
      },
      {
        label: '미국 내 휘발유 가격',
        value: '갤런당 $5 전망',
        subtext: 'JP모건 등 투자은행 경고',
        trend: 'up',
      },
      {
        label: '에너지 섹터(XLE)',
        value: '강세',
        subtext: '유가 상승 수혜와 인플레 경계심리 공존',
        trend: 'up',
      },
    ],
    theme: 'red',
    charts: [{ ticker: 'NYMEX:CL1!' }, { ticker: 'AMEX:XLE' }],
  },
  {
    id: 5,
    type: 'stats',
    turnId: 13,
    title: '선택적 랠리: 온기는 기술주에만',
    description:
      '시장의 반등은 소수의 대형 기술주에 집중되었으며, 경제의 허리가 약해지고 있다는 신호는 여전합니다. 시장은 지정학적 리스크를 단기 소음으로 치부하고 기술주의 성장성에만 베팅했습니다.',
    stats: [
      {
        label: '나스닥 상승률',
        value: '+1.23%',
        subtext: '대형 기술주 강세 주도',
        trend: 'up',
      },
      {
        label: '다우존스 상승률',
        value: '+0.63%',
        subtext: '상대적으로 낮은 상승폭',
        trend: 'up',
      },
      {
        label: '기업낙관지수',
        value: '예상 하회',
        subtext: '경제 허리 약화 신호',
        trend: 'down',
      },
    ],
    theme: 'purple',
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'DJ:DJI' }],
  },
  {
    id: 6,
    type: 'stats',
    turnId: 15,
    title: '인플레이션 둔화 신호',
    description:
      '예상보다 낮게 발표된 3월 생산자물가지수(PPI)가 인플레이션 압력 완화 기대감을 키웠습니다. 이에 국채 금리가 하락하며 금리에 민감한 기술주에 강력한 순풍으로 작용했습니다.',
    stats: [
      {
        label: '3월 생산자물가지수(PPI)',
        value: '예상 하회',
        subtext: '인플레이션 압력 완화 기대',
        trend: 'down',
      },
      {
        label: '미 10년물 국채금리',
        value: '하락 전환',
        subtext: '금리 민감 기술주에 호재',
        trend: 'down',
      },
      {
        label: '연준 위원 연설',
        value: '비둘기파적 발언 기대',
        subtext: '굴스비, 바 등 연설 예정',
        trend: 'neutral',
      },
    ],
    theme: 'green',
    charts: [{ ticker: 'TVC:US10Y' }],
  },
  {
    id: 7,
    type: 'comparison',
    turnId: 19,
    title: '엇갈린 경제 신호: 시장의 선택은?',
    description:
      '시장은 실물 경제 둔화 우려보다 인플레이션 완화라는 호재에 더 크게 환호하며 기술주 중심의 안도 랠리를 펼쳤습니다.',
    items: [
      {
        label: '긍정적 신호 (Bullish)',
        value: '인플레이션 둔화',
        description: '3월 PPI 예상 하회, 연준 긴축 완화 기대감으로 기술주 랠리 촉발',
        highlight: true,
      },
      {
        label: '부정적 신호 (Bearish)',
        value: '실물 경제 둔화',
        description: '기존주택판매 부진, 골드만삭스 소비 위축 경고 등 경기 침체 우려 상존',
        highlight: false,
      },
      {
        label: '시장의 반응',
        value: '기술주 선택',
        description: '경기 침체 우려를 잠시 뒤로하고 인플레이션 완화 호재에 집중, ‘질주로의 도피’ 현상',
        highlight: false,
      },
    ],
  },
  {
    id: 8,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'KKR',
    companyName: 'KKR & Co. Inc.',
    currentPrice: 98.14,
    dayChange: 6.92,
    dayChangePercent: 7.59,
    description:
      '글로벌 대체투자 운용사 KKR이 하루 만에 7% 넘게 급등하며 98달러 선에서 마감, 시장의 폭발적인 관심을 받았습니다.',
    charts: [{ ticker: 'NYSE:KKR' }],
  },
  {
    id: 9,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'KKR',
    title: '비즈니스 모델 재평가',
    description:
      '시장은 KKR을 더 이상 변동성 큰 사모펀드가 아닌, 안정적인 자산운용 플랫폼으로 재평가하기 시작했습니다. 핵심은 보험 자회사를 통해 확보한 ‘영구 자본’ 모델의 가치가 부각된 것입니다.',
    points: [
      '안정적인 자산운용 플랫폼으로 가치 부각',
      '보험 자회사 인수를 통한 ‘영구 자본’ 모델 확보',
      '수수료 기반 운용자산(AUM) 18% 증가 ($6,041억)',
      '변동성 낮은 관리 수수료 기반 이익 13.7% 성장',
    ],
    outlook: '수익의 질이 근본적으로 개선되고 있다는 점을 시장이 긍정적으로 평가하고 있습니다.',
    outlookColor: 'emerald',
  },
  {
    id: 10,
    type: 'headline',
    turnId: 25,
    icon: 'alert-triangle',
    title: "KKR의 '이중 노출' 리스크",
    subtitle: '금리 상승기의 구조적 취약점',
    description:
      '보험 사업 편입은 금리 변동이라는 새로운 리스크에 직접 노출됨을 의미합니다. 금리 급등 시 자산 가치 하락과 부채 유출 압력이 동시에 발생하는 최악의 시나리오가 발생할 수 있습니다.',
    bullets: [
      '금리 급등 시 보험사 보유 채권 포트폴리오 가치 하락',
      '고객의 보험 계약 해지 및 자금 인출 압력 증가',
      '자산 가치 하락과 부채 유출 동시 발생 가능성',
      '10-K 공시: 금리 0.5%p 상승 시 $13.4억 평가손실 발생 가능',
    ],
    theme: 'red',
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 27,
    ticker: 'KKR',
    title: '계산된 리스크: 헤지 전략',
    description:
      'KKR은 수백억 달러 규모의 정교한 파생상품 헤지 프로그램을 통해 ‘이중 노출’ 리스크를 적극적으로 관리하고 있습니다.',
    points: [
      '수백억 달러 규모의 정교한 파생상품 헤지 프로그램 운영',
      '금리 0.5%p 상승 시, 헤지 효과로 순이익은 오히려 $3억 이상 증가',
      '회계적 충격(평가손실)은 발생하나, 경제적 충격(현금흐름)은 통제',
      '‘이중 노출’은 방치된 시한폭탄이 아닌 관리되고 있는 리스크',
    ],
    outlook: '리스크 관리 능력이 확인되었으나, 투자자는 지속적인 관찰이 필요합니다.',
    outlookColor: 'amber',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'KKR',
    title: '종합 투자 판단',
    description:
      'KKR은 안정적인 이익 구조와 성장 잠재력을 갖춘 우량 기업으로 진화했지만, 새로운 형태의 리스크도 안게 되었습니다. 최근 주가 급등은 이러한 긍정적 변화를 상당 부분 반영한 것으로 보입니다.',
    points: [
      '안정적 수수료 기반 이익 구조로 우량 기업으로 진화',
      '영구 자본을 활용한 성장 잠재력 유효',
      '보험 사업 편입으로 새로운 거시경제 리스크 발생',
      '최근 주가 급등으로 긍정적 변화가 상당 부분 반영됨',
    ],
    outlook: '공격적 접근보다 펀더멘털 변화와 리스크 관리 능력을 관찰하는 신중한 자세가 필요한 시점입니다.',
    outlookColor: 'blue',
  },
  {
    id: 13,
    type: 'headline',
    turnId: 31,
    icon: 'eye',
    title: '관망세 짙어진 시장',
    subtitle: '방향성 탐색 구간 진입',
    description:
      '인플레이션 둔화 기대와 경기 침체 우려가 공존하며 시장 참여자들의 복잡한 심리가 드러났습니다. 뚜렷한 방향성 없이 지수별로 등락이 엇갈리는 혼조세로 장을 마감했습니다.',
    bullets: [
      '인플레이션 둔화 기대와 경기 침체 우려 공존',
      '뚜렷한 방향성 없이 지수별 등락 엇갈리는 혼조세',
      '나스닥 소폭 하락, 다우존스 강보합 마감',
      '투자자들, 연준의 향후 행보에 촉각',
    ],
    theme: 'purple',
  },
  {
    id: 14,
    type: 'events',
    turnId: 33,
    title: '향후 주요 경제 지표',
    description:
      '향후 발표될 주요 경제 지표들은 연준의 다음 금리 결정에 대한 중요한 단서를 제공할 것입니다. 투자자들은 이를 통해 시장의 방향성을 가늠하려 할 것입니다.',
    events: [
      {
        date: '4월 15일',
        label: '연준 베이지북 공개',
        description: '미국 경제 동향 및 연준의 경기 판단 시각 확인',
      },
      {
        date: '4월 21일',
        label: '소매판매 지표 발표',
        description: '미국 경제의 2/3를 차지하는 소비 건전성 확인',
      },
      {
        date: '4월 29일',
        label: 'FOMC 금리 결정',
        description: '베이지북, 소매판매 등 지표를 종합해 금리 정책 결정',
      },
    ],
  },
  {
    id: 15,
    type: 'closing',
    turnId: 37,
    headline: '변동성 장세, 신중한 접근 필요',
    tagline: '데이터에 기반한 차분한 대응',
    description:
      '시장의 방향성이 결정되기 전까지 변동성이 클 수 있습니다. 거시 경제 지표와 함께 다가오는 실적 시즌의 기업 펀더멘털을 꼼꼼히 확인하며 시장의 신호에 귀 기울이는 지혜가 필요한 시점입니다.',
  },
];