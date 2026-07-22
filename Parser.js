/**
 * Zendesk-to-QuickBooks SKU Parser for Zapier
 * 
 * Takes raw input text from Zendesk ticket internal notes and
 * maps course abbreviations against internal product SKUs into
 * a structured JSON array for QuickBooks Online invoice draft creation.
 */

const coursesInput = inputData.courses || "";

// Genericized SKU Lookup Table (Anonymized for Portfolio)
const skuLookup = {
  // Core Courses
  "COURSE-A": "101",
  "COURSE-B": "102",
  "COURSE-C": "103",
  "COURSE-D": "104",
  "COURSE-E": "105",
  "COURSE-F": "106",
  "COURSE-G": "107",
  "COURSE-H": "108",
  "COURSE-I": "109",
  "COURSE-J": "110",

  // Specialized / Regional Certification Modules
  "REG-CERT-1": "201",
  "REG-CERT-2": "202",
  "SAFETY-MOD-A": "301",
  "SAFETY-MOD-B": "302",
  "COMPLIANCE-X": "401",
  "COMPLIANCE-Y": "402"
};

/**
 * Normalizes input text and parses line items into structured SKU/Quantity pairs
 */
function parseCoursePayload(rawInput) {
  if (!rawInput.trim()) return [];

  const lineItems = rawInput.split(/\r?\n|,/);
  const parsedResults = [];

  lineItems.forEach(item => {
    const trimmedItem = item.trim();
    if (!trimmedItem) return;

    // Matches patterns like "COURSE-A x 5", "COURSE-B x2", "COURSE-C 10", or just "COURSE-D"
    const match = trimmedItem.match(/^([A-Z0-9-]+)(?:\s*(?:x|\*|\s)\s*(\d+))?$/i);

    if (match) {
      const rawCode = match[1].toUpperCase();
      const quantity = match[2] ? parseInt(match[2], 10) : 1;

      // Map to SKU lookup table
      if (skuLookup[rawCode]) {
        parsedResults.push({
          itemCode: rawCode,
          sku: skuLookup[rawCode],
          quantity: quantity
        });
      }
    }
  });

  return parsedResults;
}

// Execute parser and output structured data for Zapier
const outputData = parseCoursePayload(coursesInput);
output = { items: outputData };
