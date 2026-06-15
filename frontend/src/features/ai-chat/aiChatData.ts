import type { AiChatSummaryViewModel } from "./types";

export const aiChatSummaryMock: AiChatSummaryViewModel = {
  chatHistoryEndpoint: "/api/chat/history",
  chatQueryEndpoint: "/api/chat/query",
  documents: [
    {
      filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
      id: "doc-lab-safety",
      ownerLabel: "อัปโหลดโดย อาจารย์ปภาวี",
      status: "ready",
      summary: "สรุปขั้นตอนก่อนเข้าห้องปฏิบัติการ การใช้อุปกรณ์ป้องกัน และการรับมือเหตุฉุกเฉิน",
      summaryAvailable: true,
      topicCount: 4,
      updatedAt: "2026-06-01T09:30:00.000Z",
      updatedAtLabel: "อัปเดต 1 มิ.ย. 2026"
    },
    {
      filename: "แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf",
      id: "doc-ai-ethics",
      ownerLabel: "อัปโหลดโดย อาจารย์ธนา",
      status: "ready",
      summary: "สรุปหลักการใช้ AI อย่างโปร่งใสและตรวจสอบคำตอบด้วยหลักฐาน",
      summaryAvailable: true,
      topicCount: 5,
      updatedAt: "2026-05-31T08:45:00.000Z",
      updatedAtLabel: "อัปเดต 31 พ.ค. 2026"
    },
    {
      filename: "บทนำระบบย่อยอาหาร.pdf",
      id: "doc-digestive-system",
      ownerLabel: "อัปโหลดโดย อาจารย์มนัส",
      status: "processing",
      summary: "รอระบบอ่านเนื้อหาให้ครบก่อนเปิดให้ถาม AI",
      summaryAvailable: false,
      topicCount: 0,
      updatedAt: "2026-05-30T08:00:00.000Z",
      updatedAtLabel: "กำลังประมวลผล"
    },
    {
      filename: "แบบฝึกหัดเก่าไม่มีข้อความ.pdf",
      id: "doc-ocr-error",
      ownerLabel: "อัปโหลดโดย อาจารย์ปภาวี",
      status: "error",
      summary: "ไฟล์นี้ต้องตรวจชนิดไฟล์หรืออัปโหลดใหม่",
      summaryAvailable: false,
      topicCount: 0,
      updatedAt: "2026-05-29T08:00:00.000Z",
      updatedAtLabel: "ต้องตรวจสอบ"
    }
  ],
  documentsEndpoint: "/api/files/dashboard",
  messages: [
    {
      body: "ควรเริ่มทบทวนเรื่องใดก่อนทำควิซความปลอดภัย",
      citations: [],
      createdAtLabel: "09:10",
      id: "message-learner-1",
      role: "learner"
    },
    {
      body: "เริ่มจาก checklist ก่อนเข้าห้องปฏิบัติการ เพราะเอกสารย้ำให้ตรวจอุปกรณ์ป้องกันและพื้นที่ทำงานก่อนเริ่มทดลอง จากนั้นค่อยทบทวนขั้นตอนแจ้งครูเมื่อพบเหตุผิดปกติ",
      citations: [
        {
          chunk_index: 1,
          file_id: "doc-lab-safety",
          filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
          matched_text: "ตรวจอุปกรณ์ป้องกันก่อนเริ่มทดลอง"
        },
        {
          chunk_index: 3,
          file_id: "doc-lab-safety",
          filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
          matched_text: "แจ้งครูผู้ดูแลทันทีเมื่อพบเหตุผิดปกติ"
        }
      ],
      createdAtLabel: "09:11",
      id: "message-assistant-1",
      role: "assistant"
    },
    {
      body: "ถ้าจะทำสรุปสั้นเพื่อจำก่อนสอบ ควรแบ่งเป็นสามกลุ่ม: ก่อนทดลอง ระหว่างทดลอง และเมื่อเกิดเหตุฉุกเฉิน",
      citations: [
        {
          chunk_index: 4,
          file_id: "doc-lab-safety",
          filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
          matched_text: "บันทึกผลและเหตุการณ์สำคัญในสมุดปฏิบัติการ"
        }
      ],
      createdAtLabel: "09:13",
      id: "message-assistant-2",
      role: "assistant"
    }
  ],
  metrics: [
    {
      helper: "คำตอบ AI ที่มีอ้างอิงจากเอกสาร",
      id: "grounded-answers",
      label: "คำตอบอ้างอิง",
      value: "2"
    },
    {
      helper: "เอกสารที่พร้อมใช้ถาม AI พร้อมอ้างอิง",
      id: "ready-documents",
      label: "เอกสารพร้อมถาม",
      value: "2"
    },
    {
      helper: "จำนวนรอบสนทนาที่อ้างอิงเอกสารนี้",
      id: "history-count",
      label: "ประวัติสนทนา",
      value: "2"
    }
  ],
  selectedDocumentId: "doc-lab-safety",
  suggestedPrompts: [
    {
      id: "prompt-checklist",
      prompt: "สรุป checklist ก่อนเข้าห้องปฏิบัติการให้เป็น 5 ข้อ"
    },
    {
      id: "prompt-quiz",
      prompt: "ข้อสอบควรถามเรื่องความปลอดภัยส่วนไหนมากที่สุด"
    },
    {
      id: "prompt-gap",
      prompt: "มีประเด็นไหนที่นักเรียนมักเข้าใจผิด"
    }
  ],
  summaryPanel: {
    summary:
      "เอกสารนี้เน้นการเตรียมตัวก่อนทดลอง การใช้อุปกรณ์ป้องกัน และขั้นตอนตอบสนองเมื่อเกิดเหตุผิดปกติ คำตอบของ AI ควรอ้างอิงกลับไปยัง chunk ของเอกสารทุกครั้ง",
    takeaways: [
      "ตรวจอุปกรณ์ป้องกันก่อนเริ่มงาน",
      "แจ้งครูทันทีเมื่อพบเหตุผิดปกติ",
      "บันทึกเหตุการณ์สำคัญเพื่อใช้ทบทวนก่อนควิซ"
    ],
    title: "สรุปประกอบคำตอบ"
  },
  workspaceName: "พื้นที่แชทกับเอกสาร"
};
