import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Nexus AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Your Nexus AI Login Code',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); border-radius: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #8b5cf6; font-size: 28px; margin: 0;">Nexus AI</h1>
                    <p style="color: #a1a1aa; margin-top: 10px;">Your intelligent companion</p>
                </div>
                
                <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 30px; text-align: center;">
                    <p style="color: #e4e4e7; font-size: 16px; margin: 0 0 20px 0;">Your verification code is:</p>
                    <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px 30px; border-radius: 12px; display: inline-block;">
                        ${otp}
                    </div>
                    <p style="color: #71717a; font-size: 14px; margin-top: 20px;">This code expires in 10 minutes</p>
                </div>
                
                <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 30px;">
                    If you didn't request this code, please ignore this email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
};
