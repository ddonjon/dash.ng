import { supabase } from './supabase'

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send verification code via email using Supabase Edge Function
 */
export async function sendVerificationCode(email, code, name = '') {
  try {
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: { email, code, name }
    })

    if (error) {
      console.error('Edge function error:', error)
      return { success: false, error: 'Failed to send email' }
    }

    if (!data?.success) {
      return { success: false, error: 'Failed to send email' }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending verification code:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

/**
 * Store verification code in database - deletes old codes for the email
 */
export async function storeVerificationCode(email, code) {
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10)

  try {
    // Delete ALL existing codes for this email (verified or not)
    // This ensures old codes are invalidated
    await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email)

    // Insert new code
    const { data, error } = await supabase
      .from('email_verifications')
      .insert({
        email: email,
        code: code,
        expires_at: expiresAt.toISOString(),
        verified: false
      })
      .select()
      .single()

    if (error) {
      console.error('Store error:', error)
      return { success: false, error: 'Failed to store verification code' }
    }
    return { success: true, data }
  } catch (err) {
    console.error('Error storing verification code:', err)
    return { success: false, error: 'Failed to store verification code' }
  }
}

/**
 * Verify the code - ONLY the most recent unverified code works
 */
export async function verifyCode(email, code) {
  try {
    // First, get the most recent unverified code for this email
    const { data: latestCode, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !latestCode) {
      return { success: false, error: 'No verification code found. Please request a new one.' }
    }

    // Check if the provided code matches the latest code
    if (latestCode.code !== code) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' }
    }

    // Check if code expired
    const expiresAt = new Date(latestCode.expires_at)
    if (expiresAt < new Date()) {
      return { success: false, error: 'Verification code has expired. Please request a new one.' }
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', latestCode.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return { success: false, error: 'Failed to verify code' }
    }

    // Delete any other pending codes for this email after verification
    await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email)
      .eq('verified', false)

    return { success: true, email }

  } catch (err) {
    console.error('Error verifying code:', err)
    return { success: false, error: 'Invalid verification code' }
  }
}

/**
 * Resend verification code - deletes ALL old codes first
 */
export async function resendVerificationCode(email, name = '') {
  const code = generateVerificationCode()
  
  // This will delete ALL existing codes for this email
  const storeResult = await storeVerificationCode(email, code)
  if (!storeResult.success) {
    return { success: false, error: 'Unable to send verification code. Please try again.' }
  }

  const sendResult = await sendVerificationCode(email, code, name)
  if (!sendResult.success) {
    return { success: false, error: 'Unable to send email. Please try again.' }
  }

  return { success: true }
}
