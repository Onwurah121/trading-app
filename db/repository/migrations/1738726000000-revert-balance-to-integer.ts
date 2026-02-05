import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertBalanceToInteger1738726000000 implements MigrationInterface {
    name = 'RevertBalanceToInteger1738726000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Convert decimal values back to integers by multiplying by 100
        await queryRunner.query(`
            ALTER TABLE "balances" 
            ALTER COLUMN "amount" TYPE integer 
            USING (amount::numeric * 100)::integer
        `);
        
        // Set default back to 0
        await queryRunner.query(`
            ALTER TABLE "balances" 
            ALTER COLUMN "amount" SET DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Convert integer values to decimal by dividing by 100
        await queryRunner.query(`
            ALTER TABLE "balances" 
            ALTER COLUMN "amount" TYPE numeric(18,2) 
            USING (amount::numeric / 100)
        `);
        
        // Set default to 0.00
        await queryRunner.query(`
            ALTER TABLE "balances" 
            ALTER COLUMN "amount" SET DEFAULT 0.00
        `);
    }
}
