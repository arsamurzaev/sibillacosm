import { ImageResponse } from "next/og";
import { siteName } from "@/lib/seo";

export const alt = `${siteName} — эстетическая косметология`;
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#faf8f5",
          backgroundImage:
            "radial-gradient(circle at 90% 10%, rgba(201,168,124,0.33), transparent 40%), radial-gradient(circle at 8% 88%, rgba(107,23,40,0.2), transparent 45%)",
          padding: "56px",
          color: "#1a1614",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontSize: 60,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            fontWeight: 600,
            maxWidth: 900,
          }}
        >
          SIBILLACOSM
          <br />
          Контурная пластика и обучение
        </div>
        <div
          style={{
            fontSize: 26,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "rgba(26,22,20,0.72)",
          }}
        >
          Грозный • Москва
        </div>
      </div>
    ),
    size,
  );
}
