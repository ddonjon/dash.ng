import { supabase } from './supabase'

export async function getProperties(filters = {}) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      users (
        name,
        whatsapp_number,
        profile_picture,
        is_verified_agent
      )
    `)
    .eq('status', 'published')  // Only show published properties
    .order('created_at', { ascending: false })

  if (filters.area) query = query.eq('area', filters.area)
  if (filters.minPrice) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters.bedrooms) query = query.eq('bedrooms', filters.bedrooms)
  if (filters.features?.length) query = query.contains('features', filters.features)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPropertyById(id) {
  // Increment view count
  await incrementViews(id)
  
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      users (
        name,
        whatsapp_number,
        profile_picture,
        is_verified_agent
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createProperty(propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .insert([propertyData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProperty(id, propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .update(propertyData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProperty(id) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

export async function getAreas() {
  const { data, error } = await supabase
    .from('properties')
    .select('area')
    .order('area')
  
  if (error) throw error
  return [...new Set(data.map(item => item.area))]
}

export async function getUserProperties(userId) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('agent_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function incrementViews(propertyId) {
  try {
    // First get current views
    const { data, error } = await supabase
      .from('properties')
      .select('views')
      .eq('id', propertyId)
      .single()
    
    if (error) throw error
    
    const currentViews = data?.views || 0
    const newViews = currentViews + 1
    
    // Update with new view count
    const { error: updateError } = await supabase
      .from('properties')
      .update({ views: newViews })
      .eq('id', propertyId)
    
    if (updateError) throw updateError
    
    return newViews
  } catch (err) {
    console.error('Error incrementing views:', err)
    return null
  }
}

export async function incrementInquiries(propertyId) {
  try {
    // First get current inquiries count
    const { data, error } = await supabase
      .from('properties')
      .select('inquiries')
      .eq('id', propertyId)
      .single()
    
    // If column doesn't exist yet, create it or handle gracefully
    if (error && error.code === 'PGRST116') {
      // Column might not exist, try to update anyway
      const { error: updateError } = await supabase
        .from('properties')
        .update({ inquiries: 1 })
        .eq('id', propertyId)
      
      if (updateError) throw updateError
      return 1
    }
    
    if (error) throw error
    
    const currentInquiries = data?.inquiries || 0
    const newInquiries = currentInquiries + 1
    
    // Update with new inquiries count
    const { error: updateError } = await supabase
      .from('properties')
      .update({ inquiries: newInquiries })
      .eq('id', propertyId)
    
    if (updateError) throw updateError
    
    return newInquiries
  } catch (err) {
    console.error('Error incrementing inquiries:', err)
    return null
  }
}
