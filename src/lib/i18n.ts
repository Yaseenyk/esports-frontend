/**
 * Hindi and Marathi for the screens that players and gate staff use (invite page, pass page, gate scanner) and for the
 * ID card steps. English is the default and the fallback for any missing line.
 * The Hindi and Marathi wording should be read once by a native speaker before a real event.
 */
export const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
] as const;
export type Lang = (typeof LANGS)[number]["code"];

const en = {
  join_title: "Join {team}",
  your_name: "Your name, as it should print on the card",
  your_role: "Your role",
  under18: "I am under 18",
  under18_hint: "The organiser will need a parent or guardian's consent before your card is printed.",
  photo_label: "A clear photo of your face (optional)",
  choose_photo: "Choose or take a photo",
  change_photo: "Change photo",
  privacy: "Only your name, role and photo are sent. We do not ask for any ID number or date of birth here.",
  send: "Send to the organiser",
  sending: "Sending…",
  sent_title: "Sent. Thank you.",
  sent_body: "The organiser will check your details and add you to {team}. You do not need to do anything else.",
  invite_inactive: "This invite is no longer active. It may have expired or been used up. Ask the organiser for a new one.",
  link_incomplete: "This link is incomplete. Ask your team captain to send it again.",
  pass_title: "Your event pass",
  pass_note: "Show this QR code at the gate. Keep the link private: anyone who has it can see this pass.",
  pass_inactive: "This pass link is not active any more. Ask the organiser for a new one.",
  gate_ok: "Genuine pass: let them in",
  gate_again: "Already checked in",
  gate_bad: "Not a valid pass",
  gate_queued: "No signal: not verified yet",
  gate_connected: "Connected",
  role_Player: "Player", role_Substitute: "Substitute", role_Coach: "Coach", role_Manager: "Manager", role_Staff: "Staff",
  step_event: "Event", step_people: "People", step_design: "Design", step_print: "Print",
  back: "← Back",
  next: "Next: {step} →",
  download_pdf: "Download PDF",
  guide0: "Name your event, pick the game and the shape of the card, and list your teams. Then tap Next.",
  guide1: "Add everyone who needs a card: scan Aadhaar cards, import a sheet, or add by hand. Demo people are already here to try.",
  guide2: "Choose how the cards look for each team. Tap a design to use it, then change anything you like.",
  guide3: "Download the PDF to print at real size, or the PNG zip to share. Read the warnings first.",
  step_of: "Step {n} of 4",
  language: "Language",
};
export type Key = keyof typeof en;
export const KEYS = Object.keys(en) as Key[];

const hi: Partial<Record<Key, string>> = {
  join_title: "{team} में शामिल हों",
  your_name: "आपका नाम, जैसा कार्ड पर छपना चाहिए",
  your_role: "आपकी भूमिका",
  under18: "मेरी उम्र 18 साल से कम है",
  under18_hint: "कार्ड छपने से पहले आयोजक को माता-पिता या अभिभावक की सहमति चाहिए होगी।",
  photo_label: "आपके चेहरे की साफ़ फ़ोटो (वैकल्पिक)",
  choose_photo: "फ़ोटो चुनें या खींचें",
  change_photo: "फ़ोटो बदलें",
  privacy: "केवल आपका नाम, भूमिका और फ़ोटो भेजी जाती है। यहाँ कोई ID नंबर या जन्म तिथि नहीं माँगी जाती।",
  send: "आयोजक को भेजें",
  sending: "भेजा जा रहा है…",
  sent_title: "भेज दिया गया। धन्यवाद।",
  sent_body: "आयोजक आपकी जानकारी जाँचकर आपको {team} में जोड़ देंगे। आपको और कुछ करने की ज़रूरत नहीं है।",
  invite_inactive: "यह आमंत्रण अब चालू नहीं है। यह समाप्त हो गया होगा या इसकी सीमा पूरी हो गई होगी। आयोजक से नया माँगें।",
  link_incomplete: "यह लिंक अधूरा है। अपने टीम कैप्टन से इसे दोबारा भेजने को कहें।",
  pass_title: "आपका इवेंट पास",
  pass_note: "गेट पर यह QR कोड दिखाएँ। लिंक को निजी रखें: जिसके पास भी यह लिंक होगा वह यह पास देख सकता है।",
  pass_inactive: "यह पास लिंक अब चालू नहीं है। आयोजक से नया लिंक माँगें।",
  gate_ok: "असली पास: अंदर आने दें",
  gate_again: "पहले ही चेक-इन हो चुका है",
  gate_bad: "मान्य पास नहीं",
  gate_queued: "सिग्नल नहीं: अभी जाँचा नहीं गया",
  gate_connected: "जुड़ गया",
  role_Player: "खिलाड़ी", role_Substitute: "अतिरिक्त खिलाड़ी", role_Coach: "कोच", role_Manager: "मैनेजर", role_Staff: "स्टाफ़",
  step_event: "इवेंट", step_people: "लोग", step_design: "डिज़ाइन", step_print: "प्रिंट",
  back: "← वापस",
  next: "आगे: {step} →",
  download_pdf: "PDF डाउनलोड करें",
  guide0: "अपने इवेंट का नाम लिखें, गेम और कार्ड का आकार चुनें, और टीमें जोड़ें। फिर आगे दबाएँ।",
  guide1: "हर उस व्यक्ति को जोड़ें जिसे कार्ड चाहिए: आधार कार्ड स्कैन करें, शीट इम्पोर्ट करें, या हाथ से जोड़ें। आज़माने के लिए डेमो लोग पहले से मौजूद हैं।",
  guide2: "हर टीम के कार्ड का रूप चुनें। कोई डिज़ाइन दबाकर चुनें, फिर जो चाहें बदलें।",
  guide3: "असली आकार में प्रिंट करने के लिए PDF डाउनलोड करें, या साझा करने के लिए PNG ज़िप। पहले चेतावनियाँ पढ़ लें।",
  step_of: "चरण {n} / 4",
  language: "भाषा",
};

