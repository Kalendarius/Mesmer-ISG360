import { AlertTriangle, BookText, Building2, ClipboardCheck, ClipboardList, Home, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** Alt navigasyon (mobil) için kısa etiket; verilmezse `label` kullanılır. */
  mobileLabel?: string;
  icon: LucideIcon;
}

// Yalnızca gerçekten var olan rotalar listelenir; yeni modüller
// tamamlandıkça buraya eklenir.
export const NAV_ITEMS: NavItem[] = [
  { href: "/anasayfa", label: "Ana Sayfa", mobileLabel: "Anasayfa", icon: Home },
  { href: "/isletmeler", label: "İşletmeler", mobileLabel: "İşletme", icon: Building2 },
  { href: "/denetimler", label: "Denetimler", mobileLabel: "Denetim", icon: ClipboardCheck },
  { href: "/uygunsuzluklar", label: "Uygunsuzluklar", mobileLabel: "Bulgular", icon: AlertTriangle },
  { href: "/mevzuat", label: "Mevzuat", icon: BookText },
  { href: "/kontrol-listeleri", label: "Kontrol Listeleri", mobileLabel: "Kontrol", icon: ClipboardList },
  { href: "/profil", label: "Profilim", mobileLabel: "Profil", icon: User },
];

/** Alt rotalarda da (ör. /isletmeler/[id]) ilgili nav öğesini aktif gösterir. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
