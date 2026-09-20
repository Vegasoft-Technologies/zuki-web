import { site } from "../../data/site.ts";
import type { BookingRules } from "./config.ts";
import { checkSlot, describeProblem, type Slot } from "./slots.ts";
import type { Contact } from "./store.ts";

export interface RawInput {
  name: string;
  partySize: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  note: string;
  /** The honeypot. Real visitors never see it, so it must arrive empty. */
  website: string;
}

export interface ValidBooking {
  name: string;
  partySize: number;
  slot: Slot;
  contact: Contact;
  note?: string;
}

export type FieldErrors = Partial<Record<keyof RawInput | "contact", string>>;

export type Validation =
  { ok: true; value: ValidBooking } | { ok: false; errors: FieldErrors };

const text = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/** Reads the fields we know from whatever the request carried, trimming and capping each. */
export function readInput(raw: Record<string, unknown>): RawInput {
  return {
    name: text(raw.name, 80),
    partySize: text(raw.partySize, 3),
    date: text(raw.date, 10),
    time: text(raw.time, 5),
    phone: text(raw.phone, 20),
    email: text(raw.email, 120),
    note: text(raw.note, 300),
    website: text(raw.website, 200),
  };
}

const PHONE = /^\+?[0-9 ()-]{7,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(input: RawInput, rules: BookingRules, now: Date): Validation {
  const errors: FieldErrors = {};

  if (input.name.length < 2) errors.name = "Please tell us your name.";

  const party = Number(input.partySize);
  if (!Number.isInteger(party) || party < 1) {
    errors.partySize = "How many people are coming?";
  } else if (party > rules.maxPartyOnline) {
    errors.partySize = `For parties larger than ${rules.maxPartyOnline}, please telephone us on ${site.telephoneDisplay}.`;
  }

  const slot = checkSlot(input.date, input.time, rules, now);
  if (!slot.ok) {
    const message = describeProblem(slot.problem, rules);
    if (
      slot.problem === "invalid-date" ||
      slot.problem === "too-far-ahead" ||
      slot.problem === "closed-that-day"
    ) {
      errors.date = message;
    } else {
      errors.time = message;
    }
  }

  const contact: Contact = {};
  if (input.phone) {
    if (PHONE.test(input.phone)) contact.phone = input.phone;
    else errors.phone = "That telephone number does not look right.";
  }
  if (input.email) {
    if (EMAIL.test(input.email)) contact.email = input.email;
    else errors.email = "That email address does not look right.";
  }
  if (!input.phone && !input.email) {
    errors.contact =
      "Please give a telephone number or an email address so we can reach you.";
  }

  if (Object.keys(errors).length > 0 || !slot.ok) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: input.name,
      partySize: party,
      slot: slot.slot,
      contact,
      note: input.note || undefined,
    },
  };
}
