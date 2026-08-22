import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CloudLoom — the open-source cloud security graph";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF6EE",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 6,
              background: "#211B12",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ width: 30, height: 3, background: "#F6F2EB", borderRadius: 2, opacity: 0.6 }} />
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 4, height: 24, background: "#FF5CA8", borderRadius: 2 }} />
                <div style={{ width: 4, height: 24, background: "#FF5CA8", borderRadius: 2 }} />
              </div>
            </div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, color: "#211B12" }}>CloudLoom</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, lineHeight: 1.08, color: "#211B12", maxWidth: 900 }}>
            Find the paths that actually reach your data.
          </div>
          <div style={{ fontSize: 26, color: "#57503F" }}>
            Open-source security graph · attack paths · issue triage — free forever.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 21, color: "#8C8371" }}>
          <span style={{ color: "#D6246E", fontWeight: 700 }}>github.com/aryamthecodebreaker/CloudLoom</span>
          <span>·</span>
          <span>Apache-2.0</span>
          <span>·</span>
          <span>simulated-data demo</span>
        </div>
      </div>
    ),
    size
  );
}
