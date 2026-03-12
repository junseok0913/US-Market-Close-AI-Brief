# 멀티에이전트 프로젝트 공통 구현 명세

이 문서는 특정 프로젝트 설명서가 아니라, 어떤 분야의 멀티에이전트 시스템이든 공통으로 적용할 수 있는 구현 기준서다.  
팀원들은 이 문서를 기준으로 폴더 구조, 프롬프트, LangGraph, 출력 계약, 설정, 검증 방식을 맞춘다.

## 1. 문서 목적

이 명세의 목적은 아래를 표준화하는 것이다.

- 폴더 구조
- 에이전트 단위 설계
- 프롬프트 저장 방식
- LangGraph 구성 방식
- intermediate / final output 형식
- 툴 설계 방식
- 설정 관리 방식
- 재실행, 검증, 문서화 방식

핵심 원칙은 간단하다.

1. 에이전트는 역할 단위로 분리한다.
2. 출력 스키마를 먼저 정하고 프롬프트를 쓴다.
3. 중간 산출물을 파일로 남긴다.
4. LLM 출력은 반드시 정규화한 뒤 저장한다.
5. 각 에이전트는 단독 실행과 전체 파이프라인 실행을 모두 지원한다.

## 2. 핵심 설계 원칙

### 2.1 Agent는 역할 단위다

에이전트 이름은 책임이 드러나야 한다.

- 좋은 예: `planner`, `researcher`, `writer`, `reviewer`, `publisher`
- 나쁜 예: `agent1`, `agent2`, `main_agent`

각 에이전트는 아래 다섯 요소를 자기 폴더 안에서 최대한 닫아야 한다.

1. 상태(State)
2. 프롬프트(Prompt)
3. 그래프(Graph)
4. 출력 계약(Output contract)
5. 필요 시 전용 설정 또는 예시

### 2.2 Output contract를 먼저 정의한다

프롬프트를 쓰기 전에 아래 두 가지를 먼저 정한다.

1. 최종 산출물 JSON
2. intermediate 산출물 JSON

즉, "모델이 무엇을 생각할지"보다 "무슨 구조의 JSON을 내야 하는지"를 먼저 확정한다.

### 2.3 중간 산출물은 파일로 남긴다

각 단계 결과는 메모리에만 두지 않는다.

- 장점: resume 가능
- 장점: 특정 단계만 디버깅 가능
- 장점: 실패 지점 추적 가능
- 장점: agent 단독 실행 가능

### 2.4 LLM 출력은 바로 쓰지 않는다

모델이 낸 원문은 곧바로 저장하거나 다음 단계에 넘기지 않는다.

항상 아래 순서를 거친다.

1. JSON 추출
2. 스키마 검증
3. enum / date / id 검증
4. 잘못된 item 제거
5. 정규화된 결과 저장

### 2.5 도구 사용 단계와 편집 단계를 분리한다

하나의 에이전트가 조사와 편집을 동시에 너무 많이 하면 불안정해진다.

권장 구조:

- 조사형 agent: tool-using
- 정리형 agent: tool-less
- 리파이너 agent: tool-less

### 2.6 전체 파이프라인과 단독 실행을 둘 다 지원한다

각 agent는 두 모드를 가져야 한다.

- orchestrator에서 호출되는 모드
- intermediate artifact를 읽고 혼자 실행되는 standalone 모드

이 규칙이 없으면 운영과 디버깅 비용이 급격히 커진다.

## 3. 권장 폴더 구조

```text
project/
  orchestrator.py
  run_pipeline.sh
  README.md
  AGENTS.md

  config/
    app.yaml

  agents/
    planner/
      graph.py
      prompt/
        planner_main.yaml
      ARCHITECTURE.md

    researcher/
      graph.py
      prompt/
        researcher_main.yaml
      ARCHITECTURE.md

    writer/
      graph.py
      prompt/
        writer_main.yaml
        writer_refine.yaml
      ARCHITECTURE.md

    reviewer/
      graph.py
      prompt/
        reviewer_main.yaml
      ARCHITECTURE.md

  shared/
    config.py
    normalization.py
    yaml_config.py
    types.py
    utils/
      llm.py
      tracing.py
    tools/
      __init__.py
      search.py
      retrieval.py
      tools_docs/
        search.md
        retrieval.md

  cache/
    {run_id}/...

  outputs/
    {run_id}/
      intermediate/
      final/
      logs/
```

