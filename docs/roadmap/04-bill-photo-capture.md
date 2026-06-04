# Feature 04 — Bill / Voucher Photo Capture

| | |
|---|---|
| **Phase** | 2 — documented now, build later |
| **MVP-safe?** | ❌ No — **lifts the "No file/photo uploads" guardrail** (`docs/frontend.md` → "What's NOT in the Frontend") |
| **Effort** | Medium–Large (~4–5 days) |

## Goal
Let a supervisor snap a photo of a material bill, expense voucher, or petty-cash receipt and attach it to the relevant entry — so the paper record lives with the digital one instead of in a pocket.

## Market rationale (verified)
**Haeywa** built a whole product on bill/voucher scan + petty-cash reconciliation; **Powerplay** has photo documentation. Notably, even **Yojo does NOT** capture bill photos (verified by refutation) — so this is a *defensible* gap, not something every competitor already covers. Tying a photo to an expense kills the "where's the receipt?" month-end fight.

## ⚠️ Guardrail this lifts
Current spec: *"No file/photo uploads."* Building this requires:
- A file-storage decision (local disk for dev → object storage like S3/Cloudflare R2 for prod).
- New upload handling middleware (e.g. `multer`) — a **new backend dependency** requiring sign-off.
- Image size/type validation, and on low-end phones, client-side compression before upload (slow networks).

## Scope (when built)
**In:** attach 1+ images to a `materials` or `expenses` row; thumbnail in the row; tap to view full; delete attachment.
**Out:** OCR/auto-extract amounts (future), PDF bills, multi-page docs.

## Data-model sketch
```
attachments (
  id UUID PK,
  entity_type VARCHAR(20) CHECK (entity_type IN ('material','expense')),
  entity_id   UUID NOT NULL,        -- FK enforced in app layer (polymorphic)
  file_path   TEXT NOT NULL,        -- storage key / URL
  mime_type   VARCHAR(50),
  size_bytes  INTEGER,
  created_at  TIMESTAMP DEFAULT NOW()
)
```

## API sketch
```
POST   /api/attachments        (multipart/form-data: entity_type, entity_id, file)  → 201 {id, url}
GET    /api/<entity>/:id        includes attachments[] in the response
DELETE /api/attachments/:id     → 204
```

## Dependencies (new — need sign-off)
- Backend: `multer` (upload parsing); a storage client for prod.
- Frontend: camera/file `<input capture>`; a client-side image compressor (or canvas-based, no dep).

## Acceptance criteria (when built)
- [ ] `CLAUDE.md` + `docs/frontend.md` updated to remove the "no uploads" exclusion.
- [ ] File type (jpg/png/webp) and max-size validated server-side.
- [ ] Images compressed client-side before upload on mobile.
- [ ] Storage path/secret in `.env`, never committed.
- [ ] Deleting an entry cleans up its attachments.

## Open decisions
1. Storage backend (local vs S3/R2) — drives cost + ops.
2. Add `multer` (vs hand-parsing multipart) — recommend `multer`, needs sign-off.
3. Does this ship before or after auth? Without auth, anyone with the URL can read uploaded bills — **privacy concern**; likely should follow Feature 05's auth.
