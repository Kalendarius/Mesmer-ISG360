export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          onceki_veri: Json | null
          organization_id: string
          yeni_veri: Json | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          onceki_veri?: Json | null
          organization_id: string
          yeni_veri?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          onceki_veri?: Json | null
          organization_id?: string
          yeni_veri?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_categories: {
        Row: {
          ad: string
          checklist_template_version_id: string
          created_at: string
          id: string
          organization_id: string
          sira_no: number
        }
        Insert: {
          ad: string
          checklist_template_version_id: string
          created_at?: string
          id?: string
          organization_id: string
          sira_no?: number
        }
        Update: {
          ad?: string
          checklist_template_version_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          sira_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "checklist_categories_checklist_template_version_id_fkey"
            columns: ["checklist_template_version_id"]
            isOneToOne: false
            referencedRelation: "checklist_template_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          aciklama: string | null
          checklist_category_id: string
          checklist_template_version_id: string
          created_at: string
          deleted_at: string | null
          fotograf_gerekli: boolean
          id: string
          is_active: boolean
          is_certification_opportunity: boolean
          onerilen_duzeltici_faaliyet: string | null
          organization_id: string
          regulation_version_id: string | null
          sira_no: number
          soru: string
          standart_uygunsuzluk_aciklamasi: string | null
          updated_at: string
          varsayilan_risk_seviyesi: Database["public"]["Enums"]["finding_risk_level"]
          zorunlu: boolean
        }
        Insert: {
          aciklama?: string | null
          checklist_category_id: string
          checklist_template_version_id: string
          created_at?: string
          deleted_at?: string | null
          fotograf_gerekli?: boolean
          id?: string
          is_active?: boolean
          is_certification_opportunity?: boolean
          onerilen_duzeltici_faaliyet?: string | null
          organization_id: string
          regulation_version_id?: string | null
          sira_no?: number
          soru: string
          standart_uygunsuzluk_aciklamasi?: string | null
          updated_at?: string
          varsayilan_risk_seviyesi?: Database["public"]["Enums"]["finding_risk_level"]
          zorunlu?: boolean
        }
        Update: {
          aciklama?: string | null
          checklist_category_id?: string
          checklist_template_version_id?: string
          created_at?: string
          deleted_at?: string | null
          fotograf_gerekli?: boolean
          id?: string
          is_active?: boolean
          is_certification_opportunity?: boolean
          onerilen_duzeltici_faaliyet?: string | null
          organization_id?: string
          regulation_version_id?: string | null
          sira_no?: number
          soru?: string
          standart_uygunsuzluk_aciklamasi?: string | null
          updated_at?: string
          varsayilan_risk_seviyesi?: Database["public"]["Enums"]["finding_risk_level"]
          zorunlu?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_category_id_fkey"
            columns: ["checklist_category_id"]
            isOneToOne: false
            referencedRelation: "checklist_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_checklist_template_version_id_fkey"
            columns: ["checklist_template_version_id"]
            isOneToOne: false
            referencedRelation: "checklist_template_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_regulation_version_id_fkey"
            columns: ["regulation_version_id"]
            isOneToOne: false
            referencedRelation: "regulation_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_template_versions: {
        Row: {
          checklist_template_id: string
          created_at: string
          created_by: string | null
          id: string
          is_current: boolean
          notes: string | null
          organization_id: string
          version_no: number
        }
        Insert: {
          checklist_template_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          notes?: string | null
          organization_id: string
          version_no: number
        }
        Update: {
          checklist_template_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          notes?: string | null
          organization_id?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_versions_checklist_template_id_fkey"
            columns: ["checklist_template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_template_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          ad: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          denetim_turu: Database["public"]["Enums"]["inspection_type"] | null
          faaliyet_konusu: string | null
          id: string
          is_active: boolean
          organization_id: string
          sektor: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ad: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          denetim_turu?: Database["public"]["Enums"]["inspection_type"] | null
          faaliyet_konusu?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          sektor?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ad?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          denetim_turu?: Database["public"]["Enums"]["inspection_type"] | null
          faaliyet_konusu?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          sektor?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          calisan_sayisi: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          eposta: string | null
          faaliyet_konusu: string | null
          id: string
          is_active: boolean
          kisa_ad: string | null
          nace_kodu: string | null
          notlar: string | null
          organization_id: string
          sgk_sicil_no: string | null
          tehlike_sinifi: Database["public"]["Enums"]["hazard_class"] | null
          telefon: string | null
          unvan: string
          updated_at: string
          updated_by: string | null
          vergi_no: string | null
          website: string | null
        }
        Insert: {
          calisan_sayisi?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          eposta?: string | null
          faaliyet_konusu?: string | null
          id?: string
          is_active?: boolean
          kisa_ad?: string | null
          nace_kodu?: string | null
          notlar?: string | null
          organization_id: string
          sgk_sicil_no?: string | null
          tehlike_sinifi?: Database["public"]["Enums"]["hazard_class"] | null
          telefon?: string | null
          unvan: string
          updated_at?: string
          updated_by?: string | null
          vergi_no?: string | null
          website?: string | null
        }
        Update: {
          calisan_sayisi?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          eposta?: string | null
          faaliyet_konusu?: string | null
          id?: string
          is_active?: boolean
          kisa_ad?: string | null
          nace_kodu?: string | null
          notlar?: string | null
          organization_id?: string
          sgk_sicil_no?: string | null
          tehlike_sinifi?: Database["public"]["Enums"]["hazard_class"] | null
          telefon?: string | null
          unvan?: string
          updated_at?: string
          updated_by?: string | null
          vergi_no?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      company_branches: {
        Row: {
          adres: string | null
          calisan_sayisi: number | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          il: string | null
          ilce: string | null
          is_active: boolean
          lat: number | null
          lng: number | null
          organization_id: string
          sube_adi: string
          updated_at: string
          updated_by: string | null
          yetkili_eposta: string | null
          yetkili_kisi: string | null
          yetkili_telefon: string | null
        }
        Insert: {
          adres?: string | null
          calisan_sayisi?: number | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          il?: string | null
          ilce?: string | null
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          organization_id: string
          sube_adi: string
          updated_at?: string
          updated_by?: string | null
          yetkili_eposta?: string | null
          yetkili_kisi?: string | null
          yetkili_telefon?: string | null
        }
        Update: {
          adres?: string | null
          calisan_sayisi?: number | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          il?: string | null
          ilce?: string | null
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          organization_id?: string
          sube_adi?: string
          updated_at?: string
          updated_by?: string | null
          yetkili_eposta?: string | null
          yetkili_kisi?: string | null
          yetkili_telefon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      company_contacts: {
        Row: {
          ad_soyad: string
          ana_yetkili: boolean
          bildirim_alsin: boolean
          branch_id: string | null
          company_id: string
          created_at: string
          deleted_at: string | null
          eposta: string | null
          gorev: string | null
          id: string
          is_active: boolean
          organization_id: string
          telefon: string | null
          updated_at: string
        }
        Insert: {
          ad_soyad: string
          ana_yetkili?: boolean
          bildirim_alsin?: boolean
          branch_id?: string | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          eposta?: string | null
          gorev?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          ad_soyad?: string
          ana_yetkili?: boolean
          bildirim_alsin?: boolean
          branch_id?: string | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          eposta?: string | null
          gorev?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          telefon?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_contacts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "company_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      corrective_actions: {
        Row: {
          aciklama: string
          created_at: string
          created_by: string
          finding_id: string
          id: string
          organization_id: string
          yeni_durum: Database["public"]["Enums"]["finding_status"] | null
        }
        Insert: {
          aciklama: string
          created_at?: string
          created_by: string
          finding_id: string
          id?: string
          organization_id: string
          yeni_durum?: Database["public"]["Enums"]["finding_status"] | null
        }
        Update: {
          aciklama?: string
          created_at?: string
          created_by?: string
          finding_id?: string
          id?: string
          organization_id?: string
          yeni_durum?: Database["public"]["Enums"]["finding_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "corrective_actions_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          alicilar: string[]
          cc: string[] | null
          created_at: string
          durum: Database["public"]["Enums"]["email_status"]
          finding_id: string | null
          gonderen_user_id: string | null
          gonderim_zamani: string
          hata_mesaji: string | null
          id: string
          inspection_id: string | null
          konu: string
          mesaj: string | null
          organization_id: string
          report_id: string | null
          servis_mesaj_id: string | null
        }
        Insert: {
          alicilar: string[]
          cc?: string[] | null
          created_at?: string
          durum: Database["public"]["Enums"]["email_status"]
          finding_id?: string | null
          gonderen_user_id?: string | null
          gonderim_zamani?: string
          hata_mesaji?: string | null
          id?: string
          inspection_id?: string | null
          konu: string
          mesaj?: string | null
          organization_id: string
          report_id?: string | null
          servis_mesaj_id?: string | null
        }
        Update: {
          alicilar?: string[]
          cc?: string[] | null
          created_at?: string
          durum?: Database["public"]["Enums"]["email_status"]
          finding_id?: string | null
          gonderen_user_id?: string | null
          gonderim_zamani?: string
          hata_mesaji?: string | null
          id?: string
          inspection_id?: string | null
          konu?: string
          mesaj?: string | null
          organization_id?: string
          report_id?: string | null
          servis_mesaj_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      finding_photos: {
        Row: {
          created_at: string
          created_by: string | null
          finding_id: string
          id: string
          organization_id: string
          storage_path: string
          tip: Database["public"]["Enums"]["photo_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          finding_id: string
          id?: string
          organization_id: string
          storage_path: string
          tip?: Database["public"]["Enums"]["photo_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          finding_id?: string
          id?: string
          organization_id?: string
          storage_path?: string
          tip?: Database["public"]["Enums"]["photo_type"]
        }
        Relationships: [
          {
            foreignKeyName: "finding_photos_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finding_photos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      findings: {
        Row: {
          aciklama: string | null
          baslik: string
          branch_id: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          durum: Database["public"]["Enums"]["finding_status"]
          id: string
          inspection_id: string
          inspection_response_id: string
          kapatilma_tarihi: string | null
          kapatma_notu: string | null
          onerilen_duzeltici_faaliyet: string | null
          organization_id: string
          parent_finding_id: string | null
          regulation_metin_snapshot: string | null
          regulation_version_id: string | null
          risk_seviyesi: Database["public"]["Enums"]["finding_risk_level"]
          sorumlu_kisi_adi: string | null
          sorumlu_kisi_contact_id: string | null
          termin_tarihi: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aciklama?: string | null
          baslik: string
          branch_id: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          durum?: Database["public"]["Enums"]["finding_status"]
          id?: string
          inspection_id: string
          inspection_response_id: string
          kapatilma_tarihi?: string | null
          kapatma_notu?: string | null
          onerilen_duzeltici_faaliyet?: string | null
          organization_id: string
          parent_finding_id?: string | null
          regulation_metin_snapshot?: string | null
          regulation_version_id?: string | null
          risk_seviyesi?: Database["public"]["Enums"]["finding_risk_level"]
          sorumlu_kisi_adi?: string | null
          sorumlu_kisi_contact_id?: string | null
          termin_tarihi?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aciklama?: string | null
          baslik?: string
          branch_id?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          durum?: Database["public"]["Enums"]["finding_status"]
          id?: string
          inspection_id?: string
          inspection_response_id?: string
          kapatilma_tarihi?: string | null
          kapatma_notu?: string | null
          onerilen_duzeltici_faaliyet?: string | null
          organization_id?: string
          parent_finding_id?: string | null
          regulation_metin_snapshot?: string | null
          regulation_version_id?: string | null
          risk_seviyesi?: Database["public"]["Enums"]["finding_risk_level"]
          sorumlu_kisi_adi?: string | null
          sorumlu_kisi_contact_id?: string | null
          termin_tarihi?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "findings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "company_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_inspection_response_id_fkey"
            columns: ["inspection_response_id"]
            isOneToOne: false
            referencedRelation: "inspection_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_parent_finding_id_fkey"
            columns: ["parent_finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_regulation_version_id_fkey"
            columns: ["regulation_version_id"]
            isOneToOne: false
            referencedRelation: "regulation_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_sorumlu_kisi_contact_id_fkey"
            columns: ["sorumlu_kisi_contact_id"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_responses: {
        Row: {
          aciklama_snapshot: string | null
          checklist_item_id: string
          created_at: string
          id: string
          inspection_id: string
          not_metni: string | null
          organization_id: string
          regulation_metin_snapshot: string | null
          regulation_reference_snapshot: string | null
          sira_no: number
          sonuc: Database["public"]["Enums"]["response_result"] | null
          soru_snapshot: string
          updated_at: string
        }
        Insert: {
          aciklama_snapshot?: string | null
          checklist_item_id: string
          created_at?: string
          id?: string
          inspection_id: string
          not_metni?: string | null
          organization_id: string
          regulation_metin_snapshot?: string | null
          regulation_reference_snapshot?: string | null
          sira_no?: number
          sonuc?: Database["public"]["Enums"]["response_result"] | null
          soru_snapshot: string
          updated_at?: string
        }
        Update: {
          aciklama_snapshot?: string | null
          checklist_item_id?: string
          created_at?: string
          id?: string
          inspection_id?: string
          not_metni?: string | null
          organization_id?: string
          regulation_metin_snapshot?: string | null
          regulation_reference_snapshot?: string | null
          sira_no?: number
          sonuc?: Database["public"]["Enums"]["response_result"] | null
          soru_snapshot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_responses_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_responses_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          baslangic_saati: string | null
          bitis_saati: string | null
          branch_id: string
          checklist_template_version_id: string
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          denetim_tarihi: string
          denetim_turu: Database["public"]["Enums"]["inspection_type"]
          genel_notlar: string | null
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["inspection_status"]
          updated_at: string
          updated_by: string | null
          uzman_user_id: string
          yetkili_contact_id: string | null
        }
        Insert: {
          baslangic_saati?: string | null
          bitis_saati?: string | null
          branch_id: string
          checklist_template_version_id: string
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          denetim_tarihi?: string
          denetim_turu?: Database["public"]["Enums"]["inspection_type"]
          genel_notlar?: string | null
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["inspection_status"]
          updated_at?: string
          updated_by?: string | null
          uzman_user_id: string
          yetkili_contact_id?: string | null
        }
        Update: {
          baslangic_saati?: string | null
          bitis_saati?: string | null
          branch_id?: string
          checklist_template_version_id?: string
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          denetim_tarihi?: string
          denetim_turu?: Database["public"]["Enums"]["inspection_type"]
          genel_notlar?: string | null
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["inspection_status"]
          updated_at?: string
          updated_by?: string | null
          uzman_user_id?: string
          yetkili_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "company_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_checklist_template_version_id_fkey"
            columns: ["checklist_template_version_id"]
            isOneToOne: false
            referencedRelation: "checklist_template_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_yetkili_contact_id_fkey"
            columns: ["yetkili_contact_id"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          default_cc: string[] | null
          gonderen_adi: string | null
          id: string
          myk_firsat_bildirim_alicilari: string[] | null
          organization_id: string
          updated_at: string
          yanit_adresi: string | null
        }
        Insert: {
          created_at?: string
          default_cc?: string[] | null
          gonderen_adi?: string | null
          id?: string
          myk_firsat_bildirim_alicilari?: string[] | null
          organization_id: string
          updated_at?: string
          yanit_adresi?: string | null
        }
        Update: {
          created_at?: string
          default_cc?: string[] | null
          gonderen_adi?: string | null
          id?: string
          myk_firsat_bildirim_alicilari?: string[] | null
          organization_id?: string
          updated_at?: string
          yanit_adresi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          company_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          invited_by: string | null
          is_active: boolean
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          accent_color: string | null
          address: string | null
          created_at: string
          display_name: string
          email: string | null
          email_logo_path: string | null
          id: string
          is_active: boolean
          legal_name: string
          logo_path: string | null
          logo_white_path: string | null
          phone: string | null
          primary_color: string | null
          report_logo_path: string | null
          secondary_color: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          email_logo_path?: string | null
          id?: string
          is_active?: boolean
          legal_name: string
          logo_path?: string | null
          logo_white_path?: string | null
          phone?: string | null
          primary_color?: string | null
          report_logo_path?: string | null
          secondary_color?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          email_logo_path?: string | null
          id?: string
          is_active?: boolean
          legal_name?: string
          logo_path?: string | null
          logo_white_path?: string | null
          phone?: string | null
          primary_color?: string | null
          report_logo_path?: string | null
          secondary_color?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          default_organization_id: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          default_organization_id?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          default_organization_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_organization_id_fkey"
            columns: ["default_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      regulation_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_current: boolean
          kaynak_url: string | null
          madde_basligi: string | null
          madde_metni: string
          madde_no: string | null
          organization_id: string
          regulation_id: string
          version_no: number
          yururluk_tarihi: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          kaynak_url?: string | null
          madde_basligi?: string | null
          madde_metni: string
          madde_no?: string | null
          organization_id: string
          regulation_id: string
          version_no: number
          yururluk_tarihi?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          kaynak_url?: string | null
          madde_basligi?: string | null
          madde_metni?: string
          madde_no?: string | null
          organization_id?: string
          regulation_id?: string
          version_no?: number
          yururluk_tarihi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regulation_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulation_versions_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "regulations"
            referencedColumns: ["id"]
          },
        ]
      }
      regulations: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          mevzuat_adi: string
          mevzuat_turu: string | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          mevzuat_adi: string
          mevzuat_turu?: string | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          mevzuat_adi?: string
          mevzuat_turu?: string | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_snapshots: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          report_id: string
          snapshot_json: Json
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          report_id: string
          snapshot_json: Json
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          report_id?: string
          snapshot_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "report_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_snapshots_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          generated_at: string
          generated_by: string
          id: string
          inspection_id: string
          organization_id: string
          pdf_storage_path: string
          report_no: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          generated_by: string
          id?: string
          inspection_id: string
          organization_id: string
          pdf_storage_path: string
          report_no: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          generated_by?: string
          id?: string
          inspection_id?: string
          organization_id?: string
          pdf_storage_path?: string
          report_no?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write_in_org: { Args: { org_id: string }; Returns: boolean }
      current_organization_ids: { Args: never; Returns: string[] }
      current_role_in_org: {
        Args: { org_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_org_admin: { Args: { org_id: string }; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      organization_member_emails: {
        Args: { org_id: string }
        Returns: {
          email: string
          user_id: string
        }[]
      }
    }
    Enums: {
      email_status: "sent" | "failed"
      finding_risk_level: "low" | "medium" | "high" | "critical"
      finding_status:
        | "open"
        | "in_progress"
        | "corrected_reported"
        | "closed_by_expert"
        | "overdue"
        | "cancelled"
      hazard_class: "az_tehlikeli" | "tehlikeli" | "cok_tehlikeli"
      inspection_status: "draft" | "completed" | "cancelled"
      inspection_type:
        | "periyodik"
        | "sikayet_uzerine"
        | "takip"
        | "kaza_sonrasi"
        | "diger"
      photo_type: "detection" | "correction" | "other"
      response_result:
        | "compliant"
        | "non_compliant"
        | "not_applicable"
        | "not_checked"
      user_role:
        | "organization_admin"
        | "safety_expert"
        | "viewer"
        | "company_contact"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      email_status: ["sent", "failed"],
      finding_risk_level: ["low", "medium", "high", "critical"],
      finding_status: [
        "open",
        "in_progress",
        "corrected_reported",
        "closed_by_expert",
        "overdue",
        "cancelled",
      ],
      hazard_class: ["az_tehlikeli", "tehlikeli", "cok_tehlikeli"],
      inspection_status: ["draft", "completed", "cancelled"],
      inspection_type: [
        "periyodik",
        "sikayet_uzerine",
        "takip",
        "kaza_sonrasi",
        "diger",
      ],
      photo_type: ["detection", "correction", "other"],
      response_result: [
        "compliant",
        "non_compliant",
        "not_applicable",
        "not_checked",
      ],
      user_role: [
        "organization_admin",
        "safety_expert",
        "viewer",
        "company_contact",
      ],
    },
  },
} as const

