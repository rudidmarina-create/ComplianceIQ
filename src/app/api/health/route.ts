import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    name: "ComplianceIQ API",
    version: "0.1.0",
  });
}
