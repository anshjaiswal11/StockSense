import { MongoClient } from 'mongodb';

// Cache database connection across serverless invocations
let cachedClient: MongoClient | null = null;

const getMongoClient = async (customUri?: string) => {
  const uri = customUri || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    return null;
  }

  // If using custom URI different from cached, create new client
  if (cachedClient && !customUri) {
    return cachedClient;
  }

  const client = new MongoClient(uri);
  await client.connect();
  if (!customUri) {
    cachedClient = client;
  }
  return client;
};

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-mongo-uri');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const customUri = req.headers['x-mongo-uri'] as string | undefined || req.body?.mongoUri;

  try {
    const client = await getMongoClient(customUri);

    // If no MongoDB URI configured, respond gracefully
    if (!client) {
      if (req.method === 'GET') {
        return res.status(200).json({
          connected: false,
          message: 'MongoDB URI not configured. Set MONGODB_URI in Vercel or in app settings.',
          data: null,
        });
      }

      if (req.method === 'POST') {
        // Acknowledge receipt even without cloud mongo
        return res.status(200).json({
          connected: false,
          message: 'Saved to local store. To save to MongoDB Atlas, add MONGODB_URI environment variable.',
        });
      }
    }

    const db = client!.db('stocksense');
    const productsColl = db.collection('products');
    const operationsColl = db.collection('operations');
    const ledgerColl = db.collection('ledger');
    const usersColl = db.collection('users');
    const warehousesColl = db.collection('warehouses');
    const locationsColl = db.collection('locations');

    // Handle GET: Fetch all collections from MongoDB
    if (req.method === 'GET') {
      const [products, operations, ledger, users, warehouses, locations] = await Promise.all([
        productsColl.find({}).toArray(),
        operationsColl.find({}).toArray(),
        ledgerColl.find({}).toArray(),
        usersColl.find({}).toArray(),
        warehousesColl.find({}).toArray(),
        locationsColl.find({}).toArray(),
      ]);

      return res.status(200).json({
        connected: true,
        data: {
          products,
          operations,
          ledger,
          users,
          warehouses,
          locations,
        },
      });
    }

    // Handle POST: Sync and persist to MongoDB
    if (req.method === 'POST') {
      const { action, products, operations, ledger, users, warehouses, locations, singleItem, itemType } = req.body || {};

      // Test connection action
      if (action === 'test') {
        await db.command({ ping: 1 });
        return res.status(200).json({
          success: true,
          connected: true,
          message: 'Successfully connected to MongoDB database "stocksense"!',
        });
      }

      // Single item upsert
      if (action === 'upsert_single' && singleItem && itemType) {
        if (itemType === 'product') {
          await productsColl.updateOne({ id: singleItem.id }, { $set: singleItem }, { upsert: true });
        } else if (itemType === 'operation') {
          await operationsColl.updateOne({ id: singleItem.id }, { $set: singleItem }, { upsert: true });
        } else if (itemType === 'ledger') {
          await ledgerColl.updateOne({ id: singleItem.id }, { $set: singleItem }, { upsert: true });
        } else if (itemType === 'user') {
          await usersColl.updateOne({ id: singleItem.id }, { $set: singleItem }, { upsert: true });
        }

        return res.status(200).json({
          success: true,
          connected: true,
          message: `Item ${singleItem.id} saved in MongoDB collection "${itemType}".`,
        });
      }

      // Full batch sync
      const operationsPromises: Promise<any>[] = [];

      if (Array.isArray(products) && products.length > 0) {
        for (const p of products) {
          operationsPromises.push(productsColl.updateOne({ id: p.id }, { $set: p }, { upsert: true }));
        }
      }

      if (Array.isArray(operations) && operations.length > 0) {
        for (const op of operations) {
          operationsPromises.push(operationsColl.updateOne({ id: op.id }, { $set: op }, { upsert: true }));
        }
      }

      if (Array.isArray(ledger) && ledger.length > 0) {
        for (const l of ledger) {
          operationsPromises.push(ledgerColl.updateOne({ id: l.id }, { $set: l }, { upsert: true }));
        }
      }

      if (Array.isArray(users) && users.length > 0) {
        for (const u of users) {
          operationsPromises.push(usersColl.updateOne({ id: u.id }, { $set: u }, { upsert: true }));
        }
      }

      if (Array.isArray(warehouses) && warehouses.length > 0) {
        for (const w of warehouses) {
          operationsPromises.push(warehousesColl.updateOne({ id: w.id }, { $set: w }, { upsert: true }));
        }
      }

      if (Array.isArray(locations) && locations.length > 0) {
        for (const loc of locations) {
          operationsPromises.push(locationsColl.updateOne({ id: loc.id }, { $set: loc }, { upsert: true }));
        }
      }

      await Promise.all(operationsPromises);

      return res.status(200).json({
        success: true,
        connected: true,
        message: 'Successfully synchronized data to MongoDB.',
        stats: {
          productsSynced: products?.length || 0,
          operationsSynced: operations?.length || 0,
          ledgerSynced: ledger?.length || 0,
          usersSynced: users?.length || 0,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('MongoDB sync error:', error);
    return res.status(500).json({
      connected: false,
      error: error.message || 'Failed to communicate with MongoDB',
    });
  }
}
