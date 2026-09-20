import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { getDb } from '../db';
import { createApp } from '../index';
import productsRouter from '../routes/products';

function tempDbPath(): string {
  return path.join(os.tmpdir(), `qa-hub-test-${Date.now()}-${Math.random()}.db`);
}

describe('products API', () => {
  let dbPath: string;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    app = createApp(db);
    app.use('/api/products', productsRouter);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  const sampleProduct = {
    id: 4,
    name: 'Sauce Labs Backpack',
    price: 29.99,
    extractedPriceStr: '$29.99',
    imgUrl: 'https://www.saucedemo.com/assets/sauce-backpack-1200x1500-CjRW-Djj.jpg',
    isBrokenImage: false,
    isDuplicateAsset: false,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=4',
    status: 'valid',
    statusLabel: 'Valid'
  };

  it('bulk-upserts and lists products', async () => {
    const res = await request(app).post('/api/products').send([sampleProduct]);
    expect(res.status).toBe(201);

    const listRes = await request(app).get('/api/products');
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].name).toBe('Sauce Labs Backpack');
    expect(listRes.body[0].isBrokenImage).toBe(false);
  });

  it('upsert replaces an existing product with the same id', async () => {
    await request(app).post('/api/products').send([sampleProduct]);
    await request(app).post('/api/products').send([{ ...sampleProduct, isBrokenImage: true, statusLabel: 'Broken' }]);

    const listRes = await request(app).get('/api/products');
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].isBrokenImage).toBe(true);
  });
});
