// Hook + market pulse oriented template
export const shortsTemplateHookMarket = [
  {
    phase: 'hook',
    theme: 'alert',
    eyebrow: '장마감 쇼츠',
    headline: '실적은 좋은데 왜 하락했나',
    subheadline: '핵심 숫자 하나로 시장의 온도를 먼저 보여준다',
    body: '첫 장면은 질문형 훅으로 시작해 집중도를 올린다.',
    bullets: ['지수 방향을 한 줄로 정리', '핵심 원인 키워드를 즉시 노출'],
    tickers: ['WMT', 'HD'],
    highlights: ['90초'],
  },
  {
    phase: 'market',
    theme: 'bear',
    eyebrow: '시장 흐름',
    headline: '지수 흐름 한 줄 요약',
    subheadline: '다우, S&P500, 나스닥의 동시 방향과 강도를 압축한다',
    body: '숫자 중심 문장으로 당일 리스크 톤을 명확히 전달한다.',
    bullets: ['지수 2개 이상 숫자 포함', '시장 심리 키워드 1개'],
    tickers: ['^DJI', '^GSPC', '^IXIC'],
    highlights: ['-0.54%', '-0.28%'],
  },
];
