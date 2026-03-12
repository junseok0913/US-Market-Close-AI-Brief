# Common Multi-Agent Project Implementation Specification

This document is not a description of any specific project. It is a shared implementation standard that can be applied to a multi-agent system in any domain.  
Team members should use this document as the baseline for folder structure, prompts, LangGraph design, output contracts, configuration, and verification.

## 1. Purpose

The purpose of this specification is to standardize the following:

- Folder structure
- Agent-level design
- Prompt storage conventions
- LangGraph composition patterns
- Intermediate and final output formats
- Tool design
- Configuration management
- Re-run, verification, and documentation rules

The core principles are simple:

1. Split agents by role.
2. Define output schemas before writing prompts.
3. Persist intermediate artifacts as files.
4. Always normalize LLM output before saving it.
5. Every agent must support both standalone execution and full-pipeline execution.

## 2. Core Design Principles

### 2.1 An Agent Is a Role

Agent names should clearly reflect responsibility.

- Good examples: `planner`, `researcher`, `writer`, `reviewer`, `publisher`
- Bad examples: `agent1`, `agent2`, `main_agent`

Each agent should keep the following five elements as self-contained as possible inside its own folder:

1. State
2. Prompt
3. Graph
4. Output contract
5. Optional agent-specific config or examples

### 2.2 Define the Output Contract First

Before writing prompts, define these two things first:

1. The final output JSON
2. The intermediate output JSON

In other words, decide "what structured JSON this agent must produce" before deciding "how the model should think."

### 2.3 Persist Intermediate Artifacts to Files

Do not keep stage outputs only in memory.

- Benefit: resumable execution
- Benefit: easier stage-level debugging
- Benefit: clearer failure tracing
- Benefit: standalone agent execution

### 2.4 Never Use Raw LLM Output Directly

Do not immediately save model output or pass it to the next stage as-is.

Always follow this sequence:

1. Extract JSON
2. Validate the schema
3. Validate enums, dates, and ids
4. Remove invalid items
5. Save normalized output

### 2.5 Separate Tool-Using Stages from Editing Stages

If a single agent does too much research and editing at once, stability drops.

Recommended structure:

- Research agent: tool-using
- Structuring agent: tool-less
- Refiner agent: tool-less

### 2.6 Support Both Full-Pipeline and Standalone Execution

Each agent should support two modes:

- A mode where it is called by the orchestrator
- A standalone mode where it reads an intermediate artifact and runs by itself

Without this rule, operations and debugging become much more expensive.

## 3. Recommended Folder Structure

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

### Structure Rules

- Put agent-specific implementation under `agents/<agent_name>/`.
- Store prompts externally as `prompt/*.yaml`.
- Put shared utilities under `shared/`.
- Separate tool implementation from tool documentation.
- Persist both intermediate and final results as files.

### Recommended Intermediate Artifact Location

If concurrent runs are possible, use a structure like this:

```text
outputs/{run_id}/intermediate/planner.json
outputs/{run_id}/intermediate/researcher.json
outputs/{run_id}/intermediate/writer.json
```

If the system only runs as a single daily batch, a simpler structure is acceptable.

## 4. Minimum Agent Package Structure

Each agent should contain at least these files:

```text
agents/<agent_name>/
  graph.py
  prompt/
    <agent_name>_main.yaml
  ARCHITECTURE.md
```

Add the following only when needed:

- `prompt/*_refine.yaml`
- `config/*`
- `examples/*`

## 5. Prompt Storage Rules

### 5.1 Do Not Hardcode Prompts in Code

Prompts are assets, not code. They must be stored as files.

- Benefit: easy Git diffs
- Benefit: prompt edits are separate from code edits
- Benefit: easier experimentation and rollback

### 5.2 Store Prompts as YAML

Recommended base format:

```yaml
meta:
  description: "agent purpose"
  language: "en"
  model_hint: "gpt-5.1"
  owner: "team-name"
  last_updated: "2026-03-10"

system: |
  <role>
    You are ...
  </role>

  <objective>
    The goal of this stage is ...
  </objective>

  <critical_rules>
    - Rules that must be followed
    - Prohibited behavior
    - Output constraints
  </critical_rules>

  <available_tools>
    ...
  </available_tools>

  <workflow>
    <step number="1" name="Explore">...</step>
    <step number="2" name="Generate">...</step>
    <step number="3" name="Final Answer">...</step>
  </workflow>

user_template: |
  <context>
    {context_json}
  </context>

  <instruction>
    Output only the specified JSON.
  </instruction>
```

### 5.3 Separate the Roles of `system` and `user_template`

Put only fixed rules in `system`.

- Role
- Objective
- Prohibited behavior
- Tool usage rules
- Workflow
- Output format

Put only runtime data in `user_template`.

- Execution target
- Date or run_id
- Outputs from previous stages
- Retrieved context
- Input JSON

