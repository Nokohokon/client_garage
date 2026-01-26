'use client'
import { useSwitcher } from "@/store/useSwitcher";
import { useEffect } from "react";
import SignUP from "@/components/auth/signUp";
import SignIn from "@/components/auth/signIn";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function Home() {
  const choice = useSwitcher((state) => state.choice);
  const setChoice = useSwitcher((state) => state.setChoice);
  const {data: session} = authClient.useSession();

  useEffect(() => {
    if (session) {
      // Wenn der Benutzer bereits angemeldet ist, weiterleiten
      window.location.href = "/dashboard";
    }
  }, [session]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 transition-colors duration-300">
      <main className="w-full max-w-2xl flex flex-col items-center">
        
        {/* Header mit besserem Spacing & Textfarbe */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-txt-main tracking-tight mb-4">
            <span className="text-secondary">Log-In</span> zum Fortfahren <span className="text-warning">benötigt</span>!
          </h1>
          <p className="text-txt-muted text-lg">
            Bitte loggen Sie sich mit Ihrem <Link href="/" className="text-info hover:text-info-hover">TCub</Link> Account ein, um in das CRM zu gelangen .
          </p>
        </header>

        {/* Die Auth-Card: Dünnerer Border, dezenter Schatten */}
        <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-xl shadow-black/5 transition-all">
          
          {/* Toggle Switcher: Sieht jetzt aus wie ein professioneller Tab-Switcher */}
          <div className="flex bg-background p-1.5 rounded-xl border border-border mb-8">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                choice === "signIn" 
                  ? "bg-card text-txt-main shadow-sm" 
                  : "text-txt-muted hover:text-txt-main cursor-pointer"
              }`}
              onClick={() => setChoice("signIn")}
            >
              Anmelden
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                choice === "signUp" 
                  ? "bg-card text-txt-main shadow-sm" 
                  : "text-txt-muted hover:text-txt-main cursor-pointer"
              }`}
              onClick={() => setChoice("signUp")}
            >
              Registrieren
            </button>
          </div>

          {/* Content Bereich mit kleiner Fade-In Animation (simuliert durch transition) */}
          <div className="min-h-[300px] flex flex-col justify-center">
            {choice === "signUp" ? (
              <SignUP />
            ) : (
              <div className="text-center py-10">
                <SignIn/>
              </div>
            )}
          </div>
        </div>

        {/* Footer-Info */}
        <footer className="mt-12 text-txt-muted text-sm italic">
          &copy; 2026 TCUB
        </footer>
      </main>
    </div>
  );
}