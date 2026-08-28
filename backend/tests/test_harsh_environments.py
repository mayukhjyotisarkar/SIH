import io
import os
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.store import SessionStore
from app.models import (
    PatientRegistration, PatientAnswerRequest, ExtractedMedicationItem,
    MedicationConfidence, MedicationClarificationAnswerRequest
)
from app.services.red_flag_service import red_flag_detector
from app.services.medication_clarification_service import MedicationClarificationService

client = TestClient(app)

# =====================================================================
# HARSH ENVIRONMENT TEST SUITE: MediKiosk Clinical AI Resilience Tests
# =====================================================================

class TestHarshInputsAndAdversarialAttacks:
    """Tests resilience against malformed inputs, injections, boundary overshoots, and corrupted files."""

    def test_registration_extreme_boundary_values(self):
        """Tests negative ages, ultra-high ages, empty strings, and special characters."""
        # Extreme Age: 150 years
        res1 = client.post("/api/session/start", json={
            "fullName": "Elderly Patient",
            "age": 150,
            "gender": "Male",
            "language": "en"
        })
        assert res1.status_code == 200
        assert res1.json()["age"] == 150

        # Boundary Age: 0 years (Neonate / Infant)
        res2 = client.post("/api/session/start", json={
            "fullName": "Infant Baby",
            "age": 0,
            "gender": "Female",
            "language": "hi"
        })
        assert res2.status_code == 200

        # XSS Injection in Name
        xss_name = "<script>alert('XSS-HACK')</script><img src=x onerror=alert(1)>"
        res3 = client.post("/api/session/start", json={
            "fullName": xss_name,
            "age": 30,
            "gender": "Other",
            "language": "en"
        })
        assert res3.status_code == 200
        assert "sessionId" in res3.json()

        # SQL Injection in Full Name & ABHA ID
        sqli_payload = "'; DROP TABLE sessions; SELECT * FROM users WHERE '1'='1"
        res4 = client.post("/api/session/start", json={
            "fullName": sqli_payload,
            "age": 45,
            "gender": "Male",
            "language": "en",
            "abhaId": "ABHA-'; DROP TABLE-1234"
        })
        assert res4.status_code == 200
        assert "sessionId" in res4.json()

    def test_ultra_long_string_and_emoji_storms(self):
        """Tests 10,000-character payload and intense multi-byte Unicode/Emoji floods."""
        res = client.post("/api/session/start", json={
            "fullName": "Stress Tester",
            "age": 35,
            "gender": "Male",
            "language": "en"
        })
        s_id = res.json()["sessionId"]

        # Massive 10,000 character answer
        huge_text = "I have had severe chest pain and palpitations. " * 300
        huge_res = client.post(f"/api/session/{s_id}/answer", json={
            "answer": huge_text,
            "field": "chief_complaint",
            "questionText": "What brings you in today?",
            "medicalSystem": "allopathy"
        })
        assert huge_res.status_code == 200

        # Intense Emoji Storm & Special Non-Latin Unicode (Hindi, Bengali, Tamil, Telugu, Arabic, RTL)
        unicode_storm = "🤒 🤢 🤮 💥 🔥 🩸 मुझे बहुत दर्द हो रहा है আমার বুকে তীব্র ব্যথা எனக்கு நெஞ்சு வலி నా గుండెల్లో నొప్పి شدید درد سر"
        emoji_res = client.post(f"/api/session/{s_id}/answer", json={
            "answer": unicode_storm,
            "field": "pain_character",
            "questionText": "How does the pain feel?",
            "medicalSystem": "allopathy"
        })
        assert emoji_res.status_code == 200

    def test_corrupted_and_zero_byte_file_uploads(self):
        """Tests uploading 0-byte files, non-image binaries, and path traversal filenames."""
        res = client.post("/api/session/start", json={
            "fullName": "Corrupted File Tester",
            "age": 28,
            "gender": "Female",
            "language": "en"
        })
        s_id = res.json()["sessionId"]

        # 1. 0-byte file
        zero_byte_file = io.BytesIO(b"")
        zero_res = client.post(
            f"/api/session/{s_id}/document/upload",
            files={"file": ("empty.png", zero_byte_file, "image/png")}
        )
        assert zero_res.status_code == 200  # Should handle gracefully with fallback extraction

        # 2. Corrupted pseudo-PDF (random binary garbage)
        fake_pdf = io.BytesIO(b"\x00\xFF\xAA\xBB\xCC\xDD RANDOM NOISE")
        pdf_res = client.post(
            f"/api/session/{s_id}/document/upload",
            files={"file": ("corrupted.pdf", fake_pdf, "application/pdf")}
        )
        assert pdf_res.status_code == 200

        # 3. Path traversal filename
        malicious_file = io.BytesIO(b"fake doc content")
        trav_res = client.post(
            f"/api/session/{s_id}/document/upload",
            files={"file": ("../../../../etc/passwd.jpg", malicious_file, "image/jpeg")}
        )
        assert trav_res.status_code == 200

    def test_undo_beyond_zero_turns(self):
        """Tests clicking undo (back) repeatedly when conversation turns are empty."""
        res = client.post("/api/session/start", json={
            "fullName": "Undo Tester",
            "age": 22,
            "gender": "Male",
            "language": "en"
        })
        s_id = res.json()["sessionId"]

        # Undo on brand new session (0 turns)
        undo1 = client.post(f"/api/session/{s_id}/back")
        assert undo1.status_code == 200

        # Undo multiple times consecutively
        for _ in range(5):
            u_res = client.post(f"/api/session/{s_id}/back")
            assert u_res.status_code == 200

    def test_nonexistent_session_and_document_calls(self):
        """Tests 404 handling on fake IDs without 500 server crashes."""
        fake_id = f"nonexistent_{uuid.uuid4().hex}"
        
        assert client.get(f"/api/session/{fake_id}/summary").status_code == 404
        assert client.post(f"/api/session/{fake_id}/answer", json={"answer": "hi"}).status_code == 404
        assert client.delete(f"/api/session/{fake_id}/document/doc_999").status_code == 404
        assert client.post(f"/api/session/{fake_id}/document/doc_999/medications/clarify/plan").status_code == 404
        assert client.post(f"/api/session/{fake_id}/confirm").status_code == 404


