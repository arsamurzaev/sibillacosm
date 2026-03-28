import { ImageResponse } from "next/og";
import { siteDescription, siteName } from "@/lib/seo";

export const alt = `${siteName} — прайс эстетической косметологии и обучение`;
export const size = {
  width: 1200,
  height: 630,
};
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
          backgroundColor: "#faf8f5",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(201,168,124,0.35), transparent 42%), radial-gradient(circle at 12% 84%, rgba(107,23,40,0.22), transparent 45%)",
          padding: "64px",
          color: "#1a1614",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            alignItems: "center",
            padding: "10px 18px",
            borderRadius: "999px",
            border: "1px solid rgba(26,22,20,0.18)",
            fontSize: 20,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          SIBILLACOSM
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 940 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 74,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              fontWeight: 600,
            }}
          >
            Прайс косметологии
            <br />
            и отдельный раздел обучения
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: "rgba(26,22,20,0.78)" }}>
            {siteDescription}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
