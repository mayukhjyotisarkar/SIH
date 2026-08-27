import { LanguageCode } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  kioskMode: string;
  physicianMode: string;
  staffMode: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  identifyTitle: string;
  selectLanguage: string;
  abhaOrManual: string;
  abhaIdLabel: string;
  abhaPlaceholder: string;
  fullNameLabel: string;
  ageLabel: string;
  genderLabel: string;
  consentTitle: string;
  consentDesc: string;
  consentVoice: string;
  consentDocs: string;
  consentShare: string;
  playAudio: string;
  startBtn: string;
  converseTitle: string;
  speakPrompt: string;
  tapPrompt: string;
  listening: string;
  tapToSpeak: string;
  stopSpeaking: string;
  typePlaceholder: string;
  sendBtn: string;
  backBtn: string;
  ayushActive: string;
  ayushStandard: string;
  redFlagBanner: string;
  scanTitle: string;
  scanRealUpload: string;
  scanSampleMode: string;
  confidenceLabel: string;
  needsReviewNote: string;
  abnormalBadge: string;
  summaryTitle: string;
  summarySubtitle: string;
  confirmSendBtn: string;
  fixBtn: string;
  successTitle: string;
  successSubtitle: string;
  tokenNumberLabel: string;
  abhaLinked: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appName: "MediKiosk",
    tagline: "AI-Powered Pre-Consultation History Platform",
    kioskMode: "Patient Kiosk",
    physicianMode: "Physician OPD Dashboard",
    staffMode: "Staff Operator Portal",
    step1: "1. Identify & Consent",
    step2: "2. Speak Symptoms",
    step3: "3. Scan Documents",
    step4: "4. Review & Confirm",
    identifyTitle: "Welcome to OPD Patient Intake",
    selectLanguage: "Choose your preferred language",
    abhaOrManual: "Enter ABHA Health ID or Register as New Patient",
    abhaIdLabel: "ABHA ID (Ayushman Bharat Health Account)",
    abhaPlaceholder: "e.g. 91-4521-8890-1204 (Optional)",
    fullNameLabel: "Patient Full Name",
    ageLabel: "Age (Years)",
    genderLabel: "Gender",
    consentTitle: "Informed Patient Consent (DPDP & ABDM Compliant)",
    consentDesc: "We capture your clinical history and documents to prepare a summary for your doctor, saving your consultation time.",
    consentVoice: "Record my voice for clinical history capture",
    consentDocs: "Digitize and extract information from my uploaded prescriptions/lab reports",
    consentShare: "Share this intake summary with the OPD Doctor and Hospital EHR",
    playAudio: "Listen to Audio Explanation",
    startBtn: "Begin Intake Consultation",
    converseTitle: "Tell us about your health concerns",
    speakPrompt: "Please speak naturally or tap one of the suggested answers below",
    tapPrompt: "Quick tap options:",
    listening: "Listening to your voice... Speak now",
    tapToSpeak: "Tap to Speak",
    stopSpeaking: "Done Speaking",
    typePlaceholder: "Or type your answer here...",
    sendBtn: "Send Answer",
    backBtn: "Change Previous Answer",
    ayushActive: "AYUSH Mode Active (Dashavidha Pariksha)",
    ayushStandard: "Switch to AYUSH Intake (Ayurveda/Homeopathy)",
    redFlagBanner: "Priority Clinical Attention: Emergency safety flag detected. Hospital staff notified.",
    scanTitle: "Attach Previous Prescriptions & Lab Reports",
    scanRealUpload: "Scan / Upload Real Document Image",
    scanSampleMode: "Try a Sample Document (Demo Mode)",
    confidenceLabel: "Extraction Confidence",
    needsReviewNote: "Extraction confidence is low. Please verify and edit any unclear text.",
    abnormalBadge: "Abnormal Lab Value Detected",
    summaryTitle: "Summary of Your Health Intake",
    summarySubtitle: "Please review the information captured for your doctor",
    confirmSendBtn: "This Looks Correct — Send to Doctor",
    fixBtn: "I Need to Change Something",
    successTitle: "Intake Complete! Sent to Doctor",
    successSubtitle: "Your clinical summary has been securely routed to the OPD Physician.",
    tokenNumberLabel: "Your OPD Token Number",
    abhaLinked: "Linked with ABHA & Hospital Information System (HIS)"
  },
  hi: {
    appName: "मेडीकियोस्क (MediKiosk)",
    tagline: "एआई क्लिनिकल हिस्ट्री व पर्चा प्रणाली",
    kioskMode: "रोगी कियोस्क (Patient Kiosk)",
    physicianMode: "डॉक्टर ओपीडी डैशबोर्ड",
    staffMode: "स्टाफ ऑपरेटर पोर्टल",
    step1: "1. पहचान और सहमति",
    step2: "2. लक्षण बताएं",
    step3: "3. पर्चा / रिपोर्ट स्कैन",
    step4: "4. जांचें और पुष्टि करें",
    identifyTitle: "ओपीडी स्वास्थ्य पंजीयन में आपका स्वागत है",
    selectLanguage: "अपनी पसंदीदा भाषा चुनें",
    abhaOrManual: "आभा आईडी (ABHA ID) दर्ज करें या नया पंजीयन करें",
    abhaIdLabel: "आभा आईडी (ABHA Health ID)",
    abhaPlaceholder: "उदा. 91-4521-8890-1204 (वैकल्पिक)",
    fullNameLabel: "रोगी का पूरा नाम",
    ageLabel: "आयु (वर्ष)",
    genderLabel: "लिंग",
    consentTitle: "मरीज की सहमति (Consent)",
    consentDesc: "हम आपकी स्वास्थ्य जानकारी और पर्चे एकत्र कर रहे हैं ताकि डॉक्टर के पास आपका समय बचे।",
    consentVoice: "आवाज रिकॉर्ड करने की अनुमति दें",
    consentDocs: "पर्चे/लैब रिपोर्ट से जानकारी पढ़ने की अनुमति दें",
    consentShare: "यह सारांश डॉक्टर और अस्पताल रिकॉर्ड के साथ साझा करें",
    playAudio: "ऑडियो में सुनें",
    startBtn: "पंजीयन शुरू करें",
    converseTitle: "अपनी बीमारी या तकलीफ के बारे में बताएं",
    speakPrompt: "कृपया बोलकर बताएं या नीचे दिए गए विकल्पों पर टैप करें",
    tapPrompt: "सुझाए गए विकल्प:",
    listening: "आपकी आवाज सुन रहे हैं... कृपया बोलें",
    tapToSpeak: "बोलने के लिए माइक दबाएं",
    stopSpeaking: "बोलना समाप्त",
    typePlaceholder: "या यहां लिखकर उत्तर दें...",
    sendBtn: "जवाब भेजें",
    backBtn: "पिछला उत्तर बदलें",
    ayushActive: "आयुष (AYUSH) मोड चालू है (दशविध परीक्षा)",
    ayushStandard: "आयुष पद्धति में बदलें",
    redFlagBanner: "आपातकालीन चेतावनी: गंभीर लक्षण पाए गए। अस्पताल स्टाफ को सूचित किया गया।",
    scanTitle: "पुराने पर्चे या जांच रिपोर्ट जोड़ें",
    scanRealUpload: "पर्चे की फोटो अपलोड / स्कैन करें",
    scanSampleMode: "नमूना पर्चा लोड करें (डेमो मोड)",
    confidenceLabel: "पहचान सटीकता (Confidence)",
    needsReviewNote: "लिखावट अस्पष्ट है। कृपया विवरण की पुष्टि करें।",
    abnormalBadge: "असामान्य लैब रिपोर्ट (Alert)",
    summaryTitle: "आपके द्वारा दी गई जानकारी का सारांश",
    summarySubtitle: "कृपया जांच लें कि क्या सब कुछ सही है",
    confirmSendBtn: "सब सही है — डॉक्टर को भेजें",
    fixBtn: "कुछ बदलना है",
    successTitle: "सफलतापूर्वक दर्ज किया गया!",
    successSubtitle: "आपकी जानकारी डॉक्टर के कंप्यूटर पर भेज दी गई है।",
    tokenNumberLabel: "आपका ओपीडी टोकन नंबर",
    abhaLinked: "आभा (ABHA) व अस्पताल प्रणाली से जुड़ा हुआ"
  },
  bn: {
    appName: "মেডিকিয়স্ক (MediKiosk)",
    tagline: "এআই চালিত রোগী ক্লিনিকাল হিস্ট্রি প্ল্যাটফর্ম",
    kioskMode: "রোগী কিয়স্ক (Patient Kiosk)",
    physicianMode: "ডাক্তার ড্যাশবোর্ড",
    staffMode: "স্টাফ অপারেটর পোর্টাল",
    step1: "১. পরিচয় ও সম্মতি",
    step2: "২. লক্ষণ বলুন",
    step3: "৩. প্রেসক্রিপশন স্ক্যান",
    step4: "৪. পর্যালোচনা ও নিশ্চিতকরণ",
    identifyTitle: "ওপিডি রোগী ইনটাকে স্বাগতম",
    selectLanguage: "পছন্দের ভাষা বেছে নিন",
    abhaOrManual: "আভা আইডি লিখুন বা নতুন রোগী হিসেবে যোগ দিন",
    abhaIdLabel: "আভা আইডি (ABHA Health ID)",
    abhaPlaceholder: "যেমন: 91-4521-8890-1204 (ঐচ্ছিক)",
    fullNameLabel: "রোগীর সম্পূর্ণ নাম",
    ageLabel: "বয়স (বছর)",
    genderLabel: "লিঙ্গ",
    consentTitle: "রোগীর সম্মতি (Consent)",
    consentDesc: "আমরা আপনার উপসর্গ এবং পূর্ববর্তী প্রেসক্রিপশন স্ক্যান করে ডাক্তারের জন্য সারসংক্ষেপ তৈরি করি।",
    consentVoice: "ভয়েস রেকর্ড করার অনুমতি দিন",
    consentDocs: "প্রেসক্রিপশন/রিপোর্ট তথ্য সংগ্রহের অনুমতি দিন",
    consentShare: "এই তথ্য ডাক্তারের সাথে শেয়ার করুন",
    playAudio: "অডিও শুনুন",
    startBtn: "শুরু করুন",
    converseTitle: "আপনার শারীরিক সমস্যা সম্পর্কে বলুন",
    speakPrompt: "মুখে কথা বলুন অথবা নিচের বিকল্পগুলোতে ট্যাপ করুন",
    tapPrompt: "পরামর্শিত উত্তর:",
    listening: "শুনছি... এখন বলুন",
    tapToSpeak: "কথা বলতে ট্যাপ করুন",
    stopSpeaking: "কথা বলা শেষ",
    typePlaceholder: "অথবা টাইপ করে উত্তর দিন...",
    sendBtn: "উত্তর পাঠান",
    backBtn: "আগের উত্তর সংশোধন করুন",
    ayushActive: "আয়ুষ (AYUSH) মোড সক্রিয়",
    ayushStandard: "আয়ুষ মোডে যান",
    redFlagBanner: "জরুরী সতর্কতা: গুরুতর উপসর্গ সনাক্ত হয়েছে। ডাক্তার ও স্টাফকে সতর্ক করা হয়েছে।",
    scanTitle: "পূর্বের প্রেসক্রিপশন ও রিপোর্ট স্ক্যান করুন",
    scanRealUpload: "আসল প্রেসক্রিপশন ফটো আপলোড করুন",
    scanSampleMode: "নমুনা রিপোর্ট দেখুন (ডেমো মোড)",
    confidenceLabel: "স্ক্যান নির্ভরযোগ্যতা",
    needsReviewNote: "হাতের লেখা কিছুটা অস্পষ্ট। দয়া করে তথ্যটি পরীক্ষা করুন।",
    abnormalBadge: "অস্বাভাবিক টেস্ট রিপোর্ট",
    summaryTitle: "আপনার ক্লিনিকাল সারসংক্ষেপ",
    summarySubtitle: "ডাক্তারের কাছে পাঠানোর আগে তথ্যটি যাচাই করে নিন",
    confirmSendBtn: "সব সঠিক — ডাক্তারের কাছে পাঠান",
    fixBtn: "সংশোধন প্রয়োজন",
    successTitle: "সফলভাবে পাঠানো হয়েছে!",
    successSubtitle: "আপনার রিপোর্ট ও লক্ষণ ডাক্তারের ড্যাশবোর্ডে পাঠানো হয়েছে।",
    tokenNumberLabel: "আপনার টোকেন নম্বর",
    abhaLinked: "আভা ও হাসপাতাল ইএইচআর-এর সাথে সংযুক্ত"
  },
  ta: {
    appName: "MediKiosk",
    tagline: "AI மருத்துவ வரலாற்று தளம்",
    kioskMode: "நோயாளி கியோஸ்க்",
    physicianMode: "மருத்துவர் டாஷ்போர்டு",
    staffMode: "பணியாளர் தளம்",
    step1: "1. அடையாளம் & ஒப்புதல்",
    step2: "2. அறிகுறிகள் கூறுதல்",
    step3: "3. ஆவண ஸ்கேன்",
    step4: "4. சரிபார்த்தல்",
    identifyTitle: "OPD நோயாளி பதிவுக்கு வருக",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    abhaOrManual: "ABHA ID உள்ளிடவும் அல்லது புதிய பதிவு",
    abhaIdLabel: "ABHA ID",
    abhaPlaceholder: "எ.கா: 91-4521-8890-1204",
    fullNameLabel: "முழுப் பெயர்",
    ageLabel: "வயது",
    genderLabel: "பாலினம்",
    consentTitle: "நோயாளி ஒப்புதல்",
    consentDesc: "மருத்துவ ஆலோசனைக்கு உதவ உங்கள் தகவல்களை சேகரிக்கிறோம்.",
    consentVoice: "குரல் பதிவு செய்ய அனுமதி",
    consentDocs: "மருந்து சீட்டு ஸ்கேன் அனுமதி",
    consentShare: "மருத்துவருடன் பகிர அனுமதி",
    playAudio: "ஆடியோ விளக்கம் கேட்க",
    startBtn: "தொடங்கவும்",
    converseTitle: "உங்கள் உடல்நலப் பிரச்சனையை விவரிக்கவும்",
    speakPrompt: "பேசுங்கள் அல்லது விருப்பங்களைத் தட்டவும்",
    tapPrompt: "பரிந்துரைக்கப்பட்ட பதில்கள்:",
    listening: "கேட்கிறது... பேசவும்",
    tapToSpeak: "பேச தட்டவும்",
    stopSpeaking: "முடிக்க",
    typePlaceholder: "அல்லது தட்டச்சு செய்யவும்...",
    sendBtn: "அனுப்புக",
    backBtn: "முந்தையதை மாற்றவும்",
    ayushActive: "ஆயுஷ் முறை இயக்கத்தில் உள்ளது",
    ayushStandard: "ஆயுஷ் முறைக்கு மாறவும்",
    redFlagBanner: "அவசர எச்சரிக்கை: தீவிர அறிகுறிகள் கண்டறியப்பட்டன.",
    scanTitle: "மருந்துச் சீட்டு / ஆய்வக அறிக்கையை இணைக்கவும்",
    scanRealUpload: "புகைப்படம் பதிவேற்றவும்",
    scanSampleMode: "மாதிரி ஆவணத்தை முயற்சிக்கவும்",
    confidenceLabel: "துல்லியம்",
    needsReviewNote: "கையெழுத்து சரியாக புரியவில்லை. சரிபார்க்கவும்.",
    abnormalBadge: "அசாதாரண ஆய்வக முடிவு",
    summaryTitle: "மருத்துவ விவர சுருக்கம்",
    summarySubtitle: "உங்கள் தகவல்களை சரிபார்க்கவும்",
    confirmSendBtn: "சரியானது — மருத்துவருக்கு அனுப்பு",
    fixBtn: "மாற்ற வேண்டும்",
    successTitle: "வெற்றிகரமாக அனுப்பப்பட்டது!",
    successSubtitle: "உங்கள் மருத்துவ விவரங்கள் மருத்துவருக்கு அனுப்பப்பட்டுள்ளன.",
    tokenNumberLabel: "டோக்கன் எண்",
    abhaLinked: "ABHA மற்றும் மருத்துவமனை அமைப்புடன் இணைக்கப்பட்டது"
  },
  te: {
    appName: "MediKiosk",
    tagline: "AI క్లినికల్ హిస్టరీ ప్లాట్‌ఫారమ్",
    kioskMode: "రోగి కియోస్క్",
    physicianMode: "వైద్యుల డాష్‌బోర్డ్",
    staffMode: "సిబ్బంది పోర్టల్",
    step1: "1. గుర్తింపు & సమ్మతి",
    step2: "2. లక్షణాలు వివరించండి",
    step3: "3. ప్రిస్క్రిప్షన్ స్కాన్",
    step4: "4. సమీక్ష & నిర్ధారణ",
    identifyTitle: "OPD రోగి ఇన్‌టేక్‌కు స్వాగతం",
    selectLanguage: "మీ ప్రాధాన్య భాషను ఎంచుకోండి",
    abhaOrManual: "ABHA ID నమోదు చేయండి లేదా కొత్త రోగిగా నమోదు అవ్వండి",
    abhaIdLabel: "ABHA ID",
    abhaPlaceholder: "ఉదా: 91-4521-8890-1204",
    fullNameLabel: "పూర్తి పేరు",
    ageLabel: "వయస్సు",
    genderLabel: "లింగం",
    consentTitle: "రోగి సమ్మతి",
    consentDesc: "డాక్టర్ సంప్రదింపుల సమయాన్ని ఆదా చేయడానికి మీ ఆరోగ్య వివరాలను సేకరిస్తున్నాము.",
    consentVoice: "వాయిస్ రికార్డింగ్ అనుమతి",
    consentDocs: "ప్రిస్క్రిప్షన్ స్కాన్ అనుమతి",
    consentShare: "డాక్టర్‌తో పంచుకునే అనుమతి",
    playAudio: "ఆడియో వివరణ వినండి",
    startBtn: "ప్రారంభించండి",
    converseTitle: "మీ ఆరోగ్య సమస్యల గురించి చెప్పండి",
    speakPrompt: "మాట్లాడండి లేదా ఎంపికలపై నొక్కండి",
    tapPrompt: "సూచించిన సమాధానాలు:",
    listening: "వింటోంది... మాట్లాడండి",
    tapToSpeak: "మాట్లాడటానికి నొక్కండి",
    stopSpeaking: "పూర్తయింది",
    typePlaceholder: "లేదా టైప్ చేయండి...",
    sendBtn: "పంపండి",
    backBtn: "మునుపటి సమాధానం మార్చండి",
    ayushActive: "ఆయుష్ (AYUSH) మోడ్ సక్రియంగా ఉంది",
    ayushStandard: "ఆయుష్ మోడ్‌కు మారండి",
    redFlagBanner: "అత్యవసర హెచ్చరిక: తీవ్రమైన లక్షణాలు గుర్తించబడ్డాయి.",
    scanTitle: "మునుపటి ప్రిస్క్రిప్షన్లు & రిపోర్టులను జోడించండి",
    scanRealUpload: "ఫోటో అప్‌లోడ్ చేయండి",
    scanSampleMode: "నమూనా పత్రాన్ని ప్రయత్నించండి",
    confidenceLabel: "ఖచ్చితత్వం",
    needsReviewNote: "చేతివ్రాత అస్పష్టంగా ఉంది. దయచేసి ధృవీకరించండి.",
    abnormalBadge: "అసాధారణ ల్యాబ్ ఫలితం",
    summaryTitle: "మీ ఆరోగ్య సారాంశం",
    summarySubtitle: "దయచేసి మీ సమాచారాన్ని సరిచూసుకోండి",
    confirmSendBtn: "సరిగ్గా ఉంది — డాక్టర్‌కు పంపండి",
    fixBtn: "మార్చాలి",
    successTitle: "విజయవంతంగా పంపబడింది!",
    successSubtitle: "మీ వివరాలు డాక్టర్ డాష్‌బోర్డ్‌కు చేరాయి.",
    tokenNumberLabel: "మీ టోకెన్ నంబర్",
    abhaLinked: "ABHA & ఆసుపత్రి వ్యవస్థతో లింక్ చేయబడింది"
  }
};