### 5.4 Required Blocks in Every Main Prompt

Every main prompt must include these blocks:

1. `<role>`
2. `<objective>`
3. `<critical_rules>`
4. `<available_tools>` or an explicit tool-less note
5. `<workflow>`
6. `<output_format>`

### 5.5 Put the Output JSON Example Directly in the Prompt

Natural-language instructions are not enough. The prompt must include an explicit JSON example.

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

### 5.6 Separate the Main Prompt from the Refiner Prompt

Recommended structure:

- Main prompt: research and draft generation
- Refiner prompt: minimal edits, wording polish, transition cleanup

A refiner should not regenerate from scratch. It should only edit an existing artifact.

## 6. LangGraph Design Rules

### 6.1 One `StateGraph` per Agent

Each agent should have its own `StateGraph`.

```python
graph = StateGraph(AgentState)
graph.add_node("load_context", ...)
graph.add_node("prepare_messages", ...)
graph.add_node("agent", ...)
graph.add_node("tools", ToolNode(TOOLS))
graph.add_node("extract_output", ...)
```

### 6.2 Default Node Order for Tool-Using Agents

1. `load_context`
2. `prepare_messages`
3. `agent`
4. `tools`
5. `extract_output`
6. `persist_artifact`

If the flow is simple, saving inside `extract_output` is acceptable. As the system grows, keeping `persist_artifact` as a separate node is cleaner.

### 6.3 Default Branching Structure

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

Use this as the standard pattern.

### 6.4 Role of the Orchestrator

The orchestrator should not make detailed reasoning decisions. It should only handle:

- Execution order
- Global prefetch
- Stage resume
- Intermediate and final artifact wiring
- Re-runs from failure boundaries

In practice, design it as a simple flow manager, not a smart agent.

## 7. State Design Rules

Define state with TypedDict or Pydantic.

Recommended minimum fields:

```python
class AgentState(TypedDict, total=False):
    run_id: str
    messages: Annotated[Sequence[BaseMessage], add_messages]
    context_json: dict[str, Any]
    output: dict[str, Any]
```

Add domain-specific fields as needed:

- `plan`
- `findings`
- `sections`
- `draft`
- `review_comments`
- `sources`

Principles:

- Everything passed between nodes should be visible in State
- Keep implicit global state to a minimum
- Store only what the next nodes actually need

## 8. Parallelization Rules

### 8.1 Use Fan-Out / Fan-In as the Default Pattern

If inputs are independent, parallelize them.

Examples:

- Parallel document analysis
- Parallel section draft generation
- Parallel item review

### 8.2 Conditions for Parallelization

Parallelize when all of the following are true:

1. Inputs are independent
2. Merge rules are clear
3. Partial failure does not have to mean total failure

### 8.3 Failure Handling

Recommended rules:

- Treat worker failures as partial failures whenever possible
- Control retry counts via env or config
- Always normalize before the final merge
- If the refiner fails, keep the original draft as fallback

## 9. Output Contract Rules

### 9.1 Every Stage Outputs JSON

Raw LLM logs can be stored separately, but stage-to-stage contracts must always be JSON files.

### 9.2 Recommended Intermediate Artifact Format

```json
{
  "run_id": "20260310",
  "agent": "researcher",
  "schema_version": 1,
  "payload": {}
}
```

You can simplify it if needed, but these fields are recommended:

- `run_id`
- `agent`
- `schema_version`
- `payload`

### 9.3 Recommended Final Artifact Format

Regardless of domain, use an envelope like this:

```json
{
  "run_id": "20260310",
  "summary": "one-line summary",
  "sections": [],
  "items": [],
  "metadata": {}
}
```

Put domain-specific core fields inside `sections`, `items`, and `metadata`.

### 9.4 Reassign IDs Right Before Saving

Do not trust model-generated ids.

- Remove invalid items first
- Then, right before saving
- Reassign ids sequentially from 0

## 10. Source / Citation Rules

Every final output item should be able to carry evidence.

Recommended structure:

```json
{
  "type": "document|record|api|db_row|webpage|chart",
  "id": "stable-id",
  "title": "human-readable title",
  "locator": "optional path/url/query",
  "metadata": {}
}
```

Principles:

- A source must be a type-tagged structure
- Source schema must be validated during normalization
- Output items should include only sources that were actually used

## 11. Normalization Layer Rules

Normalization is mandatory. At minimum, it must support:

1. JSON extraction
2. Required field validation
3. Enum validation
4. Invalid item removal
5. ID reassignment
6. Source schema validation

Recommended function names:

- `parse_json_from_response()`
- `normalize_sections()`
- `normalize_items()`
- `normalize_findings()`
- `normalize_sources()`

## 12. Tool Design Rules

### 12.1 Separate Tool Implementation from Tool Documentation

Recommended structure:

```text
shared/tools/
  search.py
  retrieve.py
  tools_docs/
    search.md
    retrieve.md
```

