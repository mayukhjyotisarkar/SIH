import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.red_flag_service import red_flag_detector
from app.services.llm_service import llm_service
from app.models import QAPair
from app.store import SessionStore

client = TestClient(app)

def test_healthz():
    response = client.get("/api/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "llm_provider" in data

def test_red_flag_detection():
    # 1. Non-red flag case - Mild fever
    rf1 = red_flag_detector.evaluate("Mild fever and runny nose", [])
    assert rf1.triggered is False
    assert rf1.urgency == "routine"

    # 2. Non-red flag case - Chest discomfort with explicit denials
    rf_denial = red_flag_detector.evaluate(
        "Mild chest discomfort after spicy food",
        [
            QAPair(questionId="q1", field="radiation_site", questionText="Where does it spread?", patientAnswer="Stays strictly in center of chest, no left arm pain, no radiation", timestamp="10:00"),
            QAPair(questionId="q2", field="associated_autonomic", questionText="Any sweating?", patientAnswer="No breathlessness, no sweating, no diaphoresis", timestamp="10:01")
        ]
    )
    assert rf_denial.triggered is False
    assert rf_denial.urgency == "routine"

    # 3. Non-red flag case - GI stomach ache with denied bleeding
    rf_gi = red_flag_detector.evaluate(
        "Severe stomach pain and burning acidity",
        [
            QAPair(questionId="q1", field="red_flags_gi", questionText="Any blood in vomit?", patientAnswer="No blood in vomit, normal stools", timestamp="10:00")
        ]
    )
    assert rf_gi.triggered is False

    # 4. Non-red flag case - Isolated left arm musculoskeletal injury without chest pain
    rf_arm = red_flag_detector.evaluate(
        "Left arm and shoulder soreness after lifting heavy boxes",
        [
            QAPair(questionId="q1", field="joint_location_pattern", questionText="Which joints are painful?", patientAnswer="Single joint (Shoulder / Hip / Ankle) in left arm", timestamp="10:00")
        ]
    )
    assert rf_arm.triggered is False

    # 5. True Cardiac Emergency red flag case
    rf2 = red_flag_detector.evaluate(
        "Severe retrosternal chest pain since 2 hours",
        [QAPair(questionId="q1", field="radiation", questionText="Where does it spread?", patientAnswer="Radiates down to my left arm and I have heavy cold sweating", timestamp="10:00")]
    )
    assert rf2.triggered is True
    assert rf2.urgency == "emergency"
    assert "Acute Coronary Syndrome" in rf2.reason
    assert "IMMEDIATE" in rf2.action

def test_session_lifecycle_and_adaptive_questions():
    # 1. Start Session
    reg_payload = {
        "fullName": "Suresh Patel",
        "age": 48,
        "gender": "Male",
        "language": "en",
        "ayushMode": False,
        "consent": {"recordVoice": True, "storeDocuments": True, "shareHospital": True}
    }
    resp = client.post("/api/session/start", json=reg_payload)
    assert resp.status_code == 200
    session_data = resp.json()
    s_id = session_data["sessionId"]
    assert s_id.startswith("session_")
    assert session_data["patientName"] == "Suresh Patel"

    # 2. Submit Chief Complaint
    ans_resp = client.post(f"/api/session/{s_id}/answer", json={
        "answer": "Severe retrosternal chest pain for 2 hours",
        "mode": "voice",
        "ayushMode": False,
        "field": "chief_complaint",
        "questionText": "What is your main health problem or chief complaint today?"
    })
    assert ans_resp.status_code == 200
    data = ans_resp.json()
    assert "adaptive" in data
    assert len(data["adaptive"]["options"]) > 0
    assert data["session"]["chiefComplaint"] == "Severe retrosternal chest pain for 2 hours"

    # 3. Follow-up answer triggering red flag
    ans_resp2 = client.post(f"/api/session/{s_id}/answer", json={
        "answer": "Pain radiates to my left arm with cold diaphoresis and breathlessness",
        "mode": "tap",
        "ayushMode": False,
        "field": data["adaptive"]["field"],
        "questionText": data["adaptive"]["question"]
    })
    assert ans_resp2.status_code == 200
    data2 = ans_resp2.json()
    assert data2["redFlag"]["triggered"] is True

def test_symptom_specific_questioning_specialties_sequential_progression():
    # 1. Test Gastrointestinal 5-Turn Sequential Progression (Zero Duplicate Questions)
    resp_gi = client.post("/api/session/start", json={"fullName": "Kavita Rao", "age": 32, "gender": "Female"})
    s_gi = resp_gi.json()["sessionId"]

    # Turn 0: Chief Complaint
    ans0 = client.post(f"/api/session/{s_gi}/answer", json={
        "answer": "Severe stomach burning pain, acidity and bloating",
        "field": "chief_complaint"
    })
    assert ans0.status_code == 200
    q1_data = ans0.json()["adaptive"]
    assert q1_data["symptomCategory"] == "Gastrointestinal"
    assert q1_data["field"] == "vitals_baseline_common"

    # Turn 1: Mandatory Baseline Vitals answered
    ans1 = client.post(f"/api/session/{s_gi}/answer", json={
        "answer": "Height: 165 cm, Weight: 60 kg, Blood Pressure: 120/80 mmHg",
        "field": q1_data["field"],
        "questionText": q1_data["question"]
    })
    q2_data = ans1.json()["adaptive"]
    assert q2_data["field"] == "gi_site_character"
    assert q2_data["field"] != q1_data["field"]

    # Turn 2: Site / Character answered
    ans2 = client.post(f"/api/session/{s_gi}/answer", json={
        "answer": "Upper center (Epigastrium) - Burning pain",
        "field": q2_data["field"],
        "questionText": q2_data["question"]
    })
    q3_data = ans2.json()["adaptive"]
    assert q3_data["field"] == "onset_progression"
    assert q3_data["field"] != q2_data["field"]

    # Turn 3: Duration answered
    ans3 = client.post(f"/api/session/{s_gi}/answer", json={
        "answer": "Started 1 to 2 days ago (Acute)",
        "field": q3_data["field"],
        "questionText": q3_data["question"]
    })
    q4_data = ans3.json()["adaptive"]
    assert q4_data["field"] == "meals_relationship"
    assert q4_data["field"] != q3_data["field"]

    # Turn 4: Meals relationship answered
    ans4 = client.post(f"/api/session/{s_gi}/answer", json={
        "answer": "Worse on empty stomach / Relieved by milk",
        "field": q4_data["field"],
        "questionText": q4_data["question"]
    })
    q5_data = ans4.json()["adaptive"]
    assert q5_data["field"] == "gi_associated_nausea"

    # Turn 5: Nausea answered
    ans5 = client.post(f"/api/session/{s_gi}/answer", json={
        "answer": "Frequent sour belching & acid reflux",
        "field": q5_data["field"],
        "questionText": q5_data["question"]
    })
    res5_body = ans5.json()
    assert res5_body["redFlag"]["triggered"] is False
    q6_data = res5_body["adaptive"]
    assert q6_data["field"] == "red_flags_gi"

    # 2. Test Respiratory Complaint Specialization
    resp_resp = client.post("/api/session/start", json={"fullName": "Amit Roy", "age": 45, "gender": "Male"})
    s_resp = resp_resp.json()["sessionId"]
    ans_resp = client.post(f"/api/session/{s_resp}/answer", json={"answer": "Chronic cough with thick yellow sputum and breathlessness on exertion"})
    assert ans_resp.status_code == 200
    data_resp = ans_resp.json()
    assert data_resp["adaptive"]["symptomCategory"] == "Respiratory"
    assert data_resp["adaptive"]["field"] == "vitals_baseline_common"

    # 3. Test Musculoskeletal Complaint Specialization
    resp_msk = client.post("/api/session/start", json={"fullName": "Meenakshi Devi", "age": 60, "gender": "Female"})
    s_msk = resp_msk.json()["sessionId"]
    ans_msk = client.post(f"/api/session/{s_msk}/answer", json={"answer": "Bilateral knee joint pain, morning stiffness and swelling"})
    assert ans_msk.status_code == 200
    data_msk = ans_msk.json()
    assert data_msk["adaptive"]["symptomCategory"] == "Musculoskeletal"
    assert data_msk["adaptive"]["field"] == "vitals_baseline_common"

def test_multilingual_audio_transcription_and_colloquialisms():
    resp = client.post("/api/session/start", json={"fullName": "Rajesh Kumar", "age": 50, "gender": "Male"})
    s_id = resp.json()["sessionId"]

    # Submit simulated audio file
    fake_audio_bytes = b"RIFF....WAVEfmt ...."
    trans_resp = client.post(
        f"/api/session/{s_id}/audio-transcribe?languageHint=hi-IN&accentHint=Hindi%20/%20Hinglish",
        files={"file": ("recording.webm", io.BytesIO(fake_audio_bytes), "audio/webm")}
    )
    assert trans_resp.status_code == 200
    data = trans_resp.json()
    assert "transcript" in data
    assert data["detectedLanguage"] == "hi-IN"
    assert "accent" in data
    assert len(data["normalizedMedicalTerms"]) > 0

def test_real_and_sample_document_ocr_and_correction():
    # Create test session
    resp = client.post("/api/session/start", json={
        "fullName": "Anjali Sen",
        "age": 38,
        "gender": "Female",
        "language": "en",
        "ayushMode": False
    })
    s_id = resp.json()["sessionId"]

    # 1. Sample Document Load
    sample_resp = client.post(f"/api/session/{s_id}/document/sample/sample_lab_report")
    assert sample_resp.status_code == 200
    sample_data = sample_resp.json()
    assert sample_data["documentType"] == "lab_report"
    assert sample_data["flag"] is not None
    doc_id = sample_data["id"]

    # 2. Real Document Upload (synthetic image bytes)
    img_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    upload_resp = client.post(
        f"/api/session/{s_id}/document/upload",
        files={"file": ("my_lab_report.png", io.BytesIO(img_bytes), "image/png")}
    )
    assert upload_resp.status_code == 200
    up_data = upload_resp.json()
    assert up_data["id"].startswith("doc_")
    assert "imageUrl" in up_data

    # 3. Manual Correction of Extracted Fields
    corrected_payload = {
        "documentId": doc_id,
        "extracted": {
            "laboratory": "Apollo Diagnostics (Verified by Patient)",
            "investigations": [
                {"test": "Fasting Blood Sugar", "value": "150", "unit": "mg/dL", "flag": "HIGH"}
            ]
        }
    }
    correct_resp = client.post(f"/api/session/{s_id}/document/manual-correct", json=corrected_payload)
    assert correct_resp.status_code == 200
    assert correct_resp.json()["session"]["fieldProvenance"]["priorInvestigations"] == "manual-correction"

def test_staff_authentication_takeover_and_conflict():
    # 1. Staff Login Success
    login_resp = client.post("/api/staff/login", json={
        "username": "nurse_priya",
        "password": "hospital123"
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    token = login_data["token"]
    assert token.startswith("token_")

    # 2. Protected Staff Endpoint without Auth -> 401
    unauth_resp = client.get("/api/staff/sessions")
    assert unauth_resp.status_code == 401

    # 3. Protected Staff Endpoint with Auth -> 200
    auth_resp = client.get("/api/staff/sessions", headers={"Authorization": f"Bearer {token}"})
    assert auth_resp.status_code == 200
    sessions = auth_resp.json()
    assert len(sessions) >= 1
    target_session = sessions[0]
    s_id = target_session["sessionId"]

    # 4. Staff Takeover
    takeover_resp = client.post(
        f"/api/staff/session/{s_id}/takeover",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "staffId": "STAFF-OPD-101",
            "chiefComplaint": "Patient manually interviewed by Sister Priya: severe headache and dizziness",
            "manualNotes": "Patient felt unsteady walking.",
            "expectedVersion": target_session["version"]
        }
    )
    assert takeover_resp.status_code == 200
    sess = takeover_resp.json()["session"]
    assert sess["enteredByStaffId"] == "STAFF-OPD-101"
    assert sess["fieldProvenance"]["chiefComplaint"] == "staff-manual"

def test_physician_queue_review_and_sqlite_persistence():
    # 1. Get Physician Queue
    queue_resp = client.get("/api/physician/queue")
    assert queue_resp.status_code == 200
    queue = queue_resp.json()
    assert len(queue) >= 1
    assert queue[0]["redFlag"]["triggered"] is True

    # 2. Get Detail & Save Amendment
    s_id = queue[0]["sessionId"]
    rev_resp = client.post(f"/api/physician/session/{s_id}/review", json={
        "sectionReviews": {"chiefComplaint": "amended", "historyOfPresentIllness": "accepted"},
        "amendedData": {"chiefComplaint": "Acute Coronary Syndrome (Verified by Emergency Triage MO)"},
        "physicianNotes": "Urgent 12-lead ECG confirmed STEMI. Shifted to Cath Lab immediately.",
        "overallStatus": "Amended"
    })
    assert rev_resp.status_code == 200
    updated_sess = rev_resp.json()["session"]
    assert updated_sess["fieldProvenance"]["chiefComplaint"] == "physician-amended"

    # 3. Save Record to EHR
    save_resp = client.post(f"/api/physician/session/{s_id}/save-record")
    assert save_resp.status_code == 200
    assert save_resp.json()["status"] == "saved"

    # 4. Test Persistence: New SessionStore instance loads saved session from SQLite
    new_store = SessionStore()
    reloaded = new_store.get_session(s_id)
    assert reloaded is not None
    assert reloaded.physicianReviewStatus == "Accepted"
    assert reloaded.fieldProvenance["chiefComplaint"] == "physician-amended"

def test_department_doctor_routing_and_staff_call_protocol():
    # 1. Ophthalmology Case (Eye power / blurry vision)
    resp_eye = client.post("/api/session/start", json={"fullName": "Kishan Lal", "age": 42, "gender": "Male"})
    s_eye = resp_eye.json()["sessionId"]
    ans_eye = client.post(f"/api/session/{s_eye}/answer", json={
        "answer": "Blurry vision in both eyes, difficulty reading books and need eye power check",
        "field": "chief_complaint"
    })
    assert ans_eye.status_code == 200
    eye_routing = ans_eye.json()["departmentRouting"]
    assert eye_routing["department"] == "Ophthalmology"
    assert eye_routing["doctorName"] == "Dr. Radhika Nair"
    assert eye_routing["roomNumber"] == "Room 102"
    assert eye_routing["isAmbiguous"] is False

    # 2. Cardiology Case (Angina / Chest tightness)
    resp_card = client.post("/api/session/start", json={"fullName": "Sunil Varma", "age": 52, "gender": "Male"})
    s_card = resp_card.json()["sessionId"]
    ans_card = client.post(f"/api/session/{s_card}/answer", json={
        "answer": "Chest heaviness and palpitations for 2 days",
        "field": "chief_complaint"
    })
    assert ans_card.status_code == 200
    card_routing = ans_card.json()["departmentRouting"]
    assert card_routing["department"] == "Cardiology"
    assert card_routing["doctorName"] == "Dr. A. K. Banerjee"
    assert card_routing["roomNumber"] == "Room 204"

    # 3. Ambiguous Case / Staff Nurse Call
    resp_amb = client.post("/api/session/start", json={"fullName": "Geeta Devi", "age": 65, "gender": "Female"})
    s_amb = resp_amb.json()["sessionId"]
    ans_amb = client.post(f"/api/session/{s_amb}/answer", json={
        "answer": "Not feeling well at all, body hurting everywhere and don't know what is happening",
        "field": "chief_complaint"
    })
    assert ans_amb.status_code == 200
    amb_routing = ans_amb.json()["departmentRouting"]
    assert amb_routing["isAmbiguous"] is True

    # Patient / Kiosk triggers dedicated staff call
    call_resp = client.post(f"/api/session/{s_amb}/call-staff", json={
        "reason": "Patient confused about symptoms at Kiosk #1",
        "kioskId": "KIOSK-01"
    })
    assert call_resp.status_code == 200
    assert call_resp.json()["session"]["staffCallActive"] is True

    # 4. Staff Nurse Assigns Department Manually
    login_resp = client.post("/api/staff/login", json={"username": "nurse_priya", "password": "hospital123"})
    token = login_resp.json()["token"]

    assign_resp = client.post(
        f"/api/staff/session/{s_amb}/assign-department",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "department": "General Medicine",
            "doctorName": "Dr. Subhash Chandra",
            "roomNumber": "Room 101",
            "notes": "Patient evaluated at triage desk, directed to General Medicine for comprehensive review."
        }
    )
    assert assign_resp.status_code == 200
    final_routing = assign_resp.json()["departmentRouting"]
    assert final_routing["department"] == "General Medicine"
    assert final_routing["assignedBy"] == "staff-triage"
    assert final_routing["isAmbiguous"] is False
    assert assign_resp.json()["session"]["staffCallActive"] is False

def test_clinical_decision_support_endpoint():
    # 1. Cardiovascular Case
    resp_cv = client.post("/api/session/start", json={"fullName": "Ramesh Gupta", "age": 58, "gender": "Male"})
    s_cv = resp_cv.json()["sessionId"]
    client.post(f"/api/session/{s_cv}/answer", json={
        "answer": "Crushing chest pain radiating to left arm with breathlessness on climbing stairs",
        "field": "chief_complaint"
    })

    cdss_cv = client.post(f"/api/physician/session/{s_cv}/clinical-decision-support")
    assert cdss_cv.status_code == 200
    data_cv = cdss_cv.json()
    assert len(data_cv["differentialDiagnoses"]) > 0
    assert any("Angina" in d["condition"] or "Coronary" in d["condition"] for d in data_cv["differentialDiagnoses"])
    assert len(data_cv["suggestedTreatments"]) > 0
    assert any("Aspirin" in t["name"] or "Atorvastatin" in t["name"] or "Pantoprazole" in t["name"] for t in data_cv["suggestedTreatments"])
    assert len(data_cv["keyPointsToNotice"]) > 0
    assert len(data_cv["recommendedInvestigations"]) > 0
    assert "disclaimer" in data_cv

    # 2. Gastrointestinal Case
    resp_gi = client.post("/api/session/start", json={"fullName": "Sunita Roy", "age": 42, "gender": "Female"})
    s_gi = resp_gi.json()["sessionId"]
    client.post(f"/api/session/{s_gi}/answer", json={
        "answer": "Severe stomach burning, acidity, and epigastric pain after eating meals",
        "field": "chief_complaint"
    })

    cdss_gi = client.post(f"/api/physician/session/{s_gi}/clinical-decision-support")
    assert cdss_gi.status_code == 200
    data_gi = cdss_gi.json()
    assert any("GERD" in d["condition"] or "Gastritis" in d["condition"] for d in data_gi["differentialDiagnoses"])
    assert any("Pantoprazole" in t["name"] or "Sucralfate" in t["name"] for t in data_gi["suggestedTreatments"])
    assert any("Endoscopy" in inv or "Ultrasound" in inv for inv in data_gi["recommendedInvestigations"])

def test_emergency_casualty_queue_and_actions():
    # 1. Non-red-flag patient should NOT appear in emergency queue
    resp_routine = client.post("/api/session/start", json={"fullName": "Aman Verma", "age": 28, "gender": "Male"})
    s_routine = resp_routine.json()["sessionId"]
    client.post(f"/api/session/{s_routine}/answer", json={
        "answer": "Mild knee ache after jogging yesterday",
        "field": "chief_complaint"
    })

    # 2. Critical red-flag emergency patient
    resp_emg = client.post("/api/session/start", json={"fullName": "Vikram Malhotra", "age": 62, "gender": "Male"})
    s_emg = resp_emg.json()["sessionId"]
    client.post(f"/api/session/{s_emg}/answer", json={
        "answer": "Severe retrosternal crushing chest pain with cold sweating and dizziness",
        "field": "chief_complaint"
    })

    # Fetch emergency queue
    emg_queue_resp = client.get("/api/emergency/queue")
    assert emg_queue_resp.status_code == 200
    queue = emg_queue_resp.json()
    assert len(queue) > 0

    # Ensure routine patient is NOT in emergency queue
    assert not any(p["sessionId"] == s_routine for p in queue)

    # Ensure red flag patient IS in emergency queue
    emg_patient = next((p for p in queue if p["sessionId"] == s_emg), None)
    assert emg_patient is not None
    assert emg_patient["redFlag"]["triggered"] is True
    assert emg_patient["redFlag"]["urgency"] in ["emergency", "urgent"]

    # 3. Trigger Emergency Action: Bed assignment & Stat ECG
    action_resp = client.post(
        f"/api/emergency/session/{s_emg}/action",
        json={
            "action": "Stat 12-Lead ECG & Trop-I",
            "assignedBed": "Trauma Bay 1 (Critical)",
            "notes": "Patient wheeled into Trauma Bay 1 by Casualty Nurse Priya."
        }
    )
    assert action_resp.status_code == 200
    action_data = action_resp.json()
    assert action_data["status"] == "action_executed"
    assert action_data["assignedBed"] == "Trauma Bay 1 (Critical)"
    assert len(action_data["emergencyActionLog"]) > 0

def test_mandatory_vitals_emergency_bypass_and_non_disclosure():
    # 1. Routine Patient: Common Unified Baseline Vitals Intake
    resp_vitals = client.post("/api/session/start", json={"fullName": "Pooja Sharma", "age": 34, "gender": "Female"})
    s_vitals = resp_vitals.json()["sessionId"]
    
    # Chief complaint
    client.post(f"/api/session/{s_vitals}/answer", json={
        "answer": "Mild persistent headache for 3 days",
        "field": "chief_complaint"
    })

    # Submit single unified height, weight, and blood pressure turn
    ans_vitals = client.post(f"/api/session/{s_vitals}/answer", json={
        "answer": "Height: 165 cm, Weight: 62 kg, Blood Pressure: 118/76 mmHg",
        "field": "vitals_baseline_common"
    })
    assert ans_vitals.status_code == 200
    sess_v = ans_vitals.json()["session"]
    assert "165 cm" in sess_v["vitals"]["heightCm"]
    assert "62 kg" in sess_v["vitals"]["weightKg"]
    assert "118/76" in sess_v["vitals"]["bloodPressure"]
    assert sess_v["vitals"]["disclosureStatus"] == "disclosed"

    # 2. Patient who declines/skips vitals with optional explanation
    resp_decl = client.post("/api/session/start", json={"fullName": "Kabir Das", "age": 52, "gender": "Male"})
    s_decl = resp_decl.json()["sessionId"]
    client.post(f"/api/session/{s_decl}/answer", json={
        "answer": "Knee ache",
        "field": "chief_complaint"
    })

    ans_decl = client.post(f"/api/session/{s_decl}/answer", json={
        "answer": "Prefer not to disclose (Wheelchair user / Physical limitation)",
        "field": "vitals_baseline_common"
    })
    assert ans_decl.status_code == 200
    sess_decl = ans_decl.json()["session"]
    assert sess_decl["vitals"]["disclosureStatus"] == "declined"
    assert "Wheelchair user" in sess_decl["vitals"]["nonDisclosureReason"]

    # 3. Emergency Patient: Immediate Vitals & Routine Questions Bypass
    resp_emg = client.post("/api/session/start", json={"fullName": "Sanjay Verma", "age": 60, "gender": "Male"})
    s_emg = resp_emg.json()["sessionId"]
    ans_emg = client.post(f"/api/session/{s_emg}/answer", json={
        "answer": "Crushing chest pain radiating to left arm with cold sweats",
        "field": "chief_complaint"
    })
    assert ans_emg.status_code == 200
    adaptive = ans_emg.json()["adaptive"]
    assert adaptive["done"] is True
    assert "EMERGENCY" in adaptive["question"] or "Casualty" in adaptive["question"]

def test_multilingual_text_to_speech_endpoint():
    # 1. Bengali TTS
    resp_bn = client.get("/api/audio/tts?text=আপনার%20প্রধান%20শারীরিক%20সমস্যা%20কী?&lang=bn")
    assert resp_bn.status_code == 200
    assert resp_bn.headers.get("content-type") == "audio/mpeg"
    assert len(resp_bn.content) > 500

    # 2. Hindi TTS
    resp_hi = client.get("/api/audio/tts?text=आज%20आपकी%20मुख्य%20स्वास्थ्य%20समस्या%20क्या%20है?&lang=hi")
    assert resp_hi.status_code == 200
    assert resp_hi.headers.get("content-type") == "audio/mpeg"
    assert len(resp_hi.content) > 500

def test_homeopathy_system_intake_routing_and_cdss():
    # 1. Start Homeopathy Patient Session
    resp = client.post("/api/session/start", json={
        "fullName": "Ananya Mukherjee",
        "age": 38,
        "gender": "Female",
        "medicalSystem": "homeopathy",
        "homeopathyMode": True
    })
    assert resp.status_code == 200
    sess = resp.json()
    s_id = sess["sessionId"]
    assert sess["medicalSystem"] == "homeopathy"
    assert sess["homeopathyMode"] is True

    # Turn 0: Chief Complaint
    ans0 = client.post(f"/api/session/{s_id}/answer", json={
        "answer": "Chronic recurring gastric acidity, burning in stomach, and morning nausea",
        "field": "chief_complaint",
        "medicalSystem": "homeopathy"
    })
    assert ans0.status_code == 200
    q1 = ans0.json()["adaptive"]
    assert q1["field"] == "vitals_baseline_common"

    # Turn 1: Vitals
    ans1 = client.post(f"/api/session/{s_id}/answer", json={
        "answer": "Height: 162 cm, Weight: 58 kg, BP: 118/76 mmHg",
        "field": q1["field"],
        "questionText": q1["question"],
        "medicalSystem": "homeopathy"
    })
    q2 = ans1.json()["adaptive"]
    assert q2["field"] == "thermal_state"

    # Turn 2: Thermal State answered (Chilly)
    ans2 = client.post(f"/api/session/{s_id}/answer", json={
        "answer": "Chilly patient (Dislike cold air/drafts, need warm blankets)",
        "field": q2["field"],
        "questionText": q2["question"],
        "medicalSystem": "homeopathy"
    })
    q3 = ans2.json()["adaptive"]
    assert q3["field"] == "thirst_appetite"

    # Turn 3: Thirst answered
    ans3 = client.post(f"/api/session/{s_id}/answer", json={
        "answer": "Thirsty for small sips frequently (Arsenicum)",
        "field": q3["field"],
        "questionText": q3["question"],
        "medicalSystem": "homeopathy"
    })
    q4 = ans3.json()["adaptive"]
    assert q4["field"] == "homeopathic_modalities"

    # Verify Department Routing to AYUSH Homeopathy OPD
    sess_data = ans3.json()["session"]
    assert sess_data["departmentRouting"]["department"] == "AYUSH Homeopathy"
    assert sess_data["departmentRouting"]["departmentCode"] == "HOMEO"
    assert "Dr. S. K. Roy" in sess_data["departmentRouting"]["doctorName"]

    # Verify Homeopathic CDSS Recommendations & Potency
    cdss_resp = client.post(f"/api/physician/session/{s_id}/cdss")
    assert cdss_resp.status_code == 200
    cdss = cdss_resp.json()
    assert len(cdss["differentialDiagnoses"]) > 0
    assert len(cdss["suggestedTreatments"]) > 0
    assert any(d.get("potency") in ["30C", "200C", "1M"] for d in cdss["suggestedTreatments"])





