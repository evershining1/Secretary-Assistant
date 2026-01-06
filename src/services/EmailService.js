/**
 * EmailService - Handles professional transactional emails via Resend
 * Developer: evershining17@gmail.com
 */
export class EmailService {
    static API_KEY = 're_DnoZgUm2_97FddmT1iV3J4RJPPPXCNe2d';
    static FROM_EMAIL = 'Secretary App <evershining17@gmail.com>';

    /**
     * Send a transactional email using Resend API
     */
    static async sendEmail({ to, subject, html }) {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: this.FROM_EMAIL,
                    to: [to],
                    subject: subject,
                    html: html
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Email failed to send');

            console.log('[EmailService] Email sent successfully:', result.id);
            return result;
        } catch (error) {
            console.error('[EmailService] Failed to send email:', error);
            // Don't throw, just log so app flow isn't broken
            return null;
        }
    }

    /**
     * Send Welcome Email to new users
     */
    static async sendWelcomeEmail(userName, userEmail) {
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #ff5a5f;">Welcome to Secretary, ${userName}!</h1>
                <p>We're thrilled to have you on board. Your new Personal Life OS is ready to help you align your daily tasks with your long-term goals.</p>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Next Steps:</h3>
                    <ul>
                        <li>Connect your Google, Outlook, or Apple calendar in Settings.</li>
                        <li>Set your first 3 big goals for the year.</li>
                        <li>Ask Emily (our AI assistant) if you have any questions!</li>
                    </ul>
                </div>
                <p>Happy organizing,<br>The Secretary Team</p>
            </div>
        `;
        return this.sendEmail({ to: userEmail, subject: 'Welcome to Secretary! 🚀', html });
    }

    /**
     * Send Premium Upgrade Confirmation
     */
    static async sendUpgradeConfirmation(userEmail, planName) {
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #ff5a5f;">You're now Premium! 💎</h1>
                <p>Thank you for upgrading to the ${planName} plan. You've just unlocked the full power of Secretary.</p>
                <ul>
                    <li><strong>Unlimited Calendars:</strong> Sync every aspect of your life.</li>
                    <li><strong>Advanced Goal AI:</strong> Get deep insights into your productivity.</li>
                    <li><strong>Ad-Free Experience:</strong> Focus on what matters most.</li>
                </ul>
                <p>Your subscription is now active.</p>
                <p>Best,<br>The Secretary Team</p>
            </div>
        `;
        return this.sendEmail({ to: userEmail, subject: 'Your Secretary Premium is Active! 💎', html });
    }
}

export default EmailService;
