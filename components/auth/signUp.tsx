'use client'
import { authClient } from "@/lib/auth-client";
import {  useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUpForm } from "@/store/signUp";
import { showToast } from "nextjs-toast-notify";
import { User, Mail, Key } from "lucide-react";
import { useSwitcher } from "@/store/useSwitcher";


export default function SignUP () {
    const { data: session} = authClient.useSession()
    const router = useRouter();
    const name = useSignUpForm((state) => state.name)
    const email = useSignUpForm((state) => state.email)
    const password = useSignUpForm((state) => state.password)
    const { setName, setPassword, setEmail} = useSignUpForm();
    const setChoice = useSwitcher((state) => state.setChoice);

    useEffect(() => {
        if (session)
        router.push('/dashboard')
    }, [session, router])

    async function handleSignUp() {
        authClient.signUp.email(
            {
                name,
                email,
                password
            }
        )
        showToast.success("Sign up successful!")
    }

    async function handleSignIn() {
        authClient.signIn.email(
            {
                email,
                password
            }
        )
        showToast.success("Signed in successful!")
    }

return (
    <section className="flex flex-col max-w-md mx-auto mt-10 p-6 bg-card border border-border rounded-xl shadow-sm">
        <h2 className="text-txt-main text-2xl font-bold mb-6 text-center">Account erstellen</h2>
        
        <form className="grid grid-cols-[100px_1fr] gap-4 items-center">
            <label className="text-txt-muted text-sm font-medium items-center flex gap-2"><User/> Name</label>
            <input 
                type="text" 
                className="bg-background text-txt-main border-border border rounded-md p-2 focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="Dein Name" 
                onChange={(e) => setName(e.target.value)}
            />

            <label className="text-txt-muted text-sm font-medium items-center flex gap-2"><Mail/> Email</label>
            <input 
                type="email" 
                className="bg-background text-txt-main border-border border rounded-md p-2 focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="email@beispiel.de" 
                onChange={(e) => setEmail(e.target.value)}
            />

            <label className="text-txt-muted text-sm font-medium items-center flex gap-2"><Key/> Passwort</label>
            <input 
                name="password"  
                className="bg-background text-txt-main border border-border rounded-md p-2 focus:ring-2 focus:ring-primary outline-none transition-all" 
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => setPassword(e.target.value)}
            />
        </form>     

        <button 
            onClick={handleSignUp} 
            className="mt-8 bg-primary text-txt-inv py-2.5 rounded-lg hover:bg-primary-hover cursor-pointer font-semibold transition-colors shadow-md active:scale-[0.98]"
        >
            Registrieren
        </button>

        <p className="mt-4 text-center text-txt-muted text-xs">
            Schon einen Account? <button className="text-primary cursor-pointer hover:underline" onClick={() => setChoice('signIn')}>Anmelden</button>
        </p>
    </section>
)
}