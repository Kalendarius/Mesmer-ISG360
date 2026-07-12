import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { INSPECTION_TYPE_LABELS, type InspectionType } from "@/lib/utils/enums";
import { FINDING_RISK_LEVEL_VISUALS } from "@/lib/utils/risk";
import { ActiveToggleButton } from "@/components/active-toggle-button";
import { setTemplateActiveAction } from "../actions";
import { CategoryDialog } from "./category-dialog";
import { DeleteCategoryButton } from "./delete-category-button";
import { ItemDialog } from "./item-dialog";
import { NewVersionButton } from "./new-version-button";
import { setItemActiveAction } from "./actions";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function SablonDetayPage({ params }: PageProps) {
  const context = await requireUserContext();
  const { templateId } = await params;
  const canWrite = hasWriteAccess(context.activeOrganization.role);
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("checklist_templates")
    .select("*")
    .eq("id", templateId)
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .single();

  if (!template) notFound();

  const { data: version } = await supabase
    .from("checklist_template_versions")
    .select("id, version_no")
    .eq("checklist_template_id", templateId)
    .eq("is_current", true)
    .single();

  if (!version) notFound();

  const [{ data: categories }, { data: items }, { data: regulationVersions }] = await Promise.all([
    supabase
      .from("checklist_categories")
      .select("*")
      .eq("checklist_template_version_id", version.id)
      .order("sira_no"),
    supabase
      .from("checklist_items")
      .select("*, regulation_versions(madde_no, regulations(mevzuat_adi))")
      .eq("checklist_template_version_id", version.id)
      .is("deleted_at", null)
      .order("sira_no"),
    supabase
      .from("regulation_versions")
      .select("id, madde_no, madde_basligi, regulations!inner(mevzuat_adi, is_active)")
      .eq("organization_id", context.activeOrganization.organizationId)
      .eq("is_current", true)
      .eq("regulations.is_active", true),
  ]);

  const regulationOptions = (regulationVersions ?? []).map((rv) => ({
    id: rv.id,
    label: `${rv.regulations?.mevzuat_adi ?? ""} — Madde ${rv.madde_no}${rv.madde_basligi ? `: ${rv.madde_basligi}` : ""}`,
  }));

  const categoryOptions = (categories ?? []).map((c) => ({ id: c.id, ad: c.ad }));
  const nextCategorySiraNo = (categories?.length ?? 0) + 1;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{template.ad}</CardTitle>
            <p className="text-sm text-mesmer-text-muted">
              Versiyon {version.version_no}
              {template.sektor && ` · ${template.sektor}`}
              {template.denetim_turu && ` · ${INSPECTION_TYPE_LABELS[template.denetim_turu as InspectionType]}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={template.is_active ? "default" : "secondary"}>
              {template.is_active ? "Aktif" : "Pasif"}
            </Badge>
            {canWrite && (
              <>
                <Button
                  render={<Link href={`/kontrol-listeleri/${template.id}/duzenle`} />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                >
                  <Pencil className="size-4" />
                  Düzenle
                </Button>
                <ActiveToggleButton
                  isActive={template.is_active}
                  action={setTemplateActiveAction.bind(null, template.id, !template.is_active)}
                />
                <NewVersionButton templateId={template.id} />
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-mesmer-text">Kategoriler ve Kontrol Maddeleri</h2>
        {canWrite && <CategoryDialog templateId={template.id} versionId={version.id} nextSiraNo={nextCategorySiraNo} />}
      </div>

      {!categories || categories.length === 0 ? (
        <p className="text-sm text-mesmer-text-muted">Henüz kategori eklenmemiş.</p>
      ) : (
        categories.map((category) => {
          const categoryItems = (items ?? []).filter((i) => i.checklist_category_id === category.id);
          const nextItemSiraNo = categoryItems.length + 1;

          return (
            <Card key={category.id}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{category.ad}</CardTitle>
                {canWrite && (
                  <div className="flex items-center gap-2">
                    <CategoryDialog
                      templateId={template.id}
                      versionId={version.id}
                      nextSiraNo={category.sira_no}
                      category={{ id: category.id, ad: category.ad, sira_no: String(category.sira_no) }}
                    />
                    <ItemDialog
                      templateId={template.id}
                      versionId={version.id}
                      categories={categoryOptions}
                      regulationOptions={regulationOptions}
                      nextSiraNo={nextItemSiraNo}
                      defaultCategoryId={category.id}
                    />
                    <DeleteCategoryButton templateId={template.id} categoryId={category.id} categoryName={category.ad} />
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryItems.length === 0 ? (
                  <p className="text-sm text-mesmer-text-muted">Bu kategoride henüz madde yok.</p>
                ) : (
                  categoryItems.map((item) => {
                    const RiskIcon = FINDING_RISK_LEVEL_VISUALS[item.varsayilan_risk_seviyesi].icon;
                    return (
                      <div key={item.id} className="rounded-md border border-mesmer-border p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-mesmer-text">{item.soru}</p>
                            {item.aciklama && <p className="text-xs text-mesmer-text-muted">{item.aciklama}</p>}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-mesmer-text-muted">
                              <span
                                className={`inline-flex items-center gap-1 ${FINDING_RISK_LEVEL_VISUALS[item.varsayilan_risk_seviyesi].textClassName}`}
                              >
                                <RiskIcon className="size-3.5" />
                                {FINDING_RISK_LEVEL_VISUALS[item.varsayilan_risk_seviyesi].label}
                              </span>
                              {item.zorunlu && <Badge variant="outline">Zorunlu</Badge>}
                              {item.fotograf_gerekli && <Badge variant="outline">Fotoğraf Gerekli</Badge>}
                              {item.is_certification_opportunity && (
                                <Badge variant="outline" className="text-mesmer-secondary-text-on-light">
                                  MYK Fırsatı
                                </Badge>
                              )}
                              {item.regulation_versions && (
                                <span>
                                  {item.regulation_versions.regulations?.mevzuat_adi} — Madde{" "}
                                  {item.regulation_versions.madde_no}
                                </span>
                              )}
                              {!item.is_active && <Badge variant="secondary">Pasif</Badge>}
                            </div>
                          </div>
                          {canWrite && (
                            <div className="flex shrink-0 gap-2">
                              <ItemDialog
                                templateId={template.id}
                                versionId={version.id}
                                categories={categoryOptions}
                                regulationOptions={regulationOptions}
                                nextSiraNo={item.sira_no}
                                item={{
                                  id: item.id,
                                  checklist_category_id: item.checklist_category_id,
                                  soru: item.soru,
                                  aciklama: item.aciklama ?? "",
                                  sira_no: String(item.sira_no),
                                  regulation_version_id: item.regulation_version_id ?? "",
                                  standart_uygunsuzluk_aciklamasi: item.standart_uygunsuzluk_aciklamasi ?? "",
                                  onerilen_duzeltici_faaliyet: item.onerilen_duzeltici_faaliyet ?? "",
                                  varsayilan_risk_seviyesi: item.varsayilan_risk_seviyesi,
                                  zorunlu: item.zorunlu,
                                  fotograf_gerekli: item.fotograf_gerekli,
                                  is_certification_opportunity: item.is_certification_opportunity,
                                  is_active: item.is_active,
                                }}
                              />
                              <ActiveToggleButton
                                isActive={item.is_active}
                                action={setItemActiveAction.bind(null, template.id, item.id, !item.is_active)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
