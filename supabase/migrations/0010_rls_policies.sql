-- RLS'i tüm tenant tablolarında etkinleştir ve politikaları tanımla.
-- Kural: select -> current_organization_ids() üyeliği; insert/update ->
-- ayrıca can_write_in_org() (organization_admin | safety_expert). delete
-- politikası yoktur (silme yok, deleted_at ile soft delete).

-- organizations ------------------------------------------------------------
alter table public.organizations enable row level security;

create policy organizations_select on public.organizations
  for select using (id in (select public.current_organization_ids()));

create policy organizations_update on public.organizations
  for update using (public.is_org_admin(id)) with check (public.is_org_admin(id));

-- profiles -------------------------------------------------------------------
-- Kimlik tablosu: kişi birden fazla kuruluşa üye olabileceğinden tek bir
-- organization_id taşımaz (bkz. CLAUDE.md). Görünürlük, ortak kuruluş
-- üyeliği üzerinden sağlanır.
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.organization_members mine
      join public.organization_members theirs
        on theirs.organization_id = mine.organization_id
      where mine.user_id = auth.uid()
        and mine.is_active and mine.deleted_at is null
        and theirs.user_id = profiles.id
        and theirs.is_active and theirs.deleted_at is null
    )
  );

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- organization_members --------------------------------------------------------
alter table public.organization_members enable row level security;

create policy organization_members_select on public.organization_members
  for select using (organization_id in (select public.current_organization_ids()));

create policy organization_members_insert on public.organization_members
  for insert with check (public.is_org_admin(organization_id));

create policy organization_members_update on public.organization_members
  for update using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

-- companies / company_branches / company_contacts -----------------------------
alter table public.companies enable row level security;

create policy companies_select on public.companies
  for select using (organization_id in (select public.current_organization_ids()));

create policy companies_insert on public.companies
  for insert with check (public.can_write_in_org(organization_id));

create policy companies_update on public.companies
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

alter table public.company_branches enable row level security;

create policy company_branches_select on public.company_branches
  for select using (organization_id in (select public.current_organization_ids()));

create policy company_branches_insert on public.company_branches
  for insert with check (public.can_write_in_org(organization_id));

create policy company_branches_update on public.company_branches
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

alter table public.company_contacts enable row level security;

create policy company_contacts_select on public.company_contacts
  for select using (organization_id in (select public.current_organization_ids()));

create policy company_contacts_insert on public.company_contacts
  for insert with check (public.can_write_in_org(organization_id));

create policy company_contacts_update on public.company_contacts
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

-- regulations / regulation_versions --------------------------------------------
alter table public.regulations enable row level security;

create policy regulations_select on public.regulations
  for select using (organization_id in (select public.current_organization_ids()));

create policy regulations_insert on public.regulations
  for insert with check (public.can_write_in_org(organization_id));

create policy regulations_update on public.regulations
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

alter table public.regulation_versions enable row level security;

create policy regulation_versions_select on public.regulation_versions
  for select using (organization_id in (select public.current_organization_ids()));

create policy regulation_versions_insert on public.regulation_versions
  for insert with check (public.can_write_in_org(organization_id));

create policy regulation_versions_update on public.regulation_versions
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

-- checklist_templates / versions / categories / items --------------------------
alter table public.checklist_templates enable row level security;

create policy checklist_templates_select on public.checklist_templates
  for select using (organization_id in (select public.current_organization_ids()));

create policy checklist_templates_insert on public.checklist_templates
  for insert with check (public.can_write_in_org(organization_id));

create policy checklist_templates_update on public.checklist_templates
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

alter table public.checklist_template_versions enable row level security;

create policy checklist_template_versions_select on public.checklist_template_versions
  for select using (organization_id in (select public.current_organization_ids()));

create policy checklist_template_versions_insert on public.checklist_template_versions
  for insert with check (public.can_write_in_org(organization_id));

