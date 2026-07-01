import type { DocumentSummaryViewModel } from "./types";

export const documentSummaryMock: DocumentSummaryViewModel = {
  apiEndpoint: "/api/files/dashboard",
  apiResponse: {
    documents: [
      {
        created_at: "2026-05-31T09:00:00.000Z",
        filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
        id: "doc-lab-safety",
        related_exams_count: 3,
        status: "ready",
        summary_available: true,
        summary_markdown:
          "## ภาพรวม\nเอกสารนี้สรุปแนวทางความปลอดภัยก่อนเข้าห้องปฏิบัติการ การใช้อุปกรณ์ป้องกัน และขั้นตอนตอบสนองเมื่อเกิดเหตุฉุกเฉิน\n\n## หัวข้อสำคัญ\n- ตรวจสอบอุปกรณ์ป้องกันส่วนบุคคลก่อนเริ่มทดลอง\n- บันทึกเหตุการณ์ผิดปกติทันที\n- แจ้งครูผู้ดูแลก่อนเคลื่อนย้ายสารเคมี\n\n## ข้อควรจำ\nผู้เรียนควรทบทวน checklist ก่อนทำ quiz และใช้ AI Chat ถามจุดที่ยังไม่เข้าใจ",
        uploaded_by: "อาจารย์ปภาวี"
      },
      {
        created_at: "2026-05-30T08:00:00.000Z",
        filename: "แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf",
        id: "doc-ai-ethics",
        related_exams_count: 2,
        status: "ready",
        summary_available: true,
        summary_markdown:
          "## ภาพรวม\nเอกสารนี้อธิบายการใช้ AI ในชั้นเรียนอย่างรับผิดชอบ โดยเน้นความโปร่งใส ความเป็นส่วนตัว และการอ้างอิงแหล่งข้อมูล\n\n## หัวข้อสำคัญ\n- ความโปร่งใสในการใช้ AI\n- การไม่ส่งข้อมูลส่วนตัวของผู้เรียนเข้าเครื่องมือที่ไม่ได้รับอนุญาต\n- การตรวจทานคำตอบ AI ด้วยหลักฐานจากบทเรียน\n\n## ข้อควรจำ\nAI เป็นผู้ช่วยเรียน ไม่ใช่ผู้ตัดสินคำตอบสุดท้ายของผู้เรียน",
        uploaded_by: "อาจารย์ธนา"
      },
      {
        created_at: "2026-05-29T07:30:00.000Z",
        filename: "บทนำระบบย่อยอาหาร.pdf",
        id: "doc-digestive-system",
        related_exams_count: 0,
        status: "processing",
        summary_available: false,
        summary_markdown: null,
        uploaded_by: "อาจารย์มนัส"
      },
      {
        created_at: "2026-05-28T06:15:00.000Z",
        filename: "แบบฝึกหัดเก่าไม่มีข้อความ.pdf",
        id: "doc-ocr-error",
        related_exams_count: 0,
        status: "error",
        summary_available: false,
        summary_markdown: null,
        uploaded_by: "อาจารย์ปภาวี"
      }
    ],
    status_counts: {
      error: 1,
      pending: 0,
      processing: 1,
      ready: 2
    },
    total_documents: 4
  },
  detailEndpointPattern: "/api/files/{file_id}/detail",
  documentDetails: [
    {
      detailedBreakdown: [
        {
          body: "เตรียมแว่นตา ถุงมือ เสื้อกาวน์ และตรวจพื้นที่ทำงานให้ไม่มีสารตกค้างก่อนเริ่มทดลอง",
          id: "prep",
          title: "ก่อนเริ่มทดลอง"
        },
        {
          body: "หากสารเคมีหก ต้องหยุดกิจกรรม แจ้งครูผู้ดูแล และใช้ชุดทำความสะอาดตามประเภทของสาร",
          id: "incident",
          title: "เมื่อเกิดเหตุผิดปกติ"
        },
        {
          body: "บันทึกผลและเหตุการณ์สำคัญในสมุดปฏิบัติการ เพื่อใช้ทบทวนก่อนทำแบบทดสอบ",
          id: "record",
          title: "การบันทึกหลังทดลอง"
        }
      ],
      filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
      generatedAtLabel: "สร้างสรุปล่าสุด 31 พ.ค. 2026",
      id: "doc-lab-safety",
      keyTopics: [
        {
          confidencePercent: 96,
          id: "ppe",
          title: "อุปกรณ์ป้องกันส่วนบุคคล"
        },
        {
          confidencePercent: 92,
          id: "chemical",
          title: "การจัดการสารเคมี"
        },
        {
          confidencePercent: 89,
          id: "emergency",
          title: "ขั้นตอนฉุกเฉิน"
        }
      ],
      relatedDocuments: [
        {
          filename: "แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf",
          href: "/documents",
          id: "doc-ai-ethics",
          status: "ready"
        },
        {
          filename: "บทนำระบบย่อยอาหาร.pdf",
          href: "/documents",
          id: "doc-digestive-system",
          status: "processing"
        }
      ],
      summaryMarkdown:
        "## ภาพรวม\nเอกสารนี้สรุปแนวทางความปลอดภัยก่อนเข้าห้องปฏิบัติการ การใช้อุปกรณ์ป้องกัน และขั้นตอนตอบสนองเมื่อเกิดเหตุฉุกเฉิน\n\n## หัวข้อสำคัญ\n- ตรวจสอบอุปกรณ์ป้องกันส่วนบุคคลก่อนเริ่มทดลอง\n- บันทึกเหตุการณ์ผิดปกติทันที\n- แจ้งครูผู้ดูแลก่อนเคลื่อนย้ายสารเคมี\n\n## ข้อควรจำ\nผู้เรียนควรทบทวน checklist ก่อนทำ quiz และใช้ AI Chat ถามจุดที่ยังไม่เข้าใจ",
      canUseAiActions: true,
      summaryQuality: "document-derived",
      uploadedByLabel: "อัปโหลดโดย อาจารย์ปภาวี"
    },
    {
      detailedBreakdown: [
        {
          body: "ผู้เรียนควรระบุเมื่อใช้ AI ช่วยร่างคำตอบหรือสรุป และต้องตรวจทานความถูกต้องเสมอ",
          id: "transparency",
          title: "ความโปร่งใสในการใช้ AI"
        },
        {
          body: "ไม่ควรส่งชื่อ เบอร์โทร คะแนน หรือข้อมูลส่วนตัวของผู้เรียนเข้าเครื่องมือที่ยังไม่ได้รับอนุญาต",
          id: "privacy",
          title: "การปกป้องข้อมูลส่วนตัว"
        },
        {
          body: "คำตอบที่สร้างโดย AI ควรผูกกลับไปยังหลักฐานจากเอกสารหรือบทเรียนก่อนนำไปใช้",
          id: "grounding",
          title: "การตรวจหลักฐาน"
        }
      ],
      filename: "แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf",
      generatedAtLabel: "สร้างสรุปล่าสุด 30 พ.ค. 2026",
      id: "doc-ai-ethics",
      keyTopics: [
        {
          confidencePercent: 94,
          id: "transparent-ai",
          title: "ความโปร่งใสในการใช้ AI"
        },
        {
          confidencePercent: 91,
          id: "privacy",
          title: "ความเป็นส่วนตัวของผู้เรียน"
        },
        {
          confidencePercent: 88,
          id: "evidence",
          title: "การอ้างอิงหลักฐาน"
        }
      ],
      relatedDocuments: [
        {
          filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
          href: "/documents",
          id: "doc-lab-safety",
          status: "ready"
        }
      ],
      summaryMarkdown:
        "## ภาพรวม\nเอกสารนี้อธิบายการใช้ AI ในชั้นเรียนอย่างรับผิดชอบ โดยเน้นความโปร่งใส ความเป็นส่วนตัว และการอ้างอิงแหล่งข้อมูล\n\n## หัวข้อสำคัญ\n- ความโปร่งใสในการใช้ AI\n- การไม่ส่งข้อมูลส่วนตัวของผู้เรียนเข้าเครื่องมือที่ไม่ได้รับอนุญาต\n- การตรวจทานคำตอบ AI ด้วยหลักฐานจากบทเรียน\n\n## ข้อควรจำ\nAI เป็นผู้ช่วยเรียน ไม่ใช่ผู้ตัดสินคำตอบสุดท้ายของผู้เรียน",
      canUseAiActions: true,
      summaryQuality: "document-derived",
      uploadedByLabel: "อัปโหลดโดย อาจารย์ธนา"
    }
  ],
  generatedAtLabel: "ข้อมูลตัวอย่างล่าสุด 31 พ.ค. 2026",
  recapEndpointPattern: "/api/recap/{file_id}",
  selectedDocumentId: "doc-lab-safety",
  workspaceName: "คลังเอกสาร AI Tutor"
};