### 구조 규칙

- 에이전트별 구현은 `agents/<agent_name>/` 아래에 둔다.
- 프롬프트는 `prompt/*.yaml`로 외부 저장한다.
- 공통 유틸은 `shared/`에 둔다.
- 툴 구현과 툴 문서는 분리한다.
- intermediate 결과와 final 결과는 파일로 남긴다.

### intermediate 저장 위치

동시 실행 가능성이 있으면 아래 구조를 권장한다.

```text
outputs/{run_id}/intermediate/planner.json
outputs/{run_id}/intermediate/researcher.json
outputs/{run_id}/intermediate/writer.json
```

하루 1회 배치처럼 단일 실행만 있으면 단순화해도 된다.

## 4. 에이전트 단위 최소 구성

각 에이전트는 최소 아래 파일을 가진다.

```text
agents/<agent_name>/
  graph.py
  prompt/
    <agent_name>_main.yaml
  ARCHITECTURE.md
```

필요 시 추가한다.

- `prompt/*_refine.yaml`
- `config/*`
- `examples/*`

## 5. 프롬프트 저장 규칙

### 5.1 프롬프트는 코드에 하드코딩하지 않는다

프롬프트는 코드가 아니라 자산이다. 반드시 파일로 저장한다.

- 장점: Git diff 용이
- 장점: 프롬프트 수정과 코드 수정 분리
- 장점: 실험과 롤백이 쉬움

### 5.2 프롬프트는 YAML로 저장한다

권장 기본 형식:

```yaml
meta:
  description: "agent purpose"
  language: "ko"
  model_hint: "gpt-5.1"
  owner: "team-name"
  last_updated: "2026-03-10"

system: |
  <role>
    당신은 ...
  </role>

  <objective>
    이번 단계의 목표는 ...
  </objective>

  <critical_rules>
    - 반드시 지킬 규칙
    - 금지 사항
    - 출력 제약
  </critical_rules>

  <available_tools>
    ...
  </available_tools>

  <workflow>
    <step number="1" name="탐색">...</step>
    <step number="2" name="생성">...</step>
    <step number="3" name="Final Answer">...</step>
  </workflow>

user_template: |
  <context>
    {context_json}
  </context>

  <instruction>
    지정된 JSON만 출력하세요.
  </instruction>
```

### 5.3 `system`과 `user_template`는 역할을 분리한다

`system`에는 고정 규칙만 넣는다.

- 역할
- 목표
- 금지 사항
- 툴 사용 규칙
- 워크플로
- 출력 형식

`user_template`에는 런타임 데이터만 넣는다.

- 실행 대상
- 날짜 또는 run_id
- 이전 단계 결과
- 조회된 컨텍스트
- 실제 입력 JSON

### 5.4 모든 메인 프롬프트에 반드시 들어갈 블록

1. `<role>`
2. `<objective>`
3. `<critical_rules>`
4. `<available_tools>` 또는 tool-less 명시
5. `<workflow>`
6. `<output_format>`

### 5.5 출력 JSON 예시는 프롬프트 안에 직접 넣는다

자연어 설명만으로는 부족하다. 출력 형식은 JSON 예시까지 명시한다.

```yaml
<output_format>
  {
    "items": [
      {
        "id": 0,
        "title": "...",
        "summary": "...",
        "sources": []
      }
    ]
  }
</output_format>
```

### 5.6 메인 프롬프트와 리파이너 프롬프트를 분리한다

권장 구조:

- 메인 프롬프트: 조사 + 초안 생성
- 리파이너 프롬프트: 최소 수정, 문장 다듬기, 전환부 수정

리파이너는 처음부터 다시 생성하지 않는다. 기존 산출물을 편집하는 역할만 맡긴다.

