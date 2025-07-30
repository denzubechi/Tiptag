import { type NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const { tipTag } = await request.json();

    if (!tipTag) {
      return NextResponse.json(
        { error: "Tip tag is required" },
        { status: 400 }
      );
    }

    const tipUrl = `https://tiptag.com/tip/${tipTag}`;

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(tipUrl, {
      type: "png",
      width: 400,
      margin: 2,
      color: {
        dark: "#8b5cf6", // Purple color
        light: "#ffffff", // White background
      },
    });

    return new NextResponse(qrCodeBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${tipTag}-qr-code.png"`,
      },
    });
  } catch (error) {
    console.error("QR code generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
