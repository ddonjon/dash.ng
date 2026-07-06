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

export async function getAreas() {
  const { data, error } = await supabase
    .from('properties')
    .select('area')
    .order('area')
  
  if (error) throw error
  return [...new Set(data.map(item => item.area))]
}
