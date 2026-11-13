import type { SavedWheel, SpinResult, WheelImage } from './types';

const DB_NAME = 'intooly-picker-wheel';
const DB_VERSION = 1;

const STORES = {
  wheels: 'wheels',
  images: 'images',
  results: 'results',
} as const;

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(
      new Error('التخزين المحلي غير متاح في هذا المتصفح.'),
    );
  }

  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.wheels)) {
        db.createObjectStore(STORES.wheels, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.images)) {
        db.createObjectStore(STORES.images, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.results)) {
        const resultsStore = db.createObjectStore(STORES.results, {
          keyPath: 'id',
        });

        resultsStore.createIndex('wheelId', 'wheelId', {
          unique: false,
        });

        resultsStore.createIndex('timestamp', 'timestamp', {
          unique: false,
        });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
        databasePromise = null;
      };

      resolve(db);
    };

    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error('تعذر فتح قاعدة البيانات.'));
    };

    request.onblocked = () => {
      databasePromise = null;
      reject(new Error('قاعدة البيانات مشغولة في نافذة أخرى.'));
    };
  });

  return databasePromise;
}

function executeRequest<T>(
  storeNames: string | string[],
  mode: IDBTransactionMode,
  operation: (transaction: IDBTransaction) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        let transaction: IDBTransaction;

        try {
          transaction = db.transaction(storeNames, mode);
        } catch (error) {
          reject(error);
          return;
        }

        let result: T;

        const request = operation(transaction);

        request.onsuccess = () => {
          result = request.result;
        };

        request.onerror = () => {
          reject(request.error ?? new Error('فشلت عملية التخزين.'));
        };

        transaction.oncomplete = () => {
          resolve(result);
        };

        transaction.onerror = () => {
          reject(
            transaction.error ?? new Error('حدث خطأ في عملية التخزين.'),
          );
        };

        transaction.onabort = () => {
          reject(
            transaction.error ?? new Error('تم إلغاء عملية التخزين.'),
          );
        };
      }),
  );
}

// حفظ عجلة أو تحديثها.
export function saveWheel(wheel: SavedWheel): Promise<void> {
  return executeRequest(
    STORES.wheels,
    'readwrite',
    (transaction) =>
      transaction.objectStore(STORES.wheels).put(wheel),
  ).then(() => undefined);
}

// استرجاع عجلة باستخدام معرّفها.
export function getWheel(id: string): Promise<SavedWheel | undefined> {
  return executeRequest(
    STORES.wheels,
    'readonly',
    (transaction) =>
      transaction.objectStore(STORES.wheels).get(id),
  );
}

// استرجاع جميع العجلات، والأحدث أولاً.
export function getAllWheels(): Promise<SavedWheel[]> {
  return executeRequest(
    STORES.wheels,
    'readonly',
    (transaction) =>
      transaction.objectStore(STORES.wheels).getAll(),
  ).then((wheels) =>
    wheels.sort((a, b) => b.updatedAt - a.updatedAt),
  );
}

// حذف عجلة وحذف سجل نتائجها المرتبط بها.
export async function deleteWheel(id: string): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.wheels, STORES.results],
      'readwrite',
    );

    transaction.objectStore(STORES.wheels).delete(id);

    const resultsStore = transaction.objectStore(STORES.results);
    const cursorRequest = resultsStore
      .index('wheelId')
      .openKeyCursor(IDBKeyRange.only(id));

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;

      if (cursor) {
        resultsStore.delete(cursor.primaryKey);
        cursor.continue();
      }
    };

    transaction.oncomplete = () => resolve();

    transaction.onerror = () => {
      reject(transaction.error ?? new Error('تعذر حذف العجلة.'));
    };

    transaction.onabort = () => {
      reject(transaction.error ?? new Error('تم إلغاء حذف العجلة.'));
    };
  });
}

// حفظ صورة محلياً بصيغة Blob.
export function saveWheelImage(image: WheelImage): Promise<void> {
  return executeRequest(
    STORES.images,
    'readwrite',
    (transaction) =>
      transaction.objectStore(STORES.images).put(image),
  ).then(() => undefined);
}

// استرجاع صورة باستخدام معرّفها.
export function getWheelImage(
  id: string,
): Promise<WheelImage | undefined> {
  return executeRequest(
    STORES.images,
    'readonly',
    (transaction) =>
      transaction.objectStore(STORES.images).get(id),
  );
}

// حذف صورة.
export function deleteWheelImage(id: string): Promise<void> {
  return executeRequest(
    STORES.images,
    'readwrite',
    (transaction) =>
      transaction.objectStore(STORES.images).delete(id),
  ).then(() => undefined);
}

// إضافة نتيجة سحب إلى السجل.
export function addSpinResult(result: SpinResult): Promise<void> {
  return executeRequest(
    STORES.results,
    'readwrite',
    (transaction) =>
      transaction.objectStore(STORES.results).put(result),
  ).then(() => undefined);
}

// استرجاع نتائج عجلة معينة، والأحدث أولاً.
export function getWheelResults(
  wheelId: string,
): Promise<SpinResult[]> {
  return executeRequest(
    STORES.results,
    'readonly',
    (transaction) =>
      transaction
        .objectStore(STORES.results)
        .index('wheelId')
        .getAll(IDBKeyRange.only(wheelId)),
  ).then((results) =>
    results.sort((a, b) => b.timestamp - a.timestamp),
  );
}

// مسح سجل نتائج عجلة معينة.
export async function clearWheelResults(
  wheelId: string,
): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORES.results, 'readwrite');
    const store = transaction.objectStore(STORES.results);
    const request = store
      .index('wheelId')
      .openKeyCursor(IDBKeyRange.only(wheelId));

    request.onsuccess = () => {
      const cursor = request.result;

      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };

    transaction.oncomplete = () => resolve();

    transaction.onerror = () => {
      reject(transaction.error ?? new Error('تعذر مسح سجل النتائج.'));
    };

    transaction.onabort = () => {
      reject(transaction.error ?? new Error('تم إلغاء مسح السجل.'));
    };
  });
}
