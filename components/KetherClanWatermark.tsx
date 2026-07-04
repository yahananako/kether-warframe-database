export default function KetherClanWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: "50%",
        top: "52%",
        transform: "translate(-50%, -50%)",
        width: "min(62vw, 620px)",
        opacity: 0.12,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 6,
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
          filter: "grayscale(100%) contrast(1.08)"
        }}
      />
    </div>
  );
}
