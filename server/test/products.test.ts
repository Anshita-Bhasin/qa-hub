import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createTestSupabaseClient } from './testClient';
import { createApp } from '../index';

describe('products API', () => {
  const supabase = createTestSupabaseClient();
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    await supabase.from('products').delete().neq('id', -1);
    app = createApp(supabase);
  });

  afterEach(async () => {
    await supabase.from('products').delete().neq('id', -1);
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
