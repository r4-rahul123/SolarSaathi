const DATABASE_NAME = "solarsaathi-pending-estimate";
const STORE_NAME = "drafts";
const DRAFT_KEY = "latest";

interface PendingEstimateDraft {
  form: Record<string, unknown>;
  previewLead: unknown;
  savedAt?: number;
}

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local draft storage."));
  });
}

export async function savePendingEstimate(draft: PendingEstimateDraft): Promise<void> {
  const database = await openDraftDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({ ...draft, savedAt: Date.now() }, DRAFT_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Could not save the estimate draft."));
      transaction.onabort = () => reject(transaction.error || new Error("Estimate draft save was interrupted."));
    });
  } finally {
    database.close();
  }
}

export async function loadPendingEstimate(): Promise<PendingEstimateDraft | null> {
  const database = await openDraftDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(DRAFT_KEY);
      request.onsuccess = () => {
        const draft = request.result as PendingEstimateDraft | undefined;
        if (!draft) return resolve(null);
        if (draft.savedAt && Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
          void clearPendingEstimate();
          return resolve(null);
        }
        resolve(draft);
      };
      request.onerror = () => reject(request.error || new Error("Could not read the saved estimate."));
    });
  } finally {
    database.close();
  }
}

export async function clearPendingEstimate(): Promise<void> {
  const database = await openDraftDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(DRAFT_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Could not clear the saved estimate."));
    });
  } finally {
    database.close();
  }
}
