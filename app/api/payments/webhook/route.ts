import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Mock databases
const payments: any[] = [];
const users: any[] = [];

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    // In production, verify webhook signature from Base Pay
    const webhookData = await request.json();

    const { payment_id, status, amount, tip_tag, message, tipper_name } =
      webhookData;

    if (status === "completed") {
      // Update payment status
      const payment = {
        id: payment_id,
        tipTag: tip_tag,
        amount: amount / 100, // Convert from cents
        message,
        tipperName: tipper_name || "Anonymous",
        status: "completed",
        completedAt: new Date().toISOString(),
      };

      payments.push(payment);

      // Find creator
      const creator = users.find((user) => user.tipTag === tip_tag);
      if (creator) {
        // Update creator's total tips
        creator.totalTips = (creator.totalTips || 0) + payment.amount;
        creator.tipCount = (creator.tipCount || 0) + 1;

        // Send notification email to creator
        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: creator.email,
          subject: `New Tip Received - $${payment.amount}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #7c3aed;">You received a new tip! 🎉</h1>
              <p>Hi ${creator.displayName},</p>
              <p>Great news! You just received a tip of <strong>$${
                payment.amount
              }</strong>.</p>
              ${
                message
                  ? `<p><strong>Message from supporter:</strong><br><em>"${message}"</em></p>`
                  : ""
              }
              <p><strong>From:</strong> ${payment.tipperName}</p>
              <p>Keep up the amazing work!</p>
              <hr>
              <p style="color: #666; font-size: 12px;">
                This notification was sent by tiptag. You can manage your notification preferences in your dashboard.
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
