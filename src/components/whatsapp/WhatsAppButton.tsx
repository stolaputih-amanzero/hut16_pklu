'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppLink, WATemplateType, Lang } from '@/lib/whatsapp'
import { useState } from 'react'

interface Props {
    phone: string
    templateType: WATemplateType
    lang: Lang
    data: any
    label?: string
    variant?: 'default' | 'secondary' | 'outline' | 'ghost'
}

export function WhatsAppButton({
    phone,
    templateType,
    lang,
    data,
    label = 'Kirim via WhatsApp',
    variant = 'default',
}: Props) {
    const [isLoading, setIsLoading] = useState(false)

    const [isCopied, setIsCopied] = useState(false)

    const handleSend = async () => {
        setIsLoading(true)

        try {
            const link = buildWhatsAppLink(phone, templateType, lang, data)

            if (typeof window !== 'undefined') {
                window.open(link, '_blank', 'noopener,noreferrer')
            }

            // Set timeout to reset loading state
            setTimeout(() => {
                setIsLoading(false)
            }, 1500)
        } catch (error) {
            console.error('Error sending WhatsApp:', error)
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant={variant}
            asChild
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSend}
            disabled={isLoading}
        >
            <a href="#" target="_blank" rel="noopener noreferrer">
                {isLoading ? (
                    <>
                        <MessageCircle className="h-4 w-4 animate-spin" />
                        Mengirim...
                    </>
                ) : (
                    <>
                        <MessageCircle className="h-4 w-4" />
                        {label}
                    </>
                )}
            </a>
        </Button>
    )
}