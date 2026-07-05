export default function KetherClanWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        right: "7%",
        bottom: "9rem",
        width: "min(20vw, 180px)",
        opacity: 0.085,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 1
      }}
    >
      <img
        src="/kether-clan-logo.png"
        alt=""
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          filter: "grayscale(100%) contrast(1.12)"
        }}
      />
    </div>
  );
}
