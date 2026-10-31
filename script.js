/* Portofolio + Jadwal + Tugas — CRUD dengan JavaScript murni & localStorage */
const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const KEY = "portofolio-v2";
const $ = s => document.querySelector(s);
const iso = d => d.toISOString().slice(0, 10);
const today = new Date();
const offs = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
const todayIdx = (today.getDay() + 6) % 7; // 0 = Senin
let filter = "all";

function el(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
}
function btn(label, cls, fn) {
  const b = el("button", cls, label);
  b.type = "button";
  b.onclick = fn;
  return b;
}

/* ---------- Data ---------- */
const DEFAULT = {
  profile: { name: "Nama Kamu", role: "Mahasiswa Teknik Informatika", bio: "Saya mahasiswa yang suka membangun aplikasi web sederhana yang berguna. Klik Edit profil untuk mengganti teks ini.", email: "nama@email.com" },
  projects: [
    { id: 1, title: "Aplikasi Catatan Kuliah", desc: "Aplikasi web untuk mencatat materi per mata kuliah.", tags: ["HTML", "CSS", "JavaScript"], url: "" },
    { id: 2, title: "Sistem Informasi Perpustakaan", desc: "Tugas besar basis data: peminjaman dan denda otomatis.", tags: ["MySQL", "PHP"], url: "" }
  ],
  courses: [
    { id: 1, name: "Pemrograman Web", day: 0, start: "08:00", end: "09:40", room: "Lab 2" },
    { id: 2, name: "Basis Data", day: 2, start: "10:00", end: "11:40", room: "R. 301" },
    { id: 3, name: "Struktur Data", day: 3, start: "13:00", end: "14:40", room: "R. 204" }
  ],
  tasks: [
    { id: 1, title: "Buat halaman portofolio", course: "Pemrograman Web", due: offs(3), done: false },
    { id: 2, title: "Latihan query JOIN", course: "Basis Data", due: offs(6), done: false }
  ]
};
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || !S.profile) S = JSON.parse(JSON.stringify(DEFAULT));
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

/* ---------- Helper form: Create + Update ---------- */
function crudForm(formSel, listKey, readForm, onChange, validate) {
  const form = $(formSel);
  const submit = form.querySelector('[type="submit"]');
  const cancel = form.querySelector(".cancel");
  const hint = form.querySelector(".hint");
  const label = submit.textContent;
  let editId = null;

  function exit() {
    editId = null;
    form.reset();
    submit.textContent = label;
    cancel.hidden = true;
    hint.hidden = true;
    form.classList.remove("editing");
  }
  form.onsubmit = async e => {
    e.preventDefault();
    const current = editId !== null ? S[listKey].find(x => x.id === editId) : null;
    const data = await readForm(new FormData(form), current);
    if (!data) return;
    if (validate && !validate(data)) return;
    if (editId !== null) {                       // UPDATE
      const item = S[listKey].find(x => x.id === editId);
      Object.assign(item, data);
    } else {                                     // CREATE
      S[listKey].push({ id: Date.now(), ...data });
    }
    save();
    exit();
    onChange();
  };
  cancel.onclick = exit;
  return function startEdit(item) {              // dipanggil tombol Edit
    editId = item.id;
    [...form.elements].forEach(f => {
      if (!f.name) return;
      f.value = f.name === "tags" ? item.tags.join(", ") : item[f.name] ?? "";
    });
    submit.textContent = "Simpan perubahan";
    cancel.hidden = false;
    hint.hidden = false;
    form.classList.add("editing");
    form.scrollIntoView({ block: "center" });
    form.querySelector("input").focus();
  };
}

/* ---------- Read: tampilan ---------- */
function renderProfile() {
  const p = S.profile;
  $("#pName").textContent = p.name;
  $("#pRole").textContent = p.role;
  $("#pBio").textContent = p.bio;
  $("#pMail").href = "mailto:" + p.email;
  document.title = p.name + " – Portofolio";
}

