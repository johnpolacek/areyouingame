import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Are You In?";
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

const rubik80sFade = fetch(
  "https://fonts.gstatic.com/s/rubik80sfade/v2/U9MF6dW37nLSmnwZXyoV-uPXUhHw.ttf",
).then((response) => response.arrayBuffer());

export async function createQuestionMarkIcon({
  height,
  width,
}: {
  height: number;
  width: number;
}) {
  const rubik80sFadeData = await rubik80sFade;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "transparent",
          color: "#92400e",
          display: "flex",
          fontFamily: "Rubik 80s Fade",
          fontSize: Math.round(width * 0.69),
          height: "100%",
          justifyContent: "center",
          lineHeight: 1,
          paddingBottom: Math.round(height * 0.02),
          width: "100%",
        }}
      >
        ?
      </div>
    ),
    {
      height,
      width,
      fonts: [
        {
          name: "Rubik 80s Fade",
          data: rubik80sFadeData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}

export default async function Icon() {
  return createQuestionMarkIcon(size);
}
