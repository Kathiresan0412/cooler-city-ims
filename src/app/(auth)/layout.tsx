import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Branding panel */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-primary text-primary-foreground p-12">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold">{siteConfig.name}</h1>
          <p className="text-primary-foreground/80 text-lg">{siteConfig.description}</p>
        </div>
      </div>
      {/* Form panel */}
      <div className="flex flex-col justify-center items-center p-8">
        {children}
      </div>
    </div>
  );
}
