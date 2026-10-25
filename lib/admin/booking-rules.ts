export const BOOKING_STATES = [
  "new",
  "confirmed",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type BookingState = (typeof BOOKING_STATES)[number];
const transitions: Record<BookingState, readonly BookingState[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["assigned", "cancelled"],
  assigned: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
export function nextBookingStates(state: string): readonly BookingState[] {
  return transitions[state as BookingState] || [];
}
export function validateDispatch(input: Record<string, unknown>) {
  const field = (key: string, max: number, required = false) => {
    const value = input[key];
    if (
      typeof value !== "string" ||
      value.trim().length > max ||
      (required && !value.trim())
    )
      throw new Error("invalid_fields");
    return value.trim();
  };
  const expected = field("expectedStatus", 40, true),
    target = field("status", 40, true);
  if (
    !(BOOKING_STATES as readonly string[]).includes(expected) ||
    !(BOOKING_STATES as readonly string[]).includes(target)
  )
    throw new Error("invalid_transition");
  const reason = field("reason", 500, true),
    operatorName = field("operatorName", 100),
    operatorPhone = field("operatorPhone", 10),
    scheduledDate = field("scheduledDate", 10),
    scheduledTime = field("scheduledTime", 5);
  if (operatorPhone && !/^[6-9]\d{9}$/.test(operatorPhone))
    throw new Error("invalid_contact");
  if (
    scheduledDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) ||
      Number.isNaN(Date.parse(scheduledDate)) ||
      new Date(scheduledDate).toISOString().slice(0, 10) !== scheduledDate)
  )
    throw new Error("invalid_date");
  if (scheduledTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(scheduledTime))
    throw new Error("invalid_date");
  if (
    ["assigned", "in_progress", "completed"].includes(target) &&
    (!operatorName || !operatorPhone || !scheduledDate || !scheduledTime)
  )
    throw new Error("dispatch_required");
  if (
    expected !== target &&
    !nextBookingStates(expected).includes(target as BookingState)
  )
    throw new Error("invalid_transition");
  if (["completed", "cancelled"].includes(expected))
    throw new Error("terminal_booking");
  return {
    expected,
    target,
    reason,
    operatorName,
    operatorPhone,
    scheduledDate,
    scheduledTime,
  };
}
