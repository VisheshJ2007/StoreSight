// backend/src/scripts/importReviewsFromCsv.js
import fs from 'fs';
import { parse } from 'csv-parse';
import { execute } from '../services/snowflakeClient.js';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node src/scripts/importReviewsFromCsv.js path/to/file.csv');
  process.exit(1);
}

async function readCsv(path) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(path)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function run() {
  try {
    const records = await readCsv(filePath);
    console.log(`Found ${records.length} rows in CSV`);

    for (const row of records) {
      const storeId = parseInt(row.store_id, 10);
      const rating = parseFloat(row.rating);
      const source = row.source;
      const text = row.review_text;

      await execute(
        `
        INSERT INTO REVIEWS (STORE_ID, RATING, SOURCE, REVIEW_TEXT, CREATED_AT)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP())
        `,
        [storeId, rating, source, text]
      );

      console.log(`✅ Inserted review for store ${storeId}`);
    }

    console.log('🎉 Import complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

run();
