import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { email, code, name } = await req.json()
    
    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }

    console.log(`📧 Sending verification code to ${email}`)

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dash <onboarding@resend.dev>', // Using Resend's default domain for testing
        to: [email],
        subject: 'Verify your email - Dash',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email - Dash</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  background-color: #f9fafb;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 40px auto;
                  background-color: #ffffff;
                  border-radius: 16px;
                  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
                  overflow: hidden;
                }
                .header {
                  background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
                  padding: 32px 40px;
                  text-align: center;
                }
                .header h1 {
                  color: #ffffff;
                  font-size: 28px;
                  font-weight: 700;
                  margin: 0;
                  letter-spacing: -0.5px;
                }
                .content {
                  padding: 40px 40px 32px;
                }
                .greeting {
                  font-size: 18px;
                  color: #1f2937;
                  font-weight: 600;
                  margin-bottom: 8px;
                }
                .message {
                  color: #6b7280;
                  font-size: 15px;
                  line-height: 1.6;
                  margin-bottom: 24px;
                }
                .code-container {
                  background-color: #f3f4f6;
                  border-radius: 12px;
                  padding: 24px;
                  text-align: center;
                  margin: 24px 0;
                  border: 2px dashed #d1d5db;
                }
                .code {
                  font-size: 36px;
                  font-weight: 700;
                  letter-spacing: 8px;
                  color: #7C3AED;
                  font-family: 'Courier New', monospace;
                }
                .expiry {
                  color: #9ca3af;
                  font-size: 13px;
                  text-align: center;
                  margin-top: 8px;
                }
                .footer {
                  text-align: center;
                  padding: 24px 40px 32px;
                  border-top: 1px solid #f3f4f6;
                  color: #9ca3af;
                  font-size: 13px;
                }
                .footer a {
                  color: #7C3AED;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Dash</h1>
                </div>
                <div class="content">
                  <p class="greeting">Hi ${name || 'there'}! 👋</p>
                  <p class="message">
                    Thanks for joining Dash! To complete your registration, please enter the verification code below:
                  </p>
                  <div class="code-container">
                    <div class="code">${code}</div>
                  </div>
                  <p class="expiry">⏱️ This code will expire in 10 minutes</p>
                  <p style="text-align: center; margin-top: 16px; color: #6b7280; font-size: 14px;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </div>
                <div class="footer">
                  <p>
                    Dash - Real Estate at the speed of a text message<br>
                    <a href="https://dash.ng">dash.ng</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
          Hi ${name || 'there'}! 👋

          Thanks for joining Dash! To complete your registration, please enter the verification code below:

          ${code}

          ⏱️ This code will expire in 10 minutes

          If you didn't request this, you can safely ignore this email.

          Dash - Real Estate at the speed of a text message
        `,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend error:', data)
      throw new Error(data.message || 'Failed to send email')
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
