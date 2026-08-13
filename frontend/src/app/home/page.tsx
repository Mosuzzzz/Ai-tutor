import Link from "next/link";

import { AiTutorLogo } from "@/components/brand/AiTutorLogo";

const PublicHomePage = () => {
  return (
    <main className="flex min-h-screen items-center bg-surface px-4 py-10 text-on-surface sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-12 text-center shadow-card sm:px-10 sm:py-16">
        <AiTutorLogo className="mx-auto h-24 w-full max-w-[260px]" priority sizes="260px" />
        <p className="mt-8 text-label-md font-bold uppercase tracking-[0.18em] text-primary">AI Tutor</p>
        <h1 className="mt-3 text-headline-lg text-on-surface">หน้า Home อยู่ระหว่างการออกแบบใหม่</h1>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-on-surface-variant">
          พื้นที่หลักสำหรับเริ่มต้นการเรียนรู้ด้วยเอกสาร AI Chat ควิซ และสถิติการทบทวนกำลังจะมาเร็ว ๆ นี้
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded bg-primary px-6 py-3 text-label-md font-bold text-on-primary transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
            href="/login"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest px-6 py-3 text-label-md font-bold text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
            href="/register"
          >
            สมัครสมาชิก
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PublicHomePage;
