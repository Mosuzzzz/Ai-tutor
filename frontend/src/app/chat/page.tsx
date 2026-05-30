import { MessageSquareText } from "lucide-react";

import { PlaceholderPage } from "../../features/foundation/PlaceholderPage";

export default function ChatPage() {
  return (
    <PlaceholderPage
      description="พื้นที่สำหรับแชทกับ AI Tutor ถามตอบเนื้อหา และต่อยอดเป็น session การเรียน"
      icon={MessageSquareText}
      title="แชท AI"
    />
  );
}
