import { expect, type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly inventoryItems: Locator;
  readonly menuButton: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly sortSelect: Locator;

  constructor(private readonly page: Page) {
    this.inventoryItems = page.getByTestId('inventory-item');
    this.productNames = page.getByTestId('inventory-item-name');
    this.productPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.page.getByText('Products', { exact: true })).toBeVisible();
  }

  product(name: string): Locator {
    return this.inventoryItems.filter({ hasText: name });
  }

  async addProduct(name: string): Promise<void> {
    await this.product(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeProduct(name: string): Promise<void> {
    await this.product(name).getByRole('button', { name: 'Remove' }).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.page.getByTestId('logout-sidebar-link').click();
  }
}
