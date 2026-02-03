# Repository Pattern Implementation

## Overview

This document explains the custom repository pattern implementation that replaces TypeORM's `@InjectRepository` decorator with a custom provider-based approach. This pattern helps avoid circular dependencies and provides better control over dependency injection.

## Structure

```
src/
├── core/
│   └── constants/
│       └── index.ts              # DI tokens for repositories and data source
├── repository/
│   ├── providers/
│   │   ├── database.provider.ts          # DataSource provider
│   │   ├── user.repository.provider.ts   # User repository provider
│   │   ├── wallet.repository.provider.ts # Wallet repository provider
│   │   ├── balance.repository.provider.ts # Balance repository provider
│   │   └── transaction.repository.provider.ts # Transaction repository provider
│   └── repository.module.ts      # Global module exporting all providers
```

## Key Components

### 1. Constants (DI Tokens)

**File:** `src/core/constants/index.ts`

```typescript
export const DATA_SOURCE = 'DATA_SOURCE';
export const USER_REPOSITORY = 'USER_REPOSITORY';
export const WALLET_REPOSITORY = 'WALLET_REPOSITORY';
export const BALANCE_REPOSITORY = 'BALANCE_REPOSITORY';
export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
```

These constants serve as injection tokens for dependency injection.

### 2. Database Provider

**File:** `src/repository/providers/database.provider.ts`

Creates and initializes the TypeORM DataSource with configuration from environment variables.

```typescript
export const DatabaseProvider = [
  {
    provide: DATA_SOURCE,
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        // ... other config
        entities: [User, Wallet, Balance, Transaction],
      });
      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
```

### 3. Repository Providers

Each entity has its own repository provider that uses the DataSource to create a repository.

**Example:** `src/repository/providers/user.repository.provider.ts`

```typescript
export const UserRepoProvider = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [DATA_SOURCE],
  },
];
```

### 4. Repository Module

**File:** `src/repository/repository.module.ts`

A module that provides all repositories and the data source. **Each module that needs repositories must explicitly import this module.**

```typescript
@Module({
  providers: [
    ...DatabaseProvider,
    ...UserRepoProvider,
    ...WalletRepoProvider,
    ...BalanceRepoProvider,
    ...TransactionRepoProvider,
  ],
  exports: [/* same as providers */],
})
export class RepositoryModule {}
```

**Important:** This module is **NOT** marked as `@Global()`. You must explicitly import it in every module that uses repositories.

## Usage in Services

### Before (TypeORM's @InjectRepository)

```typescript
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
}
```

### After (Custom Repository Provider)

```typescript
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../core/constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: Repository<User>,
  ) {}
}
```

## Benefits

### 1. **Avoids Circular Dependencies**
- No need to import `TypeOrmModule.forFeature([Entity])` in every module
- Repositories are provided by `RepositoryModule` which is explicitly imported
- Clear dependency graph - you can see exactly which modules depend on repositories

### 2. **Cleaner Module Definitions**

**Before:**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User, Wallet, Balance])],
  providers: [SomeService],
})
export class SomeModule {}
```

**After:**
```typescript
@Module({
  imports: [RepositoryModule],
  providers: [SomeService],
})
export class SomeModule {}
```

### 3. **Better Control**
- Single source of truth for database configuration
- Easy to add custom repository methods
- Easier to mock in tests
- Explicit dependencies make the module graph clear

### 4. **Flexibility**
- Can easily switch between different repository implementations
- Can add middleware/interceptors to repository methods
- Better suited for microservices architecture

## Migration Summary

### Files Created
- `src/core/constants/index.ts`
- `src/repository/repository.module.ts`
- `src/repository/providers/database.provider.ts`
- `src/repository/providers/user.repository.provider.ts`
- `src/repository/providers/wallet.repository.provider.ts`
- `src/repository/providers/balance.repository.provider.ts`
- `src/repository/providers/transaction.repository.provider.ts`

### Files Modified
- `src/app.module.ts` - Replaced `TypeOrmModule` with `RepositoryModule`
- `src/auth/auth.service.ts` - Updated to use `@Inject(USER_REPOSITORY)`
- `src/auth/auth.module.ts` - Removed `UsersModule` import
- `src/wallets/wallets.service.ts` - Updated to use repository providers
- `src/wallets/wallets.module.ts` - Removed `TypeOrmModule` imports
- `src/transactions/transactions.service.ts` - Updated to use repository provider
- `src/transactions/transactions.module.ts` - Removed `TypeOrmModule` imports
- `src/users/users.module.ts` - Simplified (no longer exports TypeORM)

### Modules Simplified
All feature modules no longer need to:
- Import `TypeOrmModule`
- Call `TypeOrmModule.forFeature([...])`
- Export `TypeOrmModule`

## Testing

The application builds successfully with this new pattern:

```bash
npm run build
# Exit code: 0 ✅
```

## Best Practices

1. **Always use constants** for injection tokens to avoid typos
2. **Keep repository providers simple** - just factory functions
3. **Explicitly import RepositoryModule** in every module that uses repositories
4. **Inject DATA_SOURCE** when you need to use QueryRunner for transactions
5. **Type your injected repositories** to maintain type safety
6. **Don't use @Global()** - explicit imports make dependencies clear

## Example: Using in a New Service

**Service:**
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { USER_REPOSITORY } from '../core/constants';

@Injectable()
export class NewService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find();
  }
}
```

**Module:**
```typescript
import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/repository.module';
import { NewService } from './new.service';

@Module({
  imports: [RepositoryModule],
  providers: [NewService],
})
export class NewModule {}
```

## Troubleshooting

### Issue: "Cannot find module '../core/constants'"
**Solution:** Ensure the constants file exists at `src/core/constants/index.ts`

### Issue: "No provider for USER_REPOSITORY"
**Solution:** Ensure `RepositoryModule` is imported in `AppModule`

### Issue: Circular dependency errors
**Solution:** This pattern should eliminate them. If you still see them, check your module imports.

## Conclusion

This repository pattern provides a cleaner, more maintainable approach to dependency injection in NestJS applications. It eliminates circular dependencies, simplifies module definitions, and provides better control over repository creation and management.