function renderEducation() {
  const box = $("#education");
  const items = [
    { year: "2022 - Sekarang", title: "Teknik Informatika", text: "Mahasiswa aktif yang fokus pada pengembangan web, UI/UX, dan aplikasi berbasis browser." },
    { year: "2019 - 2022", title: "SMA / SMK", text: "Lulus dengan dasar pemrograman, desain, dan kemampuan komunikasi yang kuat." },
    { year: "2013 - 2019", title: "SMP", text: "Memperoleh dasar akademik dan minat terhadap teknologi serta kreativitas." }
  ];
  box.replaceChildren();
  items.forEach(item => {
    const card = el("div", "timeline-item");
    const content = el("div", "content");
    content.append(el("div", "year", item.year), el("h3", null, item.title), el("p", null, item.text));
    card.append(content);
    box.append(card);
  });
}

function renderContact() {
  const box = $("#contact");
  const items = [
    { title: "Instagram", value: "@dimas_hrdnsyah", href: "https://instagram.com/dimas_hrdnsyah", icon: "◎" },
    { title: "Email", value: S.profile.email || "dimasherdiansyahromadonii@gmail.com", href: "mailto:" + (S.profile.email || "dimasherdiansyahromadonii@gmail.com"), icon: "@" },
    { title: "GitHub", value: "github.com/dimas", href: "https://dimasherdiansyahromadonii-netizen.github.io/", icon: "◌" },
    { title: "LinkedIn", value: "https://www.linkedin.com/in/dimas-herdiansyah-romadoni-2735703b8?", href: "https://www.linkedin.com/in/dimas-herdiansyah-romadoni-2735703b8?", icon: "in" }
  ];
  box.replaceChildren();
  items.forEach(item => {
    const card = el("div", "contact-card");
    const header = el("div", "contact-header");
    const icon = el("span", "contact-icon", item.icon);
    const title = el("h3", null, item.title);
    header.append(icon, title);
    card.append(header, el("p", null, item.value));
    const link = document.createElement("a");
    link.href = item.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Buka";
    card.append(link);
    box.append(card);
  });
}

function renderProjects() {
  const box = $("#projects");
  box.replaceChildren();
  if (!S.projects.length) { box.append(el("p", "empty", "Belum ada proyek. Tambahkan lewat formulir di atas.")); return; }
  S.projects.forEach(p => {
    const c = el("article", "proj");
    c.append(el("h3", null, p.title), el("p", null, p.desc));
    const tg = el("div", "tags");
    p.tags.forEach(t => tg.append(el("span", "tag", t)));
    c.append(tg);
    const r = el("div", "row");
    if (p.url) { const a = el("a", null, "Buka proyek"); a.href = p.url; a.target = "_blank"; a.rel = "noopener"; r.append(a); }
    else r.append(el("span"));
    const acts = el("div", "acts");
    acts.append(btn("Edit", "ghost warn", () => editProject(p)),
      btn("Hapus", "ghost", () => { if (confirm("Hapus proyek ini?")) { S.projects = S.projects.filter(x => x.id !== p.id); save(); renderProjects(); } }));
    r.append(acts);
    c.append(r);
    box.append(c);
  });
}

function renderDays() {
  const box = $("#days");
  box.replaceChildren();
  DAYS.forEach((n, i) => {
    const d = el("div", "day" + (i === todayIdx ? " now" : ""));
    d.append(el("h3", null, n));
    const list = S.courses.filter(c => c.day === i).sort((a, b) => a.start.localeCompare(b.start));
    if (!list.length) d.append(el("div", "empty", "Tidak ada kelas"));
    list.forEach(c => {
      const x = el("div", "cls");
      x.append(el("b", null, c.name), el("small", null, c.start + "–" + c.end + (c.room ? " · " + c.room : "")));
      const acts = el("div", "acts");
      acts.append(btn("Edit", "ghost warn", () => editCourse(c)),
        btn("Hapus", "ghost", () => { if (confirm("Hapus jadwal ini?")) { S.courses = S.courses.filter(y => y.id !== c.id); save(); renderAll(); } }));
      x.append(acts);
      d.append(x);
    });
    box.append(d);
  });
  const dl = $("#courseList");
  dl.replaceChildren();
  [...new Set(S.courses.map(c => c.name))].forEach(n => { const o = document.createElement("option"); o.value = n; dl.append(o); });
}

