import { test, expect } from './fixtures/test';
import { users } from './data/users';

test.describe('Account and authentication', { tag: '@regression' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('SL-14 Menu exposes all expected navigation items', async ({ inventoryPage, loginPage, page }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.openMenu();

    for (const id of [
      'inventory-sidebar-link',
      'about-sidebar-link',
      'logout-sidebar-link',
      'reset-sidebar-link',
    ]) {
      await expect(page.getByTestId(id)).toBeVisible();
    }

    await inventoryPage.closeMenu();
    await inventoryPage.expectLoaded();
  });

  test('SL-15 Logout returns to the login screen with fields cleared', async ({ inventoryPage, loginPage, page }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.logout();

    await expect(page).toHaveURL('/');
    await expect(loginPage.usernameInput).toBeEmpty();
    await expect(loginPage.passwordInput).toBeEmpty();
    await expect(loginPage.errorMessage).toBeHidden();
  });

  for (const user of [users.standard, users.problem]) {
    test(`SL-16 Every valid user in the pool can log in and reach Products (${user.username})`, async ({ inventoryPage, loginPage }) => {
      await loginPage.login(user.username, user.password);
      await inventoryPage.expectLoaded();
      await expect(inventoryPage.inventoryItems).toHaveCount(6);
      await expect(loginPage.errorMessage).toBeHidden();
      await inventoryPage.logout();
      await expect(loginPage.usernameInput).toBeEmpty();
      await expect(loginPage.passwordInput).toBeEmpty();
    });
  }

  test('SL-17 Invalid username is rejected with field and banner errors', async ({ loginPage, page }) => {
    await loginPage.login('invalid_user', users.standard.password);

    await expect(page).toHaveURL('/');
    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match any user in this service',
    );
    await expect(page.locator('.error_icon')).toHaveCount(2);
    await expect(loginPage.usernameInput).toHaveCSS('border-bottom-color', 'rgb(226, 35, 26)');
    await expect(loginPage.passwordInput).toHaveCSS('border-bottom-color', 'rgb(226, 35, 26)');
  });
});
