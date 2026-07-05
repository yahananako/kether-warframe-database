export default function KetherClanWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        marginTop: "12px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        pointerEvents: "none",
        userSelect: "none"
      }}
    >
      <img
        src="/kether-clan-logo.png"
        alt=""
        style={{
          width: "96px",
          height: "96px",
          objectFit: "contain",
          opacity: 0.22,
          filter: "grayscale(100%) contrast(1.12)"
        }}
      />
    </div>
  );
}
