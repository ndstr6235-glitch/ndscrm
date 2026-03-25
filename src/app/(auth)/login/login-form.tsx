"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-gradient-to-br from-sidebar to-[#1a1f2e]">
      <div className="w-full max-w-[420px] animate-fade-in">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-[11px] bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg">
            ₿
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Nodi Star CRM
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40 font-medium">
            Přihlášení do systému
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] p-6 md:p-8">
          <form action={action}>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/60 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-3.5 rounded-[10px] bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/30 text-sm outline-none transition-colors focus:border-gold focus:bg-white/[0.1]"
                placeholder="vas@email.cz"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/60 mb-1.5"
              >
                Heslo
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-3.5 pr-11 rounded-[10px] bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/30 text-sm outline-none transition-colors focus:border-gold focus:bg-white/[0.1]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors text-sm"
                  tabIndex={-1}
                >
                  {showPassword ? "Skrýt" : "Zobrazit"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {state?.error && (
              <div className="mb-4 text-sm text-ruby text-center font-medium">
                {state.error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="w-full h-12 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white font-semibold text-sm tracking-wide transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {pending ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Přihlásit se &rarr;</>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-white/20">
          Nodi Star CRM &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
