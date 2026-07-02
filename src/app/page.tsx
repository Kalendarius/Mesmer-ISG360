import { Logo } from "@/components/brand/logo";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-mesmer-background px-6 text-center">
      <Logo variant="full" priority className="scale-125" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-mesmer-text">MESMER İSG360</h1>
        <p className="text-sm text-mesmer-text-muted">
          İSG Denetim ve Uygunsuzluk Takip Sistemi
        </p>
      </div>
    </div>
  );
}
