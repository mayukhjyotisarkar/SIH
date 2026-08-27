import { AdaptiveQuestion, LanguageCode } from '../types';

export interface LocalizedQuestion {
  question: string;
  options: string[];
}

export const QUESTION_TRANSLATIONS: Record<string, Record<LanguageCode, LocalizedQuestion>> = {
  // 1. Initial Chief Complaint
  chief_complaint: {
    en: {
      question: "What is your main health problem or chief complaint today?",
      options: [
        "Severe chest pain / tightness",
        "High fever with chills and cough",
        "Severe stomach ache / acidity",
        "Joint pain & stiffness in knees",
        "Blurry vision / Eye checkup",
        "Skin rash & severe itching"
      ]
    },
    hi: {
      question: "आज आपकी मुख्य स्वास्थ्य समस्या या तकलीफ क्या है?",
      options: [
        "सीने में तेज दर्द / भारीपन",
        "तेज बुखार, ठंड लगना और खांसी",
        "पेट में तेज दर्द / गैस / एसिडिटी",
        "घुटनों व जोड़ों में दर्द और अकड़न",
        "आंखों में धुंधलापन / चश्मे की जांच",
        "त्वचा पर दाने और तेज खुजली"
      ]
    },
    bn: {
      question: "আজ আপনার প্রধান শারীরিক সমস্যা বা কষ্ট কী?",
      options: [
        "বুকে তীব্র ব্যথা / চাপ ধরা ভাব",
        "কাঁপনি দিয়ে তীব্র জ্বর ও কাশি",
        "পেটে তীব্র ব্যথা / গ্যাস / অম্বল",
        "হাঁটু ও গাঁটে ব্যথা এবং শক্ত ভাব",
        "চোখে ঝাপসা দেখা / পাওয়ার পরীক্ষা",
        "ত্বকে ফুসকুড়ি ও চুলকানি"
      ]
    },
    ta: {
      question: "இன்று உங்களுக்கு ஏற்பட்டுள்ள முக்கிய உடல்நலப் பிரச்சனை என்ன?",
      options: [
        "நெஞ்சில் கடுமையான வலி / பாரம்",
        "குளிருடன் கூடிய அதிக காய்ச்சல் & இருமல்",
        "கடுமையான வயிற்று வலி / நெஞ்செரிச்சல்",
        "முழங்கால் & மூட்டு வலி, இறுக்கம்",
        "மங்கலான பார்வை / கண் பரிசோதனை",
        "தோல் அரிப்பு & தடிப்புகள்"
      ]
    },
    te: {
      question: "ఈ రోజు మీ ప్రధాన ఆరోగ్య సమస్య లేదా ఇబ్బంది ఏమిటి?",
      options: [
        "ఛాతీలో తీవ్రమైన నొప్పి / బరువు",
        "చలితో కూడిన తీవ్ర జ్వరం & దగ్గు",
        "కడుపు నొప్పి / గ్యాస్ / ఎసిడిటీ",
        "మోకాళ్ల నొప్పులు & కీళ్ల బిగుతు",
        "కంటి చూపు మసకబారడం / పవర్ చెకప్",
        "చర్మంపై దద్దుర్లు & తీవ్ర దురద"
      ]
    }
  },

  // 2. Cardiovascular: Nature
  chest_pain_nature: {
    en: {
      question: "Can you describe the pain—is it crushing, sharp, burning, or tightness?",
      options: [
        "Heavy squeezing / pressure",
        "Sharp stabbing pain",
        "Burning acid sensation",
        "Dull constant ache"
      ]
    },
    hi: {
      question: "दर्द का प्रकार कैसा है—दबाव, सुई जैसा चुभने वाला, जलन या भारीपन?",
      options: [
        "भारी दबाव / जकड़न जैसा दर्द",
        "तेज चुभने वाला दर्द",
        "जलन व एसिड जैसा दर्द",
        "हल्का लगातार मीठा दर्द"
      ]
    },
    bn: {
      question: "ব্যথাটি কেমন ধরনের—ভারী চাপ, সুচ ফোটার মতো, জ্বালা ভাব নাকি টান?",
      options: [
        "ভারী চাপ ধরা / বুক চেপে ধরা ব্যথা",
        "তীব্র সুচ ফোটার মতো ব্যথা",
        "জ্বালা করা অম্বলের মতো ব্যথা",
        "হালকা একটানা ব্যথা"
      ]
    },
    ta: {
      question: "வலி எந்த வகையானது—அழுத்துவது போலா, குத்துவது போலா, எரிச்சல் போலா?",
      options: [
        "அதிக அழுத்தம் / நெஞ்சு பிடிப்பு",
        "கூர்மையான குத்தும் வலி",
        "எரிச்சல் போன்ற வலி",
        "தொடர்ச்சியான மிதமான வலி"
      ]
    },
    te: {
      question: "నొప్పి రకం ఎలాంటిది—బరువైన నొక్కడం, పొడవడం, మంట లేదా బిగుతుగా ఉండటమా?",
      options: [
        "భారీ బరువు / ఛాతీ పిండినట్లు ఉండటం",
        "తీవ్రంగా పొడిచినట్లు నొప్పి",
        "మంటతో కూడిన నొప్పి",
        "నిరంతరం ఉండే తేలికపాటి నొప్పి"
      ]
    }
  },

  // 3. Radiation Site
  radiation_site: {
    en: {
      question: "Does the chest discomfort spread to your left arm, shoulder, back, or jaw?",
      options: [
        "Spreads to left arm & shoulder",
        "Radiates to jaw & neck",
        "Spreads to upper back",
        "Stays localized in center of chest"
      ]
    },
    hi: {
      question: "क्या यह दर्द आपके बाएं हाथ, कंधे, पीठ या जबड़े की तरफ फैलता है?",
      options: [
        "बाएं हाथ और कंधे में फैलता है",
        "जबड़े और गर्दन की तरफ जाता है",
        "पीठ के ऊपरी हिस्से में फैलता है",
        "केवल सीने के बीच में रहता है"
      ]
    },
    bn: {
      question: "এই ব্যথা কি আপনার বাঁ হাত, কাঁধ, পিঠ বা চোয়ালের দিকে ছড়ায়?",
      options: [
        "বাঁ হাত ও কাঁধে ছড়ায়",
        "চোয়াল ও ঘাড়ের দিকে যায়",
        "পিঠের উপরিভাগে ছড়ায়",
        "শুধু বুকের মাঝখানেই থাকে"
      ]
    },
    ta: {
      question: "இந்த வலி உங்கள் இடது கை, தோள்பட்டை, முதுகு அல்லது தாடைக்கு பரவுகிறதா?",
      options: [
        "இடது கை மற்றும் தோள்பட்டைக்கு பரவுகிறது",
        "தாடை மற்றும் கழுத்துக்கு பரவுகிறது",
        "முதுகின் மேல் பகுதிக்கு பரவுகிறது",
        "நெஞ்சின் நடுவில் மட்டுமே உள்ளது"
      ]
    },
    te: {
      question: "ఈ నొప్పి మీ ఎడమ చేయి, భుజం, వీపు లేదా దవడ వైపు వ్యాపిస్తుందా?",
      options: [
        "ఎడమ చేయి మరియు భుజానికి వ్యాపిస్తుంది",
        "దవడ మరియు మెడ వైపు వెళుతుంది",
        "వీపు పైభాగానికి వ్యాపిస్తుంది",
        "కేవలం ఛాతీ మధ్యలోనే ఉంటుంది"
      ]
    }
  },

  // 4. Onset & Duration
  onset_duration: {
    en: {
      question: "When did this start and how long does an episode usually last?",
      options: [
        "Started today (< 6 hours ago)",
        "Lasting 2 to 3 days",
        "Occurs intermittently for 2+ weeks",
        "Chronic issue for over a month"
      ]
    },
    hi: {
      question: "यह तकलीफ कब शुरू हुई और दर्द का दौरा कितनी देर तक रहता है?",
      options: [
        "आज ही शुरू हुआ (6 घंटे से कम)",
        "पिछले 2 से 3 दिनों से",
        "2 हफ्तों से रुक-रुक कर हो रहा है",
        "एक महीने से अधिक पुराना है"
      ]
    },
    bn: {
      question: "এটি কখন শুরু হয়েছে এবং ব্যথার তীব্রতা কতক্ষণ স্থায়ী হয়?",
      options: [
        "আজই শুরু হয়েছে (৬ ঘণ্টার কম)",
        "গত ২-৩ দিন ধরে হচ্ছে",
        "২ সপ্তাহের বেশি সময় ধরে মাঝে মাঝে হয়",
        "১ মাসেরও বেশি সময় ধরে চলছে"
      ]
    },
    ta: {
      question: "இது எப்போது தொடங்கியது மற்றும் வலி எவ்வளவு நேரம் நீடிக்கிறது?",
      options: [
        "இன்றே தொடங்கியது (6 மணி நேரத்திற்குள்)",
        "கடந்த 2 முதல் 3 நாட்களாக",
        "2 வாரங்களுக்கும் மேலாக விட்டு விட்டு வருகிறது",
        "ஒரு மாதத்திற்கும் மேலாக உள்ளது"
      ]
    },
    te: {
      question: "ఇది ఎప్పుడు ప్రారంభమైంది మరియు నొప్పి ఎంత సమయం ఉంటుంది?",
      options: [
        "ఈ రోజే మొదలైంది (6 గంటల లోపు)",
        "గత 2 నుండి 3 రోజులుగా",
        "2 వారాలుగా అప్పుడప్పుడు వస్తోంది",
        "నెల కంటే ఎక్కువ రోజులుగా ఉంది"
      ]
    }
  },

  // 5. Triggers / Exertion
  triggers_exertion: {
    en: {
      question: "Does the pain get worse during physical exertion (walking/stairs) and improve with rest?",
      options: [
        "Worse with walking/stairs, better with rest",
        "No relation to physical activity",
        "Worse when lying down flat",
        "Worse after heavy meals"
      ]
    },
    hi: {
      question: "क्या चलने या सीढ़ियां चढ़ने पर दर्द बढ़ता है और आराम करने पर कम होता है?",
      options: [
        "चलने/सीढ़ियों पर बढ़ता है, आराम से घटता है",
        "शारीरिक मेहनत से कोई संबंध नहीं",
        "सीधे लेटने पर बढ़ जाता है",
        "भारी भोजन के बाद बढ़ता है"
      ]
    },
    bn: {
      question: "হাঁটাহাঁটি বা সিঁড়ি ভাঙলে কি ব্যথা বাড়ে এবং বিশ্রাম নিলে কমে?",
      options: [
        "হাঁটা/সিঁড়িতে বাড়ে, বিশ্রামে কমে",
        "শারীরিক পরিশ্রমের সাথে সম্পর্ক নেই",
        "সোজা শুয়ে থাকলে বাড়ে",
        "ভারী খাবার খাওয়ার পর বাড়ে"
      ]
    },
    ta: {
      question: "நடக்கும்போது அல்லது படிக்கட்டுகளில் ஏறும்போது வலி அதிகமாகி, ஓய்வெடுத்தால் குறைகிறதா?",
      options: [
        "நடக்கும்போது அதிகமாகிறது, ஓய்வில் குறைகிறது",
        "உடற்பயிற்சியுடன் தொடர்பில்லை",
        "படுத்திருக்கும் போது அதிகமாகிறது",
        "சாப்பிட்ட பிறகு அதிகமாகிறது"
      ]
    },
    te: {
      question: "నడిచినప్పుడు లేదా మెట్లు ఎక్కినప్పుడు నొప్పి ఎక్కువై, విశ్రాంతి తీసుకుంటే తగ్గుతుందా?",
      options: [
        "నడకతో ఎక్కువవుతుంది, విశ్రాంతితో తగ్గుతుంది",
        "శారీరక శ్రమతో సంబంధం లేదు",
        "పడుకున్నప్పుడు ఎక్కువవుతుంది",
        "భోజనం తర్వాత ఎక్కువవుతుంది"
      ]
    }
  },

  // 6. Autonomic / Associated Symptoms
  autonomic_associated: {
    en: {
      question: "Do you also experience shortness of breath, cold sweating, or nausea?",
      options: [
        "Shortness of breath & cold sweats",
        "Severe dizziness / Lightheadedness",
        "Nausea and vomiting sensation",
        "No sweating or breathing difficulty"
      ]
    },
    hi: {
      question: "क्या आपको सांस फूलना, ठंडा पसीना आना या घबराहट/जी मिचलाना भी महसूस होता है?",
      options: [
        "सांस फूलना और ठंडा पसीना आना",
        "चक्कर आना / बेहोशी जैसा लगना",
        "जी मिचलाना और उल्टी जैसा होना",
        "कोई पसीना या सांस फूलने की समस्या नहीं"
      ]
    },
    bn: {
      question: "আপনার কি শ্বাসকষ্ট, ঠান্ডা ঘাম দেওয়া বা বমি বমি ভাবও হচ্ছে?",
      options: [
        "শ্বাসকষ্ট ও ঠান্ডা ঘাম হচ্ছে",
        "তীব্র মাথা ঘোরা / অন্ধকার দেখা",
        "বমি বমি ভাব বা বমি",
        "ঘাম বা শ্বাসকষ্টের সমস্যা নেই"
      ]
    },
    ta: {
      question: "உங்களுக்கு மூச்சுத் திணறல், குளிர்ந்த வியர்வை அல்லது குமட்டல் ஏற்படுகிறதா?",
      options: [
        "மூச்சுத் திணறல் & குளிர்ந்த வியர்வை",
        "கடுமையான தலைச்சுற்றல்",
        "குமட்டல் மற்றும் வாந்தி உணர்வு",
        "வியர்வை அல்லது மூச்சுத் திணறல் இல்லை"
      ]
    },
    te: {
      question: "మీకు ఆయాసం రావడం, చల్లని చెమటలు పట్టడం లేదా వాంతి వచ్చినట్లు ఉండటం జరుగుతోందా?",
      options: [
        "ఆయాసం & చల్లని చెమటలు",
        "తీవ్రమైన తలతిరగడం",
        "వికారం మరియు వాంతులు",
        "చెమటలు లేదా శ్వాస సమస్యలు లేవు"
      ]
    }
  },

  // 7. GI: Relation to Meals
  gi_relation_meals: {
    en: {
      question: "Is the stomach pain related to eating—does it worsen immediately after food or on an empty stomach?",
      options: [
        "Worse 30-60 mins after meals",
        "Worse on empty stomach / relieved by food",
        "Constant burning regardless of meals",
        "Worse after spicy / oily foods"
      ]
    },
    hi: {
      question: "क्या पेट का दर्द खाने से जुड़ा है—खाना खाने के तुरंत बाद बढ़ता है या खाली पेट होने पर?",
      options: [
        "खाना खाने के 30-60 मिनट बाद बढ़ता है",
        "खाली पेट ज्यादा होता है, खाने से कम होता है",
        "लगातार जलन रहती है खाने से कोई फर्क नहीं",
        "मसालेदार / तैलीय खाने के बाद बढ़ता है"
      ]
    },
    bn: {
      question: "পেটের ব্যথা কি খাবারের সাথে সম্পর্কিত—খাবার পর বাড়ে নাকি খালি পেটে বেশি হয়?",
      options: [
        "খাওয়ার ৩০-৬০ মিনিট পরে বাড়ে",
        "খালি পেটে বাড়ে, খেলে কমে",
        "খাবারের সাথে সম্পর্কহীন একটানা জ্বালা",
        "ঝাল বা তেলজাতীয় খাবারের পর বাড়ে"
      ]
    },
    ta: {
      question: "வயிற்று வலி உணவுடன் தொடர்புடையதா—சாப்பிட்ட பிறகு வருகிறதா அல்லது வெறும் வயிற்றில் வருகிறதா?",
      options: [
        "சாப்பிட்ட 30-60 நிமிடங்களில் அதிகமாகிறது",
        "வெறும் வயிற்றில் அதிகமாகிறது, சாப்பிட்டால் குறைகிறது",
        "உணவைப் பொருட்படுத்தாமல் தொடர் எரிச்சல்",
        "காரமான உணவுக்குப் பின் அதிகமாகிறது"
      ]
    },
    te: {
      question: "కడుపు నొప్పి భోజనంతో సంబంధం కలిగి ఉందా—తిన్న వెంటనే ఎక్కువవుతుందా లేదా ఖాళీ కడుపుతోనా?",
      options: [
        "తిన్న 30-60 నిమిషాల తర్వాత ఎక్కువవుతుంది",
        "ఖాళీ కడుపుతో ఎక్కువ, తింటే తగ్గుతుంది",
        "భోజనంతో సంబంధం లేకుండా నిరంతర మంట",
        "కారంగా ఉండే ఆహారం తిన్న తర్వాత ఎక్కువ"
      ]
    }
  },

  // 8. GI: Red Flags Bleeding
  gi_red_flags_bleeding: {
    en: {
      question: "Have you noticed any blood in vomit, black tarry stools, or severe difficulty swallowing?",
      options: [
        "Black tarry stools noticed",
        "Vomiting with dark blood clots",
        "Difficulty swallowing solids",
        "No bleeding or black stools (Normal)"
      ]
    },
    hi: {
      question: "क्या उल्टी में खून, काला मल (टॉयलेट) या खाना निगलने में तेज रुकावट महसूस हुई है?",
      options: [
        "काला मल (टॉयलेट) आ रहा है",
        "उल्टी में खून या गांठे दिखी हैं",
        "खाना निगलने में कठिनाई हो रही है",
        "कोई खून या काला मल नहीं (सामान्य)"
      ]
    },
    bn: {
      question: "বমির সাথে রক্ত, কালো রঙের মল বা খাবার গিলতে কষ্ট হওয়ার মতো কিছু লক্ষ্য করেছেন?",
      options: [
        "কালো রঙের মল হচ্ছে",
        "বমির সাথে রক্তের দাগ দেখা গেছে",
        "খাবার গিলতে তীব্র কষ্ট",
        "রক্ত বা কালো মলের সমস্যা নেই (স্বাভাবিক)"
      ]
    },
    ta: {
      question: "வாந்தியில் ரத்தம், கருப்பு மலம் அல்லது விழுங்குவதில் கடுமையான சிரமத்தை கவனித்துள்ளீர்களா?",
      options: [
        "கருப்பு நிற மலம் வெளியேறுகிறது",
        "வாந்தியில் ரத்தம் வருகிறது",
        "உணவை விழுங்குவதில் சிரமம்",
        "ரத்தப்போக்கு அல்லது கருப்பு மலம் இல்லை"
      ]
    },
    te: {
      question: "వాంతిలో రక్తం, నల్లని మలం లేదా ఆహారం మింగడంలో తీవ్ర ఇబ్బందిని గమనించారా?",
      options: [
        "నల్లని రంగులో మలం రావడం",
        "వాంతిలో రక్తం రావడం",
        "ఆహారం మింగడం కష్టంగా ఉండటం",
        "రక్తం లేదా నల్లని మలం లేదు (సాధారణం)"
      ]
    }
  },

  // 9. Respiratory: Cough Duration
  cough_duration_type: {
    en: {
      question: "Is your cough dry or producing phlegm/sputum, and does it worsen at night?",
      options: [
        "Dry hacking cough without sputum",
        "Wet cough with thick yellow/green phlegm",
        "Cough with blood-streaked sputum",
        "Severe coughing bouts at night / early morning"
      ]
    },
    hi: {
      question: "आपकी खांसी सूखी है या बलगम वाली, और क्या रात में खांसी बढ़ जाती है?",
      options: [
        "बिना बलगम वाली सूखी खांसी",
        "गाढ़े पीले/हरे बलगम वाली खांसी",
        "बलगम में खून के रेशे आना",
        "रात व सुबह के समय तेज खांसी के दौरे"
      ]
    },
    bn: {
      question: "আপনার কাশি কি শুকনো নাকি কফ/শ্লেষ্মা উঠছে, এবং রাতে কি কাশি বাড়ে?",
      options: [
        "কফহীন শুকনো কাশি",
        "হলুদ বা সবুজ ঘন কফসহ কাশি",
        "কফের সাথে রক্তের দাগ",
        "রাতে ও ভোরবেলা কাশির তীব্রতা বৃদ্ধি"
      ]
    },
    ta: {
      question: "உங்கள் இருமல் வறண்டதா அல்லது சளியுடன் கூடியதா, மேலும் இரவில் அதிகமாகிறதா?",
      options: [
        "சளி இல்லாத வறட்டு இருமல்",
        "மஞ்சள்/பச்சை நிற சளியுடன் கூடிய இருமல்",
        "சளியில் ரத்தக் கறை",
        "இரவில் கடுமையான இருமல் தாக்குதல்"
      ]
    },
    te: {
      question: "మీ దగ్గు పొడి దగ్గా లేదా తెమడ వస్తోందా, మరియు రాత్రి వేళల్లో ఎక్కువవుతుందా?",
      options: [
        "తెమడ లేని పొడి దగ్గు",
        "పసుపు/ఆకుపచ్చ తెమడతో కూడిన దగ్గు",
        "తెమడలో రక్తం చారలు",
        "రాత్రి మరియు తెల్లవారుజామున తీవ్ర దగ్గు"
      ]
    }
  },

  // 10. Eye: Vision & Glasses
  eye_vision_symptoms: {
    en: {
      question: "Are you having difficulty seeing near objects (reading), distance blurriness, or eye strain?",
      options: [
        "Difficulty reading small print / near vision blur",
        "Distance vision is blurry (driving / TV)",
        "Both near and distance blurriness",
        "Frequent headaches and severe eye strain"
      ]
    },
    hi: {
      question: "क्या आपको पास का पढ़ने में परेशानी, दूर का धुंधला दिखना या आंखों में खिंचाव हो रहा है?",
      options: [
        "पास का पढ़ने/किताब देखने में परेशानी",
        "दूर की चीजें (गाड़ी/टीवी) धुंधली दिखना",
        "पास और दूर दोनों में धुंधलापन",
        "सिरदर्द और आंखों में लगातार खिंचाव/थकान"
      ]
    },
    bn: {
      question: "আপনার কি কাছের জিনিস পড়তে অসুবিধা, দূরের জিনিস ঝাপসা দেখা বা চোখে চাপ লাগছে?",
      options: [
        "বই বা মোবাইল পড়তে কাছের দৃষ্টি ঝাপসা",
        "দূরের দৃষ্টি ঝাপসা (গাড়ি চালানো / টিভি)",
        "কাছে ও দূরে উভয় ক্ষেত্রেই ঝাপসা দেখা",
        "ঘন ঘন মাথাব্যথা ও চোখের ক্লান্তি"
      ]
    },
    ta: {
      question: "உங்களுக்கு படிப்பதில் சிரமம், தூரப்பார்வை மங்கலாக இருப்பது அல்லது கண் சோர்வு உள்ளதா?",
      options: [
        "புத்தகம் படிக்க அருகில் மங்கலான பார்வை",
        "தூரப்பார்வை மங்கலாக உள்ளது (டிவி / வாகனம்)",
        "அருகிலும் தூரத்திலும் மங்கலாக தெரிதல்",
        "அடிக்கடி தலைவலி & கண் சோர்வு"
      ]
    },
    te: {
      question: "మీకు చదవడంలో ఇబ్బంది, దూరపు చూపు మసకబారడం లేదా కళ్ల అలసట కలుగుతోందా?",
      options: [
        "చదవడానికి దగ్గరి చూపు మసకబారడం",
        "దూరపు చూపు మసకగా ఉండటం (టీవీ / డ్రైవింగ్)",
        "దగ్గర మరియు దూరం రెండూ మసకగా ఉండటం",
        "తరచుగా తలనొప్పి & కళ్లలో తీవ్ర ఒత్తిడి"
      ]
    }
  },

  // 11. Dermatology: Skin Rash
  skin_rash_type: {
    en: {
      question: "Where is the skin rash located and is it accompanied by intense itching, burning, or redness?",
      options: [
        "Intense itching with red bumps / hives",
        "Dry, scaling patches on hands/legs",
        "Pus-filled boils / painful pimples",
        "Spreading redness with burning sensation"
      ]
    },
    hi: {
      question: "त्वचा पर दाने कहां हैं और क्या बहुत तेज खुजली, जलन या लालिमा हो रही है?",
      options: [
        "तेज खुजली के साथ लाल दाने/चकत्ते",
        "हाथ-पैरों पर सूखी, पपड़ीदार त्वचा",
        "मवाद वाले दाने / दर्दनाक फुंसियां",
        "जलन के साथ तेजी से फैलती लालिमा"
      ]
    },
    bn: {
      question: "ত্বকের ফুসকুড়ি কোথায় হয়েছে এবং সেখানে কি তীব্র চুলকানি, জ্বালা বা লালচে ভাব আছে?",
      options: [
        "তীব্র চুলকানি ও লাল চাকা চাকা দাগ",
        "হাত-পায়ে খসখসে চামড়া ওঠা",
        "পুঁজযুক্ত ফোড়া বা ব্যথাদায়ক ব্রণ",
        "জ্বালাপোড়ার সাথে লালচে ভাব ছড়ানো"
      ]
    },
    ta: {
      question: "தோல் தடிப்பு எங்குள்ளது மற்றும் கடுமையான அரிப்பு, எரிச்சல் அல்லது சிவத்தல் உள்ளதா?",
      options: [
        "கடுமையான அரிப்பு & சிவப்பு தடிப்புகள்",
        "கைகள்/கால்களில் வறண்ட தோல்",
        "சீழ் பிடித்த கட்டிகள் / முகப்பரு",
        "எரிச்சலுடன் பரவும் சிவப்பு நிறம்"
      ]
    },
    te: {
      question: "చర్మంపై దద్దుర్లు ఎక్కడ ఉన్నాయి మరియు తీవ్రమైన దురద, మంట లేదా ఎరుపుదనం ఉందా?",
      options: [
        "తీవ్ర దురదతో కూడిన ఎర్రటి దద్దుర్లు",
        "చేతులు/కాళ్ళపై పొడి చర్మం పొరలు రావడం",
        "చీముతో కూడిన గుల్లలు / నొప్పితో కూడిన మొటిమలు",
        "మంటతో వ్యాపిస్తున్న ఎరుపుదనం"
      ]
    }
  },

  // 12. Musculoskeletal: Joint pain
  joint_site_swelling: {
    en: {
      question: "Which joints are hurting and do you have visible swelling, warmth, or morning stiffness?",
      options: [
        "Bilateral knees with swelling & crepitus",
        "Lower back with stiffness on bending",
        "Small joints of hands/fingers with morning stiffness > 30 mins",
        "Single ankle/foot with acute severe swelling"
      ]
    },
    hi: {
      question: "किन जोड़ों में दर्द है और क्या सूजन, गर्माहट या सुबह उठने पर अकड़न रहती है?",
      options: [
        "दोनों घुटनों में दर्द, सूजन और कट-कट की आवाज",
        "कमर के निचले हिस्से में दर्द और झुकने में अकड़न",
        "हाथों व उंगलियों में सुबह 30 मिनट से ज्यादा अकड़न",
        "पैर के पंजे या टखने में अचानक तेज सूजन"
      ]
    },
    bn: {
      question: "কোন গাঁটগুলোতে ব্যথা এবং সেখানে কি ফোলা ভাব বা সকালে ঘুম থেকে ওঠার পর শক্ত ভাব থাকে?",
      options: [
        "দুটো হাঁটুতেই ব্যথা, ফোলা ও শব্দ হওয়া",
        "কোমরের নিচে ব্যথা ও নিচু হতে টান ধরা",
        "হাতের আঙুলে সকালে ৩০ মিনিটের বেশি শক্ত ভাব",
        "পায়ের গোড়ালি বা পাতায় তীব্র ফোলা ব্যথা"
      ]
    },
    ta: {
      question: "எந்த மூட்டுகளில் வலி உள்ளது மற்றும் வீக்கம், வெப்பம் அல்லது காலையில் விறைப்பு உள்ளதா?",
      options: [
        "இரு முழங்கால்களிலும் வலி & வீக்கம்",
        "இடுப்பு கீழ் பகுதியில் வலி & விறைப்பு",
        "கைகளின் விரல் மூட்டுகளில் காலையில் விறைப்பு",
        "கால் கணுக்காலில் கடுமையான வீக்கம்"
      ]
    },
    te: {
      question: "ఏ కీళ్లలో నొప్పి ఉంది మరియు వాపు, వేడి లేదా ఉదయం పూట బిగుతుగా ఉండటం ఉందా?",
      options: [
        "రెండు మోకాళ్లలో నొప్పి & వాపు",
        "నడుము కింది భాగంలో నొప్పి & బిగుతు",
        "చేతి వేళ్ల కీళ్లలో ఉదయం 30 నిమిషాల కంటే ఎక్కువ బిగుతు",
        "చీలమండ లేదా పాదంలో ఆకస్మిక తీవ్ర వాపు"
      ]
    }
  },

  // 13. Comorbidities / Past Medical History
  comorbidities_past_history: {
    en: {
      question: "Do you have any long-standing chronic conditions like Diabetes, High BP, Thyroid, or Heart disease?",
      options: [
        "Type 2 Diabetes Mellitus (High Blood Sugar)",
        "Hypertension (High Blood Pressure)",
        "Both Diabetes and High BP",
        "No prior chronic medical conditions"
      ]
    },
    hi: {
      question: "क्या आपको पहले से डायबिटीज (शुगर), बीपी, थायरॉयड या दिल की बीमारी जैसी कोई पुरानी समस्या है?",
      options: [
        "डायबिटीज / शुगर की बीमारी",
        "हाई ब्लड प्रेशर (उच्च रक्तचाप)",
        "शुगर और बीपी दोनों हैं",
        "पहले से कोई पुरानी बीमारी नहीं है"
      ]
    },
    bn: {
      question: "আপনার কি আগে থেকেই ডায়াবেটিস (সুগার), হাই প্রেশার, থাইরয়েড বা হৃদরোগের মতো কোনো সমস্যা আছে?",
      options: [
        "ডায়াবেটিস / রক্তের সুগার",
        "হাই ব্লাড প্রেশার (উচ্চ রক্তচাপ)",
        "সুগার ও প্রেশার দুটোই আছে",
        "আগে থেকে কোনো দীর্ঘমেয়াদী রোগ নেই"
      ]
    },
    ta: {
      question: "உங்களுக்கு சர்க்கரை நோய், உயர் ரத்த அழுத்தம், தைராய்டு அல்லது இதய நோய் போன்ற நாள்பட்ட பிரச்சனைகள் உள்ளதா?",
      options: [
        "சர்க்கரை நோய் (நீரிழிவு)",
        "உயர் ரத்த அழுத்தம் (BP)",
        "சர்க்கரை மற்றும் BP இரண்டும் உள்ளன",
        "முந்தைய நாள்பட்ட நோய்கள் எதுவும் இல்லை"
      ]
    },
    te: {
      question: "మీకు షుగర్ (మధుమేహం), హై బీపీ, థైరాయిడ్ లేదా గుండె జబ్బులు వంటి దీర్ఘకాలిక సమస్యలు ఉన్నాయా?",
      options: [
        "డయాబెటిస్ / షుగర్ వ్యాధి",
        "హైపర్ టెన్షన్ (హై బ్లడ్ ప్రెజర్)",
        "షుగర్ మరియు బీపీ రెండూ ఉన్నాయి",
        "మునుపటి దీర్ఘకాలిక వ్యాధులు ఏమీ లేవు"
      ]
    }
  },

  // 14. Current Medications
  current_medications_compliance: {
    en: {
      question: "Are you taking regular prescription tablets or medicines every day?",
      options: [
        "Daily BP / Anti-hypertensive tablets",
        "Daily Diabetes / Metformin tablets or Insulin",
        "Taking multiple regular daily medicines",
        "Not taking any regular daily medicines"
      ]
    },
    hi: {
      question: "क्या आप रोजाना कोई नियमित दवाइयां या गोलियां ले रहे हैं?",
      options: [
        "रोजाना बीपी की गोली लेते हैं",
        "रोजाना शुगर की गोली या इंसुलिन लेते हैं",
        "कई नियमित दवाइयां चल रही हैं",
        "फिलहाल कोई नियमित दवा नहीं ले रहे"
      ]
    },
    bn: {
      question: "আপনি কি প্রতিদিন কোনো নিয়মিত প্রেসক্রিপশনের ওষুধ খাচ্ছেন?",
      options: [
        "প্রতিদিন প্রেশারের ওষুধ খাই",
        "প্রতিদিন সুগারের ওষুধ বা ইনসুলিন নিই",
        "একাধিক নিয়মিত ওষুধ চলছে",
        "বর্তমানে কোনো নিয়মিত ওষুধ খাই না"
      ]
    },
    ta: {
      question: "நீங்கள் தினமும் வழக்கமான மருந்துகள் அல்லது மாத்திரைகளை எடுத்துக்கொள்கிறீர்களா?",
      options: [
        "தினசரி BP மாத்திரைகள்",
        "தினசரி சர்க்கரை மாத்திரைகள் அல்லது இன்சுலின்",
        "பல வழக்கமான மருந்துகளை உட்கொள்கிறேன்",
        "வழக்கமான மருந்துகள் எதுவும் எடுக்கவில்லை"
      ]
    },
    te: {
      question: "మీరు రోజూ క్రమం తప్పకుండా ఏవైనా మందులు లేదా మాత్రలు తీసుకుంటున్నారా?",
      options: [
        "రోజూ బీపీ మాత్రలు వేసుకుంటాను",
        "రోజూ షుగర్ మాత్రలు లేదా ఇన్సులిన్ తీసుకుంటాను",
        "బహుళ రెగ్యులర్ మందులు వాడుతున్నాను",
        "ప్రస్తుతం ఎలాంటి రెగ్యులర్ మందులు వాడటం లేదు"
      ]
    }
  },

  // 15. Drug Allergies
  drug_allergies_check: {
    en: {
      question: "Do you have any known allergies to medicines like Penicillin, Sulfa drugs, or Painkillers?",
      options: [
        "Allergic to Penicillin / Amoxicillin",
        "Allergic to Painkillers (Aspirin / Brufen)",
        "Allergic to Sulfa antibiotics",
        "No known drug allergies (NKDA)"
      ]
    },
    hi: {
      question: "क्या आपको पेनिसिलिन, सल्फा या दर्द निवारक (पेनकिलर) दवाइयों से कोई एलर्जी है?",
      options: [
        "पेनिसिलिन / एमोक्सिसिलिन से एलर्जी है",
        "दर्द निवारक (एस्पिरिन/ब्रुफेन) से एलर्जी है",
        "सल्फा एंटीबायोटिक से एलर्जी है",
        "दवाइयों से कोई एलर्जी नहीं है (NKDA)"
      ]
    },
    bn: {
      question: "আপনার কি পেনিসিলিন, সালফা বা ব্যথানাশক কোনো ওষুধে অ্যালার্জি আছে?",
      options: [
        "পেনিসিলিন / অ্যামোক্সিসিলিনে অ্যালার্জি",
        "ব্যথানাশক ওষুধে (অ্যাসপিরিন/ব্রুফেন) অ্যালার্জি",
        "সালফা অ্যান্টিবায়োটিকে অ্যালার্জি",
        "কোনো ওষুধে অ্যালার্জি নেই (NKDA)"
      ]
    },
    ta: {
      question: "உங்களுக்கு பென்சிலின், சல்பா அல்லது வலி நிவாரணி மருந்துகளால் ஏதேனும் ஒவ்வாமை (Allergy) உள்ளதா?",
      options: [
        "பென்சிலின் / அமோக்ஸிசிலின் ஒவ்வாமை",
        "வலி நிவாரணி மருந்துகளில் ஒவ்வாமை",
        "சல்பா ஆன்டிபயாடிக் ஒவ்வாமை",
        "மருந்து ஒவ்வாமை எதுவும் இல்லை (NKDA)"
      ]
    },
    te: {
      question: "మీకు పెన్సిలిన్, సల్ఫా లేదా పెయిన్ కిల్లర్ మందుల వల్ల ఏవైనా అలర్జీలు ఉన్నాయా?",
      options: [
        "పెన్సిలిన్ / అమోక్సిసిలిన్ అలర్జీ ఉంది",
        "పెయిన్ కిల్లర్స్ (ఆస్పిరిన్/బ్రూఫెన్) అలర్జీ",
        "సల్ఫా యాంటీబయాటిక్స్ అలర్జీ",
        "ఎలాంటి మందుల అలర్జీలు లేవు (NKDA)"
      ]
    }
  },

  // 16. Emergency Wrap-Up
  emergency_allergy_check: {
    en: {
      question: "Emergency priority flagged. Do you have any medicine allergies before casualty transfer?",
      options: [
        "No known drug allergies",
        "Allergic to Penicillin / Sulfa",
        "Allergic to Aspirin / NSAIDs",
        "Other allergy"
      ]
    },
    hi: {
      question: "इमरजेंसी प्राथमिकता अलर्ट। कैजुअल्टी ट्रांसफर से पहले क्या आपकी कोई दवा एलर्जी है?",
      options: [
        "कोई दवा एलर्जी नहीं है",
        "पेनिसिलिन / सल्फा से एलर्जी है",
        "एस्पिरिन / पेनकिलर से एलर्जी है",
        "अन्य एलर्जी है"
      ]
    },
    bn: {
      question: "জরুরি সতর্কতা জারি হয়েছে। জরুরি বিভাগে স্থানান্তরের আগে কোনো ওষুধের অ্যালার্জি আছে কি?",
      options: [
        "কোনো ওষুধের অ্যালার্জি নেই",
        "পেনিসিলিন / সালফাতে অ্যালার্জি আছে",
        "অ্যাসপিরিন / ব্যথানাশকে অ্যালার্জি আছে",
        "অন্যান্য অ্যালার্জি আছে"
      ]
    },
    ta: {
      question: "அவசர முன்னுரிமை எச்சரிக்கை. அவசர சிகிச்சைப் பிரிவுக்கு செல்லும் முன் மருந்து ஒவ்வாமை உள்ளதா?",
      options: [
        "மருந்து ஒவ்வாமை எதுவும் இல்லை",
        "பென்சிலின் / சல்பா ஒவ்வாமை",
        "ஆஸ்பிரின் / வலி நிவாரணி ஒவ்வாமை",
        "பிற ஒவ்வாமை"
      ]
    },
    te: {
      question: "అత్యవసర ప్రాధాన్యత హెచ్చరిక. ఎమర్జెన్సీ వార్డుకు వెళ్లే ముందు ఏవైనా మందుల అలర్జీలు ఉన్నాయా?",
      options: [
        "ఎలాంటి మందుల అలర్జీలు లేవు",
        "పెన్సిలిన్ / సల్ఫా అలర్జీ ఉంది",
        "ఆస్పిరిన్ / పెయిన్ కిల్లర్ అలర్జీ ఉంది",
        "ఇతర అలర్జీలు"
      ]
    }
  },

  // 17. Unified Baseline OPD Vitals (Height, Weight, Blood Pressure)
  vitals_baseline_common: {
    en: {
      question: "What are your approximate Height (cm), Weight (kg), and Blood Pressure (BP)? (Standard Baseline Vitals for OPD Care)",
      options: [
        "Normal: Weight ~65 kg, Height ~168 cm, BP ~120/80 mmHg",
        "High BP (> 140/90), Weight ~75 kg, Height ~172 cm",
        "Diabetes / High BP, Weight ~80 kg, Height ~165 cm",
        "Weight ~55 kg, Height ~158 cm, Normal BP",
        "Prefer not to disclose / Skip this data"
      ]
    },
    hi: {
      question: "आपका अनुमानित कद (cm), वजन (kg) और ब्लड प्रेशर (BP) कितना है? (ओपीडी परामर्श हेतु आवश्यक विवरण)",
      options: [
        "सामान्य: वजन ~65 kg, कद ~168 cm, BP ~120/80 mmHg",
        "उच्च रक्तचाप (> 140/90), वजन ~75 kg, कद ~172 cm",
        "डायबिटीज / हाई बीपी, वजन ~80 kg, कद ~165 cm",
        "वजन ~55 kg, कद ~158 cm, सामान्य बीपी",
        "यह जानकारी छोड़ें / साझा नहीं करना चाहते"
      ]
    },
    bn: {
      question: "আপনার আনুমানিক উচ্চতা (cm), ওজন (kg) এবং রক্তচাপ (BP) কত? (ওপিডি চিকিৎসার জন্য প্রয়োজনীয় প্রাথমিক তথ্য)",
      options: [
        "স্বাভাবিক: ওজন ~৬৫ কেজি, উচ্চতা ~১৬৮ সেমি, রক্তচাপ ~১২০/৮০",
        "উচ্চ রক্তচাপ (> ১৪০/৯০), ওজন ~৭৫ কেজি, উচ্চতা ~১৭২ সেমি",
        "ডায়াবেটিস / উচ্চ রক্তচাপ, ওজন ~৮০ কেজি, উচ্চতা ~১৬৫ সেমি",
        "ওজন ~৫৫ কেজি, উচ্চতা ~১৫৮ সেমি, স্বাভাবিক রক্তচাপ",
        "তথ্যটি এড়িয়ে যান / প্রকাশ করতে ইচ্ছুক নন"
      ]
    },
    ta: {
      question: "உங்கள் தோராயமான உயரம் (செ.மீ), எடை (கிலோ) மற்றும் இரத்த அழுத்தம் (BP) என்ன? (மருத்துவ ஆலோசனைக்கான அடிப்படை விவரம்)",
      options: [
        "சாதாரண: எடை ~65 கிலோ, உயரம் ~168 செ.மீ, BP ~120/80",
        "உயர் இரத்த அழுத்தம் (> 140/90), எடை ~75 கிலோ, உயரம் ~172 செ.மீ",
        "நீரிழிவு / உயர் BP, எடை ~80 கிலோ, உயரம் ~165 செ.மீ",
        "எடை ~55 கிலோ, உயரம் ~158 செ.மீ, சாதாரண BP",
        "தகவலை தவிர்க்கவும் / பகிர விரும்பவில்லை"
      ]
    },
    te: {
      question: "మీ సుమారు ఎత్తు (సెం.మీ), బరువు (కిలోలు) మరియు రక్తపోటు (BP) ఎంత? (ఓపీడీ సంప్రదింపులకు ప్రాథమిక వివరాలు)",
      options: [
        "సాధారణ: బరువు ~65 కిలోలు, ఎత్తు ~168 సెం.మీ, BP ~120/80",
        "అధిక రక్తపోటు (> 140/90), బరువు ~75 కిలోలు, ఎత్తు ~172 సెం.మీ",
        "షుగర్ / అధిక BP, బరువు ~80 కిలోలు, ఎత్తు ~165 సెం.మీ",
        "బరువు ~55 కిలోలు, ఎత్తు ~158 సెం.మీ, సాధారణ BP",
        "సమాచారాన్ని వదిలివేయండి / తెలపడానికి ఇష్టపడటం లేదు"
      ]
    }
  },

  // 18. Intake Completed
  completion: {
    en: {
      question: "Thank you for providing your complete medical history. Please proceed to the Document Scan step.",
      options: ["Proceed to Document Scan"]
    },
    hi: {
      question: "अपना संपूर्ण स्वास्थ्य विवरण प्रदान करने के लिए धन्यवाद। कृपया दस्तावेज़ स्कैन चरण पर आगे बढ़ें।",
      options: ["दस्तावेज़ स्कैन पर आगे बढ़ें"]
    },
    bn: {
      question: "আপনার সম্পূর্ণ স্বাস্থ্য বিবরণ প্রদানের জন্য ধন্যবাদ। অনুগ্রহ করে নথি স্ক্যান ধাপে এগিয়ে যান।",
      options: ["নথি স্ক্যান ধাপে এগিয়ে যান"]
    },
    ta: {
      question: "உங்கள் முழுமையான மருத்துவ விவரங்களை வழங்கியமைக்கு நன்றி. ஆவண ஸ்கேன் படிக்கு செல்லவும்.",
      options: ["ஆவண ஸ்கேன் படிக்கு செல்லவும்"]
    },
    te: {
      question: "మీ పూర్తి వైద్య వివరాలను అందించినందుకు ధన్యవాదాలు. దయచేసి పత్రాల స్కాన్ దశకు కొనసాగండి.",
      options: ["పత్రాల స్కాన్ దశకు కొనసాగండి"]
    }
  }
};

