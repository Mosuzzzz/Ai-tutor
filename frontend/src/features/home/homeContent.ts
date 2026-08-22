import type { HomeContent, HomeLanguage, HomeNavigationItem } from "./types";

export const HOME_NAVIGATION = [
  { href: "#how-it-works", key: "howItWorks" },
  { href: "#study-kit", key: "studyKit" },
  { href: "#progress", key: "progress" },
  { href: "#faq", key: "faq" }
] satisfies HomeNavigationItem[];

export const HOME_CONTENT: Record<HomeLanguage, HomeContent> = {
  en: {
    navbar: {
      languageLabel: "Language", themeLabel: "Theme", themeLightLabel: "Light", themeDarkLabel: "Dark",
      themeLightIconLabel: "Sun", themeDarkIconLabel: "Moon", menuLabel: "Open navigation menu", loginLabel: "Log in",
      accountGreeting: "Hello! {email}", logoutLabel: "Log out", logoutError: "Unable to log out. Please try again."
    },
    navigation: { howItWorks: "How it works", studyKit: "Study kit", progress: "Progress", faq: "FAQ", startStudying: "Start studying" },
    hero: {
      eyebrow: "Your material, one connected study loop.", heading: "Turn your documents into an AI study workspace.",
      body: "Upload your material, read a clear summary, ask questions tied to the selected document, build a review quiz, and see what to study next.",
      guestCta: "Create your study workspace", authenticatedCta: "Open my documents", guestSecondaryCta: "Log in",
      authenticatedSecondaryCta: "Go to my dashboard", supportingLine: "Summary, document-based questions, review quizzes, and progress in one focused flow."
    },
    studyScene: {
      ariaLabel: "AI study workflow: document, summary, document-based question, review quiz, and result",
      documentLabel: "Cell biology notes", documentMeta: "Study document · ready", summaryLabel: "Clear summary",
      summaryText: "Cell membranes regulate what enters and leaves a cell.", questionLabel: "Your question",
      questionText: "Why is the membrane selectively permeable?", answerLabel: "AI Tutor",
      answerText: "Its structure allows some molecules through while limiting others.", sourceLabel: "Source · highlighted passage",
      quizLabel: "Quick review", quizQuestion: "What is one role of the cell membrane?", quizChoice: "Control movement of substances",
      resultLabel: "Review complete · next: active transport", pauseLabel: "Pause study story", playLabel: "Play study story"
    },
    promise: { eyebrow: "A focused learning loop", title: "Everything starts with the material you need to understand.", body: "AI Tutor keeps summary, questions, review, and progress connected to one personal workspace." },
    features: [
      { title: "Understand the source", description: "Move from an uploaded document to a focused summary after processing." },
      { title: "Ask with context", description: "Ask about the selected document and view source excerpts when available." },
      { title: "Review actively", description: "Turn ready material into a personal review quiz and learn from the result." },
      { title: "See what comes next", description: "Use your quiz history to spot the material that deserves another pass." }
    ],
    studyKit: {
      eyebrow: "One upload, connected tools", title: "A study kit that grows from the same source.",
      body: "Keep the path from reading to active recall visible, without rebuilding your context at every step.",
      steps: [
        { title: "Document", description: "Upload the material you are studying." }, { title: "Summary", description: "Start with the main ideas and structure." },
        { title: "Chat", description: "Clarify a point in the selected document." }, { title: "Quiz / Review", description: "Check recall and decide what to revisit." }
      ]
    },
    walkthrough: {
      eyebrow: "How it works", title: "Follow one clear path from source to review.", body: "Explore the three moments that turn reading material into an active study session.",
      items: [
        { label: "01 Upload & summarize", title: "Begin with your own material", description: "Upload a supported document and wait for its processing state to become ready.", detail: "PDF, Word, PowerPoint, and image uploads are supported by the current frontend flow." },
        { label: "02 Ask & clarify", title: "Keep the selected document in view", description: "Ask a focused question without losing which material the answer belongs to.", detail: "Citation and source excerpts appear when the backend provides them." },
        { label: "03 Quiz & review", title: "Turn understanding into recall", description: "Generate a personal review quiz, submit an attempt, and inspect the result.", detail: "Your results feed the personal progress view when analytics data is available." }
      ]
    },
    languageMaterial: { eyebrow: "Study in your flow", title: "A bilingual interface for the material in front of you.", body: "Switch the Home interface between English and Thai, then bring material from the subject or training topic you are studying.", formats: ["PDF", "Word", "PowerPoint", "Images"], note: "AI output language depends on the material and backend response." },
    quiz: { eyebrow: "Quiz & review", title: "Move from reading to active recall.", body: "Create a personal review quiz from a ready source and use the explanation to close the gap.", exampleLabel: "Example review flow", question: "What controls movement into and out of a cell?", choices: ["Cell membrane", "Nucleus", "Ribosome"], explanation: "The cell membrane is selectively permeable and regulates movement of substances.", source: "Source available · Cell biology notes" },
    progress: { eyebrow: "Learning progress", title: "See a useful next step, not a vanity number.", body: "Review recent scores and topic-level patterns to decide where another pass will help.", exampleLabel: "Illustrative progress preview", scoreLabel: "Recent review score", reviewLabel: "Suggested next review", reviewTopic: "Active transport across membranes" },
    trust: { eyebrow: "Trust before spectacle", title: "Know what the interface is showing you.", body: "AI states stay tied to real product boundaries instead of pretending every result is complete.", items: [
      { title: "Selected-document context", description: "Chat and quiz flows keep the chosen learning source visible." },
      { title: "Sources when available", description: "Citation excerpts are shown when the backend returns them." },
      { title: "Honest states", description: "Processing, unavailable, empty, and error states remain explicit." }
    ] },
    access: { eyebrow: "Simple access", title: "Start where you are.", body: "Choose the route that matches where you are—create your workspace or continue with material you already added.", guestTitle: "New to AI Tutor?", guestBody: "Create an account to open your personal study workspace.", guestCta: "Create your workspace", memberTitle: "Already studying?", memberBody: "Return to your documents and continue the same learning loop." },
    faq: { eyebrow: "FAQ", title: "Clear answers before you begin.", body: "What the current product supports—and where results depend on your material and backend processing.", items: [
      { question: "What does AI Tutor do with my document?", answer: "It processes supported material so you can read a summary, ask document-based questions, create a review quiz, and inspect personal progress." },
      { question: "Which file types can I upload?", answer: "The current frontend accepts PDF, Word, PowerPoint, and common image files up to its displayed upload limit." },
      { question: "Where do AI answers come from?", answer: "Chat is scoped to the selected document. Citation or source excerpts appear when the backend provides them." },
      { question: "Can I use the interface in Thai?", answer: "The Home interface supports English and Thai. Generated content depends on the material and backend response." },
      { question: "When do I need to log in?", answer: "You can understand the product on this public page. A session is required to open your personal documents and study tools." },
      { question: "Are the scores on this page live?", answer: "No. The Home progress card is an illustrative preview; authenticated analytics use your own available activity data." }
    ] },
    finalCta: { title: "Bring your next document into a clearer study loop.", body: "Start with the material you already need to understand.", guestCta: "Create your study workspace", authenticatedCta: "Continue with my documents" },
    footer: { description: "A personal AI study workspace for documents, questions, review quizzes, and learning progress.", productLabel: "Product", accountLabel: "Account", rights: "AI Tutor · Personal study workspace" }
  },
  th: {
    navbar: {
      languageLabel: "ภาษา", themeLabel: "ธีม", themeLightLabel: "สว่าง", themeDarkLabel: "มืด",
      themeLightIconLabel: "ดวงอาทิตย์", themeDarkIconLabel: "ดวงจันทร์", menuLabel: "เปิดเมนูนำทาง", loginLabel: "เข้าสู่ระบบ",
      accountGreeting: "สวัสดี! {email}", logoutLabel: "ออกจากระบบ", logoutError: "ไม่สามารถออกจากระบบได้ โปรดลองอีกครั้ง"
    },
    navigation: { howItWorks: "วิธีการทำงาน", studyKit: "ชุดเครื่องมือเรียน", progress: "ความก้าวหน้า", faq: "คำถามที่พบบ่อย", startStudying: "เริ่มเรียน" },
    hero: {
      eyebrow: "จากเอกสารของคุณ สู่การเรียนที่ต่อเนื่อง", heading: "เปลี่ยนเอกสารของคุณให้เป็นพื้นที่เรียนกับ AI",
      body: "อัปโหลดเนื้อหา อ่านสรุป ถามคำถามจากเอกสารที่เลือก สร้างควิซทบทวน และดูว่าควรกลับไปเรียนเรื่องใดต่อ",
      guestCta: "สร้างพื้นที่เรียนของฉัน", authenticatedCta: "เปิดเอกสารของฉัน", guestSecondaryCta: "เข้าสู่ระบบ",
      authenticatedSecondaryCta: "ไปที่แดชบอร์ดของฉัน", supportingLine: "สรุป แชทจากเอกสาร ควิซทบทวน และความก้าวหน้าใน flow เดียว"
    },
    studyScene: {
      ariaLabel: "ขั้นตอนการเรียนด้วย AI จากเอกสาร สรุป คำถาม ควิซ และผลทบทวน",
      documentLabel: "โน้ตชีววิทยาของเซลล์", documentMeta: "เอกสารเรียน · พร้อมใช้งาน", summaryLabel: "สรุปที่อ่านง่าย",
      summaryText: "เยื่อหุ้มเซลล์ควบคุมสารที่เข้าและออกจากเซลล์", questionLabel: "คำถามของคุณ",
      questionText: "ทำไมเยื่อหุ้มเซลล์จึงเลือกผ่านสารบางชนิด?", answerLabel: "AI Tutor",
      answerText: "โครงสร้างของเยื่อหุ้มยอมให้บางโมเลกุลผ่านและจำกัดโมเลกุลอื่น", sourceLabel: "แหล่งข้อมูล · ข้อความที่ไฮไลต์",
      quizLabel: "ทบทวนสั้น ๆ", quizQuestion: "หน้าที่หนึ่งของเยื่อหุ้มเซลล์คืออะไร?", quizChoice: "ควบคุมการเคลื่อนที่ของสาร",
      resultLabel: "ทบทวนแล้ว · ต่อไป: การลำเลียงแบบใช้พลังงาน", pauseLabel: "หยุดเรื่องราวการเรียนชั่วคราว", playLabel: "เล่นเรื่องราวการเรียน"
    },
    promise: { eyebrow: "วงจรการเรียนที่มีจุดหมาย", title: "ทุกอย่างเริ่มจากเนื้อหาที่คุณต้องการเข้าใจ", body: "AI Tutor เชื่อมสรุป คำถาม ควิซ และความก้าวหน้าไว้ในพื้นที่เรียนส่วนตัวเดียวกัน" },
    features: [
      { title: "เข้าใจเนื้อหาต้นฉบับ", description: "เริ่มจากเอกสารที่อัปโหลดและอ่านสรุปเมื่อระบบประมวลผลพร้อม" },
      { title: "ถามจากบริบท", description: "ถามจากเอกสารที่เลือกและดูข้อความอ้างอิงเมื่อมีข้อมูล" },
      { title: "ทบทวนแบบลงมือทำ", description: "เปลี่ยนเอกสารที่พร้อมเป็นควิซส่วนตัวและเรียนรู้จากผลลัพธ์" },
      { title: "เห็นสิ่งที่ควรเรียนต่อ", description: "ใช้ประวัติควิซเพื่อดูว่าเนื้อหาใดควรกลับไปทบทวน" }
    ],
    studyKit: { eyebrow: "อัปโหลดครั้งเดียว เรียนได้ต่อเนื่อง", title: "ชุดเครื่องมือเรียนที่ต่อยอดจากแหล่งเดียวกัน", body: "เดินจากการอ่านไปสู่การทบทวนโดยไม่ต้องเริ่มสร้างบริบทใหม่ทุกขั้น", steps: [
      { title: "เอกสาร", description: "อัปโหลดเนื้อหาที่กำลังเรียน" }, { title: "สรุป", description: "เริ่มจากใจความและโครงสร้างหลัก" },
      { title: "แชท", description: "ถามประเด็นจากเอกสารที่เลือก" }, { title: "ควิซ / ทบทวน", description: "ตรวจความจำและเลือกเรื่องที่ควรทบทวน" }
    ] },
    walkthrough: { eyebrow: "วิธีการทำงาน", title: "เดินตามเส้นทางเดียวจากต้นฉบับสู่การทบทวน", body: "สำรวจสามช่วงสำคัญที่เปลี่ยนเนื้อหาอ่านให้เป็นการเรียนแบบลงมือทำ", items: [
      { label: "01 อัปโหลดและสรุป", title: "เริ่มจากเนื้อหาของคุณ", description: "อัปโหลดเอกสารที่รองรับและรอจนสถานะประมวลผลพร้อม", detail: "flow ปัจจุบันรองรับ PDF, Word, PowerPoint และรูปภาพ" },
      { label: "02 ถามและทำความเข้าใจ", title: "เห็นเอกสารที่เลือกอยู่เสมอ", description: "ถามประเด็นที่สงสัยโดยไม่เสียบริบทว่าเป็นเนื้อหาใด", detail: "citation และข้อความต้นฉบับจะแสดงเมื่อ Backend ส่งมา" },
      { label: "03 ทำควิซและทบทวน", title: "เปลี่ยนความเข้าใจเป็นการเรียกคืนความจำ", description: "สร้างควิซส่วนตัว ส่งคำตอบ และดูผลทบทวน", detail: "ผลของคุณเชื่อมสู่หน้าความก้าวหน้าเมื่อมีข้อมูล analytics" }
    ] },
    languageMaterial: { eyebrow: "เรียนใน flow ของคุณ", title: "อินเทอร์เฟซสองภาษาสำหรับเนื้อหาที่อยู่ตรงหน้า", body: "สลับหน้า Home ระหว่างภาษาไทยและอังกฤษ แล้วใช้เนื้อหาจากวิชาหรือหัวข้อฝึกอบรมที่คุณกำลังเรียน", formats: ["PDF", "Word", "PowerPoint", "รูปภาพ"], note: "ภาษาของผลลัพธ์ AI ขึ้นอยู่กับเนื้อหาและการตอบกลับของ Backend" },
    quiz: { eyebrow: "ควิซและการทบทวน", title: "เปลี่ยนจากการอ่านเป็นการเรียกคืนความจำ", body: "สร้างควิซส่วนตัวจากแหล่งข้อมูลที่พร้อม และใช้คำอธิบายเพื่อปิดช่องว่าง", exampleLabel: "ตัวอย่าง flow การทบทวน", question: "สิ่งใดควบคุมสารที่เข้าและออกจากเซลล์?", choices: ["เยื่อหุ้มเซลล์", "นิวเคลียส", "ไรโบโซม"], explanation: "เยื่อหุ้มเซลล์เลือกผ่านและควบคุมการเคลื่อนที่ของสาร", source: "มีแหล่งข้อมูล · โน้ตชีววิทยาของเซลล์" },
    progress: { eyebrow: "ความก้าวหน้าในการเรียน", title: "เห็นขั้นตอนถัดไปที่ใช้ได้จริง ไม่ใช่แค่ตัวเลขสวย ๆ", body: "ดูคะแนนล่าสุดและรูปแบบตามหัวข้อ เพื่อเลือกว่าการทบทวนอีกครั้งจะช่วยตรงไหน", exampleLabel: "ภาพตัวอย่างความก้าวหน้า", scoreLabel: "คะแนนทบทวนล่าสุด", reviewLabel: "เรื่องที่แนะนำให้ทบทวนต่อ", reviewTopic: "การลำเลียงสารผ่านเยื่อหุ้มแบบใช้พลังงาน" },
    trust: { eyebrow: "ความน่าเชื่อถือก่อนลูกเล่น", title: "รู้เสมอว่าอินเทอร์เฟซกำลังแสดงอะไร", body: "สถานะ AI ยึดกับขอบเขตของ product จริง ไม่ทำให้ผลลัพธ์ที่ยังไม่พร้อมดูเหมือนเสร็จสมบูรณ์", items: [
      { title: "บริบทจากเอกสารที่เลือก", description: "flow แชทและควิซแสดงแหล่งเรียนที่กำลังใช้อยู่" },
      { title: "แหล่งข้อมูลเมื่อมี", description: "แสดง citation หรือข้อความต้นฉบับเมื่อ Backend ส่งมา" },
      { title: "สถานะที่ตรงไปตรงมา", description: "แสดง processing, unavailable, empty และ error อย่างชัดเจน" }
    ] },
    access: { eyebrow: "เริ่มต้นอย่างเรียบง่าย", title: "ไปต่อจากจุดที่คุณอยู่", body: "เลือกเส้นทางที่เหมาะกับคุณ—สร้างพื้นที่เรียนใหม่ หรือเรียนต่อจากเนื้อหาที่เพิ่มไว้แล้ว", guestTitle: "เพิ่งเริ่มใช้ AI Tutor?", guestBody: "สร้างบัญชีเพื่อเปิดพื้นที่เรียนส่วนตัว", guestCta: "สร้างพื้นที่เรียน", memberTitle: "กำลังเรียนต่ออยู่?", memberBody: "กลับไปยังเอกสารและเรียนต่อใน flow เดิม" },
    faq: { eyebrow: "คำถามที่พบบ่อย", title: "คำตอบที่ชัดเจนก่อนเริ่มเรียน", body: "สิ่งที่ product ปัจจุบันรองรับ และจุดที่ผลลัพธ์ขึ้นอยู่กับเนื้อหาหรือการประมวลผล", items: [
      { question: "AI Tutor ทำอะไรกับเอกสารของฉัน?", answer: "ระบบประมวลผลเนื้อหาที่รองรับเพื่อให้คุณอ่านสรุป ถามจากเอกสาร สร้างควิซ และดูความก้าวหน้าส่วนตัว" },
      { question: "อัปโหลดไฟล์ประเภทใดได้บ้าง?", answer: "Frontend ปัจจุบันรองรับ PDF, Word, PowerPoint และรูปภาพทั่วไป ภายใต้ขนาดที่หน้าอัปโหลดระบุ" },
      { question: "คำตอบ AI มาจากที่ใด?", answer: "แชทผูกกับเอกสารที่เลือก และแสดง citation หรือข้อความต้นฉบับเมื่อ Backend ส่งมา" },
      { question: "ใช้อินเทอร์เฟซภาษาไทยได้หรือไม่?", answer: "หน้า Home รองรับภาษาไทยและอังกฤษ ส่วนภาษาของเนื้อหาที่สร้างขึ้นอยู่กับเอกสารและ Backend" },
      { question: "ต้องเข้าสู่ระบบเมื่อใด?", answer: "คุณอ่านข้อมูล product จากหน้านี้ได้โดยไม่ต้องเข้าสู่ระบบ แต่ต้องมี session เพื่อเปิดเอกสารและเครื่องมือเรียนส่วนตัว" },
      { question: "คะแนนบนหน้านี้เป็นข้อมูลจริงหรือไม่?", answer: "ไม่ใช่ การ์ดความก้าวหน้าบน Home เป็นภาพตัวอย่าง ส่วนหน้า analytics หลังเข้าสู่ระบบใช้ข้อมูลกิจกรรมที่มีของคุณ" }
    ] },
    finalCta: { title: "นำเอกสารถัดไปเข้าสู่วงจรการเรียนที่ชัดเจนกว่าเดิม", body: "เริ่มจากเนื้อหาที่คุณต้องทำความเข้าใจอยู่แล้ว", guestCta: "สร้างพื้นที่เรียนของฉัน", authenticatedCta: "เรียนต่อจากเอกสารของฉัน" },
    footer: { description: "พื้นที่เรียนกับ AI ส่วนตัวสำหรับเอกสาร คำถาม ควิซทบทวน และความก้าวหน้า", productLabel: "ผลิตภัณฑ์", accountLabel: "บัญชี", rights: "AI Tutor · พื้นที่เรียนส่วนตัว" }
  }
};
