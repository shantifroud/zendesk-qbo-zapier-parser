# Zendesk to QuickBooks Online Invoice Automation Parser

> **Status:** Production / Deployed

## Overview
An automated support-to-billing pipeline engineered to bridge the operational gap between frontline Customer Support (Zendesk) and Finance/Accounting (QuickBooks Online). It eliminates manual invoice creation by automatically parsing ticket payloads, mapping product/service SKUs, and drafting invoices in QBO.

## The Problem
Manual invoice requests created operational friction between Support and Accounting. Hand-entering line items, unit prices, service dates, and ledger classifications led to data entry delays, higher risk of human error, duplicate processing, and heavy administrative overhead.

## The Solution & Workflow Architecture
1. **Trigger:** Support agents select a standardized macro in Zendesk containing structured billing parameters and apply an initial trigger tag (e.g., `pending_invoice`).
2. **Data Extraction (Zapier):** Zapier captures the ticket update webhook payload from Zendesk.
3. **Parsing & Business Logic Engine (Custom JS):** A robust Node.js script parses raw note text, extracts line items, validates SKUs against an internal lookup catalog, calculates line totals, maps dynamic dates, and assigns departmental/ledger classifications.
4. **Action (QuickBooks Online):** Zapier maps the structured JSON arrays directly into QuickBooks Online to create a pre-populated draft invoice.
5. **State Management & Deduplication (Zendesk API):** Zapier immediately executes an API update back to Zendesk to **remove the trigger tag** (`pending_invoice`) and **add a completion tag** (`invoice_created`). This locks the ticket state and prevents duplicate invoice generation loops.
6. **Review:** Finance performs a quick 1-click review and approves the draft invoice for the client.

## Key Operational Impact
* **Zero Duplication Risk:** Dynamic tag lifecycle management guarantees idempotent execution (tickets cannot be double-invoiced).
* **Accounting Overhead:** Reduces manual data entry time by ~90% and slashes turnaround times from days to seconds.
* **Accuracy:** Automatically handles multi-line orders, dynamic service date mapping, and departmental class tracking with built-in error handling for unmapped SKUs.

## Tech Stack
* **Language:** JavaScript (Node.js ES6+)
* **Integration Platform:** Zapier
* **Platforms & APIs:** Zendesk Webhooks / API, QuickBooks Online API

---

## 💡 Input vs. Output Example

**Zendesk Internal Note Payload (Input):**
```text
Items: 2 x SKU-101, 1 x SKU-201
Service Dates: 2026-08-15, 2026-08-16

Parsed Output (Mapped to QBO API):
{
  "ids": ["101", "201"],
  "quantities": [2, 1],
  "prices": [24.95, 149.00],
  "amounts": [49.90, 149.00],
  "descriptions": ["SKU-101", "SKU-201"],
  "categories": ["CAT-ELEARNING", "CAT-LOCATION-A"],
  "serviceDates": ["2026-08-15", "2026-08-16"],
  "skipped": "none"
}

