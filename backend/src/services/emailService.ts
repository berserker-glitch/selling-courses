import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS?.trim() // Trim to remove potential trailing spaces
    }
});

export const sendStudentCredentials = async (email: string, name: string, password: string) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Welcome to Your Course Platform - Student Account Created',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden; border: 1px solid #30363d;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 1px solid #30363d;">
                        <h1 style="color: #3b82f6; font-size: 24px; margin: 0; font-weight: 700;">Welcome to Scolink</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px;">
                        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Hello ${name},</h2>
                        <p style="color: #8b949e; line-height: 1.6;">Your student account has been successfully created. You can now access your courses and start learning.</p>
                        
                        <div style="background-color: #161b22; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #30363d;">
                            <p style="margin: 8px 0; color: #8b949e; font-size: 14px;">Email</p>
                            <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 16px; font-weight: 600;">${email}</p>
                            
                            <p style="margin: 8px 0; color: #8b949e; font-size: 14px;">Temporary Password</p>
                            <div style="background-color: #0d1117; padding: 12px; border-radius: 6px; border: 1px solid #30363d; font-family: monospace; font-size: 18px; color: #3b82f6; letter-spacing: 1px;">
                                ${password}
                            </div>
                        </div>

                        <p style="color: #8b949e; line-height: 1.6; font-size: 14px;">For your security, we recommend changing your password after your first login.</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                           <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #238636; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Access Portal</a>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="padding: 20px; text-align: center; background-color: #161b22; border-top: 1px solid #30363d;">
                        <p style="font-size: 12px; color: #484f58; margin: 0;">&copy; ${new Date().getFullYear()} Scolink. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Reset Your Password - Academy',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden; border: 1px solid #30363d;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 1px solid #30363d;">
                        <h1 style="color: #3b82f6; font-size: 24px; margin: 0; font-weight: 700;">Password Reset Request</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px;">
                        <p style="color: #8b949e; line-height: 1.6;">You requested to reset your password. Click the button below to set a new password. This link is valid for 1 hour.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                           <a href="${resetLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Reset Password</a>
                        </div>

                        <p style="color: #484f58; font-size: 12px; line-height: 1.6;">Or copy this link to your browser:<br> <span style="color: #3b82f6;">${resetLink}</span></p>

                        <p style="color: #8b949e; line-height: 1.6; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="padding: 20px; text-align: center; background-color: #161b22; border-top: 1px solid #30363d;">
                        <p style="font-size: 12px; color: #484f58; margin: 0;">&copy; ${new Date().getFullYear()} Academy. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Reset email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending reset email:', error);
        return false;
    }
};
