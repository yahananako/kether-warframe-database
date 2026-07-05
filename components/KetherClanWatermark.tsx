export default function KetherClanWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        marginTop: 26,
        display: "flex",
        justifyContent: "flex-end",
        pointerEvents: "none",
        userSelect: "none",
        opacity: 0.16
      }}
    >
      <img
        src="/kether-clan-logo.png"
        alt=""
        style={{
          width: "min(34vw, 170px)",
          maxWidth: "100%",
          height: "auto",
          display: "block",
          filter: "grayscale(100%) contrast(1.08)"
        }}
      />
    </div>
  );
}