## 6. LangGraph 구성 규칙

### 6.1 에이전트 하나당 `StateGraph` 하나

에이전트는 기본적으로 자신만의 `StateGraph`를 가진다.

```python
graph = StateGraph(AgentState)
graph.add_node("load_context", ...)
graph.add_node("prepare_messages", ...)
graph.add_node("agent", ...)
graph.add_node("tools", ToolNode(TOOLS))
graph.add_node("extract_output", ...)
```

### 6.2 툴 사용 에이전트의 기본 노드 순서

1. `load_context`
2. `prepare_messages`
3. `agent`
4. `tools`
5. `extract_output`
6. `persist_artifact`

복잡하지 않다면 `extract_output`에서 저장해도 되지만, 규모가 커지면 `persist_artifact`를 별도 노드로 두는 편이 낫다.

### 6.3 기본 분기 구조

```python
graph.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        "end": "extract_output",
    },
)
graph.add_edge("tools", "agent")
```

이 패턴을 표준으로 사용한다.

### 6.4 오케스트레이터의 역할

오케스트레이터는 세부 판단을 하지 않는다. 아래만 담당한다.

- 실행 순서 결정
- 전역 prefetch
- stage resume
- intermediate / final artifact 연결
- 실패 지점 기준 재실행

즉, "똑똑한 오케스트레이터"보다 "단순한 순서 관리자"에 가깝게 설계한다.

## 7. State 설계 규칙

상태는 TypedDict 또는 Pydantic으로 명시한다.

권장 최소 필드:

```python
class AgentState(TypedDict, total=False):
    run_id: str
    messages: Annotated[Sequence[BaseMessage], add_messages]
    context_json: dict[str, Any]
    output: dict[str, Any]
```

도메인별 필드는 여기에 추가한다.

- `plan`
- `findings`
- `sections`
- `draft`
- `review_comments`
- `sources`

원칙:

- graph 내부에서 오가는 값은 전부 State에 드러나야 한다
- 암묵적 전역 상태를 최소화한다
- 다음 노드가 필요로 하는 값만 State에 보관한다

## 8. 병렬화 규칙

### 8.1 fan-out / fan-in을 기본 패턴으로 쓴다

입력이 서로 독립적이면 병렬화한다.

예:

- 문서별 분석 병렬화
- 섹션별 초안 생성 병렬화
- 항목별 검토 병렬화

### 8.2 병렬화 조건

아래를 만족하면 병렬화한다.

1. 입력끼리 독립적이다
2. merge 규칙이 명확하다
3. 일부 실패가 전체 실패가 아니어도 된다

### 8.3 실패 처리

권장 규칙:

- worker 실패는 가능한 한 부분 실패로 처리한다
- retry 횟수는 env나 config로 제어한다
- 최종 merge 전에 반드시 normalize 한다
- refiner 실패 시 기존 초안을 유지하는 fallback을 둔다

## 9. Output 계약 규칙

### 9.1 모든 단계는 JSON을 출력한다

LLM 원문 로그는 따로 저장할 수 있지만, 단계 간 계약은 항상 JSON 파일로 고정한다.

### 9.2 intermediate artifact 권장 형식

```json
{
  "run_id": "20260310",
  "agent": "researcher",
  "schema_version": 1,
  "payload": {}
}
```

최소 형식으로 단순화해도 되지만, 아래 필드는 있으면 좋다.

- `run_id`
- `agent`
- `schema_version`
- `payload`

### 9.3 final artifact 권장 형식

도메인과 관계없이 아래 수준의 envelope를 권장한다.

```json
{
  "run_id": "20260310",
  "summary": "한 줄 요약",
  "sections": [],
  "items": [],
  "metadata": {}
}
```

도메인별 핵심 필드는 `sections`, `items`, `metadata` 안에서 자유롭게 확장한다.

### 9.4 id는 저장 직전에 재부여한다

모델이 출력한 `id`는 신뢰하지 않는다.

- invalid item 제거 후
- 최종 저장 직전에
- 0부터 순차 재부여

## 10. Source / Citation 규칙

