import "server-only";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { registerReportFonts } from "./fonts";
import type { InspectionReportData } from "./build-report-data";

registerReportFonts();

// globals.css'teki --mesmer-primary tek kaynağıyla aynı (bkz. CLAUDE.md
// Kurumsal Kimlik) — react-pdf CSS değişkeni okuyamadığından burada
// istisnai olarak sabit hex olarak tekrarlanır.
const MESMER_PRIMARY = "#054F90";
const BORDER = "#e5e7eb";
const TEXT_MUTED = "#505252";

const styles = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 9, padding: 32, color: "#1f2937" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  reportTitle: { fontSize: 14, fontWeight: 700, color: MESMER_PRIMARY },
  reportMeta: { fontSize: 8, color: TEXT_MUTED, textAlign: "right", marginTop: 2 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: MESMER_PRIMARY,
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: MESMER_PRIMARY,
    paddingBottom: 3,
  },
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoBox: { width: "50%", marginBottom: 4 },
  infoLabel: { fontSize: 7, color: TEXT_MUTED },
  infoValue: { fontSize: 9, fontWeight: 700 },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryBox: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
  },
  summaryValue: { fontSize: 14, fontWeight: 700 },
  summaryLabel: { fontSize: 7, color: TEXT_MUTED, textAlign: "center" },
  categoryHeading: { fontSize: 9, fontWeight: 700, marginTop: 8, marginBottom: 3 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    paddingVertical: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: BORDER,
    paddingVertical: 3,
  },
  colNo: { width: "5%", fontSize: 8 },
  colSoru: { width: "50%", fontSize: 8, paddingRight: 4 },
  colSonuc: { width: "15%", fontSize: 8, fontWeight: 700 },
  colNot: { width: "30%", fontSize: 8, color: TEXT_MUTED },
  headerCell: { fontSize: 7, fontWeight: 700, color: TEXT_MUTED },
  findingBox: { borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 8, marginBottom: 8 },
  findingTitle: { fontSize: 9, fontWeight: 700, marginBottom: 3 },
  findingMetaRow: { flexDirection: "row", gap: 12, marginBottom: 3 },
  findingMetaLabel: { fontSize: 7, color: TEXT_MUTED },
  findingMetaValue: { fontSize: 8, fontWeight: 700 },
  findingText: { fontSize: 8, marginBottom: 3 },
  suggestionNote: { fontSize: 6.5, color: TEXT_MUTED, marginTop: 3 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  photo: { width: 90, height: 90, objectFit: "cover", borderRadius: 3 },
  photoCaption: { fontSize: 6, color: TEXT_MUTED, textAlign: "center", width: 90 },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: TEXT_MUTED,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 4,
  },
});

interface InspectionReportDocumentProps {
  data: InspectionReportData;
  reportNo: string;
  generatedAtFormatted: string;
  generatedByName: string;
  photoImages: Record<string, { data: Buffer; format: "png" | "jpg" }>;
}

