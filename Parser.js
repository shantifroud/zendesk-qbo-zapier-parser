/**
 * Zendesk-to-QuickBooks SKU Parser for Zapier
 * 
 * Takes raw input text from Zendesk ticket internal notes and
 * maps course abbreviations against internal product SKUs into
 * a structured JSON array for QuickBooks Online invoice draft creation.
 */

const itemsInput = inputData.courses || "";

/**
 * Genericized Product SKU, ID, and Pricing Lookup Table
 * Maps inventory item codes to internal catalog IDs and tiered pricing.
 */
const catalogLookup = {
  // Tier 1 - Standard Digital Items ($25.00)
  "SKU-101": { id: "101", price: 25.00 },
  "SKU-102": { id: "102", price: 25.00 },
  "SKU-103": { id: "103", price: 25.00 },

  // Tier 2 - Core Modules ($50.00)
  "SKU-201": { id: "201", price: 50.00 },
  "SKU-202": { id: "202", price: 50.00 },
  "SKU-203": { id: "203", price: 50.00 },

  // Tier 3 - Advanced Services ($100.00)
  "SKU-301": { id: "301", price: 100.00 },
  "SKU-302": { id: "302", price: 100.00 },

  // Tier 4 - Premium Packages ($150.00)
  "SKU-401": { id: "401", price: 150.00 },
  "SKU-402": { id: "402", price: 150.00 }
};

const lineItems = [];
const skipped = [];

// Split input string into individual line item entries
const entries = itemsInput.split(",").map(e => e.trim()).filter(Boolean);

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
    skipped.push(`${quantity}x ${itemCode} (no ID)`);
    continue;
  }

  const unitPrice = Number(matchData.price || 0);
  const lineAmount = Number((quantity * unitPrice).toFixed(2));

  lineItems.push({
    quantity: quantity,
    id: matchData.id,
    price: unitPrice,
    amount: lineAmount,
    description: itemCode
  });
}

// Structure arrays for Zapier line-item mapping
output = {
  ids: lineItems.map(item => item.id),
  quantities: lineItems.map(item => item.quantity),
  prices: lineItems.map(item => item.price),
  amounts: lineItems.map(item => item.amount),
  descriptions: lineItems.map(item => item.description),
  skipped: skipped.join(", ") || "none"
};
