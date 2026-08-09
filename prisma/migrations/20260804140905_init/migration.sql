-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "paystackSecretKey" TEXT NOT NULL,
    "paystackPublicKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "paystackCustomerId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLink" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "paystackPageId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountKobo" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT,
    "paymentLinkId" TEXT,
    "paystackReference" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL,
    "channel" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "paystackRefundId" TEXT,
    "amountKobo" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEventLog" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaystackWebhookLog" (
    "id" TEXT NOT NULL,
    "paystackEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaystackWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_paystackCustomerId_key" ON "Customer"("paystackCustomerId");

-- CreateIndex
CREATE INDEX "Customer_merchantId_idx" ON "Customer"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_merchantId_email_key" ON "Customer"("merchantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_paystackPageId_key" ON "PaymentLink"("paystackPageId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_slug_key" ON "PaymentLink"("slug");

-- CreateIndex
CREATE INDEX "PaymentLink_merchantId_idx" ON "PaymentLink"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_paystackReference_key" ON "Transaction"("paystackReference");

-- CreateIndex
CREATE INDEX "Transaction_merchantId_status_idx" ON "Transaction"("merchantId", "status");

-- CreateIndex
CREATE INDEX "Transaction_merchantId_createdAt_idx" ON "Transaction"("merchantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_paystackRefundId_key" ON "Refund"("paystackRefundId");

-- CreateIndex
CREATE INDEX "Refund_merchantId_idx" ON "Refund"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_hashedKey_key" ON "ApiKey"("hashedKey");

-- CreateIndex
CREATE INDEX "ApiKey_merchantId_idx" ON "ApiKey"("merchantId");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_merchantId_idx" ON "WebhookEndpoint"("merchantId");

-- CreateIndex
CREATE INDEX "WebhookEventLog_endpointId_status_idx" ON "WebhookEventLog"("endpointId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaystackWebhookLog_paystackEventId_key" ON "PaystackWebhookLog"("paystackEventId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "PaymentLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEventLog" ADD CONSTRAINT "WebhookEventLog_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "WebhookEndpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
