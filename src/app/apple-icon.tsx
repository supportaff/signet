import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 90,
          background: "#C24A2A",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.06em",
          border: "8px solid rgba(255,255,255,0.5)",
          boxSizing: "border-box",
        }}
      >
        S
      </div>
    ),
    size,
  );
}
