import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Are You In?";
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

const rethinkSansExtraBold = fetch(
  "https://fonts.gstatic.com/s/rethinksans/v7/AMODz4SDuXOMCPfdoglY9JQuWHBGG0X45DmqkuFWCE4.ttf",
).then((response) => response.arrayBuffer());

export async function createQuestionMarkIcon({
  height,
  width,
}: {
  height: number;
  width: number;
}) {
  const rethinkSansExtraBoldData = await rethinkSansExtraBold;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "transparent",
          color: "#92400e",
          display: "flex",
          fontFamily: "Rethink Sans",
          fontSize: Math.round(width * 0.78),
          fontWeight: 800,
          height: "100%",
          justifyContent: "center",
          lineHeight: 1,
          paddingBottom: Math.round(height * 0.045),
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
          name: "Rethink Sans",
          data: rethinkSansExtraBoldData,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}

export default async function Icon() {
  return createQuestionMarkIcon(size);
}
