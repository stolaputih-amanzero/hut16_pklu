'use client'

import { useEffect, useRef, useState } from 'react'

const congregations = [
  { name: 'Anugerah', loc: 'Tambun', lat: -6.2575, lng: 107.0620 },
  { name: 'Bahtera Kasih', loc: 'Jatisampurna', lat: -6.3775, lng: 106.9212 },
  { name: 'Dian Kasih', loc: 'Jatisampurna', lat: -6.3262, lng: 106.9248 },
  { name: 'Galilea', loc: 'Kemang Pratama / Villa Galaxy', lat: -6.2650, lng: 106.9740 },
  { name: 'Gloria', loc: 'Jaka Sampurna / Bekasi Barat', lat: -6.2550, lng: 106.9650 },
  { name: 'Gratia', loc: 'Taman Wisma Asri', lat: -6.2104, lng: 107.0146 },
  { name: 'Harapan Baru', loc: 'Harapan Baru Regency', lat: -6.2232, lng: 106.9602 },
  { name: 'Harapan Indah', loc: 'Melati Indah', lat: -6.1837, lng: 106.9735 },
  { name: 'Harapan Kasih', loc: 'Harapan Jaya', lat: -6.2081, lng: 106.9822 },
  { name: 'Immanuel', loc: 'Kompleks TNI AU Jaladhapura', lat: -6.2162, lng: 107.0308 },
  { name: 'Jatipon', loc: 'Jatibening/Pondok Gede', lat: -6.2628, lng: 106.9302 },
  { name: 'Karang Satria', loc: 'Tambun Utara', lat: -6.1989, lng: 107.0378 },
  { name: 'Menara Kasih', loc: 'Jatiasih', lat: -6.3051, lng: 106.9658 },
  { name: 'Pilar Asih', loc: 'Bojong Rawalumbu', lat: -6.2801, lng: 106.9942 },
  { name: 'Pondok Ungu', loc: 'Pondok Ungu Permai', lat: -6.1848, lng: 107.0002 }
]

export default function MupelMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    const checkLeaflet = () => {
      if ((window as any).L) {
        setLoaded(true)
      } else {
        // Load CSS
        if (!document.getElementById('leaflet-css')) {
          const cssLink = document.createElement('link')
          cssLink.id = 'leaflet-css'
          cssLink.rel = 'stylesheet'
          cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(cssLink)
        }

        // Load custom style overrides to prevent grid lines artifact and style attribution
        if (!document.getElementById('leaflet-custom-style')) {
          const style = document.createElement('style')
          style.id = 'leaflet-custom-style'
          style.innerHTML = `
            .leaflet-tile {
              outline: 1px solid transparent;
            }
            .leaflet-tile-container img {
              box-shadow: 0 0 1px #022c22;
            }
            .leaflet-control-attribution {
              border-top: none !important;
              box-shadow: none !important;
              background: rgba(2, 44, 34, 0.8) !important;
              color: #FDFBF7 !important;
            }
            .leaflet-control-attribution a {
              color: #D4AF37 !important;
            }
          `
          document.head.appendChild(style)
        }

        // Load JS
        if (!document.getElementById('leaflet-js')) {
          const jsScript = document.createElement('script')
          jsScript.id = 'leaflet-js'
          jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          jsScript.async = true
          jsScript.onload = () => setLoaded(true)
          document.body.appendChild(jsScript)
        } else {
          const interval = setInterval(() => {
            if ((window as any).L) {
              setLoaded(true)
              clearInterval(interval)
            }
          }, 100)
        }
      }
    }

    checkLeaflet()
  }, [])

  useEffect(() => {
    if (!loaded || !containerRef.current) return
    const L = (window as any).L
    if (!L) return

    if (!mapInstance.current) {
      const centerLat = -6.26
      const centerLng = 106.98
      
      mapInstance.current = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: 11,
        scrollWheelZoom: false
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current)

      const goldIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #D4AF37; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #FDFBF7; box-shadow: 0 0 8px #D4AF37;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      })

      const group = L.featureGroup()
      congregations.forEach(cong => {
        const marker = L.marker([cong.lat, cong.lng], { icon: goldIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; color: #022c22; padding: 2px; line-height: 1.4; min-width: 140px;">
              <strong style="font-size: 13px; display: block; margin-bottom: 2px;">GPIB "${cong.name}"</strong>
              ${cong.loc ? `<div style="font-size: 11px; color: #555; font-weight: normal; margin-bottom: 4px;">${cong.loc}</div>` : ''}
              <div style="font-size: 9px; color: #B8860B; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Mupel Bekasi</div>
              <div style="margin-top: 6px; padding-top: 6px; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #e5e5e5;">
                <button 
                  onclick="const el = document.getElementById('jemaat-${cong.name.toLowerCase().replace(/\s+/g, '-')}'); if (el) { el.scrollIntoView({behavior:'smooth', block:'center'}); el.classList.add('bg-[#D4AF37]/35'); setTimeout(() => el.classList.remove('bg-[#D4AF37]/35'), 2000); }"
                  style="background: none; border: none; padding: 0; color: #D4AF37; font-weight: bold; cursor: pointer; text-decoration: underline; font-size: 10px; font-family: sans-serif; text-align: left; display: block;"
                >
                  Fokus di Daftar Jemaat 🔍
                </button>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=GPIB+${encodeURIComponent(cong.name)}+Bekasi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style="color: #666; font-weight: bold; text-decoration: underline; font-size: 10px; font-family: sans-serif; display: block; margin-top: 2px;"
                >
                  Buka Google Maps ↗
                </a>
              </div>
            </div>
          `)
        group.addLayer(marker)
      })
      group.addTo(mapInstance.current)

      mapInstance.current.fitBounds(group.getBounds(), { padding: [40, 40] })
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [loaded])

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-lg bg-[#022c22]/60">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[#D4AF37] font-light text-sm bg-[#022c22]/80 z-20">
          Memuat Peta Lokasi Jemaat...
        </div>
      )}
      <div ref={containerRef} className="w-full h-full z-10" />
    </div>
  )
}
