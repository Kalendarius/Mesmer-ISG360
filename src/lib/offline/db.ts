import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ResponseUpdateInput, FindingQuickInput } from "@/lib/validation/inspection";

export interface QueuedResponseUpdate {
  id: string;
  inspectionId: string;
  type: "update_response";
  responseId: string;
  payload: ResponseUpdateInput;
  createdAt: string;
}

export interface QueuedMarkNonCompliant {
  id: string;
  inspectionId: string;
  type: "mark_non_compliant";
  responseId: string;
  payload: FindingQuickInput;
  createdAt: string;
}

export type QueuedMutation = QueuedResponseUpdate | QueuedMarkNonCompliant;

interface OfflineDBSchema extends DBSchema {
  pending_mutations: {
    key: string;
    value: QueuedMutation;
    indexes: { inspectionId: string };
  };
}

const DB_NAME = "mesmer-isg360-offline";
const DB_VERSION = 1;
const STORE = "pending_mutations";

let dbPromise: Promise<IDBPDatabase<OfflineDBSchema>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("inspectionId", "inspectionId");
      },
    });
  }
  return dbPromise;
}

export async function queueMutation(mutation: QueuedMutation): Promise<void> {
  const db = await getDb();
  await db.put(STORE, mutation);
}

export async function getQueuedMutations(inspectionId: string): Promise<QueuedMutation[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE, "inspectionId", inspectionId);
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeMutation(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, id);
}
