// backend/src/services/snowflakeClient.js
import snowflake from 'snowflake-sdk';
import { config } from '../config/index.js';  // <-- pulls in dotenv + snowflake config

let connection = null;
let connectionPromise = null;

/**
 * Create (or reuse) a single Snowflake connection.
 * Returns a Promise that resolves only AFTER the connection is established.
 */
function connectOnce() {
  if (connectionPromise) return connectionPromise;

  const {
    account,
    user,
    password,
    warehouse,
    database,
    schema,
  } = config.snowflake;

  connection = snowflake.createConnection({
    account,              // e.g. gcc31764.us-east-1
    username: user,       // e.g. VISHESHJ207
    password,
    warehouse,
    database,
    schema,
  });

  console.log('🔄 Creating Snowflake connection...');

  connectionPromise = new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        console.error('❌ Snowflake connect error:', err);
        // allow retries next time
        connection = null;
        connectionPromise = null;
        return reject(err);
      }
      console.log('✅ Connected to Snowflake. Connection ID:', conn.getId());
      resolve(conn);
    });
  });

  return connectionPromise;
}

/**
 * Run a SQL query with optional bound parameters.
 * Returns an array of rows as plain JS objects.
 */
export async function execute(sqlText, binds = []) {
  const conn = await connectOnce(); // wait until connection is ready

  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText,
      binds,
      complete: (err, _stmt, rows) => {
        if (err) {
          console.error('❌ Snowflake query error:', err);
          return reject(err);
        }
        resolve(rows);
      },
    });
  });
}
