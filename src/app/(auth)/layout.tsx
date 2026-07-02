import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-mesmer-background px-4 py-12">
      <Logo variant="full" priority className="scale-125" />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
