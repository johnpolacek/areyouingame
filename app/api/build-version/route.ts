import { NextResponse } from "next/server";
import { BUILD_VERSION } from "@/lib/build-version";

export function GET() {
  return NextResponse.json(BUILD_VERSION);
}
