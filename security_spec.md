# Firebase Security Specification (Abusable Payloads & Security Rules Spec)

This document contains security rules criteria and test assertions for the Kepegawaian dashboard Firestore configurations.

## 1. Data Invariants
1. Only authenticated users can access, create, read, update, or delete records.
2. In the `pegawai` collection, employees must have valid IDs.
3. In the `pembayaran` collection, payment lists can only have standard statuses: `DRAF`, `DISETUJUI`, `DIBAYARKAN`.
4. Any `createdAt` or `updatedAt` field must align with `request.time`.

## 2. The "Dirty Dozen" Malicious Payloads
Here are the 12 malicious payloads designed to bypass/break identity and state. All must return `PERMISSION_DENIED`:

1. **Anonymous / Unauthorized Read**: Reading employee profiles without an authenticated user account.
2. **Anonymous / Unauthorized Write**: Creating an employee record without an authenticated user account.
3. **NIP Character Poisoning**: Writing an employee with a NIP containing arbitrary executable code or abnormally large strings (e.g. >128 chars).
4. **Negative Basic Wage Attempt**: Writing an employee with a negative `gajiPokok` (e.g., `-1000000`).
5. **Arbitrary Grade Assignment**: Specifying a non-existent or negative grade (e.g., `-5` or `999` for gradeTukin).
6. **Privilege Escalation in Profile**: Writing a role or field like `role: "admin"` directly in a document when not permitted by custom claims or schema.
7. **Phantom Config Alteration**: Modifying global configuration parameters like `satkerName` without authority or setting it to blank / abnormally long.
8. **Negative Tunjangan / Allowance Amount**: Inserting a negative value for Tukin allowance in grade refs list.
9. **Status Shortcutting**: Directly updating a pay cycle from `DRAF` to `DIBAYARKAN` bypassing required checks, or updating a completed cycle.
10. **Identity Spoofing**: Creating a payment cycle where the operator ID is forged to match another user's UID.
11. **Malicious SQL/Script Injection in Name**: Creating a pegawai record with a name field containing `<script>alert('hack')</script>`.
12. **Unbounded Array Abuse**: Injecting a massive array into `itemNominatif` list exceeding size limit boundaries to trigger a Denial of Wallet.

## 3. The Test Runner Reference (`firestore.rules.test.ts`)
A test suite verifying execution constraints. All above payloads fail securely when executed against the target firestore instance, protected by standard security rules.
