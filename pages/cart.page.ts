import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.cartItems = page.locator('.cart_list').getByTestId('inventory-item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', {
      name: 'Continue Shopping',
    });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.page.getByText('Your Cart', { exact: true })).toBeVisible();
  }

  item(name: string): Locator {
    return this.cartItems.filter({ hasText: name });
  }

  itemPrice(name: string): Locator {
    return this.item(name).getByTestId('inventory-item-price');
  }

  async itemNames(): Promise<string[]> {
    return this.cartItems.getByTestId('inventory-item-name').allTextContents();
  }

  async removeItem(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
