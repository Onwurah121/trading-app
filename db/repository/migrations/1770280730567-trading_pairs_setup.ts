import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPairsSetup1770280730567 implements MigrationInterface {
    name = 'TradingPairsSetup1770280730567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Trading Config table
        await queryRunner.query(`CREATE TABLE "trading_config" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "defaultTradingFee" numeric(10,4) NOT NULL DEFAULT '0.5', 
            "defaultSpread" numeric(10,4) NOT NULL DEFAULT '0.1', 
            "defaultMinTradeAmount" numeric(20,8), 
            "defaultMaxTradeAmount" numeric(20,8), 
            "isDynamicTradingEnabled" boolean NOT NULL DEFAULT true, 
            "currencyPairBlacklist" jsonb, 
            "metadata" jsonb, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_trading_config" PRIMARY KEY ("id")
        )`);

        // Create Trading Pairs table
        await queryRunner.query(`CREATE TABLE "trading_pairs" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "base_currency_id" uuid NOT NULL, 
            "quote_currency_id" uuid NOT NULL, 
            "symbol" character varying(10) NOT NULL, 
            "tradingFee" numeric(10,4) NOT NULL DEFAULT '0', 
            "spread" numeric(10,4) NOT NULL DEFAULT '0', 
            "minTradeAmount" numeric(20,8), 
            "maxTradeAmount" numeric(20,8), 
            "isActive" boolean NOT NULL DEFAULT true, 
            "isTradingEnabled" boolean NOT NULL DEFAULT true, 
            "metadata" jsonb, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_trading_pairs_symbol" UNIQUE ("symbol"), 
            CONSTRAINT "PK_trading_pairs" PRIMARY KEY ("id")
        )`);

        // Add indices
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_trading_pairs_currencies" ON "trading_pairs" ("base_currency_id", "quote_currency_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_trading_pairs_active" ON "trading_pairs" ("isActive", "isTradingEnabled")`);
        await queryRunner.query(`CREATE INDEX "IDX_trading_pairs_symbol" ON "trading_pairs" ("symbol")`);

        // Add Foreign Keys
        await queryRunner.query(`ALTER TABLE "trading_pairs" ADD CONSTRAINT "FK_trading_pairs_base" FOREIGN KEY ("base_currency_id") REFERENCES "currencies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trading_pairs" ADD CONSTRAINT "FK_trading_pairs_quote" FOREIGN KEY ("quote_currency_id") REFERENCES "currencies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trading_pairs" DROP CONSTRAINT "FK_trading_pairs_quote"`);
        await queryRunner.query(`ALTER TABLE "trading_pairs" DROP CONSTRAINT "FK_trading_pairs_base"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trading_pairs_symbol"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trading_pairs_active"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trading_pairs_currencies"`);
        await queryRunner.query(`DROP TABLE "trading_pairs"`);
        await queryRunner.query(`DROP TABLE "trading_config"`);
    }

}
