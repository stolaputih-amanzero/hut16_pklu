-- Migration 0006: merch_products table & initial seeds

CREATE TABLE IF NOT EXISTS public.merch_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    price INT NOT NULL DEFAULT 0,
    has_size BOOLEAN NOT NULL DEFAULT false,
    available_sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.merch_products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view active merch products"
    ON public.merch_products
    FOR SELECT
    TO public
    USING (true);

-- Authenticated admin access
CREATE POLICY "Admin full access to merch products"
    ON public.merch_products
    FOR ALL
    TO authenticated
    USING (true);

-- Seed Initial Products
INSERT INTO public.merch_products (name, description, image_url, price, has_size, available_sizes)
VALUES
  (
    'Kaos Merchandise Edisi HUT 16',
    'Bahan Cotton Combed 30s premium lembut, adem, dan menyerap keringat. Sablon DTF High-Density presisi tinggi dengan logo resmi HUT ke-16 PKLU GPIB.',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    100000,
    true,
    ARRAY['S', 'M', 'L', 'XL', 'XXL', '3XL']
  ),
  (
    'Topi Souvenir Resmi',
    'Topi jaring/trucker hat eksklusif warna hijau emerald dengan bordir timbul logo HUT ke-16 PKLU GPIB. Pengatur ukuran snapback di belakang.',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    50000,
    false,
    ARRAY[]::TEXT[]
  ),
  (
    'Pin Eksklusif HUT 16',
    'Pin enamel logam kuningan berlapis emas murni 24K berdiameter 4cm dengan finishing glossy resin bening pelindung.',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80',
    25000,
    false,
    ARRAY[]::TEXT[]
  ),
  (
    'Mug Cenderamata PKLU',
    'Mug keramik putih standar SNI 11oz cetak sublimasi full color anti luntur. Aman untuk microwave & dishwasher.',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    40000,
    false,
    ARRAY[]::TEXT[]
  ),
  (
    'Pouch & Goodie Bag Edisi Spesial',
    'Tas spunbond & pouch kanvas multifungsi ramah lingkungan bermotif emas khas HUT ke-16 PKLU GPIB.',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    35000,
    false,
    ARRAY[]::TEXT[]
  )
ON CONFLICT DO NOTHING;
