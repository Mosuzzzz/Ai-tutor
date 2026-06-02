import type { QuizGeneratorViewModel } from "./types";

export const aiQuizGeneratorMock: QuizGeneratorViewModel = {
  detailEndpointPattern: "/api/exams/{exam_id}",
  draft: {
    file_id: "doc-lab-safety",
    generatedAtLabel: "สร้างแบบร่างล่าสุด 2 มิ.ย. 2026",
    id: "exam-lab-safety-draft",
    questions: [
      {
        citation: {
          chunk_index: 1,
          file_id: "doc-lab-safety",
          filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
          matched_text: "ตรวจอุปกรณ์ป้องกันก่อนเริ่มทดลอง"
        },
        id: "question-ppe",
        options: [
          {
            id: "option-ppe-a",
            label: "แว่นตา ถุงมือ และพื้นที่ทำงาน"
          },
          {
            id: "option-ppe-b",
            label: "เลือกคู่ทดลองก่อนอ่านคู่มือ"
          },
          {
            id: "option-ppe-c",
            label: "เริ่มผสมสารเคมีเพื่อประหยัดเวลา"
          },
          {
            id: "option-ppe-d",
            label: "เก็บบันทึกผลไว้หลังจบทุกขั้นตอน"
          }
        ],
        question_text: "ก่อนเริ่มทดลองควรตรวจสอบสิ่งใดเป็นอันดับแรก"
      },
      {
        citation: {
          chunk_index: 3,
          file_id: "doc-lab-safety",
          filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
          matched_text: "แจ้งครูผู้ดูแลทันทีเมื่อพบเหตุผิดปกติ"
        },
        id: "question-incident",
        options: [
          {
            id: "option-incident-a",
            label: "แจ้งครูผู้ดูแลและหยุดกิจกรรม"
          },
          {
            id: "option-incident-b",
            label: "ย้ายสารเคมีออกจากห้องด้วยตัวเอง"
          },
          {
            id: "option-incident-c",
            label: "รอจนจบบทเรียนแล้วค่อยรายงาน"
          },
          {
            id: "option-incident-d",
            label: "ข้ามขั้นตอนบันทึกเหตุการณ์"
          }
        ],
        question_text: "เมื่อพบเหตุผิดปกติในห้องปฏิบัติการควรทำอย่างไร"
      }
    ],
    status: "draft",
    title: "ควิซความปลอดภัยห้องปฏิบัติการ"
  },
  generateEndpoint: "/api/exams/generate",
  instructions: [
    "เน้นคำถามที่วัดความเข้าใจ ไม่ใช่ท่องจำคำจากเอกสาร",
    "ทุกคำถามต้องผูกกับ citation จากเอกสาร",
    "ไม่แสดงเฉลยในหน้าผู้เรียนก่อนตรวจสิทธิ์"
  ],
  metrics: [
    {
      helper: "ตามขอบเขตที่ระบบรองรับ",
      id: "question-count",
      label: "คำถามในชุด",
      value: "5"
    },
    {
      helper: "เฉลี่ยสำหรับผู้เรียนก่อนทำควิซจริง",
      id: "duration",
      label: "เวลาโดยประมาณ",
      value: "8 นาที"
    },
    {
      helper: "แหล่งข้อมูลที่พร้อมสร้างแบบทดสอบ",
      id: "ready-sources",
      label: "แหล่งพร้อมใช้",
      value: "2"
    }
  ],
  publishEndpointPattern: "/api/exams/{exam_id}/publish",
  request: {
    difficulty: "medium",
    file_id: "doc-lab-safety",
    num_questions: 5
  },
  selectedSourceId: "doc-lab-safety",
  sources: [
    {
      id: "doc-lab-safety",
      questionCountRecommendation: 5,
      status: "ready",
      summary: "สร้างควิซจาก checklist ความปลอดภัย อุปกรณ์ป้องกัน และขั้นตอนฉุกเฉิน",
      title: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
      type: "document",
      updatedAt: "2026-06-01T09:00:00.000Z",
      updatedAtLabel: "อัปเดต 1 มิ.ย. 2026"
    },
    {
      id: "doc-ai-ethics",
      questionCountRecommendation: 10,
      status: "ready",
      summary: "สร้างควิซจากหลักการใช้ AI อย่างรับผิดชอบ",
      title: "แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf",
      type: "document",
      updatedAt: "2026-05-31T09:00:00.000Z",
      updatedAtLabel: "อัปเดต 31 พ.ค. 2026"
    },
    {
      id: "doc-digestive-system",
      questionCountRecommendation: 5,
      status: "processing",
      summary: "รอเอกสารประมวลผลเสร็จก่อนสร้างควิซ",
      title: "บทนำระบบย่อยอาหาร.pdf",
      type: "document",
      updatedAt: "2026-05-30T09:00:00.000Z",
      updatedAtLabel: "กำลังประมวลผล"
    }
  ],
  workspaceName: "AI Quiz Workspace"
};
