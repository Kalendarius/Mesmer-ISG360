import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  HelpCircle,
  ShieldAlert,
  Siren,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  FINDING_RISK_LEVEL_LABELS,
  RESPONSE_RESULT_LABELS,
  type FindingRiskLevel,
  type ResponseResult,
} from "@/lib/utils/enums";

/**
 * Risk ve sonuç durumları hiçbir zaman yalnızca renkle ifade edilmez: her
 * zaman ikon + Türkçe metin ile birlikte gösterilir. Renkler
 * `globals.css`'teki --risk-* tokenlarına karşılık gelen Tailwind
 * sınıflarıdır ve marka renkleriyle (mesmer-*) karıştırılmaz.
 */
interface StatusVisual {
  label: string;
  icon: LucideIcon;
  textClassName: string;
  bgClassName: string;
}

export const RESPONSE_RESULT_VISUALS: Record<ResponseResult, StatusVisual> = {
  compliant: {
    label: RESPONSE_RESULT_LABELS.compliant,
    icon: CheckCircle2,
    textClassName: "text-risk-compliant",
    bgClassName: "bg-risk-compliant/10",
  },
  non_compliant: {
    label: RESPONSE_RESULT_LABELS.non_compliant,
    icon: XCircle,
    textClassName: "text-risk-high",
    bgClassName: "bg-risk-high-bg",
  },
  not_applicable: {
    label: RESPONSE_RESULT_LABELS.not_applicable,
    icon: CircleSlash,
    textClassName: "text-risk-not-applicable",
    bgClassName: "bg-risk-not-applicable-bg",
  },
  not_checked: {
    label: RESPONSE_RESULT_LABELS.not_checked,
    icon: HelpCircle,
    textClassName: "text-risk-not-checked",
    bgClassName: "bg-risk-not-checked-bg",
  },
};

export const FINDING_RISK_LEVEL_VISUALS: Record<FindingRiskLevel, StatusVisual> = {
  low: {
    label: FINDING_RISK_LEVEL_LABELS.low,
    icon: AlertTriangle,
    textClassName: "text-risk-low",
    bgClassName: "bg-risk-low-bg",
  },
  medium: {
    label: FINDING_RISK_LEVEL_LABELS.medium,
    icon: ShieldAlert,
    textClassName: "text-risk-medium",
    bgClassName: "bg-risk-medium-bg",
  },
  high: {
    label: FINDING_RISK_LEVEL_LABELS.high,
    icon: ShieldAlert,
    textClassName: "text-risk-high",
    bgClassName: "bg-risk-high-bg",
  },
  critical: {
    label: FINDING_RISK_LEVEL_LABELS.critical,
    icon: Siren,
    textClassName: "text-risk-critical",
    bgClassName: "bg-risk-critical-bg",
  },
};
