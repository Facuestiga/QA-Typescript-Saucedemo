import { env } from '../../config/env';

export const users = {
  locked: {
    username: 'locked_out_user',
    password: env.credentials.password,
  },
  standard: {
    username: env.credentials.username,
    password: env.credentials.password,
  },
  problem: {
    username: 'problem_user',
    password: env.credentials.password,
  },
} as const;
