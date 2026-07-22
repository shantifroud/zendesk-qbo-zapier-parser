# Zendesk to QuickBooks Online Invoice Automation Parser

> **Status:** De-Bugging / Prototyping

## Overview
An automated support-to-billing pipeline engineered to bridge the operational gap between frontline Customer Support (Zendesk) and Finance/Accounting (QuickBooks Online).

## The Problem
Manual invoice requests from clients created operational friction between Client Services and Accounting. The manual handoff led to data entry delays, higher risk of human error, and heavy administrative overhead on the accounting team.

## The Solution & Workflow Architecture
1. **Trigger:** Client Services agents select a standardized internal note macro in Zendesk containing structured billing parameters.
2. **Data Extraction (Zapier):** Zapier captures the ticket update payload from Zendesk.
3. **Parsing Engine (Custom JavaScript):** A custom JS script parses and cleans the internal note body text, extracting line items, client metadata, and dollar amounts into structured JSON data.
4. **Action (QuickBooks Online):** Zapier maps the structured output directly into QuickBooks Online to draft a pre-populated invoice.
5. **Review:** Finance performs a quick 1-click review and sends the invoice to the requesting client.

## Key Operational Impact
* **Accounting:** Drastically reduces manual data entry and invoice creation turnaround times.
* **Client Services:** Streamlines billing escalations via a single internal macro, speeding up cross-departmental handoffs.
* **Clients:** Delivers faster, more accurate custom invoicing for corporate accounts.

## Tech Stack
* **Language:** JavaScript
* **Integration Platform:** Zapier
* **Platforms:** Zendesk API / Webhooks, QuickBooks Online

## 💡 Input vs. Output Example

**Zendesk Internal Note (Input):**
```text
Client: Acme Corp
Courses: COURSE-A x2, COURSE-B x1
```
Parsed Output (Sent to QuickBooks):
```
[
  { "itemCode": "COURSE-A", "sku": "101", "quantity": 2 },
  { "itemCode": "COURSE-B", "sku": "102", "quantity": 1 }
]

