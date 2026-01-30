import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS?.trim()
    }
});

async function main() {
    console.log('Testing Email Configuration...');
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`SMTP User: ${process.env.SMTP_USER}`);
    console.log(`SMTP Port: ${process.env.SMTP_PORT}`);

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to self for testing
            subject: 'Test Email from Backend',
            text: 'If you receive this, the email configuration is working.',
            html: '<b>If you receive this, the email configuration is working.</b>'
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error occurred while sending email:');
        console.error(error);
    }
}

main().catch(console.error);