function dueInfo(t) {
  const days = Math.round((new Date(t.due + "T00:00:00") - new Date(iso(today) + "T00:00:00")) / 864e5);
  if (t.done) return ["Selesai", "ok"];
  if (days < 0) return ["Lewat " + (-days) + " hari", "late"];
  if (days === 0) return ["Hari ini", "late"];
  if (days === 1) return ["Besok", ""];
  return [days + " hari lagi", ""];
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (!file || !file.size) return reject(new Error("File kosong."));
    if (file.size > MAX_FILE_SIZE) return reject(new Error("Ukuran file terlalu besar. Maksimal 20 MB."));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlobUrl(dataUrl, mimeType = "application/octet-stream") {
  if (!dataUrl) return "";
  const [prefix, content] = dataUrl.split(",");
  const actualMime = prefix.match(/data:(.*?);base64/)?.[1] || mimeType;
  const binary = atob(content || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: actualMime }));
}

function renderTasks() {
  const box = $("#tasks");
  box.replaceChildren();
  $("#taskCount").textContent = S.tasks.filter(t => !t.done).length + " belum selesai dari " + S.tasks.length;
  let list = [...S.tasks].sort((a, b) => ((a.done ? 1 : 0) - (b.done ? 1 : 0)) || a.due.localeCompare(b.due));
  if (filter === "open") list = list.filter(t => !t.done);
  if (filter === "done") list = list.filter(t => t.done);
  if (!list.length) { box.append(el("p", "empty", "Tidak ada tugas di daftar ini.")); return; }
  list.forEach(t => {
    const r = el("div", "task" + (t.done ? " done" : ""));
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.setAttribute("aria-label", "Tandai selesai: " + t.title);
    cb.onchange = () => { t.done = cb.checked; save(); renderTasks(); renderToday(); };   // update status
    const m = el("div", "t");
    const title = el("b", null, t.title);
    const status = el("span", "task-status" + (t.done ? "" : " pending"), t.done ? "✓ Sudah dikumpulkan" : "⏳ Belum dikumpulkan");
    m.append(title, el("small", null, (t.course || "Tanpa mata kuliah") + " · tenggat " + t.due), status);
    if (t.attachment) {
      const attach = el("div", "task-attachment");
      if (t.attachment.type && t.attachment.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = t.attachment.dataUrl;
        img.alt = t.attachment.name || "Lampiran tugas";
        attach.append(img);
      }
      const a = document.createElement("a");
      a.href = dataUrlToBlobUrl(t.attachment.dataUrl, t.attachment.type || "application/octet-stream");
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "📎 " + (t.attachment.name || "Buka lampiran");
      attach.append(a);
      m.append(attach);
    }
    const [txt, cls] = dueInfo(t);
    const acts = el("div", "acts");
    acts.append(btn("Edit", "ghost warn", () => editTask(t)),
      btn("Hapus", "ghost", () => { if (confirm("Hapus tugas ini?")) { S.tasks = S.tasks.filter(x => x.id !== t.id); save(); renderTasks(); renderToday(); } }));
    r.append(cb, m, el("span", "due " + cls, txt), acts);
    box.append(r);
  });
}

