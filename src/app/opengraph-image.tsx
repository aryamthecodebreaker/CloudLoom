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
          background: "#0A1633",
          padding: 72,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 560,
            height: 560,
            borderRadius: 999,
            background: "radial-gradient(closest-side, rgba(44,107,255,.45), transparent)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -80,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "radial-gradient(closest-side, rgba(255,79,154,.3), transparent)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#2C6BFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 34, height: 4, background: "#B9D0FF", borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 5, height: 30, background: "#FF4F9A", borderRadius: 4 }} />
              <div style={{ width: 5, height: 30, background: "#FF4F9A", borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Cloud<span style={{ color: "#7FA8FF" }}>Loom</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 62, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            See your cloud the way an attacker would.
          </div>
          <div style={{ fontSize: 28, color: "#94A9CC" }}>
            Open-source security graph · attack paths · issue triage — free forever.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "#7E93BC" }}>
          <span style={{ color: "#fff" }}>github.com/aryamthecodebreaker/CloudLoom</span>
          <span>·</span>
          <span>Apache-2.0</span>
          <span>·</span>
          <span>Simulated-data demo</span>
        </div>
      </div>
    ),
    size
  );
}
