'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'

interface Option {
    value: string
    label: string
    sublabel?: string
}

interface SearchableSelectProps {
    options: Option[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Pilih salah satu...',
    searchPlaceholder = 'Cari...',
    emptyMessage = 'Tidak ditemukan.',
    className = '',
    disabled = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedOption = options.find(opt => opt.value === value)

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleSelect = (val: string) => {
        onChange(val)
        setIsOpen(false)
        setSearchQuery('')
    }

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Trigger Button */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full p-3 bg-black/20 border border-[#D4AF37]/30 text-[#FDFBF7] rounded-lg flex items-center justify-between transition-all ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-black/35 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]'
                }`}
            >
                <div className="flex flex-col text-left">
                    <span className={selectedOption ? 'text-[#FDFBF7]' : 'text-white/30'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.sublabel && (
                        <span className="text-[10px] text-[#D4AF37]/80">{selectedOption.sublabel}</span>
                    )}
                </div>
                <ChevronDown className={`h-4 w-4 text-[#D4AF37] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#022c22] border border-[#D4AF37]/40 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search Input */}
                    <div className="flex items-center gap-2 px-3 border-b border-[#D4AF37]/20 bg-black/10">
                        <Search className="h-4 w-4 text-[#D4AF37] shrink-0" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 bg-transparent border-0 text-[#FDFBF7] placeholder-white/30 text-sm focus:outline-none focus:ring-0"
                            autoFocus
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-white/40 text-center">{emptyMessage}</div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = opt.value === value
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                                            isSelected
                                                ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                                : 'text-[#FDFBF7] hover:bg-[#D4AF37]/10'
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{opt.label}</span>
                                            {opt.sublabel && (
                                                <span className="text-[10px] opacity-75">{opt.sublabel}</span>
                                            )}
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 text-[#D4AF37]" />}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
