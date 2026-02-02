import { getPurchaseConfirmationEmail } from './emailTemplates'

interface SendPurchaseEmailParams {
  to: string
  userName: string
  packName: string
  creditsPurchased: number
  newCreditBalance: number
  amountPaid: string
}

export async function sendPurchaseConfirmationEmail(params: SendPurchaseEmailParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  const emailHtml = getPurchaseConfirmationEmail({
    userName: params.userName,
    userEmail: params.to,
    packName: params.packName,
    creditsPurchased: params.creditsPurchased,
    newCreditBalance: params.newCreditBalance,
    amountPaid: params.amountPaid,
    transactionDate: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Deep Vortex AI <onboarding@resend.dev>',
        to: params.to,
        subject: `🎉 Your ${params.packName} Pack is Ready! (+${params.creditsPurchased} Credits)`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email:', error);
      return false;
    }

    const data = await response.json();
    console.log('Purchase confirmation email sent:', data.id);
    return true;
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
    return false;
  }
}
