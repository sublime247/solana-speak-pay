export interface Contact {
  name: string;
  address: string;
}

const STORAGE_KEY = "solana_speak_pay_contacts";

const DEFAULT_CONTACTS: Contact[] = [
  { name: "Ayo", address: "CvPTanAUAeqVpyHc8jAdhZ6iGYeXJy9udRtWNbDfbjRg" },
  { name: "Kush", address: "CvPTanAUAeqVpyHc8jAdhZ6iGYeXJy9udRtWNbDfbjRg" },
];

/**
 * Get all contacts from localStorage
 */
export function getContacts(): Contact[] {
  if (typeof window === "undefined") return DEFAULT_CONTACTS;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTACTS));
    return DEFAULT_CONTACTS;
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_CONTACTS;
  }
}

/**
 * Add a new contact
 */
export function addContact(contact: Contact): void {
  const contacts = getContacts();
  const updated = [...contacts, contact];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Remove a contact by name
 */
export function removeContact(name: string): void {
  const contacts = getContacts();
  const updated = contacts.filter((c) => c.name.toLowerCase() !== name.toLowerCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Resolve a name to an address
 */
export function resolveAddress(input: string): string {
  const contacts = getContacts();
  const contact = contacts.find(
    (c) => c.name.toLowerCase() === input.toLowerCase()
  );
  
  if (contact) {
    return contact.address;
  }
  
  return input;
}
