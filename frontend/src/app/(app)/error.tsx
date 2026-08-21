"use client";

type ProtectedRouteErrorProps = {
  reset: () => void;
};

const ProtectedRouteError = ({ reset }: ProtectedRouteErrorProps) => {
  return (
    <section
      aria-labelledby="protected-route-error-title"
      className="mx-auto flex min-h-[40vh] max-w-xl items-center justify-center rounded-2xl border border-error/20 bg-surface-container-lowest px-6 py-12 text-center"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-title-lg font-bold text-on-surface" id="protected-route-error-title">
            เปิดหน้านี้ไม่สำเร็จ
          </h2>
          <p className="text-body-md text-on-surface-variant">
            กรุณาลองใหม่อีกครั้ง โดยข้อมูลข้อผิดพลาดจะไม่แสดงในหน้านี้
          </p>
        </div>
        <button
          className="min-h-11 rounded-xl bg-primary px-5 py-2.5 text-label-md font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={reset}
          type="button"
        >
          ลองอีกครั้ง
        </button>
      </div>
    </section>
  );
};

export default ProtectedRouteError;