### 12.2 Tools Must Use JSON Inputs and Outputs

Tool return values should be structured.

- `count`
- `items`
- `rows`
- `filters`
- `error`
- `cached`

### 12.3 Tool Documentation Must Include the Following

1. Data source
2. Cache contract
3. Request schema
4. Response schema
5. Error conditions

### 12.4 Prefer Cache-First Tools

Recommended flow:

1. Global prefetch
2. Save to cache
3. Tools read cache first
4. Only call external systems on cache miss

## 13. Configuration Management Rules

### 13.1 Separate Secrets from Non-Secret Configuration

Recommended structure:

- `.env`: secrets
- `config/app.yaml`: non-secret runtime config

### 13.2 Use Prefix-Based Override for Model Settings

Example:

```text
OPENAI_MODEL
OPENAI_TIMEOUT
OPENAI_MAX_RETRIES

PLANNER_OPENAI_MODEL
RESEARCHER_OPENAI_MODEL
WRITER_OPENAI_MODEL
REVIEWER_OPENAI_MODEL
```

Benefits:

- You can change models without changing prompts
- Cost optimization is easier
- You can upgrade only specific agents to stronger models

## 14. Re-Run / Resume Rules

New projects should support the following by default:

- Full execution
- Execution up to a specific stage
- Execution of a specific agent only
- Resume from an intermediate artifact

Recommended CLI examples:

```text
python orchestrator.py 20260310
python orchestrator.py 20260310 --stage research
python orchestrator.py 20260310 --agent writer
python orchestrator.py 20260310 --resume-from reviewer
```

## 15. Documentation Rules

Each agent folder should include an `ARCHITECTURE.md`.

It must include:

1. Role
2. Inputs
3. Outputs
4. Files it reads
5. Files it writes
6. LangGraph flow
7. State schema
8. Request schema
9. Response schema
10. Standalone execution method
11. Error handling and re-run behavior

## 16. Team Implementation Rules

The following can be copied directly into team guidelines.

### 16.1 Folder Rules

- Each agent has a single `graph.py`.
- Prompts must be stored externally as YAML files.
- Shared tools are grouped under `shared/tools/`.
- Normalization logic is separated into `shared/normalization.py` or domain-specific normalization modules.

### 16.2 Prompt Rules

- Put only fixed rules in `system`.
- Put only runtime data in `user_template`.
- Put the output JSON example directly in the prompt.
- Separate main prompts from refiner prompts.

### 16.3 Graph Rules

- Use the default pattern `load_context -> prepare_messages -> agent -> tools loop -> extract -> persist`
- Build parallel work as fan-out / fan-in
- Use `should_continue()` to break the tool loop
- Every agent must support standalone execution

### 16.4 Output Rules

- Stage-to-stage contracts must be JSON files
- Document schemas for both intermediate and final outputs
- Save outputs only after normalization

### 16.5 Operations Rules

- Run global prefetch only once
- Prefer cache-first tools
- Use prefix-based model overrides
- Support resume and stage-level execution by default

## 17. Starter Templates

### 17.1 Checklist for Adding a New Agent

1. Define the agent name and responsibility.
2. Define input JSON and output JSON first.
3. Create `agents/<name>/prompt/<name>_main.yaml`.
4. Create a `StateGraph` in `agents/<name>/graph.py`.
5. Implement the normalization function.
6. Define the intermediate artifact save rule.
7. Write `ARCHITECTURE.md`.
8. Connect it to the orchestrator.
9. Add a standalone execution path.

### 17.2 Prompt File Starter

```yaml
meta:
  description: "..."
  language: "en"
  model_hint: "gpt-5.1"
  last_updated: "2026-03-10"

system: |
  <role>...</role>
  <objective>...</objective>
  <critical_rules>...</critical_rules>
  <available_tools>...</available_tools>
  <workflow>
    <step number="1" name="Analyze">...</step>
    <step number="2" name="Generate">...</step>
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
    Output JSON only.
  </instruction>
```

### 17.3 State / Graph Starter

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

### 17.4 Intermediate Artifact Starter

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

### 17.5 Final Artifact Starter

```json
{
  "run_id": "20260310",
  "summary": "project summary",
  "sections": [],
  "items": [],
  "metadata": {
    "schema_version": 1
  }
}
```

## 18. Final Recommendation

Every new multi-agent project should adopt these ten defaults:

1. `orchestrator + per-agent graph + intermediate artifact` structure
2. External YAML prompt storage
3. Separation of `system` and `user_template`
4. LangGraph tool-loop pattern
5. Fan-out / fan-in parallel structure
6. Normalization layer
7. Structured sources and citations
8. Separation of `.env` and `config/app.yaml`
9. Standalone execution plus resume support
10. Per-agent `ARCHITECTURE.md` documentation

If a team follows these ten rules, it can build a maintainable multi-agent project even when the domain changes.
