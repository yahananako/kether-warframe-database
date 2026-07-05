export default function KetherClanWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        right: "28px",
        top: "72px",
        width: "min(26vw, 150px)",
        opacity: 0.105,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 0
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
