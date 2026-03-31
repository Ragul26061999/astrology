import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function seedUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const email = 'astrology@gmail.com'
  const password = 'password123'

  console.log(`Checking if user ${email} exists...`)

  // Check if user exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError)
    return
  }

  const existingUser = users.find(u => u.email === email)

  if (existingUser) {
    console.log(`User ${email} already exists. Updating password...`)
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true
    })
    if (error) console.error('Error updating password:', error)
    else console.log('Password updated successfully.')
  } else {
    console.log(`Creating user ${email}...`)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (error) console.error('Error creating user:', error)
    else console.log('User created successfully.')
  }
}

seedUser()
