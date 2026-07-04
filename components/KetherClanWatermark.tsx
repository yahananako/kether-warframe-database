export default function KetherClanWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        right: "7%",
        top: "44%",
        width: "min(28vw, 280px)",
        opacity: 0.055,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 1,
        mixBlendMode: "multiply"
      }}
    >
      <img
        src="/kether-clan-logo.png"
        alt=""
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          filter: "grayscale(100%) contrast(1.05)"
        }}
      />
    </div>
  );
}
