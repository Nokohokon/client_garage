'use client'
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";
import { User, Key } from "lucide-react";
import { useSignUpForm } from "@/store/signUp";

export default function SignIn() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const password = useSignUpForm((state) => state.password)
    const email = useSignUpForm((state) => state.email)
    const loading = useSignUpForm((state) => state.loading)
    const { setEmail, setPassword, setLoading} = useSignUpForm();


    useEffect(() => {
        if (session) {
            router.push('/dashboard');
        }
    }, [session, router]);

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault(); // Verhindert Neuladen der Seite
        setLoading(loading)        
        try {
            await authClient.signIn.email({
                email,
                password,
                callbackURL: "/dashboard"
            });
            showToast.success("Erfolgreich angemeldet!");
            showToast.info("Name: " + session?.user.name);
        } catch (error) {
            showToast.error("Login fehlgeschlagen. Daten prüfen.");
        } finally {
            setLoading(loading)
        }
        }
    

    return (
        <section className="flex flex-col w-full animate-in fade-in duration-500">
            <form onSubmit={handleSignIn} className="grid grid-cols-[80px_1fr] gap-4 items-center">
                
                <label className="text-txt-muted text-sm font-medium items-center flex gap-2"><User/> Email</label>
                <input 
                    type="email" 
                    required
                    className="bg-background text-txt-main border-border border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-txt-muted/50" 
                    placeholder="deine@email.de" 
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label className="text-txt-muted text-sm font-medium items-center flex gap-2"><Key/> Passwort</label>
                <input 
                    type="password" 
                    required
                    className="bg-background text-txt-main border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-txt-muted/50" 
                    placeholder="••••••••" 
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Passwort vergessen Link */}
                <div className="col-start-2 text-right">
                    <span className="text-xs text-primary hover:underline cursor-pointer">
                        Passwort vergessen?
                    </span>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="col-span-2 mt-4 bg-primary text-txt-inv py-2.5 rounded-lg font-bold hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                    {loading ? "Wird angemeldet..." : "Einloggen"}
                </button>
            </form>


        </section>
    );
}