export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #1a1020 0%, #0a0a0f 70%)",
        }}
      />

      <div className="noise-texture absolute inset-0" />

      <div className="absolute top-[15%] left-[20%] h-72 w-72 rounded-full bg-rose-gold/5 blur-[100px] animate-float-slow" />
      <div className="absolute top-[60%] right-[15%] h-56 w-56 rounded-full bg-rose-light/5 blur-[80px] animate-float-medium" />
      <div className="absolute top-[40%] left-[65%] h-64 w-64 rounded-full bg-rose-muted/4 blur-[90px] animate-float-drift" />
    </div>
  );
}
