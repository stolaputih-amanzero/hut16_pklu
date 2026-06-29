// src/app/login/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError('Email atau password salah. Silakan coba lagi.')
        } else {
            window.location.href = '/dashboard'
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-gradient p-4">
            <Card className="w-full max-w-md border-emerald shadow-emerald">
                <CardHeader className="text-center">
                    <div className="logo-container">
                        {/* Pastikan nama file sama dengan yang ada di folder public/ */}
                        <img
                            src="/logo_hut16_pklu.png"
                            alt="Logo HUT ke-16 PKLU GPIB"
                            className="logo-image"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-emerald-900">
                        Panitia HUT ke-16 PKLU GPIB
                    </CardTitle>
                    <p className="text-emerald-700 mt-2">
                        Sistem Pengelolaan Proposal Donatur & Sponsorship
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="email@panitia.com"
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="form-input"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="form-button"
                        >
                            {loading ? 'Memproses...' : 'Masuk ke Sistem'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-emerald-700">
                        <p>
                            Untuk akses, hubungi Ketua Panitia:
                            <span className="font-medium"> Vrilly Rondonuwu</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}