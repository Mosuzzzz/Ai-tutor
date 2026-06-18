import type { LoginInput, RegisterInput } from "./types";

export const AUTH_ILLUSTRATION_IMAGE = "/auth/Gemini_Generated_Image_wwfdchwwfdchwwfd.png";

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
    submitLabel: "สมัครสมาชิก",
    divider: "หรือสมัครสมาชิกด้วย",
    footerPrompt: "มีบัญชีอยู่แล้ว?",
    footerLink: "เข้าสู่ระบบ",
    termsLabel: "ฉันยอมรับข้อตกลงและเงื่อนไขการใช้งาน"
  },
  socialUnavailableSuffix: "ยังไม่เปิดใช้งาน"
} as const;
