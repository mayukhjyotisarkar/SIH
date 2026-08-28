import re
from typing import List, Dict, Any, Optional
from app.models import DepartmentRouting, QAPair

class DepartmentRoutingService:
    """
    Intelligent Hospital OPD Department and Specialist Doctor Routing Engine.
    Classifies patient chief complaints, clinical QA turns, demographic factors,
    and identifies ambiguous presentations that require dedicated human nurse triage.
    """

    DEPARTMENT_DIRECTORY: Dict[str, Dict[str, str]] = {
        "Ophthalmology": {
            "departmentCode": "OPHTH",
            "doctorName": "Dr. Radhika Nair",
            "doctorTitle": "Consultant Ophthalmologist and Cataract Specialist",
            "roomNumber": "Room 102",
            "floorLocation": "Ground Floor (East Wing - Eye Care Suite)",
            "defaultReason": "Comprehensive visual acuity testing, refraction and ocular examination."
        },
        "Cardiology": {
            "departmentCode": "CARDIO",
            "doctorName": "Dr. A. K. Banerjee",
            "doctorTitle": "Senior Interventional Cardiologist",
            "roomNumber": "Room 204",
            "floorLocation": "First Floor (West Wing - Heart Institute)",
            "defaultReason": "Cardiovascular evaluation, 12-lead ECG, and lipid profile review."
        },
        "Orthopedics": {
            "departmentCode": "ORTHO",
            "doctorName": "Dr. Vikram Mehta",
            "doctorTitle": "Consultant Orthopedic Surgeon and Joint Care Specialist",
            "roomNumber": "Room 108",
            "floorLocation": "Ground Floor (East Wing - Ortho OPD)",
            "defaultReason": "Musculoskeletal assessment, weight-bearing examination and joint mobility review."
        },
        "Gastroenterology": {
            "departmentCode": "GASTRO",
            "doctorName": "Dr. Sunita Rao",
            "doctorTitle": "Consultant Gastroenterologist and Hepatologist",
            "roomNumber": "Room 215",
            "floorLocation": "First Floor (East Wing - Digestive Health Unit)",
            "defaultReason": "Abdominal assessment, dyspepsia / acid-peptic review and liver function profile."
        },
        "Pulmonology": {
            "departmentCode": "PULMO",
            "doctorName": "Dr. Amit Roy",
            "doctorTitle": "Consultant Pulmonologist and Sleep Medicine Specialist",
            "roomNumber": "Room 302",
            "floorLocation": "Second Floor (North Wing - Respiratory Care)",
            "defaultReason": "Chest auscultation, peak expiratory flow and respiratory history evaluation."
        },
        "Neurology": {
            "departmentCode": "NEURO",
            "doctorName": "Dr. Debabrata Sen",
            "doctorTitle": "Senior Consultant Neurologist",
            "roomNumber": "Room 310",
            "floorLocation": "Second Floor (East Wing - Neurosciences)",
            "defaultReason": "Neurological screening, cranial nerve and cephalalgia evaluation."
        },
        "Endocrinology": {
            "departmentCode": "ENDO",
            "doctorName": "Dr. Meera Nambiar",
            "doctorTitle": "Senior Endocrinologist and Diabetologist",
            "roomNumber": "Room 220",
            "floorLocation": "First Floor (South Wing - Metabolic Care)",
            "defaultReason": "Glycemic control profile, HbA1c review and diabetic metabolic screen."
        },
        "Dermatology": {
            "departmentCode": "DERMA",
            "doctorName": "Dr. Shalini Verma",
            "doctorTitle": "Consultant Dermatologist and Dermatosurgeon",
            "roomNumber": "Room 114",
            "floorLocation": "Ground Floor (South Wing - Skin Clinic)",
            "defaultReason": "Dermatological lesion inspection and allergy evaluation."
        },
        "ENT": {
            "departmentCode": "ENT",
            "doctorName": "Dr. Rajesh Kulkarni",
            "doctorTitle": "Senior ENT and Head-Neck Surgeon",
            "roomNumber": "Room 116",
            "floorLocation": "Ground Floor (South Wing - ENT Suite)",
            "defaultReason": "Otolaryngological examination, otoscopy and throat evaluation."
        },
        "Pediatrics": {
            "departmentCode": "PEDIA",
            "doctorName": "Dr. Ananya Sengupta",
            "doctorTitle": "Senior Consultant Pediatrician",
            "roomNumber": "Room 105",
            "floorLocation": "Ground Floor (West Wing - Children OPD)",
            "defaultReason": "Pediatric vital assessment, developmental and pediatric clinical triage."
        },
        "AYUSH_Ayurveda": {
            "departmentCode": "AYUSH",
            "doctorName": "Vaidya Raghavan Sharma",
            "doctorTitle": "Ayurvedic Physician (BAMS, MD Ayu)",
            "roomNumber": "AYUSH-01",
            "floorLocation": "Ground Floor (AYUSH Holistic Care Annex)",
            "defaultReason": "Dashavidha Pariksha, Prakriti-Dosha analysis and holistic lifestyle prescription."
        },
        "AYUSH_Homeopathy": {
            "departmentCode": "HOMEO",
            "doctorName": "Dr. S. K. Roy",
            "doctorTitle": "Homeopathic Physician (BHMS, MD Hom)",
            "roomNumber": "HOMEO-01",
            "floorLocation": "Ground Floor (AYUSH & Homeopathy Annex)",
            "defaultReason": "Totality of symptoms, thermal/thirst constitution evaluation and Similimum repertorization."
        },
        "General_Medicine": {
            "departmentCode": "GEN_MED",
            "doctorName": "Dr. Subhash Chandra",
            "doctorTitle": "Senior Consultant Physician (Internal Medicine)",
            "roomNumber": "Room 101",
            "floorLocation": "Ground Floor (Main Central OPD Wing)",
            "defaultReason": "Complete general medical evaluation and vitals assessment."
        },
        "Emergency": {
            "departmentCode": "EMERG",
            "doctorName": "Casualty Medical Officer & Code Team",
            "doctorTitle": "Emergency Medicine and Acute Resuscitation Unit",
            "roomNumber": "ER Bay-1",
            "floorLocation": "Ground Floor (Emergency Trauma Center - Red Zone)",
            "defaultReason": "STAT Priority Emergency Triage: Immediate resuscitation, vitals stabilization and monitoring."
        }
    }

    # Specialty keyword matching rules
    RULES = [
        ("Ophthalmology", [
            r"\b(eye|eyes|vision|sight|blur|blurry|cataract|chashma|power|aankh|aankhon|aankhe|conjunctiv|spectacle|lens|retina|cornea|glaucoma|watery\s*eye|eye\s*strain|reading\s*difficulty)\b"
        ]),
        ("Cardiology", [
            r"\b(chest|heart|seene|chaati|chhati|palpitation|dhadkan|angina|cardio|bp|blood\s*pressure|hypertension|cholesterol|stent|coronary)\b"
        ]),
        ("Orthopedics", [
            r"\b(knee|knees|joint|joints|back|kamar|ghutna|ghutne|bone|bones|spine|spinal|fracture|sprain|ortho|arthritis|sandhivata|crepitus|stiffness|sciatica|neck\s*pain|shoulder\s*pain|ligament)\b"
        ]),
        ("Gastroenterology", [
            r"\b(stomach|abdom|pet|acidity|gas|jalan|vomit|vomiting|loose\s*motion|diarrhea|constipat|jaundice|piliya|liver|ulcer|digest|appetite|belching|reflux|gerd|bloating)\b"
        ]),
        ("Pulmonology", [
            r"\b(cough|breath|breathing|saans|wheez|wheezing|asthma|cold|sputum|balgam|phlegm|shwaas|bronchitis|lung|lungs|chest\s*congestion|choking)\b"
        ]),
        ("Neurology", [
            r"\b(headache|migraine|sir\s*dard|sar\s*dard|dizz|dizziness|chakkar|vertigo|weakness|stroke|paralysis|numb|numbness|sunn|seizure|mirgi|tremor|epilepsy|brain)\b"
        ]),
        ("Endocrinology", [
            r"\b(sugar|diabetes|diabetic|thirst|pyas|peshab|frequent\s*urination|polyuria|weight\s*loss|thyroid|hypothyroid|goitre|fatigue|hba1c|endocrine)\b"
        ]),
        ("Dermatology", [
            r"\b(skin|rash|rashes|itch|itching|khujli|pimple|pimples|acne|eczema|fungal|ringworm|daag|boil|boils|psoriasis|allergy|urticaria|derma|scabies)\b"
        ]),
        ("ENT", [
            r"\b(ear|ears|kaan|hearing|throat|sore\s*throat|gala|tonsil|tonsils|nose|naak|sinus|sinusitis|cold|rhinitis|hoarseness|voice|ear\s*pain|ear\s*discharge)\b"
        ])
    ]

    # Vague / non-specific complaints requiring dedicated nurse triage
    AMBIGUOUS_PATTERNS = [
        r"\b(not\s*feeling\s*well|overall\s*unwell|body\s*hurting\s*everywhere|sub\s*kuch\s*dard|kuch\s*samajh\s*nahi\s*aaraha|don'?t\s*know|just\s*checkup|general\s*checkup|unclear|multiple\s*problems|sar\s*se\s*paon\s*tak\s*dard|weak\s*all\s*over)\b",
        r"^(general|checkup|regular|normal|feeling\s*unwell|weakness|body\s*pain|tabiyat\s*kharab|kamzori|dard|pain|help|not\s*well|asustho)$",
        r"^(sirf\s*checkup|doctor\s*dikhao|kuch\s*theek\s*nahi\s*hai|shorir\s*kharap)$"
    ]

    @classmethod
    def determine_routing(
        cls,
        chief_complaint: str,
        conversation_turns: List[QAPair],
        red_flag_triggered: bool = False,
        ayush_mode: bool = False,
        homeopathy_mode: bool = False,
        medical_system: str = "allopathy",
        age: int = 30
    ) -> DepartmentRouting:
        """
        Determines the optimal specialist OPD department and doctor.
        Priority:
        1. Emergency / Red Flag -> Emergency Trauma Bay
        2. AYUSH Homeopathy -> Homeopathy OPD Block
        3. AYUSH Ayurveda -> Ayurvedic OPD Block
        4. Pediatrics -> Children OPD (if age < 12)
        5. Specific Specialty -> Cardiology / Ortho / Gastro / Pulmo / Neuro / Eye / ENT / Derma
        6. Vague / Multi-system -> General Medicine with Staff Triage Alert
        """
        # 1. Emergency Red Flag Triggered
        if red_flag_triggered:
            meta = cls.DEPARTMENT_DIRECTORY["Emergency"]
            return DepartmentRouting(
                department="Emergency Casualty",
                departmentCode=meta["departmentCode"],
                doctorName=meta["doctorName"],
                doctorTitle=meta["doctorTitle"],
                roomNumber=meta["roomNumber"],
                floorLocation=meta["floorLocation"],
                isAmbiguous=False,
                assignedBy="emergency-protocol",
                routingReason="Priority acute clinical red-flag detected. Immediate casualty resuscitation transfer.",
                confidence=1.0
            )

        # 2. AYUSH Homeopathy Mode Active
        if homeopathy_mode or medical_system == "homeopathy":
            meta = cls.DEPARTMENT_DIRECTORY["AYUSH_Homeopathy"]
            return DepartmentRouting(
                department="AYUSH Homeopathy",
                departmentCode=meta["departmentCode"],
                doctorName=meta["doctorName"],
                doctorTitle=meta["doctorTitle"],
                roomNumber=meta["roomNumber"],
                floorLocation=meta["floorLocation"],
                isAmbiguous=False,
                assignedBy="ai-triage",
                routingReason=meta["defaultReason"],
                confidence=0.98
            )

        # 3. AYUSH Ayurveda Mode Active
        if ayush_mode or medical_system == "ayurveda":
            meta = cls.DEPARTMENT_DIRECTORY["AYUSH_Ayurveda"]
            return DepartmentRouting(
                department="AYUSH Ayurveda",
                departmentCode=meta["departmentCode"],
                doctorName=meta["doctorName"],
                doctorTitle=meta["doctorTitle"],
                roomNumber=meta["roomNumber"],
                floorLocation=meta["floorLocation"],
                isAmbiguous=False,
                assignedBy="ai-triage",
                routingReason=meta["defaultReason"],
                confidence=0.98
            )

        # 3. Pediatric Demographics (< 12 years)
        if age > 0 and age < 12:
            meta = cls.DEPARTMENT_DIRECTORY["Pediatrics"]
            return DepartmentRouting(
                department="Pediatrics",
                departmentCode=meta["departmentCode"],
                doctorName=meta["doctorName"],
                doctorTitle=meta["doctorTitle"],
                roomNumber=meta["roomNumber"],
                floorLocation=meta["floorLocation"],
                isAmbiguous=False,
                assignedBy="ai-triage",
                routingReason=f"Pediatric patient ({age} years). Child specialist OPD consultation.",
                confidence=0.96
            )

        # Aggregate patient text
        full_text = (chief_complaint or "") + " " + " ".join(t.patientAnswer for t in conversation_turns)
        full_text_clean = full_text.strip().lower()

        # 4. Check for explicitly ambiguous / unclassifiable text
        is_explicitly_ambiguous = any(re.search(pat, full_text_clean) for pat in cls.AMBIGUOUS_PATTERNS)
        if is_explicitly_ambiguous or (len(full_text_clean) < 3 and not conversation_turns):
            gen_meta = cls.DEPARTMENT_DIRECTORY["General_Medicine"]
            return DepartmentRouting(
                department="General Medicine (Staff Triage Paged)",
                departmentCode=gen_meta["departmentCode"],
                doctorName=gen_meta["doctorName"],
                doctorTitle=gen_meta["doctorTitle"],
                roomNumber=gen_meta["roomNumber"],
                floorLocation=gen_meta["floorLocation"],
                isAmbiguous=True,
                assignedBy="ai-triage",
                routingReason="Non-specific or multi-system complaints detected. Triage staff nurse notified to assist patient with care.",
                confidence=0.45
            )

        # 5. Score Specialty Matches
        scores: Dict[str, int] = {}
        for dept_name, patterns in cls.RULES:
            match_count = 0
            for pat in patterns:
                matches = re.findall(pat, full_text_clean)
                match_count += len(matches)
            if match_count > 0:
                scores[dept_name] = match_count

        if not scores:
            # Fallback to General Medicine
            gen_meta = cls.DEPARTMENT_DIRECTORY["General_Medicine"]
            return DepartmentRouting(
                department="General Medicine",
                departmentCode=gen_meta["departmentCode"],
                doctorName=gen_meta["doctorName"],
                doctorTitle=gen_meta["doctorTitle"],
                roomNumber=gen_meta["roomNumber"],
                floorLocation=gen_meta["floorLocation"],
                isAmbiguous=False,
                assignedBy="ai-triage",
                routingReason=gen_meta["defaultReason"],
                confidence=0.85
            )

        # Sort departments by match score
        sorted_depts = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_dept, top_score = sorted_depts[0]

        # Check if there is an ambiguous tie between two unrelated specialties
        if len(sorted_depts) >= 2 and sorted_depts[0][1] == sorted_depts[1][1] and sorted_depts[0][1] == 1:
            gen_meta = cls.DEPARTMENT_DIRECTORY["General_Medicine"]
            return DepartmentRouting(
                department=f"{top_dept} / {sorted_depts[1][0]} (Multi-System)",
                departmentCode="MULTI",
                doctorName="Dr. Subhash Chandra / OPD Triage MO",
                doctorTitle="Internal Medicine & Cross-Consultation Triage",
                roomNumber="Room 101",
                floorLocation="Ground Floor (Main Central OPD Wing)",
                isAmbiguous=True,
                assignedBy="ai-triage",
                routingReason="Multi-system symptoms spanning multiple specialties. Triage staff nurse paged to guide patient.",
                confidence=0.55
            )

        # Retrieve top department metadata
        meta = cls.DEPARTMENT_DIRECTORY.get(top_dept, cls.DEPARTMENT_DIRECTORY["General_Medicine"])
        return DepartmentRouting(
            department=top_dept,
            departmentCode=meta["departmentCode"],
            doctorName=meta["doctorName"],
            doctorTitle=meta["doctorTitle"],
            roomNumber=meta["roomNumber"],
            floorLocation=meta["floorLocation"],
            isAmbiguous=False,
            assignedBy="ai-triage",
            routingReason=meta["defaultReason"],
            confidence=min(0.85 + (top_score * 0.05), 0.99)
        )

routing_service = DepartmentRoutingService()
