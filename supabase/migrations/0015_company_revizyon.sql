-- İşletme/denetim revizyonu: SGK sicil no + NACE kodu kaldırıldı, şube artık
-- denetimde de opsiyonel (inspections/findings.branch_id nullable).

alter table public.companies drop column if exists sgk_sicil_no;
alter table public.companies drop column if exists nace_kodu;

alter table public.inspections alter column branch_id drop not null;
alter table public.findings alter column branch_id drop not null;
