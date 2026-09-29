type TestEnvironment = 'ci' | 'local';

const loadLocalEnvironment = () => {
  try {
    process.loadEnvFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
};

const optional = (name: string) => {
  const value = process.env[name]?.trim();
  return value || undefined;
};

const required = (name: string) => {
  const value = optional(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const environment = (): TestEnvironment => {
  const value = optional('TEST_ENV') ?? 'local';

  if (value !== 'ci' && value !== 'local') {
    throw new Error('TEST_ENV must be either "local" or "ci"');
  }

  return value;
};

const baseUrl = () => {
  const value = optional('BASE_URL') ?? 'https://www.saucedemo.com';

  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error();
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    throw new Error('BASE_URL must be a valid HTTP or HTTPS URL');
  }
};

loadLocalEnvironment();

export const env = Object.freeze({
  baseUrl: baseUrl(),
  testEnvironment: environment(),
  credentials: Object.freeze({
    username: required('TEST_USERNAME'),
    password: required('TEST_PASSWORD'),
  }),
});
