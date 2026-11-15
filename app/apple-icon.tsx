import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the RE Journal bars mark, full-bleed (iOS rounds the corners itself). */
export default function AppleIcon() {
  const bars = [
    { left: 45, top: 96, height: 39 },
    { left: 79, top: 68, height: 67 },
    { left: 113, top: 45, height: 90 },
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0e0f10" }}>
        {bars.map((b) => (
          <div
            key={b.left}
            style={{ position: "absolute", left: b.left, top: b.top, width: 22, height: b.height, borderRadius: 7, background: "#fff" }}
          />
        ))}
        <div style={{ position: "absolute", left: 127, top: 26, width: 22, height: 22, borderRadius: 11, background: "#2448ff" }} />
      </div>
    ),
    size,
  );
}
