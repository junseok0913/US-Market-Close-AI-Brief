import type { Slide } from '@/types/slide';

export const slides: Slide[] = [
  {
    id: 0,
    type: 'title',
    turnId: 0,
    date: '2026-03-05',
    nutshell: '지정학적 우려 완화와 기술주 강세에 따른 반등 장세',
    description:
      '며칠간의 하락세를 멈추고 3대 지수 모두 상승 마감했습니다. 지정학적 리스크 완화와 견조한 경제 지표가 투자 심리를 개선시키며 기술주 중심의 강한 반등을 이끌었습니다.',
  },
  {
    id: 1,
    type: 'market-summary',
    turnId: 1,
    title: '오늘의 시장 요약',
    description:
      '이란 관련 분쟁이 외교적 해결의 실마리를 보인다는 소식에 투자 심리가 크게 개선되며 3대 지수 모두 상승했습니다. 특히 기술주 중심의 나스닥이 가장 강한 회복세를 보였습니다.',
    indices: [
      { name: 'S&P 500', value: 6869.50, change: 52.87, changePercent: 0.78 },
      { name: 'NASDAQ', value: 22807.48, change: 290.79, changePercent: 1.29 },
      { name: 'DOW', value: 48739.41, change: 238.14, changePercent: 0.49 },
      { name: 'Russell 2000', value: 2636.01, change: 27.65, changePercent: 1.06 },
    ],
    commodities: [
      { name: 'WTI Crude', value: 76.11, change: 1.55, changePercent: 2.08 },
      { name: 'Gold Futures', value: 5151.60, change: 44.20, changePercent: 0.87 },
      { name: 'Dollar Index', value: 98.81, change: -0.24, changePercent: -0.24 },
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
    icon: 'globe',
    title: '지정학적 리스크 완화',
    subtitle: '이란-미국 비공식 접촉 소식에 안도 랠리',
    description:
      '이란이 비공식 채널을 통해 미국과 접촉했다는 뉴욕 타임스 보도가 전해지자, 전면전 우려가 급격히 완화되며 시장 전반에 안도 랠리를 촉발시켰습니다.',
    bullets: [
      'NYT 보도: 이란, 제3국 통해 미국과 접촉',
      '전면전 우려 완화로 투자 심리 급격히 개선',
      '3대 지수 동반 상승, 나스닥 1.3% 급등',
      '안전자산 이탈, 위험자산 선호 심리 회복',
    ],
    theme: 'green',
  },
  {
    id: 3,
    type: 'stats',
    turnId: 8,
    title: '주요 지표 동향',
    description:
      '지정학적 우려 완화에 따라 안전자산에서 위험자산으로 자금이 이동하며 주요 지표들이 급변했습니다.',
    stats: [
      {
        label: 'VIX 지수',
        value: '21선으로 하락',
        subtext: '변동성 완화',
        trend: 'down',
      },
      {
        label: 'WTI 유가',
        value: '73달러 선으로 후퇴',
        subtext: '리스크 프리미엄 제거',
        trend: 'down',
      },
      {
        label: '美 10년물 국채금리',
        value: '4.08%로 상승',
        subtext: '안전자산 선호 약화',
        trend: 'up',
      },
    ],
    theme: 'blue',
    charts: [{ ticker: 'TVC:VIX' }, { ticker: 'NYMEX:CL' }, { ticker: 'TVC:US10Y' }],
  },
  {
    id: 4,
    type: 'headline',
    turnId: 9,
    icon: 'fuel',
    title: '에너지 시장 안정',
    subtitle: '호르무즈 해협 봉쇄 우려 해소',
    description:
      '전 세계 원유 수송량의 약 20%를 차지하는 호르무즈 해협의 봉쇄 가능성이 줄어들자, 급등했던 유가가 빠르게 안정을 되찾으며 인플레이션 재발 우려를 완화시켰습니다.',
    bullets: [
      '핵심 리스크: 호르무즈 해협 봉쇄 가능성',
      '분쟁 우려 고조 시 WTI 유가 77달러 돌파',
      '외교적 해결 가능성 부상하며 유가 급락',
      '에너지 공급망 붕괴 우려 완화',
    ],
    theme: 'green',
    charts: [{ ticker: 'NYMEX:CL', title: 'WTI Crude Oil' }],
  },
  {
    id: 5,
    type: 'stats',
    turnId: 11,
    title: '견조한 경제 펀더멘털',
    description:
      '지정학적 안도감에 더해, 탄탄한 미국 경제 지표가 발표되면서 시장의 상승세에 힘을 보탰습니다.',
    stats: [
      {
        label: '2월 ADP 민간 고용',
        value: '6.3만 개 증가',
        subtext: '예상(5만) 상회',
        trend: 'up',
      },
      {
        label: '2월 ISM 서비스업 PMI',
        value: '56.1',
        subtext: '3년 반 만에 최고',
        trend: 'up',
      },
      {
        label: '서비스업 물가 지수',
        value: '11개월래 최저',
        subtext: '인플레 압력 완화',
        trend: 'down',
      },
    ],
    theme: 'blue',
  },
  {
    id: 6,
    type: 'comparison',
    turnId: 13,
    title: '공포에서 기회로: 시장 심리 변화',
    description:
      '단 하루 만에 시장의 분위기는 극적인 반전을 보였습니다. 투자자들의 관심은 다시 경제 펀더멘털로 이동하고 있습니다.',
    items: [
      {
        label: '분쟁 초기',
        value: '공포 확산',
        description: '글로벌 증시 충격, 안전자산 선호 심리 고조',
      },
      {
        label: '현재',
        value: '안도 랠리',
        description: '외교적 해결 기대감, 기술주 중심 저가 매수세 유입',
        highlight: true,
      },
      {
        label: '향후 전망',
        value: '펀더멘털 주목',
        description: '관심사, 지정학적 리스크에서 경제 지표 및 기업 실적으로 이동',
      },
    ],
  },
  {
    id: 7,
    type: 'headline',
    turnId: 15,
    icon: 'cpu',
    title: '기술주, 반등의 중심에 서다',
    subtitle: '위험자산 선호 심리 회복에 랠리 주도',
    description:
      'VIX 지수 하락, 국채 금리 안정 등 우호적인 환경이 조성되면서 그동안 하락 폭이 컸던 기술주에 저가 매수세가 강하게 유입되었습니다.',
    bullets: [
      '나스닥 지수 1.3% 상승하며 시장 주도',
      'VIX 지수 하락 및 국채 금리 안정',
      '견조한 경제 지표, 경기 연착륙 기대감 상승',
      '유가 안정으로 인플레이션 우려 완화',
    ],
    theme: 'purple',
    charts: [{ ticker: 'NASDAQ:IXIC' }, { ticker: 'NASDAQ:SOXX' }],
  },
  {
    id: 8,
    type: 'comparison',
    turnId: 17,
    title: '매그니피센트 7 동반 상승',
    description:
      '대형 기술주들이 개별 호재와 함께 일제히 상승하며 시장 반등을 이끌었습니다.',
    items: [
      {
        label: 'NVIDIA',
        value: '상승',
        description: 'AI 랠리 선두주자로서 견조한 흐름 지속',
      },
      {
        label: 'Apple',
        value: '상승',
        description: '저가형 맥북 네오 공개, 교육 시장 공략 기대감',
        highlight: true,
      },
      {
        label: 'Tesla',
        value: '상승',
        description: 'BofA, 자율주행/로보택시 긍정 평가에 반등',
      },
    ],
  },
  {
    id: 9,
    type: 'stats',
    turnId: 19,
    title: '반도체 섹터, 랠리 선봉에 서다',
    description:
      'AI 기술이 반도체 생태계 전반으로 확산될 것이라는 기대감에 필라델피아 반도체 지수는 나스닥 상승률을 웃도는 강한 흐름을 보였습니다.',
    stats: [
      { label: '필라델피아 반도체 지수', value: '+2.15%', trend: 'up' },
      { label: '나스닥 지수', value: '+1.29%', trend: 'up' },
      {
        label: '시장 대비 초과 성과',
        value: 'Outperform',
        subtext: 'AI 생태계 확장 기대감',
        trend: 'up',
      },
    ],
    theme: 'purple',
    charts: [{ ticker: 'NASDAQ:SOXX' }, { ticker: 'NASDAQ:IXIC' }],
  },
  {
    id: 10,
    type: 'ticker-intro',
    turnId: 22,
    ticker: 'AVGO',
    companyName: 'Broadcom',
    currentPrice: 317.53,
    dayChange: 3.69,
    dayChangePercent: 1.18,
    description:
      '강력한 실적 발표에도 불구하고, 장 초반 상승분을 대부분 반납하며 보합권에서 마감했습니다. 시장의 복합적인 평가를 보여주는 변동성 높은 하루였습니다.',
    charts: [{ ticker: 'NASDAQ:AVGO' }],
  },
  {
    id: 11,
    type: 'ticker-analysis',
    turnId: 23,
    ticker: 'AVGO',
    title: '폭발적인 AI 성장세',
    points: [
      '1분기 실적, 시장 예상치 상회',
      '2분기 매출 가이던스, 전망치 크게 상회 (약 220억 달러)',
      '2분기 AI 관련 매출 107억 달러 전망',
      'AI 시장의 핵심 플레이어 입지 재확인',
    ],
    description:
      '표면적인 실적과 가이던스는 의심의 여지 없이 훌륭하며, 브로드컴이 AI 시장의 핵심 수혜주임을 다시 한번 각인시켰습니다.',
    outlook: '강력한 성장 모멘텀',
    outlookColor: 'emerald',
  },
  {
    id: 12,
    type: 'ticker-analysis',
    turnId: 29,
    ticker: 'AVGO',
    title: '성장 이면의 구조적 리스크',
    points: [
      '고객 집중 리스크: 상위 5개 고객이 매출의 40% 차지',
      '공급망 의존 리스크: 웨이퍼 생산 95%를 TSMC 한 곳에 의존',
      'VM웨어 인수로 인한 막대한 부채 (약 671억 달러)',
      '운영 리스크에 재무 리스크까지 가중',
    ],
    description:
      '시장은 화려한 성장 이면에 존재하는 극단적인 사업 의존도와 높은 부채라는 잠재적 위험을 가치 평가에 반영하기 시작했습니다.',
    outlook: '리스크 관리 필요',
    outlookColor: 'amber',
  },
  {
    id: 13,
    type: 'events',
    turnId: 31,
    title: '이번 주 주요 경제 이벤트',
    description:
      '투자자들은 연준의 금리 인하 시점을 가늠할 수 있는 핵심 이벤트들을 앞두고 관망세로 돌아섰습니다. 고용과 물가 관련 지표가 시장의 단기 방향성을 결정할 전망입니다.',
    events: [
      {
        date: '내일',
        label: '파월 연준 의장 의회 증언',
        description: '금리 인하 시점에 대한 힌트 탐색',
      },
      {
        date: '금요일',
        label: '2월 비농업 고용보고서 발표',
        description: '고용 시장 열기 및 임금 상승률 주목',
      },
      {
        date: '다음 주',
        label: '2월 소비자물가지수(CPI) 발표',
        description: '인플레이션 둔화 추세 확인 여부가 관건',
      },
    ],
  },
  {
    id: 14,
    type: 'stats',
    turnId: 35,
    title: '2월 고용보고서 전망 (컨센서스)',
    description:
      '오는 금요일 발표될 고용 지표는 파월 의장의 증언과 맞물려 연준의 정책 경로에 대한 중요한 단서를 제공할 것입니다.',
    stats: [
      { label: '비농업 일자리', value: '5.9만 개 증가', trend: 'neutral' },
      { label: '실업률', value: '4.3%', trend: 'neutral' },
      {
        label: '시간당 평균 임금 (MoM)',
        value: '+0.3%',
        subtext: '상승률 둔화 예상',
        trend: 'down',
      },
    ],
    note: '임금 상승률이 예상보다 높을 경우 인플레이션 우려를 다시 자극할 수 있습니다.',
    theme: 'gold',
  },
  {
    id: 15,
    type: 'closing',
    turnId: 38,
    headline: '고용과 물가 지표에 쏠린 시장의 눈',
    tagline: '단기 방향성을 결정할 분수령',
    description:
      '이번 주와 다음 주로 이어지는 핵심 경제 지표 발표 결과에 따라 시장의 변동성이 확대될 수 있습니다. 지금까지 3월 5일 장마감 브리핑이었습니다.',
  },
];