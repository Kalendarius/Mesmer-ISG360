import "server-only";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

let registered = false;

/**
 * PDF'in standart 14 fontu (Helvetica) Türkçe karakterleri (ş, ğ, ı, İ, ö, ü, ç)
 * içermiyor. Google Fonts'un resmi Roboto TTF dosyaları (Apache 2.0, bu
 * dosyaya `src/lib/pdf/fonts/` altında commit edilmiştir — çevrimiçi bir font
 * CDN'ine çalışma zamanında bağımlı kalınmaz) kullanılır.
 *
 * ÖNEMLİ: `@fontsource/roboto` paketinin sunduğu .woff/.woff2 dosyaları
 * DENENDİ ve elendi — fontkit bu dosyaları PDF'e gömmek için yeniden
 * subset ederken Türkçe noktasız "ı" (U+0131) karakterinin glyph'ini bozuyor
 * (render'da "1" rakamı olarak çıkıyor, bazı kelimelerde karakterler üst
 * üste biniyor) ve .woff2 dosyası tamamen `RangeError` ile çöküyor. Google'ın
 * ham/işlenmemiş .ttf dosyası bu sorunu yaşamıyor — bkz. bu teslimin test
 * notları (CLAUDE.md → PDF Raporlama).
 */
export function registerReportFonts() {
  if (registered) return;

  const dir = path.join(process.cwd(), "src/lib/pdf/fonts");
  Font.register({
    family: "Roboto",
    fonts: [
      { src: path.join(dir, "Roboto-Regular.ttf"), fontWeight: 400 },
      { src: path.join(dir, "Roboto-Bold.ttf"), fontWeight: 700 },
    ],
  });

  registered = true;
}
