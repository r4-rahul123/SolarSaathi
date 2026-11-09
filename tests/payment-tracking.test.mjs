import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  canCustomerViewPayments,
  isPaymentStaffRole,
  summarizePayments,
  validatePaymentAmount,
} from "../src/lib/payment-utils.ts";

describe("Mock payment tracking", () => {
  test("accepts an advance payment within the quoted balance", () => {
    assert.equal(validatePaymentAmount(25000, 117000), true);
  });

  test("accepts a later installment against the remaining balance", () => {
    const previous = summarizePayments(117000, [{ amount: 25000, status: "Paid" }]);
    assert.equal(previous.remainingBalance, 92000);
    assert.equal(validatePaymentAmount(40000, previous.remainingBalance), true);
  });

  test("calculates paid total and remaining balance from Paid rows only", () => {
    assert.deepEqual(summarizePayments(117000, [
      { amount: 25000, status: "Paid" }, { amount: 10000, status: "Pending" },
    ]), { projectAmount: 117000, totalPaid: 25000, remainingBalance: 92000, status: "Partially Paid" });
  });

  test("marks the project paid at the full quoted net amount", () => {
    assert.equal(summarizePayments(117000, [{ amount: 117000, status: "Paid" }]).status, "Paid");
  });

  test("does not count pending or failed payments as received", () => {
    const summary = summarizePayments(117000, [{ amount: 30000, status: "Pending" }, { amount: 20000, status: "Failed" }]);
    assert.equal(summary.totalPaid, 0);
    assert.equal(summary.remainingBalance, 117000);
    assert.equal(summary.status, "Pending");
  });

  test("rejects zero, invalid, and over-balance payment amounts", () => {
    assert.equal(validatePaymentAmount(0, 100), false);
    assert.equal(validatePaymentAmount(Number.NaN, 100), false);
    assert.equal(validatePaymentAmount(100.01, 100), false);
  });

  test("only sales staff and coordinators are authorized for payment operations", () => {
    assert.equal(isPaymentStaffRole("SALES"), true);
    assert.equal(isPaymentStaffRole("COORDINATOR"), true);
    assert.equal(isPaymentStaffRole("SURVEYOR"), false);
    assert.equal(isPaymentStaffRole("HOMEOWNER"), false);
  });

  test("homeowners can view payments only for their own project", () => {
    assert.equal(canCustomerViewPayments("HOMEOWNER", "user-1", "user-1"), true);
    assert.equal(canCustomerViewPayments("HOMEOWNER", "user-2", "user-1"), false);
    assert.equal(canCustomerViewPayments("SALES", "user-1", "user-1"), false);
  });
});
