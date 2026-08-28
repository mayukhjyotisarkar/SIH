"""
Emergency Severity Index (ESI) & NEWS2 Acuity Scoring Engine for MediKiosk.
Computes objective clinical priority levels (ESI 1-5) and early warning scores (NEWS2)
based on physiological vitals, Red Flag triggers, and symptom acuity.
"""
from typing import Dict, Any, Optional, Union
from app.models import TriageAcuityScore, PatientSession, PatientVitals, RedFlag

class TriageService:
    """
    Computes ESI Levels (1-5) and NEWS2 scores for clinical queue prioritization.
    """

    @classmethod
    def calculate_news2(cls, vitals: Any) -> int:
        """
        Calculates the National Early Warning Score (NEWS2).
        Parameters evaluated: Respiration rate, SpO2, Systolic BP, Heart rate, Temperature.
        """
        if not vitals:
            return 0

        def _get_val(obj, key):
            if isinstance(obj, dict):
                return obj.get(key)
            return getattr(obj, key, None)

        score = 0

        # 1. Respiration Rate
        rr = _get_val(vitals, "respirationRate")
        if rr is not None:
            if rr <= 8 or rr >= 25:
                score += 3
            elif 21 <= rr <= 24:
                score += 2
            elif 9 <= rr <= 11:
                score += 1

        # 2. Oxygen Saturation (SpO2)
        spo2 = _get_val(vitals, "spO2")
        if spo2 is not None:
            if spo2 <= 91:
                score += 3
            elif 92 <= spo2 <= 93:
                score += 2
            elif 94 <= spo2 <= 95:
                score += 1

        # 3. Systolic Blood Pressure
        sbp = _get_val(vitals, "bpSystolic")
        if sbp is not None:
            if sbp <= 90 or sbp >= 220:
                score += 3
            elif 91 <= sbp <= 100:
                score += 2
            elif 101 <= sbp <= 110:
                score += 1

        # 4. Pulse / Heart Rate
        pr = _get_val(vitals, "pulseRate")
        if pr is not None:
            if pr <= 40 or pr >= 131:
                score += 3
            elif 111 <= pr <= 130:
                score += 2
            elif 41 <= pr <= 50 or 91 <= pr <= 110:
                score += 1

        # 5. Temperature (Celsius)
        temp = _get_val(vitals, "temperatureC")
        if temp is not None:
            if temp <= 35.0:
                score += 3
            elif temp >= 39.1:
                score += 2
            elif (35.1 <= temp <= 36.0) or (38.1 <= temp <= 39.0):
                score += 1

        return score

    @classmethod
    def evaluate_triage_acuity(cls, session: Union[PatientSession, Dict[str, Any]]) -> TriageAcuityScore:
        """
        Evaluates ESI Triage Level (1-5) and NEWS2 Acuity Score for a patient session.
        """
        def _get_val(obj, key, default=None):
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)

        vitals = _get_val(session, "vitals")
        red_flag_obj = _get_val(session, "redFlag") or {}
        
        red_flag_triggered = _get_val(red_flag_obj, "triggered", False)
        red_flag_urgency = _get_val(red_flag_obj, "urgency", "routine")
        red_flag_reason = _get_val(red_flag_obj, "reason", "")
        red_flag_category = _get_val(red_flag_obj, "category", "")

        cc = str(_get_val(session, "chiefComplaint", "")).lower()
        
        pain_obj = _get_val(session, "painAssessment")
        pain_vas = _get_val(pain_obj, "painSeverityVAS", 0) if pain_obj else 0

        prior_inv = _get_val(session, "priorInvestigations") or []
        conv_turns = _get_val(session, "conversationTurns") or []

        news2 = cls.calculate_news2(vitals)

        # NEWS2 Risk Tier
        if news2 >= 7:
            news2_risk = "Critical"
        elif news2 >= 5:
            news2_risk = "High"
        elif news2 >= 1:
            news2_risk = "Medium"
        else:
            news2_risk = "Low"

        # ESI 1 - Resuscitation / Immediate Life-Threatening
        sp_o2_val = _get_val(vitals, "spO2") if vitals else None
        if red_flag_triggered and red_flag_urgency == "emergency" and (
            "arrest" in red_flag_reason.lower() or 
            "unresponsive" in red_flag_reason.lower() or 
            "anaphylaxis" in red_flag_category.lower() or
            (sp_o2_val is not None and sp_o2_val < 85)
        ):
            return TriageAcuityScore(
                esiLevel=1,
                esiCategory="Resuscitation",
                news2Score=news2,
                news2Risk=news2_risk,
                clinicalPriority="Immediate",
                rationale="Critical airway/hemodynamic emergency requiring immediate resuscitation.",
                suggestedTargetTimeMinutes=0
            )

        # ESI 2 - Emergent / High Risk
        if (red_flag_triggered and red_flag_urgency in ["emergency", "urgent"]) or \
           news2 >= 5 or pain_vas >= 8 or \
           "chest pain" in cc or "stroke" in cc or "crushing" in cc or "shortness of breath" in cc:
            return TriageAcuityScore(
                esiLevel=2,
                esiCategory="Emergent",
                news2Score=news2,
                news2Risk=news2_risk,
                clinicalPriority="High Priority",
                rationale="High risk condition with acute physiological derangement or severe pain.",
                suggestedTargetTimeMinutes=10
            )

        # ESI 3 - Urgent (Complex / Multiple resources needed)
        has_abnormal_vitals = False
        if vitals:
            sbp = _get_val(vitals, "bpSystolic")
            pr = _get_val(vitals, "pulseRate")
            spo2 = _get_val(vitals, "spO2")
            if (sbp and (sbp >= 140 or sbp < 100)) or \
               (pr and (pr > 100 or pr < 60)) or \
               (spo2 and spo2 < 95):
                has_abnormal_vitals = True

        has_multiple_meds = len(prior_inv) > 0 or pain_vas >= 5

        if has_abnormal_vitals or has_multiple_meds or news2 >= 2:
            return TriageAcuityScore(
                esiLevel=3,
                esiCategory="Urgent",
                news2Score=news2,
                news2Risk=news2_risk,
                clinicalPriority="Routine",
                rationale="Stable vitals with moderate symptom burden requiring clinical labs / prescription review.",
                suggestedTargetTimeMinutes=30
            )

        # ESI 4 - Less Urgent (Single focused problem, normal vitals)
        if len(conv_turns) > 0 and pain_vas > 0:
            return TriageAcuityScore(
                esiLevel=4,
                esiCategory="Less Urgent",
                news2Score=news2,
                news2Risk=news2_risk,
                clinicalPriority="Fast Track",
                rationale="Single focused complaint with stable baseline vitals.",
                suggestedTargetTimeMinutes=60
            )

        # ESI 5 - Non-Urgent (Refill / General checkup)
        return TriageAcuityScore(
            esiLevel=5,
            esiCategory="Non-Urgent",
            news2Score=news2,
            news2Risk="Low",
            clinicalPriority="Fast Track",
            rationale="Routine check-in, preventive consultation, or medication renewal.",
            suggestedTargetTimeMinutes=120
        )

