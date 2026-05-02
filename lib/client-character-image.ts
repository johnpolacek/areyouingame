"use client";

import {
  characterImageContentType,
  maxCharacterImageBytes,
} from "./character-image";

const maxCharacterImageDimension = 1024;
const characterImageQuality = 0.82;

export async function resizeCharacterImageFile(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    maxCharacterImageDimension / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, characterImageContentType, characterImageQuality);
  });

  if (!blob) {
    throw new Error("Unable to prepare image.");
  }

  if (blob.size > maxCharacterImageBytes) {
    throw new Error("Character image is still too large after resizing.");
  }

  return blob;
}
