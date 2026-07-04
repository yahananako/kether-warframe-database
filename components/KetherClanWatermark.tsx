export default function KetherClanWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        right: "5.5%",
        top: "58%",
        transform: "translateY(-50%)",
        width: "min(22vw, 220px)",
        opacity: 0.105,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 7
      }}
    >
      <img
        src="/kether-clan-logo.png"
        alt=""
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          filter: "grayscale(100%) contrast(1.15)"
        }}
      />
    </div>
  );
}
