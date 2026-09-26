import { test, expect } from './fixtures/test';
import { users } from './data/users';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test('shows the full catalog', async ({ inventoryPage }) => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
    await expect(inventoryPage.productNames).toContainText([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ]);
  });

  test('sorts products low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortSelect.selectOption('lohi');

    const prices = (await inventoryPage.productPrices.allTextContents()).map(
      (price) => Number(price.replace('$', '')),
    );
    const sortedPrices = [...prices].sort((left, right) => left - right);

    expect(prices).toEqual(sortedPrices);
  });

  test('adds and removes a product', async ({ inventoryPage }) => {
    const productName = 'Sauce Labs Backpack';

    await inventoryPage.addProduct(productName);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.removeProduct(productName);

    await expect(inventoryPage.cartBadge).toBeHidden();
    await expect(
      inventoryPage.product(productName).getByRole('button', {
        name: 'Add to cart',
      }),
    ).toBeVisible();
  });
});
