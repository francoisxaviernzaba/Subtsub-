import { prisma } from "./db";
import { Prisma } from "@prisma/client";

/**
 * Compute current coin balance for a user from the ledger.
 * Always trust the server-computed balance; never trust client values.
 */
export async function getBalance(userId: string): Promise<number> {
  const agg = await prisma.coinTransaction.aggregate({
    where: { userId },
    _sum: { deltaCoins: true },
  });
  return agg._sum.deltaCoins ?? 0;
}

export type CoinTxnType =
  | "VIEW_REWARD"
  | "SUBSCRIBE_REWARD"
  | "BOOST_SPEND"
  | "BOOST_REFUND"
  | "COIN_PURCHASE"
  | "ADMIN_ADJUSTMENT"
  | "REFUND"
  | "REVERSAL"
  | "PLATFORM_FEE";

export type CreditInput = {
  userId: string;
  amount: number; // positive integer
  type: CoinTxnType;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  idempotencyKey?: string;
};

export type DebitInput = {
  userId: string;
  amount: number; // positive integer (will be stored as negative delta)
  type: CoinTxnType;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  idempotencyKey?: string;
};

/**
 * Atomic ledger operations. Throws on insufficient balance or duplicate idempotency key.
 * Always use these — never update balance directly.
 */
export async function creditCoins(input: CreditInput): Promise<{ balance: number; txnId: string }> {
  if (input.amount <= 0) throw new Error("Amount must be positive");
  return prisma.$transaction(async (tx) => {
    if (input.idempotencyKey) {
      const existing = await tx.coinTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        return { balance: existing.balanceAfter, txnId: existing.id };
      }
    }
    const current = await tx.coinTransaction.aggregate({
      where: { userId: input.userId },
      _sum: { deltaCoins: true },
    });
    const balance = (current._sum.deltaCoins ?? 0) + input.amount;
    const created = await tx.coinTransaction.create({
      data: {
        userId: input.userId,
        deltaCoins: input.amount,
        balanceAfter: balance,
        type: input.type,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        note: input.note,
        idempotencyKey: input.idempotencyKey,
      },
    });
    return { balance, txnId: created.id };
  });
}

export async function debitCoins(input: DebitInput): Promise<{ balance: number; txnId: string }> {
  if (input.amount <= 0) throw new Error("Amount must be positive");
  return prisma.$transaction(async (tx) => {
    if (input.idempotencyKey) {
      const existing = await tx.coinTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        return { balance: existing.balanceAfter, txnId: existing.id };
      }
    }
    const current = await tx.coinTransaction.aggregate({
      where: { userId: input.userId },
      _sum: { deltaCoins: true },
    });
    const balance = (current._sum.deltaCoins ?? 0) - input.amount;
    if (balance < 0) {
      throw new InsufficientBalanceError(
        `Insufficient coins: have ${current._sum.deltaCoins ?? 0}, need ${input.amount}`,
      );
    }
    const created = await tx.coinTransaction.create({
      data: {
        userId: input.userId,
        deltaCoins: -input.amount,
        balanceAfter: balance,
        type: input.type,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        note: input.note,
        idempotencyKey: input.idempotencyKey,
      },
    });
    return { balance, txnId: created.id };
  });
}

export class InsufficientBalanceError extends Error {
  code = "INSUFFICIENT_BALANCE";
}

/**
 * Ensure balance atomically inside an outer transaction. Use when you need
 * to debit + perform other writes atomically (e.g. boost campaign creation).
 */
export async function ensureBalance(tx: Prisma.TransactionClient, userId: string, need: number) {
  const agg = await tx.coinTransaction.aggregate({
    where: { userId },
    _sum: { deltaCoins: true },
  });
  const have = agg._sum.deltaCoins ?? 0;
  if (have < need) {
    throw new InsufficientBalanceError(`Insufficient coins: have ${have}, need ${need}`);
  }
  return have;
}
