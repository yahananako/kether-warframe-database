export default function KetherClanWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: "50%",
        top: "56%",
        transform: "translate(-50%, -50%)",
        width: "min(58vw, 560px)",
        maxWidth: "560px",
        opacity: 0.065,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 0,
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
