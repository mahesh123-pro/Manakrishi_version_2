import test from "node:test";
import assert from "node:assert/strict";
import {
  nextBookingStates,
  validateDispatch,
} from "../lib/admin/booking-rules.ts";
const input = {
  expectedStatus: "confirmed",
  status: "assigned",
  reason: "Operator confirmed",
  operatorName: "Fixture operator",
  operatorPhone: "9876543210",
  scheduledDate: "2026-10-28",
  scheduledTime: "10:30",
};
test("dispatch requires a complete operator and schedule before assignment", () => {
  assert.equal(validateDispatch(input).target, "assigned");
  for (const key of [
    "operatorName",
    "operatorPhone",
    "scheduledDate",
    "scheduledTime",
  ])
    assert.throws(
      () => validateDispatch({ ...input, [key]: "" }),
      /dispatch_required/,
    );
  assert.throws(
    () => validateDispatch({ ...input, operatorPhone: "123" }),
    /invalid_contact/,
  );
  assert.throws(
    () => validateDispatch({ ...input, scheduledDate: "2026-02-30" }),
    /invalid_date/,
  );
  assert.throws(
    () => validateDispatch({ ...input, scheduledTime: "25:00" }),
    /invalid_date/,
  );
});
test("service booking progression cannot skip work or reopen terminal jobs", () => {
  assert.deepEqual(nextBookingStates("new"), ["confirmed", "cancelled"]);
  assert.deepEqual(nextBookingStates("completed"), []);
  assert.deepEqual(nextBookingStates("unknown"), []);
  assert.throws(
    () =>
      validateDispatch({
        ...input,
        expectedStatus: "new",
        status: "completed",
      }),
    /invalid_transition/,
  );
  assert.throws(
    () =>
      validateDispatch({
        ...input,
        expectedStatus: "completed",
        status: "completed",
      }),
    /terminal_booking/,
  );
  assert.throws(
    () =>
      validateDispatch({
        ...input,
        expectedStatus: "cancelled",
        status: "cancelled",
      }),
    /terminal_booking/,
  );
  assert.throws(
    () => validateDispatch({ ...input, reason: " " }),
    /invalid_fields/,
  );
  assert.equal(
    validateDispatch({
      ...input,
      status: "cancelled",
      operatorName: "",
      operatorPhone: "",
      scheduledDate: "",
      scheduledTime: "",
    }).target,
    "cancelled",
  );
});