class TestEmergencyRedFlagEdgeCases:
    """Stress tests high-acuity life-threatening emergency detection and false positive suppression."""

    def test_acute_coronary_syndrome_crushing_pain(self):
        rf = red_flag_detector.evaluate(
            "Crushing heavy chest pain radiating to left shoulder and jaw with cold sweat and nausea",
            []
        )
        assert rf.triggered is True
        assert rf.urgency == "emergency"
        assert "cardiac" in rf.category.lower() or "chest" in rf.category.lower()

    def test_acute_stroke_fast_protocol(self):
        rf = red_flag_detector.evaluate(
            "Sudden facial droop on right side with slurred speech and right arm weakness since 30 minutes",
            []
        )
        assert rf.triggered is True
        assert rf.urgency == "emergency"
        assert "neuro" in rf.category.lower() or "stroke" in rf.category.lower()

    def test_severe_anaphylaxis_airway_compromise(self):
        rf = red_flag_detector.evaluate(
            "Swelling in throat, wheezing sound, inability to breathe, and facial hives after eating nuts",
            []
        )
        assert rf.triggered is True
        assert rf.urgency == "emergency"

    def test_active_massive_gi_bleed(self):
        rf = red_flag_detector.evaluate(
            "Vomiting fresh blood and dark black tarry stools with severe dizziness and fainting",
            []
        )
        assert rf.triggered is True
        assert rf.urgency == "emergency"

    def test_psychiatric_crisis_and_suicidality(self):
        rf = red_flag_detector.evaluate(
            "Patient expresses active thoughts of suicide and self harm",
            []
        )
        assert rf.triggered is True
        assert rf.urgency == "emergency"

    def test_denial_safety_no_false_positive_on_negations(self):
        """Verifies that explicit denials (e.g. 'NO chest pain', 'NO shortness of breath') do NOT trip emergencies."""
        rf = red_flag_detector.evaluate(
            "Routine health checkup. Denies chest pain, denies shortness of breath, no palpitations, no stroke signs",
            []
        )
        assert rf.triggered is False
        assert rf.urgency == "routine"