/**
 * Translates an AdaptiveQuestion into the target language.
 * Matches by field key or clinical keyword matching.
 */
export function translateAdaptiveQuestion(
  q: AdaptiveQuestion,
  targetLang: LanguageCode
): AdaptiveQuestion {
  if (!q) return q;

  const entry = findTranslationEntry(q);
  if (entry && entry[targetLang]) {
    const loc = entry[targetLang];
    return {
      ...q,
      question: loc.question,
      options: loc.options,
    };
  }

  return q;
}

function findTranslationEntry(q: AdaptiveQuestion): Record<LanguageCode, LocalizedQuestion> | null {
  const f = (q.field || '').toLowerCase();
  
  if (f === 'chief_complaint' || f.includes('chief')) return QUESTION_TRANSLATIONS.chief_complaint;
  if (f.includes('chest') || f.includes('nature') || f.includes('character')) return QUESTION_TRANSLATIONS.chest_pain_nature;
  if (f.includes('radiation') || f.includes('site')) return QUESTION_TRANSLATIONS.radiation_site;
  if (f.includes('onset') || f.includes('duration') || f.includes('chronology')) return QUESTION_TRANSLATIONS.onset_duration;
  if (f.includes('trigger') || f.includes('exertion') || f.includes('relief')) return QUESTION_TRANSLATIONS.triggers_exertion;
  if (f.includes('autonomic') || f.includes('breath') || f.includes('sweat')) return QUESTION_TRANSLATIONS.autonomic_associated;
  if (f.includes('meal') || f.includes('food') || f.includes('acid')) return QUESTION_TRANSLATIONS.gi_relation_meals;
  if (f.includes('bleed') || f.includes('stool') || f.includes('tarry')) return QUESTION_TRANSLATIONS.gi_red_flags_bleeding;
  if (f.includes('cough') || f.includes('sputum') || f.includes('phlegm')) return QUESTION_TRANSLATIONS.cough_duration_type;
  if (f.includes('eye') || f.includes('vision') || f.includes('glass') || f.includes('blur')) return QUESTION_TRANSLATIONS.eye_vision_symptoms;
  if (f.includes('skin') || f.includes('rash') || f.includes('itch')) return QUESTION_TRANSLATIONS.skin_rash_type;
  if (f.includes('joint') || f.includes('knee') || f.includes('stiff')) return QUESTION_TRANSLATIONS.joint_site_swelling;
  if (f.includes('past') || f.includes('comorbid') || f.includes('diabetes') || f.includes('bp')) return QUESTION_TRANSLATIONS.comorbidities_past_history;
  if (f.includes('meds') || f.includes('tablet') || f.includes('medicine')) return QUESTION_TRANSLATIONS.current_medications_compliance;
  if (f.includes('allerg')) return QUESTION_TRANSLATIONS.drug_allergies_check;
  if (f.includes('emergency')) return QUESTION_TRANSLATIONS.emergency_allergy_check;
  if (f.includes('vitals') || f.includes('weight') || f.includes('height') || f.includes('blood_pressure') || f.includes('bp')) return QUESTION_TRANSLATIONS.vitals_baseline_common;

  if (f.includes('complete') || q.done) return QUESTION_TRANSLATIONS.completion;

  // Keyword check on English question text
  const qt = (q.question || '').toLowerCase();
  if (qt.includes('chief') || qt.includes('main health') || qt.includes('मुख्य स्वास्थ्य') || qt.includes('শারীরিক সমস্যা')) return QUESTION_TRANSLATIONS.chief_complaint;
  if (qt.includes('crushing') || qt.includes('sharp') || qt.includes('burning') || qt.includes('tightness') || qt.includes('दर्द का प्रकार')) return QUESTION_TRANSLATIONS.chest_pain_nature;
  if (qt.includes('spread') || qt.includes('radiat') || qt.includes('arm') || qt.includes('jaw') || qt.includes('फैलता')) return QUESTION_TRANSLATIONS.radiation_site;
  if (qt.includes('start') || qt.includes('how long') || qt.includes('कब शुरू')) return QUESTION_TRANSLATIONS.onset_duration;
  if (qt.includes('exertion') || qt.includes('stair') || qt.includes('rest') || qt.includes('चलने')) return QUESTION_TRANSLATIONS.triggers_exertion;
  if (qt.includes('sweat') || qt.includes('nausea') || qt.includes('breath') || qt.includes('पसीना')) return QUESTION_TRANSLATIONS.autonomic_associated;
  if (qt.includes('eat') || qt.includes('meal') || qt.includes('empty stomach') || qt.includes('खाली पेट')) return QUESTION_TRANSLATIONS.gi_relation_meals;
  if (qt.includes('blood') || qt.includes('vomit') || qt.includes('stool') || qt.includes('उल्टी में खून')) return QUESTION_TRANSLATIONS.gi_red_flags_bleeding;
  if (qt.includes('cough') || qt.includes('phlegm') || qt.includes('sputum') || qt.includes('खांसी')) return QUESTION_TRANSLATIONS.cough_duration_type;
  if (qt.includes('read') || qt.includes('vision') || qt.includes('blur') || qt.includes('eye') || qt.includes('धुंधला')) return QUESTION_TRANSLATIONS.eye_vision_symptoms;
  if (qt.includes('skin') || qt.includes('rash') || qt.includes('itch') || qt.includes('खुजली')) return QUESTION_TRANSLATIONS.skin_rash_type;
  if (qt.includes('joint') || qt.includes('knee') || qt.includes('swelling') || qt.includes('जोड़ों')) return QUESTION_TRANSLATIONS.joint_site_swelling;
  if (qt.includes('diabetes') || qt.includes('chronic') || qt.includes('blood pressure') || qt.includes('डायबिटीज')) return QUESTION_TRANSLATIONS.comorbidities_past_history;
  if (qt.includes('regular') || qt.includes('tablet') || qt.includes('prescription') || qt.includes('दवाइयां')) return QUESTION_TRANSLATIONS.current_medications_compliance;
  if (qt.includes('allerg') || qt.includes('penicillin') || qt.includes('एलर्जी')) return QUESTION_TRANSLATIONS.drug_allergies_check;
  if (qt.includes('weight') || qt.includes('height') || qt.includes('blood pressure') || qt.includes('वजन') || qt.includes('উচ্চতা') || qt.includes('रक्तচাপ')) return QUESTION_TRANSLATIONS.vitals_baseline_common;


  return null;
}


