import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-[1.75rem] border border-[#f1e7d9] bg-white p-7 shadow-xl shadow-[#5d4424]/[0.06] sm:p-10">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e69ab8]">Your Cooler City workspace</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#102d49]">Welcome back</h1>
        <p className="text-sm leading-6 text-slate-500">Sign in to manage stock, sales, and store operations.</p>
      </div>
      <LoginForm />
    </div>
  );
}
