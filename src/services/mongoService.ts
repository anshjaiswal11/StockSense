// Client-side MongoDB Sync Service
// Connects to /api/sync to persist and retrieve products, operations, ledger, and user accounts in MongoDB.

export interface MongoSyncPayload {
  products?: any[];
  operations?: any[];
  ledger?: any[];
  users?: any[];
  warehouses?: any[];
  locations?: any[];
}

export interface MongoSyncResult {
  success: boolean;
  connected: boolean;
  message: string;
  stats?: {
    productsSynced: number;
    operationsSynced: number;
    ledgerSynced: number;
    usersSynced: number;
  };
  data?: any;
  error?: string;
}

export const getCustomMongoUri = (): string => {
  return localStorage.getItem('stocksense_mongo_uri') || '';
};

export const setCustomMongoUri = (uri: string): void => {
  if (!uri.trim()) {
    localStorage.removeItem('stocksense_mongo_uri');
  } else {
    localStorage.setItem('stocksense_mongo_uri', uri.trim());
  }
};

/**
 * Test connectivity with MongoDB
 */
export const testMongoConnection = async (customUri?: string): Promise<MongoSyncResult> => {
  const uriToTest = customUri ?? getCustomMongoUri();
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(uriToTest ? { 'x-mongo-uri': uriToTest } : {}),
      },
      body: JSON.stringify({
        action: 'test',
        mongoUri: uriToTest,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return {
        success: false,
        connected: false,
        message: data.error || 'Failed to connect to MongoDB',
        error: data.error,
      };
    }

    return {
      success: true,
      connected: true,
      message: data.message || 'Connected to MongoDB successfully!',
    };
  } catch (err: any) {
    return {
      success: false,
      connected: false,
      message: err.message || 'Could not reach serverless /api/sync endpoint',
      error: err.message,
    };
  }
};

/**
 * Fetch all documents from MongoDB database 'stocksense'
 */
export const fetchAllFromMongo = async (): Promise<MongoSyncResult> => {
  const uri = getCustomMongoUri();
  try {
    const res = await fetch('/api/sync', {
      method: 'GET',
      headers: {
        ...(uri ? { 'x-mongo-uri': uri } : {}),
      },
    });

    const result = await res.json();
    return {
      success: res.ok && result.connected,
      connected: !!result.connected,
      message: result.message || 'Fetched data from MongoDB',
      data: result.data,
    };
  } catch (err: any) {
    return {
      success: false,
      connected: false,
      message: err.message || 'Network error fetching from MongoDB',
      error: err.message,
    };
  }
};

/**
 * Save / Upsert single item to MongoDB
 */
export const saveItemToMongo = async (
  itemType: 'product' | 'operation' | 'ledger' | 'user',
  singleItem: any
): Promise<MongoSyncResult> => {
  const uri = getCustomMongoUri();
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(uri ? { 'x-mongo-uri': uri } : {}),
      },
      body: JSON.stringify({
        action: 'upsert_single',
        itemType,
        singleItem,
        mongoUri: uri,
      }),
    });

    const data = await res.json();
    return {
      success: res.ok && data.success,
      connected: !!data.connected,
      message: data.message || `Saved ${itemType} to MongoDB`,
    };
  } catch (err: any) {
    return {
      success: false,
      connected: false,
      message: err.message,
      error: err.message,
    };
  }
};

/**
 * Save full dataset batch to MongoDB
 */
export const saveAllToMongo = async (payload: MongoSyncPayload): Promise<MongoSyncResult> => {
  const uri = getCustomMongoUri();
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(uri ? { 'x-mongo-uri': uri } : {}),
      },
      body: JSON.stringify({
        ...payload,
        mongoUri: uri,
      }),
    });

    const data = await res.json();
    return {
      success: res.ok && data.success,
      connected: !!data.connected,
      message: data.message || 'Synchronized dataset to MongoDB',
      stats: data.stats,
    };
  } catch (err: any) {
    return {
      success: false,
      connected: false,
      message: err.message,
      error: err.message,
    };
  }
};
