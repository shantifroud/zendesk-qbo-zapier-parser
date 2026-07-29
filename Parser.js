/**
 * Zendesk-to-QBO Line Item, Date & Department Parser for Zapier
 * 
 * Parses raw text input from Zendesk ticket notes (using shorthand item abbreviations),
 * maps them to QuickBooks Online Internal Product IDs (to prevent SKU mismatches),
 * calculates totals, dynamically assigns service dates, and outputs clean arrays
 * for QBO draft invoice creation.
 * 
 * Expected Inputs from Zapier:
 * - inputData.courses (or itemsInput): e.g., "2 x PROD-A, 1 x SERV-B"
 * - inputData.dateOfTraining (or dateInput): e.g., "2026-08-15, 2026-08-16"
 */

const itemsInput = inputData.courses || inputData.itemsInput || "";
const dateInput = inputData.dateOfTraining || inputData.dateInput || ""; 

// Extract array of clean dates
const parsedDates = dateInput.split(",").map(d => d.trim()).filter(Boolean);

// System Category / Ledger Class Mapping (Delivery Channels & Locations)
const CATEGORIES = {
  DIGITAL_SELF_SERVE: "CAT-100001",
  MANAGED_SERVICES: "CAT-100002",
  LOCATION_ALPHA: "CAT-200001",
  LOCATION_BETA: "CAT-200002",
  LOCATION_GAMMA: "CAT-200003"
};

/**
 * Product & Internal ID Lookup Table
 * Maps Zendesk Abbreviation -> { qboProductId (Internal DB Key), Unit Price, Class ID }
 */
const catalogLookup = {
  // Digital / Self-Serve Channel
  "PROD-A": { qboProductId: "5000000101", price: 50.00, categoryId: CATEGORIES.DIGITAL_SELF_SERVE },
  "PROD-B": { qboProductId: "5000000102", price: 60.00, categoryId: CATEGORIES.DIGITAL_SELF_SERVE },
  "PROD-C": { qboProductId: "5000000103", price: 60.00, categoryId: CATEGORIES.DIGITAL_SELF_SERVE },

  // Location-based Services (Alpha / Beta)
  "SERV-ALPHA": { qboProductId: "5000000201", price: 150.00, categoryId: CATEGORIES.LOCATION_ALPHA },
  "SERV-BETA":  { qboProductId: "5000000301", price: 150.00, categoryId: CATEGORIES.LOCATION_BETA },

  // Managed Services / Enterprise Channel
  "ENTERPRISE-1": { qboProductId: "5000000401", price: 200.00, categoryId: CATEGORIES.MANAGED_SERVICES }
};

const lineItems = [];
const skipped = [];

// Split comma-separated note entries into individual string items
const entries = itemsInput.split(",").map(e => e.trim()).filter(Boolean);

let index = 0;
for (const entry of entries) {
  // Regex pattern matching format like "2 x PROD-A" or "1xSERV-ALPHA"
  const match = entry.match(/^(\d+)\s*x\s*([A-Z0-9\-]+)$/i);
  
  if (!match) {
    skipped.push(entry);
    continue;
  }

  const quantity = Number(match[1]);
  const abbreviation = match[2].toUpperCase();
  const matchData = catalogLookup[abbreviation];

  // Fallback for unmapped or misspelled abbreviations
  if (!matchData) {
    skipped.push(`${quantity}x ${abbreviation} (unmapped)`);
    continue;
  }

  const unitPrice = Number(matchData.price || 0);
  const lineAmount = Number((quantity * unitPrice).toFixed(2));
  
  // Assign corresponding date by array position, or default to primary date
  const serviceDate = parsedDates[index] || parsedDates[0] || "";

  lineItems.push({
    quantity: quantity,
    qboProductId: matchData.qboProductId, // Exact QBO Internal Database ID
    price: unitPrice,
    amount: lineAmount,
    description: abbreviation,
    categoryId: matchData.categoryId,
    serviceDate: serviceDate
  });

  index++;
}

// Return clean, parallel arrays structured for direct Zapier-to-QBO API line-item mapping
output = {
  qboProductIds: lineItems.map(item => item.qboProductId),
  quantities: lineItems.map(item => item.quantity),
  prices: lineItems.map(item => item.price),
  amounts: lineItems.map(item => item.amount),
  descriptions: lineItems.map(item => item.description),
  categories: lineItems.map(item => item.categoryId),
  serviceDates: lineItems.map(item => item.serviceDate),
  skipped: skipped.join(", ") || "none"
};
