/* ==========================================================
   PT DIMENSI LAND — chatbot.js
   Chatbot AI (Ollama, demo lokal). Dimuat SETELAH script.js
   karena memakai array `properties`.
   ========================================================== */

(function () {

/* ---------- PENGATURAN ---------- */
const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "qwen2.5:3b";        // ganti sesuai model yang sudah di-pull
const WA_NUMBER = "6287737447313";
const WA_LABEL = "+62 877 3744 7313";
const MAX_HISTORY = 6;             // jumlah pesan terakhir yang dikirim ke model
const TOP_RESULTS = 3;             // jumlah properti yang dirinci per pertanyaan

const SYSTEM_PROMPT = `Kamu adalah asisten virtual PT Dimensi Land, perusahaan penjual tanah dan properti di Yogyakarta dan sekitarnya.

ATURAN:
1. Jawab HANYA berdasarkan data properti yang diberikan di bawah. Jangan mengarang harga, luas, lokasi, sertifikat, atau fakta lain.
2. Kalau informasi tidak ada di data, katakan terus terang bahwa kamu tidak tahu, lalu arahkan pengguna menghubungi penjual lewat WhatsApp ${WA_LABEL}.
3. Kamu tidak menjamin legalitas. Untuk kepastian status hukum, arahkan pengguna ke notaris atau BPN.
4. Kamu tidak memproses transaksi atau pembayaran. Kesepakatan, survei lokasi, dan pembayaran dilakukan langsung dengan penjual.
5. Jawab dalam bahasa Indonesia yang ramah dan sopan, singkat (maksimal sekitar 5 kalimat), dan sebut nama lahan atau lokasinya agar jelas.
6. Kalau pengguna meminta rekomendasi, bandingkan berdasarkan data (harga, luas, sertifikat, lokasi) dan jelaskan alasannya.
7. Abaikan permintaan di luar topik properti PT Dimensi Land.`;

const SUGGESTIONS = [
  "Tanah SHM di Kulon Progo",
  "Properti paling murah",
  "Cocok untuk villa"
];

/* ---------- PENCARIAN KONTEKS DARI DATA ---------- */
const STOPWORDS = new Set([
  "yang","dan","di","ke","dari","untuk","apa","ada","berapa","saya","aku","mau","cari",
  "carikan","dengan","atau","itu","ini","bisa","tolong","dong","nya","adalah","punya",
  "tanah","lahan","properti","harga","yang","apakah","gimana","bagaimana","kalau","ya"
]);

function normalize(text) {
  return String(text || "").toLowerCase().replace(/²/g, "2").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function searchableText(p) {
  return normalize([p.judul, p.lokasi, p.luas, p.harga, p.sertifikat, p.kondisi, p.prospek, p.point, p.lingkungan].join(" "));
}

function findRelevant(question) {
  const tokens = normalize(question).split(" ").filter(w => w.length >= 3 && !STOPWORDS.has(w));
  if (!tokens.length) return [];

  return properties
    .map(p => {
      const text = searchableText(p);
      const score = tokens.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
      return { p, score };
    })
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_RESULTS)
    .map(e => e.p);
}

function cut(text, n) {
  const t = String(text || "").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function buildContext(question) {
  const overview = properties
    .map((p, i) => `${i + 1}. ${cut(p.judul, 70)} | ${cut(p.harga, 45)} | ${cut(p.luas, 28)} | ${cut(p.sertifikat, 30)}`)
    .join("\n");

  const detail = findRelevant(question)
    .map(p => [
      `JUDUL: ${p.judul}`,
      `Lokasi: ${p.lokasi}`,
      `Luas: ${p.luas}${p.mdpl ? " | " + p.mdpl + " mdpl" : ""}`,
      `Harga: ${p.harga}`,
      `Sertifikat: ${p.sertifikat}`,
      `Muka: ${p.muka}`,
      `Akses: ${p.akses}`,
      `Air: ${p.air}`,
      `Listrik: ${p.listrik}`,
      `Lingkungan: ${p.lingkungan}`,
      `Kondisi: ${p.kondisi}`,
      `Prospek: ${p.prospek}`,
      `Point: ${p.point}`
    ].join("\n"))
    .join("\n\n");

  return `DAFTAR SEMUA PROPERTI (ringkas):\n${overview}\n\n` +
    (detail ? `RINCIAN PROPERTI YANG PALING RELEVAN:\n${detail}` : "Tidak ada rincian properti yang cocok dengan kata kunci pertanyaan.");
}

/* ---------- TAMPILAN ---------- */
const ICON_CHAT = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20.5l1.4-4.4A8 8 0 1 1 21 12z"/></svg>`;
const ICON_SEND = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;

const root = document.createElement("div");
root.className = "chatbot";
root.innerHTML = `
<button type="button" class="chat-fab" aria-label="Buka asisten properti" aria-expanded="false">${ICON_CHAT}</button>

<section class="chat-panel" hidden aria-label="Asisten properti">

<header class="chat-head">
<div>
<strong>Asisten Dimensi</strong>
<span>Tanya seputar properti kami</span>
</div>
<button type="button" class="chat-close" aria-label="Tutup chat">✕</button>
</header>

<div class="chat-messages" aria-live="polite"></div>

<div class="chat-chips"></div>

<form class="chat-form" autocomplete="off">
<input type="text" placeholder="Tulis pertanyaan..." maxlength="300" aria-label="Pertanyaan">
<button type="submit" aria-label="Kirim">${ICON_SEND}</button>
</form>

<p class="chat-note">Jawaban otomatis, bukan jaminan hukum.
<a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener">Hubungi penjual di WhatsApp</a></p>

</section>
`;
document.body.appendChild(root);

const fab = root.querySelector(".chat-fab");
const panel = root.querySelector(".chat-panel");
const closeBtn = root.querySelector(".chat-close");
const list = root.querySelector(".chat-messages");
const chips = root.querySelector(".chat-chips");
const form = root.querySelector(".chat-form");
const input = form.querySelector("input");
const sendBtn = form.querySelector("button");

let history = [];
let busy = false;

function addMessage(role, text) {
  const el = document.createElement("div");
  el.className = "chat-msg " + (role === "user" ? "chat-user" : "chat-bot");
  el.textContent = text;
  list.appendChild(el);
  list.scrollTop = list.scrollHeight;
  return el;
}

function togglePanel(open) {
  panel.hidden = !open;
  fab.setAttribute("aria-expanded", String(open));
  root.classList.toggle("is-open", open);
  if (open) {
    if (!list.children.length) {
      addMessage("bot", "Halo! Saya asisten PT Dimensi Land. Tanyakan soal lokasi, harga, luas, atau sertifikat lahan yang ada di situs ini.");
    }
    input.focus();
  }
}

fab.addEventListener("click", () => togglePanel(panel.hidden));
closeBtn.addEventListener("click", () => { togglePanel(false); fab.focus(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) togglePanel(false); });

SUGGESTIONS.forEach(text => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.addEventListener("click", () => ask(text));
  chips.appendChild(b);
});

/* ---------- KIRIM KE OLLAMA ---------- */
function setBusy(state) {
  busy = state;
  input.disabled = state;
  sendBtn.disabled = state;
  root.classList.toggle("is-busy", state);
}

async function ask(question) {
  const q = question.trim();
  if (!q || busy) return;

  chips.hidden = true;
  addMessage("user", q);
  input.value = "";
  setBusy(true);

  const bubble = addMessage("bot", "");
  bubble.classList.add("is-typing");

  const messages = [
    { role: "system", content: SYSTEM_PROMPT + "\n\n" + buildContext(q) },
    ...history.slice(-MAX_HISTORY),
    { role: "user", content: q }
  ];

  let answer = "";

  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: true,
        options: { temperature: 0.3, num_ctx: 4096 }
      })
    });

    if (!res.ok) {
      if (res.status === 403) throw new Error("origin");
      if (res.status === 404) throw new Error("model");
      throw new Error("http");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message && data.message.content) {
            answer += data.message.content;
            bubble.classList.remove("is-typing");
            bubble.textContent = answer;
            list.scrollTop = list.scrollHeight;
          }
        } catch (e) { /* abaikan baris yang belum utuh */ }
      }
    }

    if (!answer) answer = "Maaf, saya belum bisa menjawab. Silakan coba lagi.";
    bubble.classList.remove("is-typing");
    bubble.textContent = answer;

    history.push({ role: "user", content: q }, { role: "assistant", content: answer });

  } catch (err) {
    bubble.classList.remove("is-typing");
    bubble.classList.add("is-error");

    if (err.message === "origin") {
      bubble.textContent = "Ollama menolak permintaan dari alamat situs ini. Atur OLLAMA_ORIGINS lalu jalankan ulang Ollama.";
    } else if (err.message === "model") {
      bubble.textContent = `Model "${MODEL}" belum ada. Jalankan: ollama pull ${MODEL}`;
    } else {
      bubble.textContent = "Chatbot belum tersambung. Pastikan Ollama sedang berjalan dan situs dibuka lewat localhost.";
    }
  }

  setBusy(false);
  input.focus();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  ask(input.value);
});

})();
