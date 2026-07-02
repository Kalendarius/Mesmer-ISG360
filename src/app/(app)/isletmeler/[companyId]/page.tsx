import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { HAZARD_CLASS_LABELS, type HazardClass } from "@/lib/utils/enums";
import { ActiveToggleButton } from "@/components/active-toggle-button";
import { setCompanyActiveAction } from "../actions";
import { setBranchActiveAction, setContactActiveAction } from "./actions";
import { BranchDialog } from "./branch-dialog";
import { ContactDialog } from "./contact-dialog";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function IsletmeDetayPage({ params }: PageProps) {
  const context = await requireUserContext();
  const { companyId } = await params;
  const canWrite = hasWriteAccess(context.activeOrganization.role);
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .single();

  if (!company) notFound();

  const [{ data: branches }, { data: contacts }] = await Promise.all([
    supabase
      .from("company_branches")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("sube_adi"),
    supabase
      .from("company_contacts")
      .select("*, company_branches(sube_adi)")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("ad_soyad"),
  ]);

  const branchOptions = (branches ?? []).map((b) => ({ id: b.id, sube_adi: b.sube_adi }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{company.unvan}</CardTitle>
            {company.kisa_ad && <p className="text-sm text-mesmer-text-muted">{company.kisa_ad}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={company.is_active ? "default" : "secondary"}>
              {company.is_active ? "Aktif" : "Pasif"}
            </Badge>
            {canWrite && (
              <>
                <Button
                  render={<Link href={`/isletmeler/${company.id}/duzenle`} />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                >
                  <Pencil className="size-4" />
                  Düzenle
                </Button>
                <ActiveToggleButton
                  isActive={company.is_active}
                  action={setCompanyActiveAction.bind(null, company.id, !company.is_active)}
                />
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-mesmer-text-muted">Vergi No</dt>
              <dd className="font-medium text-mesmer-text">{company.vergi_no ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-mesmer-text-muted">Tehlike Sınıfı</dt>
              <dd className="font-medium text-mesmer-text">
                {company.tehlike_sinifi ? HAZARD_CLASS_LABELS[company.tehlike_sinifi as HazardClass] : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-mesmer-text-muted">Faaliyet Konusu</dt>
              <dd className="font-medium text-mesmer-text">{company.faaliyet_konusu ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-mesmer-text-muted">Çalışan Sayısı</dt>
              <dd className="font-medium text-mesmer-text">{company.calisan_sayisi ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-mesmer-text-muted">Telefon</dt>
              <dd className="font-medium text-mesmer-text">{company.telefon ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-mesmer-text-muted">E-posta</dt>
              <dd className="font-medium text-mesmer-text">{company.eposta ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-mesmer-text-muted">Web Sitesi</dt>
              <dd className="font-medium text-mesmer-text">{company.website ?? "—"}</dd>
            </div>
            {company.notlar && (
              <div className="sm:col-span-3">
                <dt className="text-mesmer-text-muted">Notlar</dt>
                <dd className="font-medium text-mesmer-text whitespace-pre-wrap">{company.notlar}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Şubeler</CardTitle>
          {canWrite && <BranchDialog companyId={company.id} />}
        </CardHeader>
        <CardContent>
          {!branches || branches.length === 0 ? (
            <p className="text-sm text-mesmer-text-muted">Henüz şube eklenmemiş.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-mesmer-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şube Adı</TableHead>
                    <TableHead>İl / İlçe</TableHead>
                    <TableHead>Yetkili Kişi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.sube_adi}</TableCell>
                      <TableCell>
                        {[b.il, b.ilce].filter(Boolean).join(" / ") || "—"}
                      </TableCell>
                      <TableCell>{b.yetkili_kisi ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={b.is_active ? "default" : "secondary"}>
                          {b.is_active ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canWrite && (
                          <div className="flex justify-end gap-2">
                            <BranchDialog
                              companyId={company.id}
                              branch={{
                                id: b.id,
                                sube_adi: b.sube_adi,
                                adres: b.adres ?? "",
                                il: b.il ?? "",
                                ilce: b.ilce ?? "",
                                calisan_sayisi: b.calisan_sayisi != null ? String(b.calisan_sayisi) : "",
                                yetkili_kisi: b.yetkili_kisi ?? "",
                                yetkili_eposta: b.yetkili_eposta ?? "",
                                yetkili_telefon: b.yetkili_telefon ?? "",
                                is_active: b.is_active,
                              }}
                            />
                            <ActiveToggleButton
                              isActive={b.is_active}
                              action={setBranchActiveAction.bind(null, company.id, b.id, !b.is_active)}
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Yetkililer</CardTitle>
          {canWrite && <ContactDialog companyId={company.id} branches={branchOptions} />}
        </CardHeader>
        <CardContent>
          {!contacts || contacts.length === 0 ? (
            <p className="text-sm text-mesmer-text-muted">Henüz yetkili eklenmemiş.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-mesmer-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Görev</TableHead>
                    <TableHead>Şube</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.ad_soyad}
                        {c.ana_yetkili && (
                          <Badge variant="outline" className="ml-2">
                            Ana Yetkili
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{c.gorev ?? "—"}</TableCell>
                      <TableCell>{c.company_branches?.sube_adi ?? "İşletme geneli"}</TableCell>
                      <TableCell>
                        <p>{c.eposta ?? "—"}</p>
                        <p className="text-xs text-mesmer-text-muted">{c.telefon ?? ""}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.is_active ? "default" : "secondary"}>
                          {c.is_active ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canWrite && (
                          <div className="flex justify-end gap-2">
                            <ContactDialog
                              companyId={company.id}
                              branches={branchOptions}
                              contact={{
                                id: c.id,
                                branch_id: c.branch_id ?? undefined,
                                ad_soyad: c.ad_soyad,
                                gorev: c.gorev ?? "",
                                eposta: c.eposta ?? "",
                                telefon: c.telefon ?? "",
                                bildirim_alsin: c.bildirim_alsin,
                                ana_yetkili: c.ana_yetkili,
                                is_active: c.is_active,
                              }}
                            />
                            <ActiveToggleButton
                              isActive={c.is_active}
                              action={setContactActiveAction.bind(null, company.id, c.id, !c.is_active)}
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
