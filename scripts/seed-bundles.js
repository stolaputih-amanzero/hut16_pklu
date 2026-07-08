const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
)

async function seedBundles() {
    console.log('Memulai seed produk bundling merchandise...')

    const p1 = {
        name: 'Paket Bundling 3 Pcs (Kaos, Mug, & Bag)',
        description: 'Dapatkan 3 cenderamata sekaligus dengan harga hemat: Kaos Merchandise Edisi HUT 16 (bebas pilih ukuran S-4XL), Mug Cenderamata PKLU, dan Pouch & Bag Edisi Spesial.',
        image_url: '/bundle_3pcs_mockup.png',
        price: 275000,
        has_size: true,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']
    }

    const p2 = {
        name: 'Paket Bundling 2 Pcs (Mug & Bag)',
        description: 'Dapatkan paket hemat 2 cenderamata: Mug Cenderamata PKLU dan Pouch & Bag Edisi Spesial.',
        image_url: '/bundle_2pcs_mockup.png',
        price: 125000,
        has_size: false,
        available_sizes: []
    }

    for (const p of [p1, p2]) {
        const { data, error: fetchErr } = await supabaseAdmin
            .from('merch_products')
            .select('id')
            .eq('name', p.name)
            .maybeSingle()

        if (fetchErr) {
            console.error(`Error saat mencari produk "${p.name}":`, fetchErr)
            continue
        }

        if (!data) {
            console.log(`Menambahkan produk baru: "${p.name}"...`)
            const { error: insErr } = await supabaseAdmin
                .from('merch_products')
                .insert(p)

            if (insErr) {
                console.error(`Gagal menambahkan "${p.name}":`, insErr)
            } else {
                console.log(`✅ Berhasil menambahkan "${p.name}"`)
            }
        } else {
            console.log(`Produk "${p.name}" sudah ada.`)
        }
    }

    console.log('Selesai.')
}

seedBundles()
