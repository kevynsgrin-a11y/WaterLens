import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Home-screen icon, generated at build time. The manifest advertises this path,
 * so without it every page load 404s on the icon request.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #1b3e59 0%, #112232 100%)",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 28 28" fill="none">
          <circle cx="13" cy="13" r="8.5" stroke="#7cb6d8" strokeWidth="1.9" />
          <path
            d="M13 8.5c1.9 2.2 3 3.9 3 5.4a3 3 0 1 1-6 0c0-1.5 1.1-3.2 3-5.4Z"
            fill="#4fa17f"
          />
          <path
            d="m19.5 19.5 4 4"
            stroke="#7cb6d8"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size
  );
}
