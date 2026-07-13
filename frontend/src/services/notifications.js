import { supabase } from './supabase'

/**
 * Create a notification for a user
 */
export async function createNotification(userId, type, title, message, link = null, metadata = {}) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type,
        title: title,
        message: message,
        link: link,
        metadata: metadata,
        read: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error creating notification:', err)
    return null
  }
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error fetching notifications:', err)
    return []
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  } catch (err) {
    console.error('Error getting unread count:', err)
    return 0
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
    return true
  } catch (err) {
    console.error('Error marking notification as read:', err)
    return false
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return true
  } catch (err) {
    console.error('Error marking all as read:', err)
    return false
  }
}

/**
 * Delete all notifications for a user
 */
export async function clearAllNotifications(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (err) {
    console.error('Error clearing notifications:', err)
    return false
  }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(userId, callback) {
  const channel = supabase
    .channel('notifications_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return channel
}
