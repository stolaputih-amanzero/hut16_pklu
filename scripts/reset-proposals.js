const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
)

async function resetDB() {
    console.log('Memulai proses reset data proposal (Persiapan Live)...')

    // 1. Hapus semua data proposal
    console.log('Menghapus riwayat proposal uji coba...')
    const { error: delError } = await supabaseAdmin
        .from('proposals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Hapus semua baris
    
    if (delError) {
        console.error('Error saat menghapus proposal:', delError)
        return
    }
    console.log('✅ Semua proposal uji coba berhasil dihapus.')

    // 2. Reset nomor urut (sequences) ke 0
    console.log('Mereset penomoran proposal kembali ke 001...')
    const { error: updateError } = await supabaseAdmin
        .from('numbering_sequences')
        .update({ last_number: 0 })
        .neq('id', 0)
    
    if (updateError) {
        console.error('Error saat mereset penomoran:', updateError)
        return
    }
    console.log('✅ Penomoran berhasil direset.')
    
    console.log('\n🎉 PROSES SELESAI. Sistem kini siap digunakan untuk LIVE (Mulai dari 001).')
}

resetDB()
