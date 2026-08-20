const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { parseSizeStocks, serializeSizeStocksToArray, parseOrderItemType, DEFAULT_SIZES } = require('../src/lib/utils');
const { adjustProductStockFromItems, fetchMerchProducts, updateMerchOrderStatus, deleteMerchOrder } = require('../src/app/(admin)/admin/merch/actions');
const { submitMerchOrder } = require('../src/app/(public)/merch/actions');

async function runEndToEndVerification() {
  console.log('=== MEMULAI FINAL END-TO-END CHECK SISTEM MERCHANDISE ===\n');

  // 1. Snapshot Initial State
  console.log('1. Mengambil Snapshot Status Awal Produk...');
  const resInitial = await fetchMerchProducts(false);
  if (!resInitial.success || !resInitial.data) {
    throw new Error('Gagal mengambil data produk awal');
  }

  const initialProducts = resInitial.data;
  console.log('Daftar Produk Terdeteksi:');
  initialProducts.forEach(p => {
    console.log(`- ${p.name} | Total Stok: ${p.stock} | Has Size: ${p.has_size}`);
    if (p.has_size && p.size_stocks) {
      console.log(`  Rincian Ukuran:`, p.size_stocks);
    }
  });

  const kaosInit = initialProducts.find(p => p.has_size && p.name.includes('Kaos Merchandise'));
  const tumblerInit = initialProducts.find(p => p.name.includes('Tumbler'));
  const toteInit = initialProducts.find(p => p.name.includes('Tote Bag'));
  const bundle3Init = initialProducts.find(p => p.name.includes('Bundling 3'));
  const bundle2Init = initialProducts.find(p => p.name.includes('Bundling 2'));

  const initialKaosXL = kaosInit?.size_stocks?.['XL'] ?? 0;
  const initialKaosM = kaosInit?.size_stocks?.['M'] ?? 0;
  const initialTumbler = tumblerInit?.stock ?? 0;
  const initialTote = toteInit?.stock ?? 0;

  const dummyOrderIds = [];

  try {
    // 2. Test Pembelian Kaos Eceran Ukuran XL (2 pcs)
    console.log('\n2. Pengujian Checkout Kaos Eceran XL (2 pcs)...');
    const fdKaos = new FormData();
    fdKaos.append('buyer_name', 'TEST DUMMY BUYER (KAOS)');
    fdKaos.append('church_city', 'GPIB Dummy Jakarta');
    fdKaos.append('whatsapp', '089999999991');
    fdKaos.append('payment_date', '2026-08-20');
    fdKaos.append('items', JSON.stringify([{
      productId: kaosInit.id,
      name: kaosInit.name,
      price: kaosInit.price,
      size: 'XL',
      quantity: 2
    }]));
    const dummyBlob = new Blob(['test dummy receipt'], { type: 'image/jpeg' });
    fdKaos.append('payment_proof', dummyBlob, 'test_receipt_kaos.jpg');

    const resOrderKaos = await submitMerchOrder(fdKaos);
    if (!resOrderKaos.success || !resOrderKaos.data?.id) {
      throw new Error(`Checkout Kaos gagal: ${resOrderKaos.error}`);
    }
    dummyOrderIds.push(resOrderKaos.data.id);
    console.log(`✅ Order Kaos Berhasil Dibuat (ID: ${resOrderKaos.data.id})`);

    // Verify Stock Kaos & Bundling 3
    const resAfterKaos = await fetchMerchProducts(false);
    const kaosAfter1 = resAfterKaos.data.find(p => p.id === kaosInit.id);
    const bundle3After1 = resAfterKaos.data.find(p => p.id === bundle3Init.id);

    console.log(`- Kaos XL Awal: ${initialKaosXL} -> Sesudah: ${kaosAfter1?.size_stocks?.['XL']}`);
    console.log(`- Bundling 3 XL Awal: ${bundle3Init?.size_stocks?.['XL']} -> Sesudah: ${bundle3After1?.size_stocks?.['XL']}`);

    if (kaosAfter1?.size_stocks?.['XL'] !== initialKaosXL - 2 || bundle3After1?.size_stocks?.['XL'] !== initialKaosXL - 2) {
      throw new Error('Stok ukuran XL Kaos dan Bundling 3 tidak sinkron!');
    }
    console.log('✅ Sinkronisasi Kaos Eceran & Bundling 3 Valid!');

    // 3. Test Pembelian Paket Bundling 3 Pcs Ukuran M (1 pcs)
    console.log('\n3. Pengujian Checkout Paket Bundling 3 Pcs Ukuran M (1 pcs)...');
    const fdBundling3 = new FormData();
    fdBundling3.append('buyer_name', 'TEST DUMMY BUYER (BUNDLE 3)');
    fdBundling3.append('church_city', 'GPIB Dummy Bandung');
    fdBundling3.append('whatsapp', '089999999992');
    fdBundling3.append('payment_date', '2026-08-20');
    fdBundling3.append('items', JSON.stringify([{
      productId: bundle3Init.id,
      name: bundle3Init.name,
      price: bundle3Init.price,
      size: 'M',
      quantity: 1
    }]));
    fdBundling3.append('payment_proof', dummyBlob, 'test_receipt_b3.jpg');

    const resOrderB3 = await submitMerchOrder(fdBundling3);
    if (!resOrderB3.success || !resOrderB3.data?.id) {
      throw new Error(`Checkout Bundling 3 gagal: ${resOrderB3.error}`);
    }
    dummyOrderIds.push(resOrderB3.data.id);
    console.log(`✅ Order Bundling 3 Berhasil Dibuat (ID: ${resOrderB3.data.id})`);

    // Verify All Components Stock
    const resAfterB3 = await fetchMerchProducts(false);
    const kaosAfter2 = resAfterB3.data.find(p => p.id === kaosInit.id);
    const tumblerAfter2 = resAfterB3.data.find(p => p.id === tumblerInit.id);
    const toteAfter2 = resAfterB3.data.find(p => p.id === toteInit.id);
    const bundle3After2 = resAfterB3.data.find(p => p.id === bundle3Init.id);

    console.log(`- Kaos M Awal: ${initialKaosM} -> Sesudah: ${kaosAfter2?.size_stocks?.['M']} (Expected: ${initialKaosM - 1})`);
    console.log(`- Bundling 3 M Awal: ${initialKaosM} -> Sesudah: ${bundle3After2?.size_stocks?.['M']} (Expected: ${initialKaosM - 1})`);
    console.log(`- Tumbler Awal: ${initialTumbler} -> Sesudah: ${tumblerAfter2?.stock} (Expected: ${initialTumbler - 1})`);
    console.log(`- Tote Bag Awal: ${initialTote} -> Sesudah: ${toteAfter2?.stock} (Expected: ${initialTote - 1})`);

    if (
      kaosAfter2?.size_stocks?.['M'] !== initialKaosM - 1 ||
      bundle3After2?.size_stocks?.['M'] !== initialKaosM - 1 ||
      tumblerAfter2?.stock !== initialTumbler - 1 ||
      toteAfter2?.stock !== initialTote - 1
    ) {
      throw new Error('Pengurangan komponen Bundling 3 tidak sesuai!');
    }
    console.log('✅ Sinkronisasi Seluruh Komponen Bundling 3 (Kaos M, Tumbler, Tote Bag) Valid!');

    // 4. Test Pembelian Paket Bundling 2 Pcs (1 pcs)
    console.log('\n4. Pengujian Checkout Paket Bundling 2 Pcs (1 pcs)...');
    const fdBundling2 = new FormData();
    fdBundling2.append('buyer_name', 'TEST DUMMY BUYER (BUNDLE 2)');
    fdBundling2.append('church_city', 'GPIB Dummy Surabaya');
    fdBundling2.append('whatsapp', '089999999993');
    fdBundling2.append('payment_date', '2026-08-20');
    fdBundling2.append('items', JSON.stringify([{
      productId: bundle2Init.id,
      name: bundle2Init.name,
      price: bundle2Init.price,
      quantity: 1
    }]));
    fdBundling2.append('payment_proof', dummyBlob, 'test_receipt_b2.jpg');

    const resOrderB2 = await submitMerchOrder(fdBundling2);
    if (!resOrderB2.success || !resOrderB2.data?.id) {
      throw new Error(`Checkout Bundling 2 gagal: ${resOrderB2.error}`);
    }
    dummyOrderIds.push(resOrderB2.data.id);
    console.log(`✅ Order Bundling 2 Berhasil Dibuat (ID: ${resOrderB2.data.id})`);

    const resAfterB2 = await fetchMerchProducts(false);
    const tumblerAfter3 = resAfterB2.data.find(p => p.id === tumblerInit.id);
    const toteAfter3 = resAfterB2.data.find(p => p.id === toteInit.id);

    console.log(`- Tumbler Sesudah Bundling 2: ${tumblerAfter3?.stock} (Expected: ${initialTumbler - 2})`);
    console.log(`- Tote Bag Sesudah Bundling 2: ${toteAfter3?.stock} (Expected: ${initialTote - 2})`);

    if (tumblerAfter3?.stock !== initialTumbler - 2 || toteAfter3?.stock !== initialTote - 2) {
      throw new Error('Pengurangan komponen Bundling 2 tidak sesuai!');
    }
    console.log('✅ Sinkronisasi Komponen Bundling 2 Valid!');

    // 5. Test Proteksi Over-selling (Memesan melebihi stok yang ada)
    console.log('\n5. Pengujian Proteksi Over-selling...');
    const fdOver = new FormData();
    fdOver.append('buyer_name', 'TEST OVERBUY');
    fdOver.append('church_city', 'Test');
    fdOver.append('whatsapp', '089999999994');
    fdOver.append('payment_date', '2026-08-20');
    fdOver.append('items', JSON.stringify([{
      productId: kaosInit.id,
      name: kaosInit.name,
      price: kaosInit.price,
      size: 'XL',
      quantity: 9999 // Over stock
    }]));
    fdOver.append('payment_proof', dummyBlob, 'test.jpg');

    const resOver = await submitMerchOrder(fdOver);
    if (resOver.success) {
      throw new Error('Sistem gagal menolak pesanan melebihi stok!');
    }
    console.log(`✅ Sistem Berhasil Menolak Over-selling: "${resOver.error}"`);

    // 6. Test Rollback saat Admin Mengubah Status menjadi "Rejected"
    console.log('\n6. Pengujian Rollback Stok saat Status Diubah Menjadi "Rejected"...');
    const orderToReject = dummyOrderIds[0]; // Kaos XL order (2 pcs)
    const resReject = await updateMerchOrderStatus(orderToReject, 'rejected', 'Dummy test rejection');
    if (!resReject.success) {
      throw new Error(`Gagal mengubah status menjadi rejected: ${resReject.error}`);
    }

    const resAfterReject = await fetchMerchProducts(false);
    const kaosAfterReject = resAfterReject.data.find(p => p.id === kaosInit.id);
    console.log(`- Kaos XL Setelah Rejected: ${kaosAfterReject?.size_stocks?.['XL']} (Expected: ${initialKaosXL} - kembali pulih)`);

    if (kaosAfterReject?.size_stocks?.['XL'] !== initialKaosXL) {
      throw new Error('Rollback stok saat rejection tidak mengembalikan stok!');
    }
    console.log('✅ Rollback Status Rejected Berhasil!');

  } finally {
    // 7. Pembersihan & Cleanup Seluruh Dummy Data
    console.log('\n7. Membersihkan Seluruh Dummy Order & Mengembalikan Stok...');
    for (const orderId of dummyOrderIds) {
      console.log(`- Menghapus dummy order ID: ${orderId}`);
      await deleteMerchOrder(orderId);
    }

    // Double check & restore base products to exact initial snapshot
    console.log('\n8. Verifikasi Status Akhir Pasca Pembersihan...');
    const resFinal = await fetchMerchProducts(false);
    console.log('Status Akhir Produk:');
    resFinal.data.forEach(p => {
      console.log(`- ${p.name} | Total Stok: ${p.stock}`);
      if (p.has_size && p.size_stocks) {
        console.log(`  Rincian Ukuran:`, p.size_stocks);
      }
    });

    // Check no dummy orders remaining in merch_orders table
    const { data: checkDummyOrders } = await supabaseAdmin
      .from('merch_orders')
      .select('id, buyer_name')
      .ilike('buyer_name', '%TEST DUMMY%');

    if (checkDummyOrders && checkDummyOrders.length > 0) {
      console.warn('Masih terdapat dummy order tersisa, menghapus...', checkDummyOrders);
      for (const d of checkDummyOrders) {
        await supabaseAdmin.from('merch_orders').delete().eq('id', d.id);
      }
    } else {
      console.log('✅ Tabel merch_orders 100% Bersih dari data testing dummy.');
    }
  }

  console.log('\n🎉 SELURUH PENGUJIAN FINAL SUKSES TANPA ERROR!');
}

runEndToEndVerification().catch(err => {
  console.error('\n❌ PENGUJIAN GAGAL:', err);
  process.exit(1);
});