export interface VitalsNonDisclosureData {
  alertTitle: string;
  alertMessage: string;
  reconsiderButtonText: string;
  confirmSkipButtonText: string;
  reasonQuestion: string;
  reasonOptions: string[];
}

export const VITALS_I18N: Record<LanguageCode, VitalsNonDisclosureData> = {
  en: {
    alertTitle: "Clinical Reminder: Why Baseline Vitals Matter",
    alertMessage: "Your weight, height, and blood pressure allow your doctor to prescribe safe medication doses, calculate exact metabolic metrics, and catch hidden cardiovascular risks.",
    reconsiderButtonText: "I'll Provide My Vitals",
    confirmSkipButtonText: "Skip and Explain Why (Optional)",
    reasonQuestion: "Why would you prefer not to disclose your vitals today?",
    reasonOptions: [
      "Not measured recently / Don't know exact values",
      "Wheelchair user / Physical limitation",
      "Prefer doctor or nurse to measure in clinic",
      "Personal privacy preference"
    ]
  },
  hi: {
    alertTitle: "महत्वपूर्ण स्वास्थ्य सूचना: वजन व बीपी की आवश्यकता",
    alertMessage: "आपका वजन, कद और ब्लड प्रेशर डॉक्टर को दवाइयों की सही और सुरक्षित खुराक तय करने और हृदय जोखिम की पहचान करने में मदद करते हैं।",
    reconsiderButtonText: "मैं जानकारी देना चाहता हूँ",
    confirmSkipButtonText: "छोड़ें और कारण बताएं (वैकल्पिक)",
    reasonQuestion: "आप यह जानकारी क्यों नहीं देना चाहते?",
    reasonOptions: [
      "हाल ही में नहीं नापा / सही मान मालूम नहीं",
      "शारीरिक अक्षमता / व्हीलचेयर पर हूँ",
      "डॉक्टर या नर्स क्लिनिक में स्वयं नापें",
      "व्यक्तिगत निजता का कारण"
    ]
  },
  bn: {
    alertTitle: "গুরুত্বপূর্ণ স্বাস্থ্য তথ্য: ওজন ও রক্তচাপের প্রয়োজনীয়তা",
    alertMessage: "আপনার সঠিক ওজন, উচ্চতা এবং রক্তচাপ ডাক্তারবাবুকে ওষুধের সঠিক ও নিরাপদ মাত্রা নির্ধারণে এবং হৃদরোগের ঝুঁকি বুঝতে সাহায্য করে।",
    reconsiderButtonText: "আমি তথ্য দিতে চাই",
    confirmSkipButtonText: "এড়িয়ে যান ও কারণ লিখুন (ঐচ্ছিক)",
    reasonQuestion: "আপনি কেন এই তথ্য দিতে চান না?",
    reasonOptions: [
      "সম্প্রতি মাপা হয়নি / সঠিক মান জানা নেই",
      "শারীরিক সীমাবদ্ধতা / হুইলচেয়ার ব্যবহারকারী",
      "ডাক্তার বা নার্স ক্লিনিকে মেপে নিন",
      "ব্যক্তিগত গোপনীয়তার কারণ"
    ]
  },
  ta: {
    alertTitle: "மருத்துவ முக்கியத்துவம்: எடை மற்றும் இரத்த அழுத்தம்",
    alertMessage: "உங்கள் எடை, உயரம் மற்றும் இரத்த அழுத்தம் மருத்துவர் சரியான மருந்து அளவை பரிந்துரைக்கவும் இதய பாதுகாப்பை உறுதி செய்யவும் உதவுகிறது.",
    reconsiderButtonText: "நான் விவரங்களை அளிக்கிறேன்",
    confirmSkipButtonText: "தவிர்த்து காரணம் குறிப்பிடவும் (விருப்பத்தேர்வு)",
    reasonQuestion: "இந்த விவரங்களை ஏன் தவிர்க்க விரும்புகிறீர்கள்?",
    reasonOptions: [
      "சமீபத்தில் அளவிடவில்லை / சரியான மதிப்பு தெரியாது",
      "உடல் இயக்கம் குறைபாடு / சக்கர நாற்காலி",
      "மருத்துவர் அல்லது செவிலியர் பரிசோதிக்கட்டும்",
      "தனிப்பட்ட விருப்பம்"
    ]
  },
  te: {
    alertTitle: "ముఖ్యమైన వైద్య సమాచారం: బరువు మరియు రక్తపోటు",
    alertMessage: "మీ బరువు, ఎత్తు మరియు రక్తపోటు వివరాలు డాక్టర్‌కు సరైన మోతాదులో మందులు రాయడానికి మరియు గుండె ఆరోగ్యాన్ని అంచనా వేయడానికి ఎంతో అవసరం.",
    reconsiderButtonText: "నేను వివరాలు అందిస్తాను",
    confirmSkipButtonText: "వదిలివేసి కారణం చెప్పండి (ఐచ్ఛికం)",
    reasonQuestion: "ఈ వివరాలను ఎందుకు అందించలేకపోతున్నారు?",
    reasonOptions: [
      "ఇటీవల కొలవలేదు / ఖచ్చితమైన విలువ తెలియదు",
      "శారీరక పరిమితి / వీల్ చైర్ ఉపయోగిస్తున్నాను",
      "డాక్టర్ లేదా నర్సు క్లినిక్‌లో స్వయంగా కొలవాలి",
      "వ్యక్తిగత కారణం"
    ]
  }
};
