import { createClient } from '@/utils/supabase/client'

export async function saveBirthChart(params: {
  fullName: string;
  birthDate: string;
  birthTime: string;
  location: string;
  latitude: number;
  longitude: number;
  resultData: any;
}) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('You must be logged in to save charts')
  }

  const { data, error } = await supabase
    .from('birth_charts')
    .insert([{
      user_id: session.user.id,
      full_name: params.fullName,
      birth_date: params.birthDate,
      birth_time: params.birthTime,
      location: params.location,
      latitude: params.latitude,
      longitude: params.longitude,
      result_data: params.resultData
    }])
    .select()

  if (error) {
    console.error('Error saving birth chart:', error)
    throw error
  }

  return data[0]
}

export async function getSavedCharts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('birth_charts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
