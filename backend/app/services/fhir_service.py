"""
HL7 FHIR R4 Exporter Service for MediKiosk.
Transforms a complete patient intake session into standard HL7 FHIR R4 Bundle JSON
including Patient, Condition, Observation, MedicationStatement, and AllergyIntolerance resources.
"""
from typing import Dict, Any, List
from datetime import datetime
import uuid
from app.models import PatientSession, FHIRBundleResponse

class FHIRService:
    """
    Serializes PatientSession to standard HL7 FHIR R4 JSON Bundle.
    """

    @classmethod
    def generate_fhir_bundle(cls, session: Any) -> Dict[str, Any]:
        """
        Creates a FHIR R4 Document/Collection Bundle.
        """
        def _get_val(obj, key, default=None):
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)

        session_id = _get_val(session, "sessionId", "unknown")
        patient_id = _get_val(session, "patientId", "unknown")
        patient_name = _get_val(session, "patientName", "Unknown Patient")
        gender = str(_get_val(session, "gender", "unknown")).lower()
        language = _get_val(session, "language", "en")
        chief_complaint = _get_val(session, "chiefComplaint", "")
        vitals = _get_val(session, "vitals")
        prior_docs = _get_val(session, "priorInvestigations") or []
        allergy_obj = _get_val(session, "drugAllergyHistory") or {}

        bundle_id = f"bundle-{session_id}"
        now_iso = datetime.now().isoformat() + "Z"
        entries: List[Dict[str, Any]] = []

        # 1. Patient Resource
        patient_res_id = f"pat-{patient_id}"
        patient_resource = {
            "fullUrl": f"urn:uuid:{patient_res_id}",
            "resource": {
                "resourceType": "Patient",
                "id": patient_res_id,
                "identifier": [
                    {
                        "system": "https://abdm.gov.in/abha",
                        "value": patient_id,
                        "type": {"text": "ABHA / Hospital Registration ID"}
                    }
                ],
                "active": True,
                "name": [
                    {
                        "use": "official",
                        "text": patient_name
                    }
                ],
                "gender": gender,
                "telecom": [
                    {
                        "system": "phone",
                        "value": "Patient Contact Not Disclosed"
                    }
                ],
                "communication": [
                    {
                        "language": {
                            "coding": [
                                {
                                    "system": "urn:ietf:bcp:47",
                                    "code": language,
                                    "display": language.upper()
                                }
                            ]
                        },
                        "preferred": True
                    }
                ]
            }
        }
        entries.append(patient_resource)

        # 2. Condition Resource (Chief Complaint & Diagnoses)
        if chief_complaint:
            condition_res_id = f"cond-{uuid.uuid4().hex[:8]}"
            condition_resource = {
                "fullUrl": f"urn:uuid:{condition_res_id}",
                "resource": {
                    "resourceType": "Condition",
                    "id": condition_res_id,
                    "clinicalStatus": {
                        "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]
                    },
                    "verificationStatus": {
                        "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "provisional"}]
                    },
                    "category": [
                        {
                            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "encounter-diagnosis"}]
                        }
                    ],
                    "code": {
                        "text": chief_complaint
                    },
                    "subject": {
                        "reference": f"Patient/{patient_res_id}",
                        "display": patient_name
                    },
                    "recordedDate": now_iso
                }
            }
            entries.append(condition_resource)

        # 3. Observation Resources (Vitals: BP, Pulse, SpO2, Temp, Glucose)
        if vitals:
            bp_sys = _get_val(vitals, "bpSystolic")
            bp_dia = _get_val(vitals, "bpDiastolic")
            if bp_sys and bp_dia:
                obs_bp = {
                    "fullUrl": f"urn:uuid:obs-bp-{uuid.uuid4().hex[:6]}",
                    "resource": {
                        "resourceType": "Observation",
                        "status": "final",
                        "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
                        "code": {
                            "coding": [{"system": "http://loinc.org", "code": "85354-9", "display": "Blood pressure panel"}],
                            "text": "Blood Pressure"
                        },
                        "subject": {"reference": f"Patient/{patient_res_id}"},
                        "component": [
                            {
                                "code": {"coding": [{"system": "http://loinc.org", "code": "8480-6", "display": "Systolic blood pressure"}]},
                                "valueQuantity": {"value": bp_sys, "unit": "mmHg", "system": "http://unitsofmeasure.org", "code": "mm[Hg]"}
                            },
                            {
                                "code": {"coding": [{"system": "http://loinc.org", "code": "8462-4", "display": "Diastolic blood pressure"}]},
                                "valueQuantity": {"value": bp_dia, "unit": "mmHg", "system": "http://unitsofmeasure.org", "code": "mm[Hg]"}
                            }
                        ]
                    }
                }
                entries.append(obs_bp)

            pulse = _get_val(vitals, "pulseRate")
            if pulse:
                obs_pr = {
                    "fullUrl": f"urn:uuid:obs-pr-{uuid.uuid4().hex[:6]}",
                    "resource": {
                        "resourceType": "Observation",
                        "status": "final",
                        "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
                        "code": {
                            "coding": [{"system": "http://loinc.org", "code": "8867-4", "display": "Heart rate"}],
                            "text": "Pulse Rate"
                        },
                        "subject": {"reference": f"Patient/{patient_res_id}"},
                        "valueQuantity": {"value": pulse, "unit": "beats/minute", "system": "http://unitsofmeasure.org", "code": "/min"}
                    }
                }
                entries.append(obs_pr)

            spo2 = _get_val(vitals, "spO2")
            if spo2:
                obs_spo2 = {
                    "fullUrl": f"urn:uuid:obs-spo2-{uuid.uuid4().hex[:6]}",
                    "resource": {
                        "resourceType": "Observation",
                        "status": "final",
                        "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
                        "code": {
                            "coding": [{"system": "http://loinc.org", "code": "2708-6", "display": "Oxygen saturation in Arterial blood"}],
                            "text": "SpO2 Oxygen Saturation"
                        },
                        "subject": {"reference": f"Patient/{patient_res_id}"},
                        "valueQuantity": {"value": spo2, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"}
                    }
                }
                entries.append(obs_spo2)

        # 4. MedicationStatement Resources (Extracted Rx)
        for doc in prior_docs:
            extracted = _get_val(doc, "extracted")
            if extracted and isinstance(extracted, dict) and "medications" in extracted:
                for med in extracted["medications"]:
                    med_res_id = f"med-{uuid.uuid4().hex[:8]}"
                    m_name = med.get("name", "Unspecified Drug") if isinstance(med, dict) else getattr(med, "name", "Unspecified Drug")
                    m_dosage = med.get("dosage", "") if isinstance(med, dict) else getattr(med, "dosage", "")
                    m_freq = med.get("frequency", "") if isinstance(med, dict) else getattr(med, "frequency", "")
                    m_dur = med.get("duration", "") if isinstance(med, dict) else getattr(med, "duration", "")
                    m_inst = med.get("instructions", "") if isinstance(med, dict) else getattr(med, "instructions", "")

                    med_resource = {
                        "fullUrl": f"urn:uuid:{med_res_id}",
                        "resource": {
                            "resourceType": "MedicationStatement",
                            "id": med_res_id,
                            "status": "active",
                            "medicationCodeableConcept": {
                                "text": m_name
                            },
                            "subject": {"reference": f"Patient/{patient_res_id}"},
                            "dosage": [
                                {
                                    "text": f"{m_dosage} - {m_freq} ({m_dur})",
                                    "patientInstruction": m_inst
                                }
                            ]
                        }
                    }
                    entries.append(med_resource)

        # 5. AllergyIntolerance Resource
        has_allergy = _get_val(allergy_obj, "hasAllergy", False)
        allergy_details = str(_get_val(allergy_obj, "details", ""))
        if has_allergy and allergy_details:
            allergy_res_id = f"all-{uuid.uuid4().hex[:8]}"
            allergy_resource = {
                "fullUrl": f"urn:uuid:{allergy_res_id}",
                "resource": {
                    "resourceType": "AllergyIntolerance",
                    "id": allergy_res_id,
                    "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", "code": "active"}]},
                    "type": "allergy",
                    "category": ["medication"],
                    "criticality": "high",
                    "code": {"text": allergy_details},
                    "patient": {"reference": f"Patient/{patient_res_id}"}
                }
            }
            entries.append(allergy_resource)

        return {
            "resourceType": "Bundle",
            "id": bundle_id,
            "type": "document",
            "timestamp": now_iso,
            "total": len(entries),
            "entry": entries
        }
