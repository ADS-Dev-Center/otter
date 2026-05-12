# 12 — Credentials Page (CRUD) — Halaman Baru + Fitur Paste

Tujuan

- Buat halaman CRUD untuk `Credentials` (bukan modal).
- Tambahkan fitur "Paste .env" — ketika developer menempel (paste) isi file .env, form otomatis terisi dan jumlah field menyesuaikan.

Ringkasan implementasi

1. Halaman terpisah di route `/credentials` (Next.js App Router: `app/(app)/credentials/page.tsx`).
2. UI: daftar credentials + tombol `Create` yang membuka form page (bukan modal). Form untuk create/edit berada di sub-route atau panel di halaman.
3. Backend: endpoint RESTful di `api/credentials` untuk `GET`, `POST`, `PUT`, `DELETE`.
4. Input model: setiap credential terdiri dari pasangan key/value dinamis (array fields). Tambahkan metadata (nama credential, description, environment, projectId, dll sesuai kebutuhan).
5. Fitur paste: siapkan textarea kecil atau handler global pada form. Ketika pengguna melakukan paste teks .env, parse setiap baris, buat pair `key=value`, dan set state fields sesuai jumlah pasangan.

UX detail

- Halaman utama menampilkan list kartu/rows credentials dengan aksi: View, Edit, Delete.
- Tombol `Create Credential` navigasi ke `/credentials/new` atau menampilkan inline form di halaman. (Preferensi: route terpisah lebih mudah untuk history/back.)
- Form: `Name` (string), `Environment` (select), `Fields` (dynamic list of {key, value, secret? checkbox}).
- Tombol `Paste .env` di form membuka modal kecil/prompt atau cukup mendengarkan `Ctrl/Cmd+V` jika fokus pada area paste.
- Saat paste sukses, highlight field baru dan fokus ke value pertama yang berisi credential.

Parsing .env (robust)

- Behavior:
  - Terima teks paste multi-baris.
  - Ambil baris yang bukan kosong dan bukan komentar (baris yang dimulai dengan `#`).
  - Validasi format `KEY=VALUE`. Jika baris tanpa `=`, skip atau masukkan ke field `value` kosong dengan `key`=baris.
  - Dukung quotes: `KEY="some value"` atau `KEY='some value'` — hapus kutipan luar.
  - Trim spasi di sekitar key dan value.
- Contoh parsing (JS):

```ts
function parseDotEnv(text: string) {
  const lines = text.split(/\r?\n/);
  const pairs: Array<{ key: string; value: string }> = [];
  for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    // support lines like `export KEY=value`
    const cleaned = line.replace(/^export\s+/, "");
    const idx = cleaned.indexOf("=");
    if (idx === -1) {
      // fallback: treat whole line as key with empty value
      pairs.push({ key: cleaned, value: "" });
      continue;
    }
    let key = cleaned.slice(0, idx).trim();
    let value = cleaned.slice(idx + 1).trim();
    // remove surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    pairs.push({ key, value });
  }
  return pairs;
}
```

Contoh implementasi frontend (ringkas)

- Gunakan React + useState untuk `fields: Array<{key:string,value:string,id:string}>`.
- Saat parsing hasil paste: setFields(parsed.map(...)). Jika ada existing fields, replace or merge (pilihan: replace by default on Paste).

Contoh komponen (TypeScript / React)

```tsx
import React, { useState } from "react";

type Field = { id: string; key: string; value: string; secret?: boolean };

function parseDotEnv(text: string) {
  const lines = text.split(/\r?\n/);
  const pairs: Array<{ key: string; value: string }> = [];
  for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const cleaned = line.replace(/^export\s+/, "");
    const idx = cleaned.indexOf("=");
    if (idx === -1) {
      pairs.push({ key: cleaned, value: "" });
      continue;
    }
    let key = cleaned.slice(0, idx).trim();
    let value = cleaned.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    pairs.push({ key, value });
  }
  return pairs;
}

export default function CredentialsForm({ initial }: { initial?: Field[] }) {
  const [fields, setFields] = useState<Field[]>(
    initial ?? [{ id: crypto.randomUUID(), key: "", value: "" }],
  );

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const parsed = parseDotEnv(text);
    if (parsed.length === 0) return;
    const mapped = parsed.map((p) => ({
      id: crypto.randomUUID(),
      key: p.key,
      value: p.value,
    }));
    setFields(mapped);
    e.preventDefault();
  }

  return (
    <form>
      <div>
        <label className="text-sm font-medium">Paste .env</label>
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Paste .env here"
          onPaste={onPaste}
          rows={4}
        />
      </div>

      <div className="mt-4 space-y-2">
        {fields.map((f) => (
          <div key={f.id} className="flex gap-2">
            <input
              value={f.key}
              onChange={(e) =>
                setFields((s) =>
                  s.map((x) =>
                    x.id === f.id ? { ...x, key: e.target.value } : x,
                  ),
                )
              }
              placeholder="KEY"
              className="flex-1"
            />
            <input
              value={f.value}
              onChange={(e) =>
                setFields((s) =>
                  s.map((x) =>
                    x.id === f.id ? { ...x, value: e.target.value } : x,
                  ),
                )
              }
              placeholder="VALUE"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setFields((s) => s.filter((x) => x.id !== f.id))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() =>
            setFields((s) => [
              ...s,
              { id: crypto.randomUUID(), key: "", value: "" },
            ])
          }
        >
          Add Field
        </button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
}
```

