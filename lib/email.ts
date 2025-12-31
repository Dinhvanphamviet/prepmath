import nodemailer from 'nodemailer';


// Helper to get transporter (lazy load for test account)
async function getTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback: Create Ethereal Test Account
    console.log("No SMTP config found, creating Ethereal test account...");
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}


export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    try {
        const transporter = await getTransporter();

        const info = await transporter.sendMail({
            from: '"Prep HSA Support" <support@prephsa.com>', // sender address
            to: email, // list of receivers
            subject: 'Yêu cầu đặt lại mật khẩu', // Subject line
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #7c3aed; text-decoration: none; }
                .content { margin-bottom: 30px; }
                .button-container { text-align: center; margin: 30px 0; }
                .button { display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s; }
                .button:hover { background-color: #6d28d9; }
                .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                .link-fallback { word-break: break-all; color: #7c3aed; font-size: 14px; }
            </style>
        </head>
        <body style="background-color: #f8fafc; padding: 40px 0;">
            <div class="container">
                <div class="header">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="logo">Prep HSA</a>
                </div>
                <div class="content">
                    <h2 style="color: #1e293b; margin-top: 0;">Yêu cầu đặt lại mật khẩu</h2>
                    <p>Xin chào,</p>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Prep HSA của bạn.</p>
                    <p>Vui lòng nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu:</p>
                    
                    <div class="button-container">
                        <a href="${resetLink}" class="button" target="_blank">Đặt lại mật khẩu</a>
                    </div>
                    
                    <p>Link này sẽ hết hạn sau 1 giờ.</p>
                    <p>Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email và tài khoản của bạn vẫn được bảo mật.</p>
                </div>
            </div>
        </body>
        </html>
      `, // html body
        });

        console.log("Message sent: %s", info.messageId);

        // Preview URL detection
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log("========================================");
            console.log("📧 EMAIL PREVIEW URL (Click to view email):");
            console.log(previewUrl);
            console.log("========================================");
        }

        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        // Fallback for completely broken transport
        console.log("========================================");
        console.log("FAILSAFE EMAIL LOG (Transport failed):");
        console.log(`To: ${email}`);
        console.log(`Link: ${resetLink}`);
        console.log("========================================");
        // Return true so the API returns success to the frontend, allowing the user to proceed with the manual link
        return true;
    }
}
