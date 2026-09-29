# AI Usage Declaration

SRS Section 1.8 (rules 15 & 16) requires every team to declare all AI tools used during development. This file is that declaration.

## Runtime AI (part of the product)

These AI services are called by the deployed application itself and are part of the SRS-mandated Generative AI pipeline:

| Tool | Purpose | Where |
|---|---|---|
| Groq API (`openai/gpt-oss-120b`) | Pipeline 1 — personalised onboarding plan generation | `backend/app/core/groq_client.py`, `backend/app/services/generation_service.py` |
| Google Gemini API (`gemini-3.5-flash-lite`) | Pipeline 1 fallback when Groq is unavailable | `backend/app/core/gemini_client.py`, `backend/app/core/ai_client.py` |

**Pipeline 2 (validation) uses no AI.** It runs on scikit-learn TF-IDF + deterministic Python rules only, as SRS Section 1.2 mandates. Verify with:

```bash
grep -r "genai\|gemini\|groq\|ai_client" backend/app/services/validation_service.py
# (returns nothing)
```

## Development-time AI assistance

An AI coding assistant was used during development. Every generated code block was reviewed, adapted, tested, and — where necessary — debugged by the team before commit.

| Area | Purpose | Files affected | Modifications performed | Tests performed |
|---|---|---|---|---|
| FastAPI scaffolding | Boilerplate route + service structure | `backend/app/routes/*.py`, `backend/app/services/*.py` | Adjusted to match SRS field lists, added auditing, added authorization guards | Full endpoint smoke test (98 scenarios), employee-flow test |
| SQLAlchemy models | Table definitions | `backend/app/models/*.py` | Adjusted column types for MySQL LONGBLOB / LONGTEXT variants, added `Unique` constraints, added foreign keys | DB creation verified against SQLite + MySQL |
| Pydantic schemas | Request/response validation | `backend/app/schemas/*.py` | Added enum validators against constants module, added length caps | Round-tripped through smoke tests |
| Prompt template | Onboarding plan generation prompt | `backend/app/prompts/onboarding_plan.v1.txt` | Wrote SRS-mandated JSON output schema, added prompt-injection defence clause | Verified real Groq + Gemini generations produce compliant JSON |
| Validation pipeline | Coverage, traceability, hallucination, contradiction, duplicate, sequence, role relevance, distractor checks | `backend/app/services/validation_service.py` | Tuned thresholds against real generated plans; corrected cycle detection bug | Live validation run confirmed correct finding categorisation |
| Consistency check | Two-run comparison | `backend/app/services/consistency_service.py` | Composite score formula, structured-attribute comparison per SRS Step 44 | Real Groq double-run produced 100% consistency on identical inputs |
| React Tailwind UI | Page layout + primitives | `frontend/src/components/*.jsx`, `frontend/src/pages/**/*.jsx` | Restyled to remove gradients / rounded pills / AI feel per team preference | Production build passes; end-to-end employee flow tested |
| Seed data | Fictional company | `backend/scripts/seed_demo.py` | 10 roles, 20 documents, 15 requirements, 65 assignments | Seed idempotency verified across multiple runs |

## What the team verified independently

- Every route's authorization matrix (employee-only vs admin-only vs public).
- SQL query correctness — hand-checked with `EXPLAIN` against the schema.
- Pydantic validators reject invalid enum values (422) and duplicate IDs (409).
- Bcrypt password hashing works with bcrypt 5.x (fixed passlib incompatibility manually).
- Cycle detection in requirement prerequisites (fixed the initial BFS seed-set bug).
- Gemini SDK model catalogue verified live (`gemini-1.5-flash` deprecated; switched to `gemini-3.5-flash-lite`).
- Groq model catalogue verified live (`llama-3.3-70b-versatile` retired; switched to `openai/gpt-oss-120b`).

## What was intentionally NOT delegated to AI

- The Role Requirement Matrix logic and coverage formula (SRS Steps 28–29).
- Rate-limit middleware and security-header middleware.
- Deployment configuration and evaluation flow.
- Anti-injection regex patterns (chose them from documented prompt-injection research).
- Precedence rules and their default ordering.
