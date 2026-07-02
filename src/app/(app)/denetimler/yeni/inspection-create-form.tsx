"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inspectionCreateSchema, type InspectionCreateInput } from "@/lib/validation/inspection";
import { INSPECTION_TYPES, INSPECTION_TYPE_LABELS } from "@/lib/utils/enums";
import { createInspectionAction } from "../actions";

interface Company {
  id: string;
  unvan: string;
}
interface Branch {
  id: string;
  company_id: string;
  sube_adi: string;
}
interface Contact {
  id: string;
  company_id: string;
  branch_id: string | null;
  ad_soyad: string;
}
interface Template {
  id: string;
  ad: string;
}
interface Expert {
  id: string;
  name: string;
}

interface InspectionCreateFormProps {
  companies: Company[];
  branches: Branch[];
  contacts: Contact[];
  templates: Template[];
  experts: Expert[];
  defaultUzmanId: string;
}

export function InspectionCreateForm({
  companies,
  branches,
  contacts,
  templates,
  experts,
  defaultUzmanId,
}: InspectionCreateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InspectionCreateInput>({
    resolver: zodResolver(inspectionCreateSchema),
    defaultValues: {
      denetim_turu: "periyodik",
      uzman_user_id: defaultUzmanId,
      denetim_tarihi: new Date().toISOString().slice(0, 10),
    },
  });

  const selectedCompanyId = useWatch({ control, name: "company_id" });
  const selectedBranchId = useWatch({ control, name: "branch_id" });

  const availableBranches = useMemo(
    () => branches.filter((b) => b.company_id === selectedCompanyId),
    [branches, selectedCompanyId],
  );
  const availableContacts = useMemo(
    () =>
      contacts.filter(
        (c) => c.company_id === selectedCompanyId && (c.branch_id === null || c.branch_id === selectedBranchId),
      ),
    [contacts, selectedCompanyId, selectedBranchId],
  );

  const companyItems = useMemo(() => Object.fromEntries(companies.map((c) => [c.id, c.unvan])), [companies]);
  const branchItems = useMemo(
    () => Object.fromEntries(availableBranches.map((b) => [b.id, b.sube_adi])),
    [availableBranches],
  );
  const contactItems = useMemo(
    () => Object.fromEntries(availableContacts.map((c) => [c.id, c.ad_soyad])),
    [availableContacts],
  );
  const templateItems = useMemo(() => Object.fromEntries(templates.map((t) => [t.id, t.ad])), [templates]);
  const expertItems = useMemo(() => Object.fromEntries(experts.map((e) => [e.id, e.name])), [experts]);

  const onSubmit = (data: InspectionCreateInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createInspectionAction(data);
      if (result?.error) setFormError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company_id">İşletme *</Label>
          <Controller
            control={control}
            name="company_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange} items={companyItems}>
                <SelectTrigger id="company_id" className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.unvan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.company_id && <p className="text-sm text-risk-high">{errors.company_id.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="branch_id">Şube</Label>
          <Controller
            control={control}
            name="branch_id"
            render={({ field }) => (
              <Select
                value={field.value || "yok"}
                onValueChange={(v) => field.onChange(v === "yok" ? "" : v)}
                items={{ yok: "Şube yok (işletme geneli)", ...branchItems }}
                disabled={!selectedCompanyId}
              >
                <SelectTrigger id="branch_id" className="w-full">
                  <SelectValue placeholder={selectedCompanyId ? "Seçiniz" : "Önce işletme seçin"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yok">Şube yok (işletme geneli)</SelectItem>
                  {availableBranches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.sube_adi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.branch_id && <p className="text-sm text-risk-high">{errors.branch_id.message}</p>}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="checklist_template_id">Kontrol Listesi *</Label>
          <Controller
            control={control}
            name="checklist_template_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange} items={templateItems}>
                <SelectTrigger id="checklist_template_id" className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.ad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.checklist_template_id && (
            <p className="text-sm text-risk-high">{errors.checklist_template_id.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="denetim_turu">Denetim Türü *</Label>
          <Controller
            control={control}
            name="denetim_turu"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} items={INSPECTION_TYPE_LABELS}>
                <SelectTrigger id="denetim_turu" className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {INSPECTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {INSPECTION_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="uzman_user_id">Denetimi Yapan Uzman *</Label>
          <Controller
            control={control}
            name="uzman_user_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange} items={expertItems}>
                <SelectTrigger id="uzman_user_id" className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {experts.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.uzman_user_id && <p className="text-sm text-risk-high">{errors.uzman_user_id.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="denetim_tarihi">Denetim Tarihi *</Label>
          <Input id="denetim_tarihi" type="date" {...register("denetim_tarihi")} />
          {errors.denetim_tarihi && <p className="text-sm text-risk-high">{errors.denetim_tarihi.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="yetkili_contact_id">İşletme Yetkilisi</Label>
          <Controller
            control={control}
            name="yetkili_contact_id"
            render={({ field }) => (
              <Select
                value={field.value || "yok"}
                onValueChange={(v) => field.onChange(v === "yok" ? "" : v)}
                items={{ yok: "Yok", ...contactItems }}
                disabled={!selectedCompanyId}
              >
                <SelectTrigger id="yetkili_contact_id" className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yok">Yok</SelectItem>
                  {availableContacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.ad_soyad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="baslangic_saati">Başlangıç Saati</Label>
          <Input id="baslangic_saati" type="time" {...register("baslangic_saati")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bitis_saati">Bitiş Saati</Label>
          <Input id="bitis_saati" type="time" {...register("bitis_saati")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="genel_notlar">Genel Notlar</Label>
          <Textarea id="genel_notlar" rows={3} {...register("genel_notlar")} />
        </div>
      </div>
      {formError && <p className="text-sm text-risk-high">{formError}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Oluşturuluyor..." : "Denetimi Başlat"}
      </Button>
    </form>
  );
}
