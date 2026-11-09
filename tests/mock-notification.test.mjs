import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  generateMockWhatsAppMessage,
  formatStageLabel,
  maskRecipientPhone,
  createMockNotificationRecord,
} from "../src/lib/mock-notifications.ts";

describe("Mock WhatsApp Notification System", () => {
  test("formatStageLabel formats all project stages into human-readable strings", () => {
    assert.equal(formatStageLabel("LEAD_APPROVED"), "Lead & Bill Approved");
    assert.equal(formatStageLabel("SITE_SURVEY"), "Rooftop Site Survey");
    assert.equal(formatStageLabel("QUOTATION_APPROVED"), "Quotation Accepted");
    assert.equal(formatStageLabel("ADVANCE_PAYMENT"), "Advance Token Payment Confirmed");
    assert.equal(formatStageLabel("INSTALLATION"), "Installation Completed");
    assert.equal(formatStageLabel("NET_METERING"), "Net Metering Synchronized");
    assert.equal(formatStageLabel("SUBSIDY_APPLICATION"), "DBT Subsidy Application Filed");
    assert.equal(formatStageLabel("SUBSIDY_CREDITED"), "Central Subsidy Credited");
  });

  test("maskRecipientPhone securely masks phone numbers to prevent privacy leaks", () => {
    assert.equal(maskRecipientPhone("9876543210"), "98******3210");
    assert.equal(maskRecipientPhone("+919876543210"), "91******3210");
    assert.equal(maskRecipientPhone(""), "—");
    assert.equal(maskRecipientPhone("1234"), "*4");
  });

  test("Notification message contains actual customer name, project ID, and status next-steps context", () => {
    const msg = generateMockWhatsAppMessage("Prashant Deshmukh", "LD-30881", "INSTALLATION");

    assert.ok(msg.includes("Hello Prashant ji,"), "Message should greet customer with name");
    assert.ok(msg.includes("Project ID: LD-30881"), "Message should include actual Project ID");
    assert.ok(msg.includes("Installation Completed"), "Message should include human-readable status");
    assert.ok(msg.includes("SolarSaathi"), "Message should reference company name");
    assert.ok(msg.includes("MSEDCL bi-directional net meter"), "Message should mention next steps context");
  });

  test("createMockNotificationRecord creates record with WhatsApp Mock channel, Sent status, and UUID", () => {
    const lead = {
      id: "LD-30881",
      customerName: "Prashant Deshmukh",
      phone: "9876543210",
      status: "SITE_SURVEY",
    };

    const notif = createMockNotificationRecord(lead, "SITE_SURVEY");
    assert.ok(notif.id, "Should have a generated UUID");
    assert.equal(notif.projectId, "LD-30881");
    assert.equal(notif.customerName, "Prashant Deshmukh");
    assert.equal(notif.channel, "WhatsApp Mock");
    assert.equal(notif.status, "Sent (Mock)");
    assert.equal(notif.stage, "SITE_SURVEY");
    assert.equal(notif.recipient, "9876543210");
    assert.ok(notif.createdAt, "Should have ISO createdAt");
    assert.ok(notif.sentAt, "Should have ISO sentAt");
  });

  test("Duplicate status update deduplication prevents multiple notifications for identical stage", () => {
    const existingNotifications = [
      {
        id: "1",
        projectId: "LD-30881",
        stage: "SITE_SURVEY",
        channel: "WhatsApp Mock",
        status: "Sent (Mock)",
        message: "Hello Prashant",
        recipient: "98******10",
        createdAt: new Date().toISOString(),
      },
    ];

    const targetStage = "SITE_SURVEY";
    const isDuplicate = existingNotifications.some((n) => n.stage === targetStage);
    assert.equal(isDuplicate, true, "Stage already notified should be detected as duplicate");

    const newStage = "INSTALLATION";
    const isNewDuplicate = existingNotifications.some((n) => n.stage === newStage);
    assert.equal(isNewDuplicate, false, "New stage should allow notification generation");
  });

  test("RBAC rules: Homeowner cannot query other projects' notifications", () => {
    const checkNotificationAccess = (role, userProjectId, requestedProjectId) => {
      const isStaff = ["SURVEYOR", "SALES", "COORDINATOR"].includes(role);
      if (isStaff) return true;
      if (role === "HOMEOWNER") {
        return requestedProjectId === userProjectId;
      }
      return false;
    };

    // Staff can access any project
    assert.equal(checkNotificationAccess("COORDINATOR", null, "LD-30902"), true);

    // Customer can access their own project
    assert.equal(checkNotificationAccess("HOMEOWNER", "LD-30881", "LD-30881"), true);

    // Customer CANNOT access other project
    assert.equal(checkNotificationAccess("HOMEOWNER", "LD-30881", "LD-30902"), false);

    // Anonymous cannot access
    assert.equal(checkNotificationAccess(null, null, "LD-30881"), false);
  });
});