create policy checklist_template_versions_update on public.checklist_template_versions
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

alter table public.checklist_categories enable row level security;

create policy checklist_categories_select on public.checklist_categories
  for select using (organization_id in (select public.current_organization_ids()));

create policy checklist_categories_insert on public.checklist_categories
  for insert with check (public.can_write_in_org(organization_id));

create policy checklist_categories_update on public.checklist_categories
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

alter table public.checklist_items enable row level security;

create policy checklist_items_select on public.checklist_items
  for select using (organization_id in (select public.current_organization_ids()));

create policy checklist_items_insert on public.checklist_items
  for insert with check (public.can_write_in_org(organization_id));

create policy checklist_items_update on public.checklist_items
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

-- inspections / inspection_responses -------------------------------------------
alter table public.inspections enable row level security;

create policy inspections_select on public.inspections
  for select using (organization_id in (select public.current_organization_ids()));

create policy inspections_insert on public.inspections
  for insert with check (public.can_write_in_org(organization_id));

create policy inspections_update on public.inspections
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

alter table public.inspection_responses enable row level security;

create policy inspection_responses_select on public.inspection_responses
  for select using (organization_id in (select public.current_organization_ids()));

create policy inspection_responses_insert on public.inspection_responses
  for insert with check (public.can_write_in_org(organization_id));

create policy inspection_responses_update on public.inspection_responses
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

-- findings / finding_photos / corrective_actions -------------------------------
alter table public.findings enable row level security;

create policy findings_select on public.findings
  for select using (organization_id in (select public.current_organization_ids()));

create policy findings_insert on public.findings
  for insert with check (public.can_write_in_org(organization_id));

create policy findings_update on public.findings
  for update using (public.can_write_in_org(organization_id)) with check (public.can_write_in_org(organization_id));

alter table public.finding_photos enable row level security;

create policy finding_photos_select on public.finding_photos
  for select using (organization_id in (select public.current_organization_ids()));

create policy finding_photos_insert on public.finding_photos
  for insert with check (public.can_write_in_org(organization_id));

alter table public.corrective_actions enable row level security;

create policy corrective_actions_select on public.corrective_actions
  for select using (organization_id in (select public.current_organization_ids()));

create policy corrective_actions_insert on public.corrective_actions
  for insert with check (public.can_write_in_org(organization_id));

-- reports / report_snapshots (değiştirilemez) ----------------------------------
alter table public.reports enable row level security;

create policy reports_select on public.reports
  for select using (organization_id in (select public.current_organization_ids()));

create policy reports_insert on public.reports
  for insert with check (public.can_write_in_org(organization_id));

alter table public.report_snapshots enable row level security;

create policy report_snapshots_select on public.report_snapshots
  for select using (organization_id in (select public.current_organization_ids()));

create policy report_snapshots_insert on public.report_snapshots
  for insert with check (public.can_write_in_org(organization_id));

-- email_logs (değiştirilemez) ---------------------------------------------------
alter table public.email_logs enable row level security;

create policy email_logs_select on public.email_logs
  for select using (organization_id in (select public.current_organization_ids()));

create policy email_logs_insert on public.email_logs
  for insert with check (public.can_write_in_org(organization_id));

-- audit_logs (yalnızca kuruluş yöneticisi görebilir, append-only) -------------
alter table public.audit_logs enable row level security;

create policy audit_logs_select on public.audit_logs
  for select using (public.is_org_admin(organization_id));

create policy audit_logs_insert on public.audit_logs
  for insert with check (public.can_write_in_org(organization_id));

-- notification_settings ---------------------------------------------------------
alter table public.notification_settings enable row level security;

create policy notification_settings_select on public.notification_settings
  for select using (organization_id in (select public.current_organization_ids()));

create policy notification_settings_insert on public.notification_settings
  for insert with check (public.is_org_admin(organization_id));

create policy notification_settings_update on public.notification_settings
  for update using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
