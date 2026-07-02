"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";
import { USER_ROLE_LABELS, type UserRole } from "@/lib/utils/enums";

interface UserMenuProps {
  fullName: string | null;
  email: string;
  role: UserRole;
  organizationDisplayName: string;
}

function initials(fullName: string | null, email: string) {
  if (fullName) {
    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }
  return email[0]?.toUpperCase() ?? "?";
}

export function UserMenu({ fullName, email, role, organizationDisplayName }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-mesmer-primary">
        <Avatar className="size-9">
          <AvatarFallback className="bg-mesmer-primary-light text-mesmer-primary">
            {initials(fullName, email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-mesmer-text">{fullName ?? email}</span>
            <span className="text-xs font-normal text-mesmer-text-muted">{email}</span>
            <span className="text-xs font-normal text-mesmer-text-muted">
              {organizationDisplayName} · {USER_ROLE_LABELS[role]}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profil" />}>
            <User className="size-4" />
            Profilim
          </DropdownMenuItem>
          {role === "organization_admin" && (
            <DropdownMenuItem render={<Link href="/ayarlar" />}>
              <Settings className="size-4" />
              Ayarlar
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(() => signOutAction())}
          >
            <LogOut className="size-4" />
            {isPending ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
