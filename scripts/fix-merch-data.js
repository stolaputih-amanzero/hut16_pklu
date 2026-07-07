const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
)

async function fixMerchData() {
    console.log('Memulai sinkronisasi dan perbaikan data merchandise...')

    // 1. Update nama produk di tabel public.merch_products
    console.log('Mengubah nama produk di merch_products...')
    const { data: products, error: prodFetchError } = await supabaseAdmin
        .from('merch_products')
        .select('*')

    if (prodFetchError) {
        console.error('Error saat mengambil produk:', prodFetchError)
        return
    }

    for (const p of products) {
        const originalName = p.name
        let newName = originalName
            .replace(/&amp;/g, '&')
            .replace(/Pouch & Goodie Bag Edisi Spesial/g, 'Pouch & Bag Edisi Spesial')
            .replace(/Pouch & Googie Bag Edisi Spesial/g, 'Pouch & Bag Edisi Spesial')
            .trim()

        if (originalName !== newName) {
            console.log(`Mengupdate produk ${p.id}: "${originalName}" -> "${newName}"`)
            const { error: updErr } = await supabaseAdmin
                .from('merch_products')
                .update({ name: newName })
                .eq('id', p.id)

            if (updErr) {
                console.error(`Gagal mengupdate produk ${p.id}:`, updErr)
            } else {
                console.log(`✅ Berhasil mengupdate produk ${p.id}`)
            }
        }
    }

    // 2. Update item_type dan size di tabel public.merch_orders
    console.log('Mengubah item_type dan size di merch_orders...')
    const { data: orders, error: ordFetchError } = await supabaseAdmin
        .from('merch_orders')
        .select('*')

    if (ordFetchError) {
        console.error('Error saat mengambil pesanan:', ordFetchError)
        return
    }

    for (const o of orders) {
        const originalItemType = o.item_type || ''
        const originalSize = o.size || ''
        const originalBuyerName = o.buyer_name || ''
        const originalChurchCity = o.church_city || ''
        const originalNotes = o.notes || ''

        let newItemType = originalItemType
            .replace(/&amp;/g, '&')
            .replace(/Pouch & Goodie Bag Edisi Spesial/g, 'Pouch & Bag Edisi Spesial')
            .replace(/Pouch & Googie Bag Edisi Spesial/g, 'Pouch & Bag Edisi Spesial')
            .trim()

        let newSize = originalSize
            .replace(/&amp;/g, '&')
            .replace(/Pouch & Goodie Bag Edisi Spesial/g, 'Pouch & Bag Edisi Spesial')
            .replace(/Pouch & Googie Bag Edisi Spesial/g, 'Pouch & Bag Edisi Spesial')
            .trim()

        let newBuyerName = originalBuyerName.replace(/&amp;/g, '&').trim()
        let newChurchCity = originalChurchCity.replace(/&amp;/g, '&').trim()
        let newNotes = originalNotes ? originalNotes.replace(/&amp;/g, '&').trim() : null

        if (
            originalItemType !== newItemType ||
            originalSize !== newSize ||
            originalBuyerName !== newBuyerName ||
            originalChurchCity !== newChurchCity ||
            originalNotes !== newNotes
        ) {
            console.log(`Mengupdate pesanan ${o.id}:`)
            if (originalItemType !== newItemType) console.log(`  item_type: "${originalItemType}" -> "${newItemType}"`)
            if (originalSize !== newSize) console.log(`  size: "${originalSize}" -> "${newSize}"`)
            if (originalBuyerName !== newBuyerName) console.log(`  buyer_name: "${originalBuyerName}" -> "${newBuyerName}"`)
            if (originalChurchCity !== newChurchCity) console.log(`  church_city: "${originalChurchCity}" -> "${newChurchCity}"`)

            const { error: updErr } = await supabaseAdmin
                .from('merch_orders')
                .update({
                    item_type: newItemType,
                    size: newSize || null,
                    buyer_name: newBuyerName,
                    church_city: newChurchCity,
                    notes: newNotes
                })
                .eq('id', o.id)

            if (updErr) {
                console.error(`Gagal mengupdate pesanan ${o.id}:`, updErr)
            } else {
                console.log(`✅ Berhasil mengupdate pesanan ${o.id}`)
            }
        }
    }

    console.log('\n🎉 Selesai.')
}

fixMerchData()
