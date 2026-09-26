import { test, expect } from './fixtures/test';
import { users } from './data/users';

const productName = 'Sauce Labs Backpack';

test.describe('Cart and checkout', () => {
  test.beforeEach(async ({ inventoryPage, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addProduct(productName);
    await inventoryPage.openCart();
  });

  test('keeps items after navigation', async ({ cartPage, inventoryPage }) => {
    await expect(cartPage.item(productName)).toBeVisible();
    await cartPage.continueShopping();

    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.openCart();
    await expect(cartPage.item(productName)).toBeVisible();
  });

  test('validates checkout details', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.continue();

    await expect(checkoutPage.errorMessage).toContainText(
      'First Name is required',
    );
  });

  test('completes an order @smoke', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomer({
      firstName: 'Test',
      lastName: 'Automation',
      postalCode: '1000',
    });
    await checkoutPage.continue();
    await checkoutPage.finish();

    await checkoutPage.expectComplete();
  });
});
