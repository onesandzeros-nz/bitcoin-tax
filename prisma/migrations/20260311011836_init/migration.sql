-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "transactionDate" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "btcAmount" DECIMAL NOT NULL,
    "fiatAmount" DECIMAL NOT NULL,
    "fiatCurrency" TEXT NOT NULL DEFAULT 'NZD',
    "feeAmount" DECIMAL,
    "feeCurrency" TEXT,
    "price" DECIMAL NOT NULL,
    "sourceReference" TEXT,
    "importBatchId" TEXT,
    "rawData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WACCalculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "calculationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runningBalance" DECIMAL NOT NULL,
    "runningCost" DECIMAL NOT NULL,
    "wacPrice" DECIMAL NOT NULL,
    "costBasis" DECIMAL NOT NULL,
    "capitalGain" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WACCalculation_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "recordsImported" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TaxYear" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "openingBtcBalance" DECIMAL NOT NULL DEFAULT 0,
    "openingCostBasis" DECIMAL NOT NULL DEFAULT 0,
    "openingWac" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CurrencyRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DECIMAL NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Transaction_transactionDate_idx" ON "Transaction"("transactionDate");

-- CreateIndex
CREATE INDEX "Transaction_source_idx" ON "Transaction"("source");

-- CreateIndex
CREATE INDEX "Transaction_importBatchId_idx" ON "Transaction"("importBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "WACCalculation_transactionId_key" ON "WACCalculation"("transactionId");

-- CreateIndex
CREATE INDEX "WACCalculation_calculationDate_idx" ON "WACCalculation"("calculationDate");

-- CreateIndex
CREATE INDEX "ImportBatch_importedAt_idx" ON "ImportBatch"("importedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TaxYear_year_key" ON "TaxYear"("year");

-- CreateIndex
CREATE INDEX "TaxYear_year_idx" ON "TaxYear"("year");

-- CreateIndex
CREATE INDEX "CurrencyRate_date_idx" ON "CurrencyRate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_date_fromCurrency_toCurrency_key" ON "CurrencyRate"("date", "fromCurrency", "toCurrency");
