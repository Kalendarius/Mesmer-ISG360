import { describe, it, expect } from "vitest";
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  HAZARD_CLASSES,
  HAZARD_CLASS_LABELS,
  INSPECTION_TYPES,
  INSPECTION_TYPE_LABELS,
  INSPECTION_STATUSES,
  INSPECTION_STATUS_LABELS,
  RESPONSE_RESULTS,
  RESPONSE_RESULT_LABELS,
  FINDING_RISK_LEVELS,
  FINDING_RISK_LEVEL_LABELS,
  FINDING_STATUSES,
  FINDING_STATUS_LABELS,
  OPEN_FINDING_STATUSES,
  PHOTO_TYPES,
  PHOTO_TYPE_LABELS,
  EMAIL_STATUSES,
  EMAIL_STATUS_LABELS,
} from "./enums";

/**
 * Her enum değeri için bir Türkçe etiket bulunmalı — biri eksikse arayüzde
 * "undefined" görünür. Yeni bir enum değeri eklenip etiketi unutulursa bu
 * test kırılır.
 */
describe("enum etiket eksiksizliği", () => {
  const cases: [string, readonly string[], Record<string, string>][] = [
    ["USER_ROLES", USER_ROLES, USER_ROLE_LABELS],
    ["HAZARD_CLASSES", HAZARD_CLASSES, HAZARD_CLASS_LABELS],
    ["INSPECTION_TYPES", INSPECTION_TYPES, INSPECTION_TYPE_LABELS],
    ["INSPECTION_STATUSES", INSPECTION_STATUSES, INSPECTION_STATUS_LABELS],
    ["RESPONSE_RESULTS", RESPONSE_RESULTS, RESPONSE_RESULT_LABELS],
    ["FINDING_RISK_LEVELS", FINDING_RISK_LEVELS, FINDING_RISK_LEVEL_LABELS],
    ["FINDING_STATUSES", FINDING_STATUSES, FINDING_STATUS_LABELS],
    ["PHOTO_TYPES", PHOTO_TYPES, PHOTO_TYPE_LABELS],
    ["EMAIL_STATUSES", EMAIL_STATUSES, EMAIL_STATUS_LABELS],
  ];

  for (const [name, values, labels] of cases) {
    it(`${name} — her değerin bir Türkçe etiketi var`, () => {
      for (const value of values) {
        expect(labels[value], `${name}.${value} için etiket eksik`).toBeTruthy();
        expect(typeof labels[value]).toBe("string");
      }
      expect(Object.keys(labels)).toHaveLength(values.length);
    });
  }
});

describe("OPEN_FINDING_STATUSES", () => {
  it("yalnızca gerçek FINDING_STATUSES değerlerini içerir", () => {
    for (const status of OPEN_FINDING_STATUSES) {
      expect(FINDING_STATUSES).toContain(status);
    }
  });

  it("kapalı/iptal durumlarını içermez", () => {
    expect(OPEN_FINDING_STATUSES).not.toContain("closed_by_expert");
    expect(OPEN_FINDING_STATUSES).not.toContain("cancelled");
  });
});
