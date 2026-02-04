import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../../core/constants';
import dataSource from './typeorm.config';

export { dataSource };

export const DatabaseProvider = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      return dataSource.initialize();
    },
  },
];