모든 최종 산출물 항목은 근거를 가질 수 있어야 한다.

권장 구조:

```json
{
  "type": "document|record|api|db_row|webpage|chart",
  "id": "stable-id",
  "title": "human-readable title",
  "locator": "optional path/url/query",
  "metadata": {}
}
```

원칙:

- source는 type-tagged 구조체여야 한다
- source 스키마는 정규화 단계에서 검증한다
- 출력 item에는 "실제로 사용한 근거"만 넣는다

## 11. 정규화 계층 규칙

정규화는 필수다. 최소 아래 기능을 가져야 한다.

1. JSON extraction
2. required field validation
3. enum validation
4. invalid item drop
5. id 재부여
6. source schema validation

권장 함수 이름:

- `parse_json_from_response()`
- `normalize_sections()`
- `normalize_items()`
- `normalize_findings()`
- `normalize_sources()`

## 12. 툴 설계 규칙

### 12.1 툴은 구현과 문서를 분리한다

권장 구조:

```text
shared/tools/
  search.py
  retrieve.py
  tools_docs/
    search.md
    retrieve.md
```

### 12.2 툴은 JSON 입출력만 가진다

툴 반환값은 구조화한다.

- `count`
- `items`
- `rows`
- `filters`
- `error`
- `cached`

### 12.3 툴 문서는 아래를 포함한다

1. 데이터 소스
2. 캐시 계약
3. request schema
4. response schema
5. 오류 조건

### 12.4 가능하면 cache-first로 만든다

권장 흐름:

1. global prefetch
2. cache 저장
3. tool은 cache 우선 조회
4. cache miss일 때만 외부 호출

## 13. 설정 관리 규칙

### 13.1 비밀값과 일반 설정을 분리한다

권장 구조:

- `.env`: secret
- `config/app.yaml`: non-secret runtime config

### 13.2 모델 설정은 prefix override 구조로 둔다

예:

```text
OPENAI_MODEL
OPENAI_TIMEOUT
OPENAI_MAX_RETRIES

PLANNER_OPENAI_MODEL
RESEARCHER_OPENAI_MODEL
WRITER_OPENAI_MODEL
REVIEWER_OPENAI_MODEL
```

장점:

- 프롬프트는 그대로 두고 모델만 바꿀 수 있다
- 비용 최적화가 쉽다
- 특정 agent만 더 강한 모델로 올릴 수 있다

## 14. 재실행 / Resume 규칙

새 프로젝트는 아래를 기본 지원해야 한다.

- 전체 실행
- 특정 stage까지만 실행
- 특정 agent만 실행
- intermediate artifact에서 resume

권장 CLI 예시:

```text
python orchestrator.py 20260310
python orchestrator.py 20260310 --stage research
python orchestrator.py 20260310 --agent writer
python orchestrator.py 20260310 --resume-from reviewer
```

## 15. 문서화 규칙

각 agent 폴더에는 `ARCHITECTURE.md`를 둔다.

반드시 포함할 것:

1. 역할
2. 입력
3. 출력
4. 읽는 파일
5. 쓰는 파일
6. LangGraph 흐름도
7. 상태 스키마
8. 요청 스키마
9. 응답 스키마
10. standalone 실행 방법
11. 에러 처리 / 재실행 특성

## 16. 팀용 구현 규칙

아래는 팀 규칙으로 그대로 복붙 가능한 문장이다.

### 16.1 폴더 규칙

- 에이전트마다 `graph.py` 하나를 둔다.
- 프롬프트는 반드시 YAML 파일로 외부 저장한다.
- 공통 도구는 `shared/tools/`로 모은다.
- 정규화 로직은 `shared/normalization.py` 또는 도메인별 normalization 모듈로 분리한다.

### 16.2 프롬프트 규칙

- `system`에는 고정 규칙만 쓴다.
- `user_template`에는 런타임 데이터만 넣는다.
- 출력 JSON 예시를 프롬프트 안에 직접 넣는다.
- 메인 프롬프트와 refiner 프롬프트를 분리한다.

### 16.3 그래프 규칙

