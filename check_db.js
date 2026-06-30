const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
)

async function checkData() {
    const { data: comms, error } = await supabaseAdmin.from('committees').select('*')
    if (error) console.error(error)
    else console.log('Committees:', comms)
}

checkData()
