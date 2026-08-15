import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0C0B09",
          color: "#F4EFE4",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: "#C24A2A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Georgia, serif",
              fontSize: 26,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 28 }}>SelfSignedCert</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, lineHeight: 0.95, fontFamily: "Georgia, serif", maxWidth: 900 }}>
            Certificates, forged locally.
          </div>
          <div style={{ fontSize: 28, color: "#D7CFC0", maxWidth: 820 }}>
            Private keys never leave the browser. We store nothing we could leak.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
