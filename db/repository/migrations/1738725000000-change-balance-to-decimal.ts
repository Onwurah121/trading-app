import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeBalanceToDecimal1738725000000 implements MigrationInterface {
    name = 'ChangeBalanceToDecimal1738725000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, convert existing integer values to decimal by dividing by 100
        // This preserves existing data (e.g., 10000 cents becomes 100.00 dollars)
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

    public async down(queryRunner: QueryRunner): Promise<void> {
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
}
