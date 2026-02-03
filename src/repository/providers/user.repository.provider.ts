import { DataSource } from 'typeorm';
import { DATA_SOURCE, USER_REPOSITORY } from '../../core/constants';
import { User } from '../../users/entities/user.entity';

export const UserRepoProvider = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [DATA_SOURCE],
  },
];