const mr: Partial<Record<Key, string>> = {
  join_title: "{team} मध्ये सामील व्हा",
  your_name: "तुमचे नाव, कार्डवर जसे छापायचे आहे तसे",
  your_role: "तुमची भूमिका",
  under18: "माझे वय १८ वर्षांपेक्षा कमी आहे",
  under18_hint: "कार्ड छापण्यापूर्वी आयोजकांना पालकांची संमती लागेल.",
  photo_label: "तुमच्या चेहऱ्याचा स्पष्ट फोटो (ऐच्छिक)",
  choose_photo: "फोटो निवडा किंवा काढा",
  change_photo: "फोटो बदला",
  privacy: "फक्त तुमचे नाव, भूमिका आणि फोटो पाठवला जातो. येथे कोणताही ओळख क्रमांक किंवा जन्मतारीख विचारली जात नाही.",
  send: "आयोजकांना पाठवा",
  sending: "पाठवत आहे…",
  sent_title: "पाठवले. धन्यवाद.",
  sent_body: "आयोजक तुमची माहिती तपासून तुम्हाला {team} मध्ये जोडतील. तुम्हाला आणखी काही करण्याची गरज नाही.",
  invite_inactive: "हे आमंत्रण आता सक्रिय नाही. ते कालबाह्य झाले असेल किंवा वापराची मर्यादा संपली असेल. आयोजकांकडून नवीन मागा.",
  link_incomplete: "ही लिंक अपूर्ण आहे. तुमच्या टीम कॅप्टनला ती पुन्हा पाठवायला सांगा.",
  pass_title: "तुमचा इव्हेंट पास",
  pass_note: "गेटवर हा QR कोड दाखवा. लिंक खाजगी ठेवा: ज्याच्याकडे ही लिंक असेल तो हा पास पाहू शकतो.",
  pass_inactive: "ही पास लिंक आता सक्रिय नाही. आयोजकांकडून नवीन लिंक मागा.",
  gate_ok: "खरा पास: आत सोडा",
  gate_again: "आधीच चेक-इन झाले आहे",
  gate_bad: "वैध पास नाही",
  gate_queued: "सिग्नल नाही: अजून तपासले नाही",
  gate_connected: "जोडले गेले",
  role_Player: "खेळाडू", role_Substitute: "राखीव खेळाडू", role_Coach: "कोच", role_Manager: "व्यवस्थापक", role_Staff: "कर्मचारी",
  step_event: "इव्हेंट", step_people: "लोक", step_design: "डिझाइन", step_print: "प्रिंट",
  back: "← मागे",
  next: "पुढे: {step} →",
  download_pdf: "PDF डाउनलोड करा",
  guide0: "तुमच्या इव्हेंटचे नाव लिहा, गेम आणि कार्डचा आकार निवडा, आणि टीम्स जोडा. मग पुढे दाबा.",
  guide1: "ज्यांना कार्ड हवे आहे त्या प्रत्येकाला जोडा: आधार कार्ड स्कॅन करा, शीट इम्पोर्ट करा, किंवा हाताने जोडा. करून पाहण्यासाठी डेमो लोक आधीच आहेत.",
  guide2: "प्रत्येक टीमच्या कार्डचे रूप निवडा. एखादे डिझाइन दाबून निवडा, मग हवे ते बदला.",
  guide3: "खऱ्या आकारात छापण्यासाठी PDF डाउनलोड करा, किंवा शेअर करण्यासाठी PNG झिप. आधी इशारे वाचा.",
  step_of: "पायरी {n} / 4",
  language: "भाषा",
};

const DICT: Record<Lang, Partial<Record<Key, string>>> = { en, hi, mr };

/** Looks a line up in the chosen language, falling back to English, and fills in {placeholders}. */
export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let s = DICT[lang]?.[key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export const isLang = (x: unknown): x is Lang => LANGS.some((l) => l.code === x);
