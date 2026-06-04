import type { AuthRole, LoginInput, RegisterInput } from "./types";

export const AUTH_VISUAL_SLIDES = [
  "/auth/login-slide-1.webp",
  "/auth/login-slide-2.webp",
  "/auth/login-slide-3.webp"
] as const;

export const INITIAL_LOGIN_FORM: LoginInput = {
  email: "",
  password: ""
};

export const INITIAL_REGISTER_FORM: RegisterInput = {
  acceptedTerms: false,
  confirmPassword: "",
  email: "",
  fullName: "",
  password: "",
  role: "student"
};

export const AUTH_MESSAGES = {
  genericError: "ไม่สามารถดำเนินการได้ในขณะนี้",
  loginSubmitting: "กำลังตรวจสอบข้อมูลเข้าสู่ระบบ",
  loginSuccess: "เข้าสู่ระบบสำเร็จ",
  registerSubmitting: "กำลังตรวจสอบข้อมูลสมัครสมาชิก",
  registerSuccess: "สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
} as const;

export const AUTH_COPY = {
  login: {
    heading: "AI Tutor",
    intro: "เข้าสู่ระบบเพื่อดำเนินการต่อ",
    shellHeadline: "Learn with clarity, safely.",
    shellDescription: "พื้นที่เข้าสู่ระบบที่เรียบง่าย ปลอดภัย และพร้อมเชื่อม backend เมื่อทีม API เปิดใช้งาน",
    submitLabel: "เข้าสู่ระบบ",
    divider: "หรือเข้าสู่ระบบด้วย",
    footerPrompt: "ยังไม่มีบัญชี?",
    footerLink: "สมัครสมาชิก",
    forgotPassword: "ลืมรหัสผ่าน?"
  },
  register: {
    eyebrow: "AI Tutor onboarding",
    heading: "สร้างบัญชีใหม่",
    intro: "เริ่มต้นการเรียนรู้ด้วยพลังของ AI ไปกับเรา",
    shellHeadline: "Empower Your Learning",
    shellDescription: "เลือกเส้นทางของคุณ แล้วเริ่มสร้างพื้นที่เรียนรู้ที่ AI ช่วยจัดระเบียบทุกบทเรียน",
    submitLabel: "สมัครสมาชิก",
    divider: "หรือสมัครสมาชิกด้วย",
    footerPrompt: "มีบัญชีอยู่แล้ว?",
    footerLink: "เข้าสู่ระบบ",
    roleLegend: "เลือกบทบาทของคุณ",
    roleFallback: "เลือกเส้นทางของคุณ",
    termsLabel: "ฉันยอมรับข้อตกลงและเงื่อนไขการใช้งาน"
  },
  socialUnavailableSuffix: "ยังไม่เปิดใช้งาน"
} as const;

export const AUTH_ROLE_LABELS: Record<AuthRole, string> = {
  student: "เส้นทางนักเรียน",
  teacher: "เส้นทางผู้สอน"
};

export const AUTH_ROLE_DESCRIPTIONS: Record<AuthRole, string> = {
  student: "เตรียมพื้นที่สำหรับเรียน ทบทวน และถาม AI Tutor",
  teacher: "เตรียมพื้นที่สำหรับสร้างบทเรียนและดูแลผู้เรียน"
};
