# 슬라이드 자동 생성 스크립트

## 목표
`script.json`을 LLM에 입력하여 `web/src/landing/{date}/slides.ts` 자동 생성

## 현재 상황
✅ **TypeScript 타입 정의**: `web/src/types/slide.ts`에 이미 완벽하게 정의됨
✅ **React 컴포넌트**: `web/src/components/slides/`에 모든 슬라이드 타입 구현됨
✅ **참고 예제**: `web/src/landing/20251222/slides.ts`에 실제 사용 예시 있음

## 필요한 작업
간단한 Python 스크립트 하나만 만들면 끝!

---

## 구현: `generate_slides.py`

### 스크립트 개요
```python
# generate_slides.py - 독립 실행 스크립트

1. script.json 읽기
2. 타입 정의 (slide.ts) 읽기
3. 참고 예제 (20251222/slides.ts) 읽기
4. LLM에게 전달:
   - "이 script.json을 보고"
   - "이 타입 형식에 맞춰"
   - "저 예제처럼 slides.ts 파일 만들어줘"
5. LLM 응답을 파일로 저장
```

### LLM 프롬프트 전략
```
입력:
- script.json (전체 브리핑 데이터)
- TypeScript 타입 정의
- 기존 예제 슬라이드

지시:
1. chapter별로 적절한 슬라이드 타입 선택
2. sources 데이터 활용 (chart → 차트 슬라이드, article → 헤드라인 등)
3. 최소 10-15개 슬라이드 생성
4. TypeScript 코드로 출력

출력:
완성된 slides.ts 파일 코드
```

---

## 실행 방법

```bash
# 독립 실행
uv run python generate_slides.py 20260121

# 결과
web/src/landing/20260121/slides.ts 생성됨
```

---

## Phase 2: Orchestrator 통합 (나중에)

스크립트가 잘 작동하면, `orchestrator.py`의 마지막 단계에 추가:

```python
def finalize_and_save_node(state: BriefingState) -> BriefingState:
    # ... 기존 script.json 저장 ...
    
    # 슬라이드 생성 추가
    from generate_slides import generate_slides_for_date
    generate_slides_for_date(date_yyyymmdd)
    
    return state
```

---

## 예상 소요 시간
- **스크립트 작성**: 30분
- **테스트 및 조정**: 1-2시간
- **Orchestrator 통합**: 30분

**총 2-3시간**

---

## 다음 단계

1. `generate_slides.py` 스크립트 작성
2. `20260121` 데이터로 테스트
3. 웹에서 확인
4. 문제없으면 `orchestrator.py`에 통합