export function InspectionReportDocument({
  data,
  reportNo,
  generatedAtFormatted,
  generatedByName,
  photoImages,
}: InspectionReportDocumentProps) {
  return (
    <Document title={`${reportNo} - ${data.company.unvan}`}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerRow}>
          <Text style={styles.reportTitle}>İSG DENETİM RAPORU</Text>
          <View>
            <Text style={styles.reportMeta}>Rapor No: {reportNo}</Text>
            <Text style={styles.reportMeta}>Oluşturulma: {generatedAtFormatted}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>İşletme ve Denetim Bilgileri</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>İşletme</Text>
            <Text style={styles.infoValue}>{data.company.unvan}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Şube</Text>
            <Text style={styles.infoValue}>{data.branch.subeAdi}</Text>
          </View>
          {data.company.vergiNo && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Vergi No</Text>
              <Text style={styles.infoValue}>{data.company.vergiNo}</Text>
            </View>
          )}
          {data.company.tehlikeSinifiLabel && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Tehlike Sınıfı</Text>
              <Text style={styles.infoValue}>{data.company.tehlikeSinifiLabel}</Text>
            </View>
          )}
          {data.branch.adres && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Adres</Text>
              <Text style={styles.infoValue}>
                {data.branch.adres}
                {data.branch.ilIlce ? ` (${data.branch.ilIlce})` : ""}
              </Text>
            </View>
          )}
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Denetim Türü</Text>
            <Text style={styles.infoValue}>{data.inspection.denetimTuruLabel}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Denetim Tarihi</Text>
            <Text style={styles.infoValue}>
              {data.inspection.denetimTarihi}
              {data.inspection.baslangicSaati ? ` · ${data.inspection.baslangicSaati.slice(0, 5)}` : ""}
              {data.inspection.bitisSaati ? `–${data.inspection.bitisSaati.slice(0, 5)}` : ""}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Denetimi Yapan Uzman</Text>
            <Text style={styles.infoValue}>{data.inspection.uzmanAdi}</Text>
          </View>
          {data.inspection.yetkiliAdi && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>İşletme Yetkilisi</Text>
              <Text style={styles.infoValue}>{data.inspection.yetkiliAdi}</Text>
            </View>
          )}
        </View>
        {data.inspection.genelNotlar && (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.infoLabel}>Genel Notlar</Text>
            <Text style={styles.findingText}>{data.inspection.genelNotlar}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Özet</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{data.summary.totalItems}</Text>
            <Text style={styles.summaryLabel}>Toplam Madde</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{data.summary.compliant}</Text>
            <Text style={styles.summaryLabel}>Uygun</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{data.summary.nonCompliant}</Text>
            <Text style={styles.summaryLabel}>Uygun Değil</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{data.summary.openFindings}</Text>
            <Text style={styles.summaryLabel}>Açık Uygunsuzluk</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{data.summary.closedFindings}</Text>
            <Text style={styles.summaryLabel}>Kapatılan Uygunsuzluk</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Kontrol Maddeleri</Text>
        {data.categories.map((category) => (
          <View key={category.ad} wrap={false}>
            <Text style={styles.categoryHeading}>{category.ad}</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colNo, styles.headerCell]}>No</Text>
              <Text style={[styles.colSoru, styles.headerCell]}>Madde</Text>
              <Text style={[styles.colSonuc, styles.headerCell]}>Sonuç</Text>
              <Text style={[styles.colNot, styles.headerCell]}>Not</Text>
            </View>
            {category.items.map((item) => (
              <View key={item.siraNo} style={styles.tableRow}>
                <Text style={styles.colNo}>{item.siraNo}</Text>
                <Text style={styles.colSoru}>{item.soru}</Text>
                <Text style={styles.colSonuc}>{item.sonuc ?? "—"}</Text>
                <Text style={styles.colNot}>{item.notMetni ?? "—"}</Text>
              </View>
            ))}
          </View>
        ))}

        {data.findings.length > 0 && (
          <>
            <Text style={styles.sectionTitle} break>
              Uygunsuzluklar
            </Text>
            {data.findings.map((finding) => (
              <View key={finding.baslik} style={styles.findingBox} wrap={false}>
                <Text style={styles.findingTitle}>{finding.baslik}</Text>
                <View style={styles.findingMetaRow}>
                  <View>
                    <Text style={styles.findingMetaLabel}>Risk Seviyesi</Text>
                    <Text style={styles.findingMetaValue}>{finding.riskSeviyesi}</Text>
                  </View>
                  <View>
                    <Text style={styles.findingMetaLabel}>Durum</Text>
                    <Text style={styles.findingMetaValue}>{finding.durum}</Text>
                  </View>
                  {finding.terminTarihi && (
                    <View>
                      <Text style={styles.findingMetaLabel}>Termin</Text>
                      <Text style={styles.findingMetaValue}>{finding.terminTarihi}</Text>
                    </View>
                  )}
                  {finding.sorumluKisiAdi && (
                    <View>
                      <Text style={styles.findingMetaLabel}>Sorumlu Kişi</Text>
                      <Text style={styles.findingMetaValue}>{finding.sorumluKisiAdi}</Text>
                    </View>
                  )}
                </View>
                {finding.aciklama && <Text style={styles.findingText}>{finding.aciklama}</Text>}
                {finding.kapatmaNotu && (
                  <Text style={styles.findingText}>
                    Kapatma Notu ({finding.kapatilmaTarihi}): {finding.kapatmaNotu}
                  </Text>
                )}
                {finding.isCertificationOpportunity && (
                  <Text style={styles.suggestionNote}>
                    Not: Mesleki Yeterlilik Belgesi, Mesleki Yeterlilik Kurumu (MYK) tarafından yetkilendirilmiş sınav
                    ve belgelendirme kuruluşlarından temin edilebilir. MESMER Mesleki Yeterlilik Belgelendirme Merkezi
                    A.Ş. de bu kuruluşlardan biridir.
                  </Text>
                )}
                {finding.photos.length > 0 && (
                  <View style={styles.photoGrid}>
                    {finding.photos.map((photo) => {
                      const image = photoImages[photo.storagePath];
                      if (!image) return null;
                      return (
                        <View key={photo.storagePath}>
                          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, HTML img değil */}
                          <Image style={styles.photo} src={image} />
                          <Text style={styles.photoCaption}>{photo.tip}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        <View style={styles.footer} fixed>
          <Text>
            {reportNo} · Oluşturan: {generatedByName}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
