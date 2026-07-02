"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActiveToggleButton } from "@/components/active-toggle-button";
import { USER_ROLE_LABELS, type UserRole } from "@/lib/utils/enums";
import { setMemberActiveAction } from "./actions";

interface MemberRow {
  id: string;
  fullName: string | null;
  email: string | null;
  role: UserRole;
  isActive: boolean;
}

export function MembersTable({ members }: { members: MemberRow[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-mesmer-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.fullName ?? "—"}</TableCell>
              <TableCell>{m.email ?? "—"}</TableCell>
              <TableCell>{USER_ROLE_LABELS[m.role]}</TableCell>
              <TableCell>
                <Badge variant={m.isActive ? "default" : "secondary"}>{m.isActive ? "Aktif" : "Pasif"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <ActiveToggleButton isActive={m.isActive} action={setMemberActiveAction.bind(null, m.id, !m.isActive)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
