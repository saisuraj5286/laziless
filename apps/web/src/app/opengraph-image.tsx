import { ImageResponse } from "next/og";

import { site } from "~/content/site";

export const alt = `${site.name}: tiny tasks to beat laziness`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social preview image, used by every page unless overridden. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 800, opacity: 0.9 }}>laziless</div>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, marginTop: 24, maxWidth: 950 }}>
          Beat laziness with tiny tasks.
        </div>
        <div style={{ fontSize: 34, marginTop: 28, opacity: 0.9, maxWidth: 950 }}>
          Drink water, stretch, climb stairs: one small nudge at a time.
        </div>
      </div>
    ),
    size,
  );
}
