import { FileText } from "lucide-react";

import { PlaceholderPage } from "../../features/foundation/PlaceholderPage";

export default function DocumentsPage() {
  return (
    <PlaceholderPage
      description="ฐานหน้าสำหรับอัปโหลดเอกสาร สร้างสรุป และแยกประเด็นสำคัญจากไฟล์เรียน"
      icon={FileText}
      title="สรุปเอกสาร"
    />
  );
}
