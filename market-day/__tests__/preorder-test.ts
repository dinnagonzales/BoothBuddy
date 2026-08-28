import { createCatalog } from '@/lib/catalog';
import { paymentCanComplete, paymentMethodCompletesPreorder, preorderMetadataValid } from '@/lib/sale-edit';

test('Quick Sale preorder saves with pay on pickup and stays out of Sales tab', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  const { saleNumber } = await catalog.recordQuickSale({
    lines: [
      {
        itemId: dragon.id,
        name: 'Dragon',
        emoji: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 1,
      },
    ],
    paymentMethod: 'pay_on_pickup',
    cashReceivedCents: null,
    name: 'Emma',
    notes: 'Saturday pickup',
    isPreorder: true,
  });

  expect(await catalog.getSale(saleNumber)).toMatchObject({
    saleNumber: 1,
    paymentMethod: 'pay_on_pickup',
    name: 'Emma',
    notes: 'Saturday pickup',
    isPreorder: true,
  });

  expect(await catalog.listPreorderSales()).toHaveLength(1);
  expect(await catalog.listAllTimeSales()).toHaveLength(0);
  expect(await catalog.getAllTimeStats()).toMatchObject({
    totalCents: 0,
    itemCount: 0,
  });
});

test('marking a preorder complete moves it to Sales tab', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  const { saleNumber } = await catalog.recordQuickSale({
    lines: [
      {
        itemId: dragon.id,
        name: 'Dragon',
        emoji: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 1,
      },
    ],
    paymentMethod: 'pay_on_pickup',
    cashReceivedCents: null,
    name: 'Emma',
    notes: 'Saturday pickup',
    isPreorder: true,
  });

  await catalog.completePreorder(saleNumber, { paymentMethod: 'venmo_zelle' });

  expect(await catalog.listPreorderSales()).toHaveLength(0);
  expect(await catalog.listAllTimeSales()).toHaveLength(1);
  expect(await catalog.getSale(saleNumber)).toMatchObject({
    paymentMethod: 'venmo_zelle',
    isPreorder: false,
  });
  expect(await catalog.getAllTimeStats()).toMatchObject({
    totalCents: 400,
    venmoCents: 400,
  });
});

test('pending preorders are excluded from Running Tab export', async () => {
  jest.useFakeTimers();

  const catalog = createCatalog();
  const dragon = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  jest.setSystemTime(new Date('2026-08-20T15:00:00.000Z'));
  await catalog.recordQuickSale({
    lines: [
      {
        itemId: dragon.id,
        name: 'Dragon',
        emoji: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 1,
      },
    ],
    paymentMethod: 'pay_on_pickup',
    cashReceivedCents: null,
    name: 'Emma',
    notes: 'Saturday pickup',
    isPreorder: true,
  });

  expect(await catalog.listSalesExportRows('2026-08-20', '2026-08-20')).toHaveLength(0);

  jest.useRealTimers();
});

test('payment helpers treat pay on pickup as checkout-complete but not preorder-complete', () => {
  expect(paymentCanComplete('pay_on_pickup', 0, 500)).toBe(true);
  expect(paymentMethodCompletesPreorder('pay_on_pickup')).toBe(false);
  expect(paymentMethodCompletesPreorder('venmo_zelle')).toBe(true);
});

test('preorder requires name and notes', async () => {
  const catalog = createCatalog();
  const dragon = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  const line = {
    itemId: dragon.id,
    name: 'Dragon',
    emoji: '🐉',
    priceCents: 400,
    costCents: 100,
    quantity: 1,
  };

  await expect(
    catalog.recordQuickSale({
      lines: [line],
      paymentMethod: 'pay_on_pickup',
      cashReceivedCents: null,
      isPreorder: true,
    }),
  ).rejects.toThrow('Preorder requires name and notes');

  expect(preorderMetadataValid('Emma', '')).toBe(false);
  expect(preorderMetadataValid('Emma', 'Saturday')).toBe(true);
});
