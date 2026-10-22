# AI Insurance Chat

An AI assistant that answers questions about **travel insurance terms and conditions**, in Romanian, using **Retrieval-Augmented Generation (RAG)** over the policy documents of Romanian insurers.

The user asks in natural language (e.g. *"Is off-piste skiing covered?"*, *"What happens if I cancel 5 days before departure?"*). The system finds the relevant passages in the insurance conditions and an LLM writes a short answer based **only** on those passages.

Knowledge base used in the prototype:

- **Generali** – Travel insurance, *Sporturi Extreme* (conditions + product information document)
- **Omniasig** – Travel insurance, *Safe Travel* (conditions + product information document)

---

## How it works

```
                 ┌──────────────── Ingestion (offline) ────────────────┐
 Insurance T&C   │  split into chunks  →  OpenAI embeddings             │
 documents (.txt)│  (text-embedding-3-large, 3072 dims)                 │
                 │  →  versioned embeddings store (versionModels/*.json)│
                 └──────────────────────────────────────────────────────┘

                 ┌──────────────── Question answering ─────────────────┐
 User question → │  embed question → cosine similarity over all chunks │
                 │  → top 15 passages + source file names              │
                 │  → GPT-4o with grounding prompt (temperature 0.2)   │ → Answer
                 └──────────────────────────────────────────────────────┘
```

### 1. Ingestion pipeline (`src/app.ts`)

- Reads the insurance documents and splits them into paragraph-level chunks.
- Generates an embedding for each chunk with **OpenAI `text-embedding-3-large`**.
- Saves the chunks, their vectors, the source file and a chunk ID into a **versioned embeddings file** (`versionModels/embeddings-vX.Y.Z.json`).
- Two knowledge-base versions are included: `v0.0.1` (133 chunks) and `v0.0.2` (143 chunks, re-processed documents plus the product information documents).

### 2. Retrieval (`server/src/openai.ts`)

- The user question is embedded with the same model.
- **Cosine similarity** is computed against every chunk of the selected knowledge-base version (implemented in code, no external vector database).
- The **15 most relevant passages** are selected and passed to the model together with the name of the document they come from.

### 3. Grounded answer generation

- Model: **GPT-4o** via the OpenAI API, `temperature: 0.2` for factual answers.
- The system prompt constrains the model to:
  - answer **only** from the provided passages, without outside knowledge or assumptions;
  - reply *"Nu am informații despre acest subiect în documentele disponibile."* when the documents do not cover the question, and guide the user toward a better question;
  - state clearly when the answer concerns **more than one insurer**;
  - answer concisely, in Romanian, only about travel insurance.

### 4. Evaluation interface

- **Version selector**: the same questions can be asked against different knowledge-base versions to compare answer quality.
- **Reviewer notes**: each AI answer can be annotated ("Add note"), so incorrect or incomplete answers are recorded for the next iteration.
- Chats, messages, versions and notes are stored in **Firebase Firestore**.

---

## Design decision: RAG vs. fine-tuning

Before building, two approaches were compared:

| | RAG (chosen) | Fine-tuning |
|---|---|---|
| Knowledge | Stays in the documents, outside the model | Frozen inside the model weights |
| Updating conditions | Re-embed the changed document | Re-train the model |
| Traceability | Answer can be tied to the exact passage and document | No guaranteed link to the source |
| Cost | One-time embedding cost is very low; pay only for answer generation | Cheap training, but more expensive per query |

Insurance conditions change often and answers must be traceable to the exact clause, so RAG over an unmodified pre-trained model was chosen.

---

## Tech stack

| Layer | Technologies |
|---|---|
| AI | OpenAI API — `text-embedding-3-large` (embeddings), `gpt-4o` (generation) |
| Backend | Node.js, Express, TypeScript |
| Frontend | React 19, TypeScript, Zustand, React Context, CSS Modules |
| Database | Firebase Firestore (chats, messages, versions, reviewer notes) |

---

## Project structure

```
├── src/app.ts            # Ingestion: chunking + embeddings → versionModels/
├── versionModels/        # Versioned embeddings (knowledge base)
├── files/                # Source documents (already processed, by version)
├── server/
│   └── src/
│       ├── server.ts     # Express API (POST /api/openai) + serves the React build
│       ├── openai.ts     # Retrieval (cosine similarity) + GPT-4o answer
│       └── config.ts     # Environment configuration
└── client/
    └── src/
        ├── pages/        # Chat page
        ├── Components/   # Chat list, version selector, messages, input
        ├── context/      # Chat & version state
        └── services/     # Firestore access
```

---

## Running locally

**1. Install dependencies**

```bash
npm install
npm run install-all
```

**2. Environment variables**

`.env` in the project root:

```
OPENAI_API_KEY=...
PORT=5000
NODE_ENV=development
```

`client/.env`:

```
REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_MESSAGES_COLLECTION=messages
REACT_APP_CLIENT_APY_KEY=...
REACT_APP_CLIENT_AUTH_DOMAIN=...
REACT_APP_CLIENT_PROJECT_ID=...
REACT_APP_CLIENT_STORAGE_BUCKET=...
REACT_APP_CLIENT_MESSAGING_SENDER_ID=...
REACT_APP_CLIENT_APP_ID=...
```

In Firestore, create a `versions` collection with one document per knowledge-base version; its `name` must match the embeddings file (e.g. `Embeddings-v0.0.2` → `versionModels/embeddings-v0.0.2.json`).

**3. Start the server and the client**

```bash
cd server && npm run start:dev
cd client && npm start
```

**4. (Optional) Build a new knowledge-base version**

Put the `.txt` documents in `files/fileToLearnFrom/`, set the output file name in `src/app.ts`, then run:

```bash
npm run start:test
```

---

## Status

Prototype built in February 2025 to validate semantic question answering over travel insurance conditions.
