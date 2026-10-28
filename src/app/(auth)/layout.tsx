import Image from "next/image";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fffaf3] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#075394] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div aria-hidden="true" className="absolute -right-32 -top-36 h-[28rem] w-[28rem] rounded-full border-[50px] border-white/5" />
        <div aria-hidden="true" className="absolute -bottom-48 -left-24 h-[30rem] w-[30rem] rounded-full bg-[#ffc900]/10" />

        <div className="relative z-10 flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-white/75">
          <span className="h-2 w-2 rounded-full bg-[#ffd000]" />
          COOLER CITY · JAFFNA
        </div>

        <div className="relative z-10 mx-auto w-full max-w-2xl">
          <div className="rounded-[2rem] bg-white p-5 shadow-2xl shadow-[#002c53]/25">
            <Image
              src="/images/brand/cooler-city-logo.png"
              alt="Cooler City Icecream · Tea"
              width={1052}
              height={331}
              priority
              className="h-auto w-full"
            />
          </div>
          <div className="mt-8 flex items-center justify-between gap-6">
            <div className="max-w-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ffd000]">{siteConfig.name}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight xl:text-4xl">A little joy in every scoop.</h2>
              <p className="mt-3 text-base leading-7 text-white/75">{siteConfig.description}</p>
            </div>
            <Image
              src="/images/brand/kuku-mascot.png"
              alt="KUKU, Cooler City’s cheerful ice cream mascot"
              width={290}
              height={290}
              className="h-36 w-36 shrink-0 rounded-full bg-white object-contain p-2 xl:h-44 xl:w-44"
            />
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/20 bg-white shadow-lg">
            <Image
              src="/images/brand/new-flavors.jpg"
              alt="More new Cooler City flavors coming soon"
              width={1920}
              height={300}
              className="h-auto w-full"
            />
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/55">Made for the moments worth sharing.</p>
      </section>

      <section className="flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <Image src="/images/brand/kuku-mascot.png" alt="KUKU mascot" width={64} height={64} className="h-16 w-16 rounded-full bg-white object-contain shadow-sm" />
          <div>
            <p className="font-bold text-[#075394]">Cooler City</p>
            <p className="text-xs text-slate-500">Icecream · Tea</p>
          </div>
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-slate-400">Cooler City Jaffna · Inventory Management</p>
      </section>
    </main>
  );
}
