# MediKiosk Backend Service 🩺

FastAPI backend service for **MediKiosk — AI Clinical History Platform**. Exposes REST and WebSocket endpoints for patient intake, adaptive conversational questioning (Groq / Gemini / OpenRouter), non-LLM clinical red-flag safety detection, multimodal document/OCR extraction with confidence scoring and abnormal lab value flagging, physician inline review, and staff operator connectivity monitoring & manual intake failover.

---

## 🚀 How to Run the Backend

### Prerequisites
- Python 3.10+ (Python 3.14 supported)
- pip

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure API Keys (Optional but Recommended)
Copy `.env.example` to `.env` and add your free-tier API keys:
```bash
cp .env.example .env
```
Supported Free-tier Providers:
- **Google Gemini Flash** (Vision OCR + Adaptive LLM): [Get Gemini API Key](https://aistudio.google.com/)
- **Groq API** (Llama 3.3 70B Adaptive LLM): [Get Groq API Key](https://console.groq.com/)
- **OpenRouter** (Free Open-Source Models): [Get OpenRouter Key](https://openrouter.ai/)

> **Note:** If no API key is provided, MediKiosk automatically uses its intelligent, deterministic clinical fallback engine so the prototype works seamlessly offline out-of-the-box.

### 3. Start the FastAPI Server
```bash
# Run from the backend directory:
uvicorn app.main:app --reload --port 8000
```
API Documentation (Swagger UI) is available at: `http://localhost:8000/docs`

---

## 🧪 Run Automated Tests
```bash
pytest tests/ -v
```

---

## 🔑 Pre-Registered Staff Accounts
Staff accounts are pre-registered for the Staff Operator Dashboard:
- `nurse_priya` / `hospital123` (Sister Priya Sharma — OPD Triage Staff Nurse)
- `admin_raj` / `admin123` (Rajesh Varma — Kiosk & IT Operator)
- `sister_anita` / `nurse123` (Anita Sen — Senior Staff Nurse)

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/session/start` | Start new patient kiosk session |
| `POST` | `/api/session/{id}/answer` | Submit patient response & get next adaptive question |
| `POST` | `/api/session/{id}/back` | Rewind previous response & regenerate flow |
| `POST` | `/api/session/{id}/document/upload` | Upload real image for Vision-LLM extraction |
| `POST` | `/api/session/{id}/document/sample/{sample_id}` | Load bundled demo document into extraction pipeline |
| `POST` | `/api/session/{id}/document/manual-correct` | Correct low-confidence OCR fields |
| `GET` | `/api/session/{id}/summary` | Retrieve full clinical note summary & provenance |
| `POST` | `/api/session/{id}/confirm` | Confirm intake and route to Physician Queue |
| `POST` | `/api/session/{id}/connectivity` | Report kiosk connection status & trigger staff alert |
| `POST` | `/api/staff/login` | Authenticate pre-registered staff account |
| `GET` | `/api/staff/sessions` | List all active sessions with connectivity status |
| `POST` | `/api/staff/session/{id}/takeover` | Staff manual takeover (`staff-manual` provenance) |
| `POST` | `/api/staff/session/{id}/handback` | Hand back session to kiosk on reconnection |
| `GET` | `/api/physician/queue` | Physician triage queue with Red-Flag priority |
| `GET` | `/api/physician/session/{id}` | Physician view of structured clinical note |
| `POST` | `/api/physician/session/{id}/review` | Inline Accept / Amend / Reject controls |
| `POST` | `/api/physician/session/{id}/save-record` | Commit verified clinical note to hospital EHR |
| `WS` | `/api/ws/staff` | Real-time WebSocket stream for staff alerts |

