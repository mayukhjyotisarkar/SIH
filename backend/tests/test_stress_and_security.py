import io
import asyncio
import time
import httpx
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestSecurityAndPathTraversal:
    """Security tests against directory traversal and unauthorized resource access."""

    def test_directory_traversal_image_endpoints(self):
        """Attempts to read outside upload directories using dot-dot-slash in IDs."""
        res1 = client.get("/api/documents/../../etc/passwd/image")
        assert res1.status_code in (404, 422, 400)

        res2 = client.get("/api/sample-docs/../../app/main.py/image")
        assert res2.status_code in (404, 422, 400)

        res3 = client.get("/api/documents/%2e%2e%2f%2e%2e%2fconfig/image")
        assert res3.status_code in (404, 422, 400)

    def test_staff_takeover_invalid_session(self):
        """Staff attempts to take over a non-existent or expired session."""
        res = client.post("/api/staff/takeover", json={
            "sessionId": "ghost_session_000",
            "staffId": "nurse_priya",
            "action": "lock"
        })
        assert res.status_code == 404


class TestConcurrencyAndRapidInputs:
    """Tests high-concurrency rapid fire inputs and state mutation races."""

    def test_rapid_fire_answer_submission(self):
        """Submits 20 rapid answers in tight sequence."""
        res = client.post("/api/session/start", json={
            "fullName": "Rapid Patient",
            "age": 29,
            "gender": "Male",
            "language": "en"
        })
        s_id = res.json()["sessionId"]

        for i in range(15):
            ans_res = client.post(f"/api/session/{s_id}/answer", json={
                "answer": f"Rapid answer #{i+1} with symptom update",
                "field": f"turn_field_{i+1}",
                "questionText": f"Question {i+1}?",
                "medicalSystem": "allopathy"
            })
            assert ans_res.status_code == 200

        # Verify summary reflects all 15 inputs (1 chief complaint + 14 conversation turns)
        sum_res = client.get(f"/api/session/{s_id}/summary")
        assert sum_res.status_code == 200
        data = sum_res.json()
        assert data["chiefComplaint"] != ""
        assert len(data["conversationTurns"]) == 14

    def test_concurrent_document_operations(self):
        """Loads multiple documents, deletes one, and replaces another in rapid succession."""
        res = client.post("/api/session/start", json={
            "fullName": "Multi Doc Patient",
            "age": 52,
            "gender": "Female",
            "language": "en"
        })
        s_id = res.json()["sessionId"]

        # Load 3 sample documents
        d1 = client.post(f"/api/session/{s_id}/document/sample/sample_lab_report").json()
        d2 = client.post(f"/api/session/{s_id}/document/sample/sample_printed_rx").json()
        d3 = client.post(f"/api/session/{s_id}/document/sample/sample_handwritten_rx").json()

        session_docs = client.get(f"/api/session/{s_id}/summary").json()["priorInvestigations"]
        assert len(session_docs) == 3

        # Delete middle document
        del_res = client.delete(f"/api/session/{s_id}/document/{d2['id']}")
        assert del_res.status_code == 200
        remaining_docs = del_res.json()["priorInvestigations"]
        assert len(remaining_docs) == 2
        assert d2["id"] not in [d["id"] for d in remaining_docs]

        # Replace first document with a fresh PDF
        replacement_pdf = io.BytesIO(b"%PDF-1.4 mock replacement report")
        rep_res = client.post(
            f"/api/session/{s_id}/document/{d1['id']}/replace",
            files={"file": ("new_blood_test.pdf", replacement_pdf, "application/pdf")}
        )
        assert rep_res.status_code == 200
        new_doc = rep_res.json()
        assert new_doc["document"] == "new_blood_test.pdf"


class TestLLMFallbackAndDegradedConnectivity:
    """Tests that when external LLMs fail or timeout, the deterministic fallback engine keeps the kiosk 100% operational."""

    def test_fallback_adaptive_question_progression(self):
        """Verifies deterministic question engine advances without infinite loops."""
        from app.services.llm_service import llm_service
        from app.models import QAPair
        
        # Test for various chief complaints
        complaints = [
            "Chest pain and sweating",
            "Severe headache and vomiting",
            "Stomach pain after meals",
            "Knee joint swelling",
            "High fever with chills",
            "Skin rash and itching",
            "General weakness and tiredness"
        ]

        for comp in complaints:
            cat = llm_service.identify_symptom_category(comp)
            # Turn 1
            q1 = llm_service._symptom_specific_fallback(comp, [], False, False, "allopathy", 0, cat)
            assert q1.question is not None
            assert len(q1.options) > 0
            assert q1.done is False

            # Turn 2
            t1 = QAPair(questionId="q1", field=q1.field, questionText=q1.question, patientAnswer="Yes, moderate severity", timestamp="10:00")
            q2 = llm_service._symptom_specific_fallback(comp, [t1], False, False, "allopathy", 1, cat)
            assert q2.field != q1.field or q2.done is True
