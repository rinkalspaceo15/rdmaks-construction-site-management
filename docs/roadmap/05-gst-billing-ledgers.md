# Feature 05 — GST Billing + Vendor/Labour Payment Ledgers

| | |
|---|---|
| **Phase** | 2 — documented now, build later |
| **MVP-safe?** | ❌ No — **lifts the "No auth" guardrail** and adds compliance scope |
| **Effort** | Large (~2–3 weeks; regulatory burden) |

## Goal
Generate GST-compliant invoices and track who-owes-whom: money paid to vendors (against materials) and to labour (against wages), so a contractor sees outstanding balances, not just totals.

## Market rationale (verified)
GST billing is the clearest value-add layer above the commoditized six modules. **Vyapar** and **ContractorDash** sell exactly this (GST/non-GST invoicing, reverse charge, e-invoicing, vendor ledgers, labour payments). Our specs have **zero** GST/invoice/tax references — definitively absent. For a contractor, GST-ready billing + a payment ledger is often the real reason to pay for software at all.

## ⚠️ Guardrails this lifts / scope it adds
- **Auth/accounts:** GST invoices carry a seller GSTIN and legal identity → the app needs per-business accounts and data isolation. This breaks the MVP's "no auth" rule and is a prerequisite.
- **Compliance burden:** correct GST means tax rates/HSN-SAC codes, CGST/SGST vs IGST split, reverse-charge handling, and (for e-invoicing) IRN/QR generation via the GST portal/IRP. This is legal-accuracy territory — **needs domain/accounting review, not just engineering.**

## Scope (when built) — phased internally
1. **Payment ledgers first** (lower regulatory risk): record payments against vendors (materials) and workers (wages from Feature 02) → outstanding balance per party. Builds naturally on payroll + materials.
2. **GST invoicing second:** invoice generation with line items, tax split, GSTIN, printable/PDF output.
3. **E-invoicing last** (highest burden): IRN + QR via IRP — only if customers demand it.

## Data-model sketch
```
payments (
  id UUID PK, party_type VARCHAR(10) CHECK (party_type IN ('vendor','worker')),
  party_ref TEXT, site_id UUID REFERENCES sites(id),
  amount DECIMAL(12,2) NOT NULL, mode VARCHAR(20), note TEXT, date DATE
)
invoices (
  id UUID PK, site_id UUID, buyer_name TEXT, buyer_gstin VARCHAR(15),
  invoice_no TEXT, date DATE, subtotal DECIMAL(12,2),
  cgst DECIMAL(12,2), sgst DECIMAL(12,2), igst DECIMAL(12,2), total DECIMAL(12,2)
)
invoice_items ( id UUID PK, invoice_id UUID, description TEXT, hsn_sac VARCHAR(10),
  qty DECIMAL(10,2), rate DECIMAL(10,2), tax_rate DECIMAL(4,1), amount DECIMAL(12,2) )
```

## Dependencies (new — need sign-off)
- Auth layer (sessions/JWT) — itself a large, separately-scoped piece.
- PDF generation (server-side) for invoices.
- GST/IRP integration libs only if e-invoicing is in scope.

## Acceptance criteria (when built)
- [ ] `CLAUDE.md` + both specs updated to lift "no auth" and add the billing contract.
- [ ] Tax math reviewed by someone with GST/accounting knowledge against real invoice examples.
- [ ] Per-business data isolation enforced server-side (not client-trusted).
- [ ] Money/tax as DECIMAL strings per cross-package contract.

## Open decisions
1. **Build auth first as its own project** — strongly recommended; it gates this *and* pricing tiers.
2. Ledgers-only MVP vs full GST invoicing — recommend ledgers first (high value, low regulatory risk).
3. Is e-invoicing (IRN) actually demanded by small contractors, or only larger ones? (Open research question.)