class TestMedicationClarificationHarshCases:
    """Tests the Dynamic Medication Clarifier under harsh unreadable handwriting and adversarial responses."""

    def test_ten_unreadable_drugs_deterministic_escalation(self):
        """Verifies that 10 unreadable medications triggers deterministic staff escalation without spamming questions."""
        scribbled_meds = [
            ExtractedMedicationItem(
                id=f"med_{i:02d}",
                name=f"Unidentified illegible scribble #{i+1}",
                confidence=MedicationConfidence(medicine=0.2, frequency=0.1, timing=0.1),
                status="needs_clarification",
                unreliableFields=["medicine", "frequency", "timing"]
            )
            for i in range(10)
        ]
        plan = MedicationClarificationService.plan_next_question(scribbled_meds, patient_age=70, language="hi")
        assert plan.shouldAskPatient is False
        assert plan.escalateToStaff is True
        assert plan.unclearMedicationCount == 10
        assert "Escrowed to Hospital Staff Desk" in plan.reason or "pharmacist" in plan.reason.lower()

    def test_contradictory_and_vague_patient_answers(self):
        """Tests patient responding with 'I don't know', 'I am not sure', and partial info."""
        target_med = ExtractedMedicationItem(
            id="med_test",
            name="Unidentified tablet",
            confidence=MedicationConfidence(medicine=0.5, frequency=0.3),
            status="needs_clarification",
            unreliableFields=["medicine", "frequency"]
        )

        # 1. Patient answers 'I have no idea / don't know'
        med_out, resolved = MedicationClarificationService.interpret_patient_answer(
            answer="I don't know at all, doctor wrote something weird",
            target_med=target_med,
            language="en"
        )
        assert med_out.status == "uncertain"
        assert "patient_marked_uncertain" in resolved

        # 2. Patient provides Hindi spoken multi-field answer with colloquial terms
        target_med2 = ExtractedMedicationItem(
            id="med_test_2",
            name="Unidentified tablet",
            confidence=MedicationConfidence(medicine=0.5, frequency=0.3),
            status="needs_clarification",
            unreliableFields=["medicine", "frequency", "timing"]
        )
        med_out2, resolved2 = MedicationClarificationService.interpret_patient_answer(
            answer="Ye Pan-D hai, subah khali pet leta hu ek goli",
            target_med=target_med2,
            language="hi"
        )
        assert "medicine" in resolved2
        assert "timing" in resolved2
        assert "frequency" in resolved2 or "dosage" in resolved2
        assert "Empty stomach" in (med_out2.timing or "")
        assert "Pantoprazole" in (med_out2.name or "") or "Pan-d" in (med_out2.name.lower() or "")


class TestMedicalSystemSynthesizersHarshCases:
    """Tests Ayurveda, Homeopathy, and Allopathy synthesizers with sparse or contradictory patient turns."""

    def test_ayurveda_with_zero_specific_answers(self):
        res = client.post("/api/session/start", json={
            "fullName": "Sparse Ayurveda",
            "age": 35,
            "gender": "Male",
            "language": "en"
        })
        s_id = res.json()["sessionId"]

        client.post(f"/api/session/{s_id}/answer", json={
            "answer": "Just feeling tired",
            "field": "dosha_lakshana",
            "questionText": "Any specific body constitution changes?",
            "medicalSystem": "ayurveda"
        })

        sum_res = client.get(f"/api/session/{s_id}/summary")
        assert sum_res.status_code == 200
        data = sum_res.json()
        assert data["historyOfPresentIllness"]["ayurvedicDetails"] is not None

    def test_homeopathy_with_sparse_modalities(self):
        res = client.post("/api/session/start", json={
            "fullName": "Sparse Homeo",
            "age": 40,
            "gender": "Female",
            "language": "en"
        })
        s_id = res.json()["sessionId"]

        client.post(f"/api/session/{s_id}/answer", json={
            "answer": "Thirsty for cold water",
            "field": "thirst_thermal",
            "questionText": "How is your thirst?",
            "medicalSystem": "homeopathy"
        })

        sum_res = client.get(f"/api/session/{s_id}/summary")
        assert sum_res.status_code == 200
        data = sum_res.json()
        assert data["historyOfPresentIllness"]["homeopathicDetails"] is not None

    def test_allopathy_socrates_minimal_turns(self):
        res = client.post("/api/session/start", json={
            "fullName": "Sparse Allopathy",
            "age": 55,
            "gender": "Male",
            "language": "en"
        })
        s_id = res.json()["sessionId"]

        client.post(f"/api/session/{s_id}/answer", json={
            "answer": "Headache on left side since morning",
            "field": "site_onset",
            "questionText": "Where is the pain?",
            "medicalSystem": "allopathy"
        })

        sum_res = client.get(f"/api/session/{s_id}/summary")
        assert sum_res.status_code == 200
        data = sum_res.json()
        assert data["historyOfPresentIllness"]["allopathicDetails"] is not None

