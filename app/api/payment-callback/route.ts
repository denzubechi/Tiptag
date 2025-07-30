// app/api/payment-callback/route.ts
import { NextResponse } from "next/server";
import { getPaymentStatus } from "@base-org/account";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("id");

  if (!paymentId) {
    return NextResponse.json(
      { message: "Missing payment ID" },
      { status: 400 }
    );
  }

  try {
    const { status } = await getPaymentStatus({ id: paymentId });

    console.log(
      `Received callback for payment ID: ${paymentId}, Status: ${status}`
    );

    return NextResponse.json({
      message: `Received callback for payment ID: ${paymentId}, Status: ${status}`,
      paymentId,
      status,
    });
  } catch (error: any) {
    console.error(`Error processing payment callback: ${error.message}`);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
