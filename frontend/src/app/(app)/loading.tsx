const ProtectedRouteLoading = () => {
  return (
    <div
      aria-live="polite"
      className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-primary/10 bg-surface-container-lowest px-6 text-center"
      role="status"
    >
      <div className="space-y-3">
        <span
          aria-hidden="true"
          className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none"
        />
        <p className="text-body-md text-on-surface-variant">กำลังเปิดพื้นที่เรียน...</p>
      </div>
    </div>
  );
};

export default ProtectedRouteLoading;