Catatan backend

- Endpoint minimal:
  - `GET /api/credentials` — list
  - `POST /api/credentials` — create (body termasuk name, environment, fields: [{key,value,secret?}])
  - `GET /api/credentials/:id` — get
  - `PUT /api/credentials/:id` — update
  - `DELETE /api/credentials/:id` — delete
- Simpan fields di DB sebagai JSON array atau normalized table; pilih sesuai kebutuhan pencarian dan enkripsi.
- Jika menyimpan secrets, enkripsi field `value` di server (KMS/ENV key) and mark `secret=true`.

Edge cases & testing

- Paste teks gabungan (mix komentar dan export syntax `export KEY=value`) — strip `export ` prefix.
- Duplicate keys: decide policy (overwrite, keep both with suffix, atau error). Document chosen behavior.
- Very large env files: limit number of fields and show warning.

Keamanan

- Jangan menyimpan secret plaintext tanpa enkripsi.
- Tampilkan nilai `value` sebagai masked input bila `secret=true`, dengan toggle reveal.
- Audit log akses dan perubahan (lihat fitur auditlog di repo).

## Server-side encryption (Node `crypto`)

- Gunakan modul Node `crypto` sesuai kebijakan arsitektur: AES-256-GCM dengan key 32 bytes.
- Simpan kunci enkripsi di environment variable `CREDENTIAL_ENCRYPTION_KEY` dalam format Base64 (32 raw bytes encoded).
- Letakkan util enkripsi di `lib/crypto.ts` dan pastikan file ini hanya diimport di route/handler server-side.

Contoh implementasi `lib/crypto.ts` (server-only):

```ts
import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY_B64 = process.env.CREDENTIAL_ENCRYPTION_KEY;
if (!KEY_B64) throw new Error("CREDENTIAL_ENCRYPTION_KEY is not set");
const KEY = Buffer.from(KEY_B64, "base64"); // must be 32 bytes

export function encrypt(plaintext: string) {
  const iv = crypto.randomBytes(12); // 96-bit recommended
  const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  });
}

export function decrypt(payloadString: string) {
  const payload = JSON.parse(payloadString) as {
    iv: string;
    tag: string;
    ciphertext: string;
  };
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv, {
    authTagLength: 16,
  });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
```

Catatan:

- Pastikan `CREDENTIAL_ENCRYPTION_KEY` di-generate sebagai 32 random bytes lalu di-encode Base64, contoh CLI: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- Ikuti invariant arsitektur: `encrypt()` harus dipanggil sebelum menulis ke DB, dan `decrypt()` hanya digunakan di server ketika user berwenang memintanya.

Checklist deliverable

- [ ] Halaman `/credentials` yang menampilkan list
- [ ] Route `new` dan `edit` dengan form page-based
- [ ] Backend CRUD endpoints
- [ ] Paste parser yang robust dan unit tests
- [ ] Validation & secrets encryption

Contoh langkah implementasi singkat

1. Tambah route UI: `app/(app)/credentials/page.tsx` dan `app/(app)/credentials/new/page.tsx`.
2. Buat `components/credentials/` untuk `CredentialsForm` komponen.
3. Tambah API routes di `app/api/credentials/route.ts`.
4. Implementasikan `parseDotEnv` util dan tests.
5. QA: paste beberapa varian .env, cek behavior duplicate/quoted/export/comments.

Saya dapat melanjutkan dengan: implementasi komponen `CredentialsForm` di kode repo, atau membuat route dan API CRUD. Mau saya mulai ke implementasi frontend atau cukup dokumentasi ini saja?
