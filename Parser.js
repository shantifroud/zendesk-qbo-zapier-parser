/**
 * Zendesk-to-ERP Order & SKU Parser for Zapier
 * 
 * Parses raw text input from ticket notes, extracts item quantities and SKUs,
 * calculates totals, and maps them to an internal product catalog array
 * for automated invoice creation.
 * 
 * Inputs:
 * - inputData.itemsInput: e.g., "5 x SKU-101, 2 x SKU-201"
 * - inputData.orderDates: e.g., "2026-08-15, 2026-08-16"
 */

const itemsInput = inputData.itemsInput || inputData.courses || "";
const datesInput = inputData.orderDates || inputData.dateOfTraining || ""; 

const parsedDates = datesInput.split(",").map(d => d.trim()).filter(Boolean);

// Generic System Category Mapping (e.g., Department / Ledger IDs)
const CATEGORIES = {
  DIGITAL: "CAT-100",
  PHYSICAL: "CAT-200",
  ENTERPRISE: "CLASS-300"
};

/**
 * Product Catalog Lookup Table
 * Maps SKU Code -> { Internal Product ID, Unit Price, Category ID }
 */
const catalogLookup = {
  // Tier 1 - Standard Digital Items
  "SKU-101": { id: "101", price: 25.00, categoryId: CATEGORIES.DIGITAL },
  "SKU-102": { id: "102", price: 25.00, categoryId: CATEGORIES.DIGITAL },
  "SKU-103": { id: "103", price: 35.00, categoryId: CATEGORIES.DIGITAL },

  // Tier 2 - Standard Physical / Hardware Items
  "SKU-201": { id: "201", price: 50.00, categoryId: CATEGORIES.PHYSICAL },
  "SKU-202": { id: "202", price: 75.00, categoryId: CATEGORIES.PHYSICAL },
  "SKU-203": { id: "203", price: 100.00, categoryId: CATEGORIES.PHYSICAL },

  // Tier 3 - Enterprise Bundles
  "SKU-301": { id: "301", price: 150.00, categoryId: CATEGORIES.ENTERPRISE },
  "SKU-302": { id: "302", price: 200.00, categoryId: CATEGORIES.ENTERPRISE }
};

const lineItems = [];
const skipped = [];

// Split input string into individual item entries
const entries = itemsInput.split(",").map(e => e.trim()).filter(Boolean);

let index = 0;
for (const entry of entries) {
  // Matches patterns like "2 x SKU-101" or "2xSKU-101"
  const match = entry.match(/^(\d+)\s*x\s*([A-Z0-9\-]+)$/i);
  if (!match) {
    skipped.push(entry);
    continue;
  }

  const quantity = Number(match[1]);
  const itemCode = match[2].toUpperCase();
  const matchData = catalogLookup[itemCode];

  if (!matchData) {
    skipped.push(`${quantity}x ${itemCode} (unmapped)`);
    continue;
  }

  const unitPrice = Number(matchData.price || 0);
  const lineAmount = Number((quantity * unitPrice).toFixed(2));
  
  // Assign corresponding date or default to primary order date
  const itemDate = parsedDates[index] || parsedDates[0] || "";

  lineItems.push({
    quantity: quantity,
    id: matchData.id,
    price: unitPrice,
    amount: lineAmount,
    description: itemCode,
    categoryId: matchData.categoryId,
    itemDate: itemDate
  });

  index++;
}

// Format output arrays for Zapier line-item steps
output = {
  ids: lineItems.map(item => item.id),
  quantities: lineItems.map(item => item.quantity),
  prices: lineItems.map(item => item.price),
  amounts: lineItems.map(item => item.amount),
  descriptions: lineItems.map(item => item.description),
  categories: lineItems.map(item => item.categoryId),
  itemDates: lineItems.map(item => item.itemDate),
  skipped: skipped.join(", ") || "none"
};
