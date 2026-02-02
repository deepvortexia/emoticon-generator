interface PurchaseEmailData {
  userName: string
  userEmail: string
  packName: string
  creditsPurchased: number
  newCreditBalance: number
  amountPaid: string
  transactionDate: string
}

export function getPurchaseConfirmationEmail(data: PurchaseEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purchase Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #0a0a0a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #16213e 100%); border-radius: 24px; border: 1px solid rgba(245, 158, 11, 0.3); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
              
              <!-- Header with Logo -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(245, 158, 11, 0.2);">
                  <div style="font-size: 64px; margin-bottom: 16px;">🎨</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Deep Vortex AI</h1>
                  <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.7); font-size: 16px;">Emoticon Generator</p>
                </td>
              </tr>
              
              <!-- Success Message -->
              <tr>
                <td style="padding: 40px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 50px; font-size: 18px; font-weight: 600; margin-bottom: 16px;">
                      ✅ Purchase Successful!
                    </div>
                  </div>
                  
                  <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px; text-align: center;">Thank you for your purchase!</h2>
                  <p style="color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 32px;">
                    Your credits have been added to your account and are ready to use.
                  </p>
                  
                  <!-- Purchase Details Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(245, 158, 11, 0.1); border: 2px solid rgba(245, 158, 11, 0.3); border-radius: 16px; margin-bottom: 32px;">
                    <tr>
                      <td style="padding: 24px;">
                        <h3 style="color: #f59e0b; font-size: 18px; margin: 0 0 20px; text-align: center;">📦 Purchase Details</h3>
                        
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px; padding: 8px 0;">Pack:</td>
                            <td style="color: #ffffff; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${data.packName}</td>
                          </tr>
                          <tr>
                            <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px; padding: 8px 0;">Credits Purchased:</td>
                            <td style="color: #f59e0b; font-size: 18px; font-weight: 700; text-align: right; padding: 8px 0;">+${data.creditsPurchased} 🪙</td>
                          </tr>
                          <tr>
                            <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px; padding: 8px 0;">New Balance:</td>
                            <td style="color: #10b981; font-size: 18px; font-weight: 700; text-align: right; padding: 8px 0;">${data.newCreditBalance} credits</td>
                          </tr>
                          <tr style="border-top: 1px solid rgba(255, 255, 255, 0.1);">
                            <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px; padding: 12px 0 0;">Amount Paid:</td>
                            <td style="color: #ffffff; font-size: 16px; font-weight: 600; text-align: right; padding: 12px 0 0;">$${data.amountPaid}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="https://www.deepvortexai.xyz" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);">
                          🚀 Start Creating Emojis
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Tips Section -->
                  <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-top: 32px;">
                    <h4 style="color: #f59e0b; font-size: 16px; margin: 0 0 12px;">💡 Pro Tips:</h4>
                    <ul style="margin: 0; padding-left: 20px; color: rgba(255, 255, 255, 0.8); font-size: 14px; line-height: 1.8;">
                      <li>Each emoji generation uses 1 credit</li>
                      <li>Use simple, descriptive prompts for best results</li>
                      <li>Download your creations to use on any platform</li>
                    </ul>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                  <p style="margin: 0 0 8px; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                    Transaction Date: ${data.transactionDate}
                  </p>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                    Questions? Reply to this email or visit our support page.
                  </p>
                  <p style="margin: 16px 0 0; color: rgba(255, 255, 255, 0.3); font-size: 12px;">
                    © 2026 Deep Vortex AI. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
