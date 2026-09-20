import { Router } from 'express';
import type { Database } from 'better-sqlite3';

interface ProductRow {
  id: number;
  name: string;
  price: number;
  extractedPriceStr: string;
  imgUrl: string;
  isBrokenImage: number;
  isDuplicateAsset: number;
  duplicateNote: string | null;
  isPriceGlitch: number;
  missingDescription: number;
  location: string;
  deepLink: string;
  status: string;
  statusLabel: string;
}

function rowToProduct(row: ProductRow) {
  return {
    ...row,
    isBrokenImage: !!row.isBrokenImage,
    isDuplicateAsset: !!row.isDuplicateAsset,
    isPriceGlitch: !!row.isPriceGlitch,
    missingDescription: !!row.missingDescription
  };
}

const router = Router();

router.get('/', (req, res) => {
  const db: Database = req.app.locals.db;
  const rows = db.prepare('SELECT * FROM products ORDER BY id').all() as ProductRow[];
  res.json(rows.map(rowToProduct));
});

router.post('/', (req, res) => {
  const db: Database = req.app.locals.db;
  const input = Array.isArray(req.body) ? req.body : [req.body];

  if (input.length === 0) {
    return res.status(400).json({ error: 'Request body must be a product or a non-empty array of products' });
  }

  const upsert = db.prepare(`
    INSERT INTO products
      (id, name, price, extractedPriceStr, imgUrl, isBrokenImage, isDuplicateAsset, duplicateNote, isPriceGlitch, missingDescription, location, deepLink, status, statusLabel)
    VALUES
      (@id, @name, @price, @extractedPriceStr, @imgUrl, @isBrokenImage, @isDuplicateAsset, @duplicateNote, @isPriceGlitch, @missingDescription, @location, @deepLink, @status, @statusLabel)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, price=excluded.price, extractedPriceStr=excluded.extractedPriceStr,
      imgUrl=excluded.imgUrl, isBrokenImage=excluded.isBrokenImage, isDuplicateAsset=excluded.isDuplicateAsset,
      duplicateNote=excluded.duplicateNote, isPriceGlitch=excluded.isPriceGlitch,
      missingDescription=excluded.missingDescription, location=excluded.location,
      deepLink=excluded.deepLink, status=excluded.status, statusLabel=excluded.statusLabel
  `);

  const upsertMany = db.transaction((products: any[]) => {
    for (const p of products) {
      upsert.run({
        ...p,
        isBrokenImage: p.isBrokenImage ? 1 : 0,
        isDuplicateAsset: p.isDuplicateAsset ? 1 : 0,
        isPriceGlitch: p.isPriceGlitch ? 1 : 0,
        missingDescription: p.missingDescription ? 1 : 0,
        duplicateNote: p.duplicateNote ?? null
      });
    }
  });

  try {
    upsertMany(input);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  res.status(201).json(Array.isArray(req.body) ? input : input[0]);
});

export default router;
