import nodemailer from "nodemailer";
import { wrapHtmlContent } from "./emailLayout.ts"; // Import the wrapper

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, bodyContent: string): Promise<void> => {
    try {
        // Wrap the simple content in your predefined HTML
        const finalHtml = wrapHtmlContent(bodyContent);

        const info = await transporter.sendMail({
            from: `"Job Scheduler" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html: finalHtml, // Send the full formatted HTML
        });

        console.log("Email sent successfully: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email delivery failed");
    }
};