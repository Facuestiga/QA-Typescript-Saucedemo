import { expect, type Locator, type Page } from '@playwright/test';

export type Customer = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export class CheckoutPage {
  readonly errorMessage: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.errorMessage = page.getByTestId('error');
  }

  async fillCustomer(customer: Customer): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
  }

  async continue(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async finish(): Promise<void> {
    await this.page.getByRole('button', { name: 'Finish' }).click();
  }

  async expectComplete(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(
      this.page.getByRole('heading', { name: 'Thank you for your order!' }),
    ).toBeVisible();
  }
}
