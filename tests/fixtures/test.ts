import { test as base } from '@playwright/test';
import { CartPage } from '../../pages/cart.page';
import { CheckoutPage } from '../../pages/checkout.page';
import { InventoryPage } from '../../pages/inventory.page';
import { LoginPage } from '../../pages/login.page';

type AppFixtures = {
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  inventoryPage: InventoryPage;
  loginPage: LoginPage;
};

export const test = base.extend<AppFixtures>({
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from '@playwright/test';
