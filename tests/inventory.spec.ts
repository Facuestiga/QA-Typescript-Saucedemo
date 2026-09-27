import { test, expect } from './fixtures/test';
import { users } from './data/users';

const expectedProducts = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)',
];

test.describe('Product grid and filtering', { tag: '@regression' }, () => {
  test.beforeEach(async ({ inventoryPage, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test('SL-01 Product grid shows all catalog items', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
    expect(await inventoryPage.productNamesText()).toEqual(expectedProducts);

    for (const item of await inventoryPage.inventoryItems.all()) {
      await expect(item.getByTestId('inventory-item-name')).not.toHaveText('');
      await expect(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(item.getByRole('img')).toBeVisible();
      await expect(item.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
    }
  });

  test('SL-02 Responsive layout preserves catalog items', { tag: '@mobile' }, async ({ inventoryPage, page }) => {
    const viewport = page.viewportSize();
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
    const names = await inventoryPage.productNamesText();

    expect(names).toEqual(expectedProducts);
    for (const item of await inventoryPage.inventoryItems.all()) {
      expect(await item.evaluate((element) => element.getBoundingClientRect().width)).toBeLessThanOrEqual(
        viewport!.width,
      );
    }
  });

  test('SL-03 Opening a product shows matching details', async ({ inventoryPage, page }) => {
    const name = (await inventoryPage.productNames.first().textContent())!;
    const price = (await inventoryPage.productPrices.first().textContent())!;

    await inventoryPage.openProduct(name);

    await expect(page).toHaveURL(/inventory-item\.html/);
    const details = page.locator('.inventory_details');
    await expect(details.getByTestId('inventory-item-name')).toHaveText(name);
    await expect(details.getByTestId('inventory-item-price')).toHaveText(price);
    await expect(details.getByTestId('inventory-item-desc')).not.toHaveText('');
    await expect(details.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  });

  test('SL-04 Back from product details returns to an unchanged grid', async ({ inventoryPage, page }) => {
    const namesBefore = await inventoryPage.productNamesText();
    await inventoryPage.openProduct(namesBefore[1]);
    await page.getByRole('button', { name: 'Back to products' }).click();

    await inventoryPage.expectLoaded();
    expect(await inventoryPage.productNamesText()).toEqual(namesBefore);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  const sortCases = [
    { id: 'SL-05', title: 'Sort by Name A to Z', option: 'az', kind: 'name', direction: 1 },
    { id: 'SL-06', title: 'Sort by Name Z to A', option: 'za', kind: 'name', direction: -1 },
    { id: 'SL-07', title: 'Sort by Price low to high', option: 'lohi', kind: 'price', direction: 1 },
    { id: 'SL-08', title: 'Sort by Price high to low', option: 'hilo', kind: 'price', direction: -1 },
  ] as const;

  for (const sortCase of sortCases) {
    test(`${sortCase.id} ${sortCase.title}`, async ({ inventoryPage }) => {
      await expect(inventoryPage.sortSelect.locator('option')).toHaveCount(4);
      await inventoryPage.sortSelect.selectOption(sortCase.option);
      await expect(inventoryPage.inventoryItems).toHaveCount(6);

      if (sortCase.kind === 'name') {
        const actual = await inventoryPage.productNamesText();
        const expected = [...actual].sort(
          (left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }) * sortCase.direction,
        );
        expect(actual).toEqual(expected);
      } else {
        const actual = await inventoryPage.productPricesNumber();
        const expected = [...actual].sort((left, right) => (left - right) * sortCase.direction);
        expect(actual).toEqual(expected);
      }
    });
  }
});