- 기본 패턴은 `load_context -> prepare_messages -> agent -> tools loop -> extract -> persist`
- 병렬 작업은 fan-out / fan-in으로 만든다.
- `should_continue()`로 tool loop를 끊는다.
- 모든 agent는 standalone 실행 경로를 가진다.

### 16.4 출력 규칙

- 단계 간 계약은 JSON 파일로 고정한다.
- intermediate와 final output 모두 스키마를 문서화한다.
- output은 normalize 이후에만 저장한다.

### 16.5 운영 규칙

- global prefetch는 한 번만 한다.
- 툴은 가능하면 cache-first로 만든다.
- 모델 설정은 prefix override 구조로 둔다.
- resume와 stage 실행을 기본 제공한다.

## 17. 스타터 템플릿

### 17.1 새 에이전트 추가 체크리스트

1. 에이전트 이름과 책임을 정의한다.
2. 입력 JSON과 출력 JSON을 먼저 정의한다.
3. `agents/<name>/prompt/<name>_main.yaml`을 만든다.
4. `agents/<name>/graph.py`에 StateGraph를 만든다.
5. 정규화 함수를 만든다.
6. intermediate artifact 저장 규칙을 만든다.
7. `ARCHITECTURE.md`를 작성한다.
8. orchestrator에 연결한다.
9. standalone 실행 경로를 만든다.

### 17.2 프롬프트 파일 스타터

```yaml
meta:
  description: "..."
  language: "ko"
  model_hint: "gpt-5.1"
  last_updated: "2026-03-10"

system: |
  <role>...</role>
  <objective>...</objective>
  <critical_rules>...</critical_rules>
  <available_tools>...</available_tools>
  <workflow>
    <step number="1" name="분석">...</step>
    <step number="2" name="생성">...</step>
    <step number="3" name="Final Answer">
      <output_format>
        {
          "items": []
        }
      </output_format>
    </step>
  </workflow>

user_template: |
  <context>
    {context_json}
  </context>
  <instruction>
    JSON만 출력하세요.
  </instruction>
```

### 17.3 State / Graph 스타터

```python
class MyAgentState(TypedDict, total=False):
    run_id: str
    messages: Annotated[Sequence[BaseMessage], add_messages]
    context_json: dict[str, Any]
    items: list[dict[str, Any]]


def build_graph():
    graph = StateGraph(MyAgentState)
    graph.add_node("load_context", load_context_node)
    graph.add_node("prepare_messages", prepare_messages_node)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(TOOLS))
    graph.add_node("extract", extract_node)
    graph.add_edge(START, "load_context")
    graph.add_edge("load_context", "prepare_messages")
    graph.add_edge("prepare_messages", "agent")
    graph.add_conditional_edges(
        "agent",
        should_continue,
        {"tools": "tools", "end": "extract"},
    )
    graph.add_edge("tools", "agent")
    graph.add_edge("extract", END)
    return graph.compile()
```

### 17.4 intermediate artifact 스타터

```json
{
  "run_id": "20260310",
  "agent": "writer",
  "schema_version": 1,
  "payload": {
    "items": []
  }
}
```

### 17.5 final artifact 스타터

```json
{
  "run_id": "20260310",
  "summary": "프로젝트 요약",
  "sections": [],
  "items": [],
  "metadata": {
    "schema_version": 1
  }
}
```

## 18. 최종 권장안

새 멀티에이전트 프로젝트는 아래 10가지를 기본으로 채택한다.

1. `orchestrator + agent별 graph + intermediate artifact` 구조
2. YAML 외부 프롬프트 저장
3. `system` / `user_template` 분리
4. LangGraph의 tool loop 패턴
5. fan-out / fan-in 병렬 구조
6. normalize 계층
7. source/citation 구조화
8. `.env`와 `config/app.yaml` 분리
9. standalone 실행 + resume 지원
10. agent별 `ARCHITECTURE.md` 문서화

이 10가지를 지키면, 도메인이 바뀌어도 유지보수 가능한 멀티에이전트 프로젝트를 만들 수 있다.
