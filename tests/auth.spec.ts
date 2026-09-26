import { test, expect } from './fixtures/test';
import { users } from './data/users';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('logs in with valid user @smoke', async ({ inventoryPage, loginPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await inventoryPage.expectLoaded();
  });

  test('rejects invalid password', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, 'invalid_password');

    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match',
    );
  });

  test('rejects a locked user', async ({ loginPage }) => {
    await loginPage.login(users.locked.username, users.locked.password);

    await expect(loginPage.errorMessage).toContainText(
      'Sorry, this user has been locked out',
    );
  });

  test('logs out an authenticated user', async ({
    inventoryPage,
    loginPage,
    page,
  }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.logout();

    await expect(page).toHaveURL('/');
    await expect(loginPage.submitButton).toBeVisible();
  });
});
