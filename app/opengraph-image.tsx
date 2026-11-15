import { ImageResponse } from "next/og";

export const alt = "RE Journal — Real estate data, powered by scientific research";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BARS = [70, 120, 170, 135, 95, 60];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f7f7f4",
          color: "#0e0f10",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#0e0f10", display: "flex" }} />
          RE Journal
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>
              Real estate data, powered by scientific research
            </div>
            <div style={{ marginTop: 24, fontSize: 28, color: "#66665f" }}>
              Office · Retail · Warehousing · Residential — across India
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            {BARS.map((h, i) => (
              <div key={i} style={{ width: 34, height: h * 1.4, borderRadius: 6, background: i === 2 ? "#2448ff" : "#cfd4de" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