function renderToday() {
  $("#todayLabel").textContent = DAYS[todayIdx] || "Minggu";
  const now = String(today.getHours()).padStart(2, "0") + ":" + String(today.getMinutes()).padStart(2, "0");
  const cl = S.courses.filter(c => c.day === todayIdx && c.end > now).sort((a, b) => a.start.localeCompare(b.start))[0];
  if (cl) { $("#nextClass").textContent = cl.name; $("#nextClassSub").textContent = cl.start + "–" + cl.end + (cl.room ? " di " + cl.room : ""); }
  else { $("#nextClass").textContent = "Tidak ada kelas lagi"; $("#nextClassSub").textContent = "Waktunya mengerjakan tugas."; }
  const ul = $("#soon");
  ul.replaceChildren();
  const next = S.tasks.filter(t => !t.done).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);
  if (!next.length) { ul.append(el("li", null, "Semua tugas selesai.")); return; }
  next.forEach(t => { const li = el("li"); li.append(el("span", null, t.title), el("span", null, dueInfo(t)[0])); ul.append(li); });
}

function renderAll() { renderProfile(); renderEducation(); renderContact(); renderProjects(); renderDays(); renderTasks(); renderToday(); }

/* ---------- Form: Create & Update ---------- */
const editProject = crudForm("#projForm", "projects",
  f => ({ title: f.get("title"), desc: f.get("desc"), tags: f.get("tags").split(",").map(s => s.trim()).filter(Boolean), url: f.get("url") || "" }),
  renderProjects);

function normalizeTime(value) {
  if (typeof value !== "string") return value;
  const s = value.trim();
  if (!s) return s;
  return s.includes(".") ? s.replace(/\./g, ":") : s;
}

const editCourse = crudForm("#courseForm", "courses",
  f => {
    const start = normalizeTime(f.get("start"));
    const end = normalizeTime(f.get("end"));
    return { name: f.get("name"), day: +f.get("day"), start, end, room: f.get("room") };
  },
  renderAll,
  d => d.end > d.start || (alert("Jam selesai harus setelah jam mulai. Gunakan format 13:00 atau 13.00."), false));

const editTask = crudForm("#taskForm", "tasks",
  async (f, current) => {
    const file = f.get("attachment");
    let attachment = current && current.attachment ? current.attachment : null;
    if (file && file.size) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        attachment = { name: file.name, type: file.type, size: file.size, dataUrl };
      } catch (error) {
        alert(error.message || "File tidak bisa diproses.");
        return null;
      }
    }
    return {
      title: f.get("title"),
      course: f.get("course"),
      due: f.get("due"),
      attachment,
      done: !!f.get("done")
    };
  },
  () => { renderTasks(); renderToday(); });

DAYS.forEach((d, i) => { const o = document.createElement("option"); o.value = i; o.textContent = d; $("#daySel").append(o); });
$("#daySel").value = Math.min(todayIdx, 5);

/* ---------- Filter, profil, tema ---------- */
document.querySelectorAll(".filters button").forEach(b => b.onclick = () => {
  filter = b.dataset.f;
  document.querySelectorAll(".filters button").forEach(x => x.setAttribute("aria-pressed", x === b));
  renderTasks();
});

const dlg = $("#dlg");
const navTabs = document.querySelectorAll(".nav-tab");
const tabPanels = document.querySelectorAll(".tab-panel");

function activateTab(name) {
  const profilePanel = document.getElementById("profil");

  navTabs.forEach(btn => {
    const active = btn.dataset.tab === name;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  tabPanels.forEach(panel => {
    const active = panel.dataset.panel === name;
    panel.classList.toggle("active", active);
  });

  if (profilePanel) {
    profilePanel.style.display = name === "profil" ? "grid" : "none";
  }
}

navTabs.forEach(btn => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});

$("#editProfile").onclick = () => {
  const p = S.profile;
  $("#fName").value = p.name; $("#fRole").value = p.role; $("#fBio").value = p.bio; $("#fMail").value = p.email;
  dlg.showModal();
};
$("#saveProf").onclick = () => {
  S.profile = { name: $("#fName").value || "Nama Kamu", role: $("#fRole").value, bio: $("#fBio").value, email: $("#fMail").value || "nama@email.com" };
  save(); renderProfile();
};
activateTab("profil");
renderAll();
