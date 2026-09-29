# SkillSprint AI

A generative-AI-powered onboarding platform that reads a company's policies, SOPs, FAQs and role descriptions, then produces a source-cited, role-specific onboarding plan for each new employee. An independent Python validator confirms coverage, source traceability, hallucinations, contradictions and duplicates before the plan is approved.

Built for the Aptech TechWiz 7 competition — SkillSprint AI theme, Generative AI PowerPlay category.

## Tech stack

- **Backend**: FastAPI, SQLAlchemy, SQLite (production) / MySQL (also supported).
- **Frontend**: React 19, Vite, Tailwind CSS v4.
- **AI**: Groq (`openai/gpt-oss-120b`) primary, Google Gemini fallback.
- **Validation**: pure Python + scikit-learn TF-IDF (no AI).
- **Deployment**: Render (backend) + Netlify (frontend).

## Repository layout

```
skillsprint/
├── backend/
│   ├── app/
│   │   ├── core/          # config, security, middleware, gemini/groq/ai clients
│   │   ├── models/        # SQLAlchemy ORM (30 tables)
│   │   ├── schemas/       # Pydantic input/output
│   │   ├── services/      # generation, validation, progress, reports, …
│   │   ├── routes/        # FastAPI routers
│   │   ├── prompts/       # versioned prompt templates
│   │   └── main.py
│   ├── scripts/seed_demo.py
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/    # Layout, UI primitives
│   │   ├── context/       # Auth
│   │   ├── lib/           # api client
│   │   └── pages/         # auth / employee / admin / static
│   ├── package.json
│   ├── netlify.toml
│   └── .env.example
├── srs/                   # SRS document
├── AI_USAGE.md
├── README.md
└── LICENSE
```

## Quick start (local)

Prerequisites: Python 3.11+, Node 20+, and either MySQL or nothing (SQLite works by default).

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # or: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env      # cp on Linux/Mac
# Edit .env: set GROQ_API_KEY (get at console.groq.com/keys)
uvicorn app.main:app --reload
```

Backend runs on **http://localhost:8000**.

### Seed the demo dataset (optional but recommended)

```bash
python scripts/seed_demo.py
```

Creates 10 job roles, 20 documents, 15 requirements, 65 role-requirement links, 3 demo employees.

Default admin login: **`admin@gmail.com` / `123456789`**
Demo employee: **`aiden@example.com` / `password123`**

### Frontend

```bash
cd frontend
copy .env.example .env      # cp on Linux/Mac
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**.

## Demo walkthrough (5 minutes)

1. Go to http://localhost:5173/login and sign in as **admin@gmail.com / 123456789**.
2. **Documents** → 20 seeded documents are already parsed and chunked.
3. **Requirements** → 15 seeded requirements.
4. **Role matrix** → verify Sales Executive has 7 mandatory requirements.
5. **Plans** → click **Generate plan**, pick "Aiden Sales" and "Sales Executive", **Generate**. Wait ~10s (Groq call).
6. Open the generated plan → each module, task, quiz, assessment is source-cited (doc # + section).
7. Click **Validate** → coverage, traceability, hallucination, contradiction, duplicate and role-relevance checks run.
8. **Reviews** → any low-severity findings can be acknowledged or overridden.
9. Log out and log in as **aiden@example.com / password123**.
10. **My onboarding** → open Aiden's plan → open a module → submit the quiz with correct answers → 100%. Submit the assessment rubric → weighted score.
11. **Progress** → overall %, weak areas, progress assessment (on_track / behind_schedule / …).

## SRS test-scenario coverage

The SRS Section 1.8 lists specific tester scenarios. Each is supported:

| Scenario | How to demonstrate |
|---|---|
| Hidden Evaluation Documents | Admin → Documents → Upload a PDF/DOCX at runtime. Parser + chunker + adversarial detector all run automatically. |
| Hidden Role | Admin → Job roles → New role → assign requirements → generate plan for a new employee in that role. |
| Policy Update | Admin → Documents → open a doc → upload a v2 with same doc_code → **Policy impact** page shows all affected plans → **Regenerate**. |
| Prompt Injection | Upload a document containing `Ignore all previous instructions...`. The chunk is flagged (`adversarial_flags`) and excluded from AI generation context. |
| Contradiction | Upload two docs on the same topic with opposite guidance → run Validate on a plan citing both → contradictions surfaced. |
| Source Traceability | Every generated module/task/quiz/assessment carries `source_document_id` and `source_section`. Visible in plan detail, exportable in reports. |
| Hallucination | Ask for a plan when the matrix requires a topic not in any uploaded doc. Validator flags it via low cosine similarity (`hallucination_count`). |
| Live Code Modification | Adding a validation rule, changing the JSON schema, adding a role — architecture separates prompt templates, schemas, services and models cleanly. |
| No Hard-Coded Output | Plan generation is deterministic w.r.t. matrix + docs + prompt template but content is produced fresh by the AI on every call, logged in `generation_runs`. |
| GenAI API Restriction | `validation_service.py` imports **only** scikit-learn + SQLAlchemy. No AI calls in Pipeline 2. Verifiable via `grep -r "gemini\\|groq\\|ai_client" app/services/validation_service.py` → returns nothing. |

## Deployment

### Backend on Render

1. Push this repo to GitHub.
2. In Render, **New → Blueprint** → point to your repo. Render reads `backend/render.yaml`.
3. Set the two secrets marked `sync: false`:
   - `CORS_ORIGINS` = your Netlify URL (e.g. `https://your-app.netlify.app`)
   - `GROQ_API_KEY` = from https://console.groq.com/keys
   - `GEMINI_API_KEY` = optional (fallback)
4. Deploy. The start command runs the seeder then boots uvicorn on `$PORT`.

### Frontend on Netlify

1. In Netlify, **Add new site → Import from Git**.
2. Base directory: `frontend`. Build command auto-detected from `netlify.toml`.
3. Set env var `VITE_API_URL` = your Render URL (e.g. `https://skillsprint-api.onrender.com`).
4. Deploy.

### Notes on the free tier

- Render free web dyno **spins down after 15 min idle**. First request after sleep takes ~30-60s. Sleep/wake preserves the SQLite DB on the same container.
- Full container recycles (rare on free tier, more likely after weeks) wipe SQLite; the seeder runs at boot so the demo dataset is always available.
- If you need long-term persistence, swap `DATABASE_URL` to a Neon Postgres connection string (free forever, 500MB). Rest of the code is unchanged.

## Testing

Backend has a self-contained smoke script covering **98 endpoint scenarios** and a separate **employee-flow** script proving end-to-end learner interaction. Both live in the developer scratchpad (`scripts/` in this repo can be extended).

Frontend production build:

```bash
cd frontend
npm run build
```

## Security

- JWT access tokens in HttpOnly, `SameSite=Strict` cookies.
- Refresh tokens hashed with SHA-256 before storage, rotated on use.
- bcrypt password hashing (cost 12).
- Every mutating request audit-logged (user, action, entity, IP, timestamp).
- Middleware: security headers, per-IP rate limit (240 req/min default), body-size cap (40 MB default).
- CORS restricted to declared origins.
- File uploads validated: MIME + extension + SHA-256 dedupe + 25 MB cap.
- Adversarial content detection on every uploaded chunk (`app/core/injection_detector.py`, 20 regex patterns). Flagged chunks are excluded from AI generation context.

## License

MIT — see [LICENSE](LICENSE).

## Attribution

Built for Aptech TechWiz 7 (2026). See `AI_USAGE.md` for the AI tool declaration required by the competition.
