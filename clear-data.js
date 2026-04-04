const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function clear() {
  const { error } = await supabase
    .from('birth_charts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Successfully cleared birth_charts')
  }
}

clear()
