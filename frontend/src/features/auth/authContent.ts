import type { LoginInput, RegisterInput } from "./types";

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
  password: ""
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
    shellHeadline: "กลับเข้าสู่พื้นที่เรียนรู้ของคุณ",
    shellDescription: "พื้นที่เข้าสู่ระบบที่เรียบง่าย ปลอดภัย และพร้อมเชื่อม backend เมื่อทีม API เปิดใช้งาน",
    submitLabel: "เข้าสู่ระบบ",
    divider: "หรือเข้าสู่ระบบด้วย",
    footerPrompt: "ยังไม่มีบัญชี?",
    footerLink: "สมัครสมาชิก",
    forgotPassword: "ลืมรหัสผ่าน?"
  },
  register: {
    eyebrow: "พื้นที่เรียนส่วนตัว",
    heading: "สร้างบัญชีใหม่",
    intro: "สร้างพื้นที่ของคุณสำหรับอัปโหลดเอกสาร สรุปบทเรียน ถาม AI และทำควิซทบทวน",
    shellHeadline: "พื้นที่เรียนรู้ AI ส่วนตัวของคุณ",
    shellDescription: "เริ่มจากบัญชีเดียว ใช้งานเอกสาร แชท และควิซได้ในพื้นที่เรียนรู้ส่วนตัว โดยไม่ต้องเลือกบทบาท",
    submitLabel: "สมัครสมาชิก",
    divider: "หรือสมัครสมาชิกด้วย",
    footerPrompt: "มีบัญชีอยู่แล้ว?",
    footerLink: "เข้าสู่ระบบ",
    termsLabel: "ฉันยอมรับข้อตกลงและเงื่อนไขการใช้งาน"
  },
  socialUnavailableSuffix: "ยังไม่เปิดใช้งาน"
} as const;
