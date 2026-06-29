import { supabase } from './supabase/client'

export async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

export async function signOut() {
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
        window.location.href = '/login'
    }
}