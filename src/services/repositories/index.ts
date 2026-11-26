import type { IRepositories } from './interfaces';
import { createMockRepositories } from './mock';
import { createApiRepositories } from './api/apiRepo';

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock';

export const repositories: IRepositories =
  dataSource === 'api' ? createApiRepositories() : createMockRepositories();
