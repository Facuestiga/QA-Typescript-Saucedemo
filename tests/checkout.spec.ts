import { test, expect } from './fixtures/test';
import { users } from './data/users';

const products = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
] as const;

test.describe('Cart and checkout', { tag: '@regression' }, () => {
  test.beforeEach(async ({ inventoryPage, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test('SL-09 Add a single item from the grid updates the cart badge', async ({ cartPage, inventoryPage }) => {
    const product = products[0];
    const price = await inventoryPage.productPrice(product).textContent();
    await expect(inventoryPage.cartBadge).toBeHidden();

    await inventoryPage.addProduct(product);
    await expect(inventoryPage.product(product).getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.openCart();

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.item(product)).toBeVisible();
    await expect(cartPage.itemPrice(product)).toHaveText(price!);
  });

  test('SL-10 Add an item from the product details page', async ({ cartPage, inventoryPage, page }) => {
    const product = products[0];
    await inventoryPage.openProduct(product);
    const details = page.locator('.inventory_details');
    const price = await details.getByTestId('inventory-item-price').textContent();

    await details.getByRole('button', { name: 'Add to cart' }).click();
    await expect(details.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.openCart();

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.item(product)).toBeVisible();
    await expect(cartPage.itemPrice(product)).toHaveText(price!);
  });

  test('SL-11 Add multiple items and verify cart contents match the badge', async ({ cartPage, inventoryPage }) => {
    for (const [index, product] of products.entries()) {
      await inventoryPage.addProduct(product);
      await expect(inventoryPage.cartBadge).toHaveText(String(index + 1));
    }

    await inventoryPage.openCart();
    await expect(cartPage.cartItems).toHaveCount(3);
    expect(await cartPage.itemNames()).toEqual(products);
  });

  test('SL-12 Remove an item from the cart', async ({ cartPage, inventoryPage }) => {
    for (const product of products.slice(0, 2)) {
      await inventoryPage.addProduct(product);
    }
    await expect(inventoryPage.cartBadge).toHaveText('2');
    await inventoryPage.openCart();

    await cartPage.removeItem(products[0]);
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await cartPage.removeItem(products[1]);
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('SL-13 Cart contents survive Continue Shopping', async ({ cartPage, inventoryPage }) => {
    for (const product of products.slice(0, 2)) {
      await inventoryPage.addProduct(product);
    }
    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    const names = await cartPage.itemNames();
    await cartPage.continueShopping();

    await inventoryPage.expectLoaded();
    await expect(inventoryPage.cartBadge).toHaveText('2');
    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    expect(await cartPage.itemNames()).toEqual(names);
  });

  test('SL-18 Successful checkout calculates totals and completes the purchase', { tag: '@smoke' }, async ({
    cartPage,
    checkoutPage,
    inventoryPage,
    page,
  }) => {
    const selected = products.slice(0, 2);
    const prices: number[] = [];
    for (const product of selected) {
      prices.push(Number((await inventoryPage.productPrice(product).textContent())!.replace('$', '')));
      await inventoryPage.addProduct(product);
    }
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillCustomer({ firstName: 'Test', lastName: 'User', postalCode: '12345' });
    await checkoutPage.continue();

    for (const [index, product] of selected.entries()) {
      await expect(checkoutPage.overviewItem(product)).toBeVisible();
      await expect(checkoutPage.overviewItem(product).getByTestId('inventory-item-price')).toHaveText(
        `$${prices[index].toFixed(2)}`,
      );
    }
    const subtotal = prices.reduce((sum, price) => sum + price, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    await expect(page.getByTestId('subtotal-label')).toHaveText(`Item total: $${subtotal.toFixed(2)}`);
    await expect(page.getByTestId('tax-label')).toHaveText(`Tax: $${tax.toFixed(2)}`);
    await expect(page.getByTestId('total-label')).toHaveText(`Total: $${(subtotal + tax).toFixed(2)}`);

    await checkoutPage.finish();
    await checkoutPage.expectComplete();
    await checkoutPage.backHome();
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  const validationCases = [
    {
      id: 'SL-19',
      title: 'Checkout requires a first name',
      customer: { firstName: '', lastName: 'User', postalCode: '12345' },
      error: 'First Name is required',
    },
    {
      id: 'SL-20',
      title: 'Checkout requires a last name',
      customer: { firstName: 'Test', lastName: '', postalCode: '12345' },
      error: 'Last Name is required',
    },
    {
      id: 'SL-21',
      title: 'Checkout requires a postal code',
      customer: { firstName: 'Test', lastName: 'User', postalCode: '' },
      error: 'Postal Code is required',
    },
  ] as const;

  for (const validationCase of validationCases) {
    test(`${validationCase.id} ${validationCase.title}`, async ({ cartPage, checkoutPage, inventoryPage, page }) => {
      await inventoryPage.addProduct(products[0]);
      await inventoryPage.openCart();
      await cartPage.checkout();
      await checkoutPage.fillCustomer(validationCase.customer);
      await checkoutPage.continue();

      await expect(page).toHaveURL(/checkout-step-one\.html/);
      await expect(checkoutPage.firstNameInput).toHaveValue(validationCase.customer.firstName);
      await expect(checkoutPage.lastNameInput).toHaveValue(validationCase.customer.lastName);
      await expect(checkoutPage.postalCodeInput).toHaveValue(validationCase.customer.postalCode);
      await expect(checkoutPage.errorMessage).toContainText(validationCase.error);
    });
  }

  test('SL-22 Cancelling checkout preserves the cart', async ({ cartPage, checkoutPage, inventoryPage }) => {
    const product = products[0];
    const price = await inventoryPage.productPrice(product).textContent();
    await inventoryPage.addProduct(product);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.cancel();

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(cartPage.itemPrice(product)).toHaveText(price!);

    await cartPage.checkout();
    await checkoutPage.fillCustomer({ firstName: 'Test', lastName: 'User', postalCode: '12345' });
    await checkoutPage.continue();
    await checkoutPage.cancel();

    await inventoryPage.expectLoaded();
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.openCart();
    await expect(cartPage.itemPrice(product)).toHaveText(price!);
  });
});
