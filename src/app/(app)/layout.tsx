import { Logo } from "@/components/brand/logo";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { requireUserContext } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const context = await requireUserContext();
  const { activeOrganization } = context;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-mesmer-border bg-mesmer-surface px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Logo variant="symbol" priority />
          </div>
          <span className="hidden text-sm font-medium text-mesmer-text md:inline">
            {activeOrganization.organizationDisplayName}
          </span>
          <UserMenu
            fullName={context.fullName}
            email={context.email}
            role={activeOrganization.role}
            organizationDisplayName={activeOrganization.organizationDisplayName}
          />
        </header>
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
