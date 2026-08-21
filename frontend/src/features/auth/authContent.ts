import type { LoginInput, RegisterInput } from "./types";

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
  emailVerificationRequired: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
  genericError: "ไม่สามารถดำเนินการได้ในขณะนี้",
  loginSubmitting: "กำลังตรวจสอบข้อมูลเข้าสู่ระบบ",
  loginSuccess: "เข้าสู่ระบบสำเร็จ",
  registerSubmitting: "กำลังตรวจสอบข้อมูลสมัครสมาชิก",
  registerSuccess: "สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
} as const;

export const AUTH_FEEDBACK = {
  login: {
    invalidCredentials: {
      detail: "ตรวจสอบข้อมูลแล้วลองอีกครั้ง",
      title: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
    },
    redirecting: "กำลังพาคุณไปยังพื้นที่เรียน...",
    success: "เข้าสู่ระบบสำเร็จ",
    unavailable: {
      detail: "กรุณาลองใหม่อีกครั้งในภายหลัง",
      title: "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้"
    }
  },
  register: {
    invalidInput: {
      detail: "กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง",
      title: "ไม่สามารถสมัครสมาชิกได้"
    },
    success: "สมัครสมาชิกสำเร็จ",
    unavailable: {
      detail: "กรุณาลองใหม่อีกครั้งในภายหลัง",
      title: "ไม่สามารถสมัครสมาชิกได้ในขณะนี้"
    },
    verified: "บัญชีของคุณพร้อมแล้ว กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน",
    verificationRequired: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ"
  }
} as const;

export const AUTH_COPY = {
  common: {
    backHomeLabel: "กลับหน้าแรก"
  },
  login: {
    heading: "ยินดีต้อนรับกลับมา",
    intro: "เข้าสู่ระบบเพื่อกลับไปยังพื้นที่เรียนส่วนตัวของคุณ",
    submitLabel: "เข้าสู่ระบบ",
    loadingLabel: "กำลังเข้าสู่ระบบ...",
    redirectingLabel: "กำลังพาไปยังพื้นที่เรียน...",
    footerPrompt: "ยังไม่มีบัญชี?",
    footerLink: "สมัครสมาชิก"
  },
  register: {
    heading: "สร้างพื้นที่เรียนของคุณ",
    intro: "สร้างพื้นที่ของคุณสำหรับอัปโหลดเอกสาร สรุปบทเรียน ถาม AI และทำควิซทบทวน",
    submitLabel: "สมัครสมาชิก",
    loadingLabel: "กำลังสร้างบัญชี...",
    passwordRequirement: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    footerPrompt: "มีบัญชีอยู่แล้ว?",
    footerLink: "เข้าสู่ระบบ",
    termsLabel: "ฉันยอมรับเงื่อนไขการใช้งานของ AI Tutor"
  }
} as const;
