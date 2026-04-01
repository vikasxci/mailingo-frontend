// ============================================================
// Tab Navigation
// ============================================================
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.page;
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('page-' + target).classList.add('active');
    window.scrollTo(0, 0);
    if (target === 'history') loadHistory();
    if (target === 'resume')  loadCurrentResume();
    if (target === 'content') loadContent();
  });
});

// ============================================================
// HOME - Send mail
// ============================================================
const mailForm   = document.getElementById('mailForm');
const emailInput = document.getElementById('emailInput');
const sendBtn    = document.getElementById('sendBtn');
const toast      = document.getElementById('toast');

mailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return;
  setBtnLoading(sendBtn, true);
  hideToast(toast);
  try {
    const res  = await fetch(CONFIG.endpoints.send, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(toast, data.message, 'success');
      emailInput.value = '';
    } else {
      showToast(toast, data.message || 'Failed to send', 'error');
    }
  } catch {
    showToast(toast, 'Network error - is the server running?', 'error');
  } finally {
    setBtnLoading(sendBtn, false);
  }
});

// ============================================================
// HISTORY - Load sent mails
// ============================================================
const historyList = document.getElementById('historyList');
document.getElementById('refreshBtn').addEventListener('click', loadHistory);

async function loadHistory() {
  historyList.innerHTML = '<p class="empty-state">Loading...</p>';
  try {
    const res  = await fetch(CONFIG.endpoints.history);
    const data = await res.json();
    if (!data.success || !data.data.length) {
      historyList.innerHTML = '<p class="empty-state">No mails sent yet.</p>';
      return;
    }
    historyList.innerHTML = data.data.map(item => {
      const d  = new Date(item.createdAt);
      const dt = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
               + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return '<div class="history-item">'
        + '<span class="history-email">' + escapeHTML(item.recipientEmail) + '</span>'
        + '<div class="history-meta">'
        + '<span class="history-time">' + dt + '</span>'
        + '<span class="badge ' + item.status + '">' + item.status + '</span>'
        + '</div></div>';
    }).join('');
  } catch {
    historyList.innerHTML = '<p class="empty-state">Could not load history.</p>';
  }
}

// ============================================================
// RESUME - Upload and display current
// ============================================================
const uploadZone      = document.getElementById('uploadZone');
const resumeFileInput = document.getElementById('resumeFileInput');
const uploadProgress  = document.getElementById('uploadProgress');
const uploadProgText  = document.getElementById('uploadProgressText');
const uploadProgFill  = document.getElementById('uploadProgressFill');
const resumeToast     = document.getElementById('resumeToast');

uploadZone.addEventListener('click', () => resumeFileInput.click());
resumeFileInput.addEventListener('change', () => {
  if (resumeFileInput.files[0]) handleResumeUpload(resumeFileInput.files[0]);
});
uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file) handleResumeUpload(file);
});

async function handleResumeUpload(file) {
  if (file.type !== 'application/pdf') {
    showToast(resumeToast, 'Only PDF files are allowed', 'error');
    return;
  }
  hideToast(resumeToast);
  uploadProgress.classList.remove('hidden');
  uploadProgFill.style.width = '20%';
  uploadProgText.textContent = 'Uploading to Cloudinary...';
  const formData = new FormData();
  formData.append('resume', file);
  try {
    uploadProgFill.style.width = '60%';
    const res  = await fetch(CONFIG.endpoints.resumeUpload, { method: 'POST', body: formData });
    uploadProgFill.style.width = '100%';
    const data = await res.json();
    if (data.success) {
      uploadProgText.textContent = 'Upload complete!';
      showToast(resumeToast, 'Resume uploaded successfully', 'success');
      setTimeout(() => { uploadProgress.classList.add('hidden'); uploadProgFill.style.width = '0%'; }, 2000);
      loadCurrentResume();
      resumeFileInput.value = '';
    } else {
      uploadProgress.classList.add('hidden');
      showToast(resumeToast, data.message || 'Upload failed', 'error');
    }
  } catch {
    uploadProgress.classList.add('hidden');
    showToast(resumeToast, 'Network error during upload', 'error');
  }
}

async function loadCurrentResume() {
  const el = document.getElementById('currentResumeInfo');
  el.innerHTML = '<p class="empty-state" style="padding:12px 0;">Loading...</p>';
  try {
    const res  = await fetch(CONFIG.endpoints.resumeCurrent);
    const data = await res.json();
    if (!data.success || !data.data) {
      el.innerHTML = '<p class="empty-state" style="padding:12px 0;">No resume uploaded yet.</p>';
      return;
    }
    const r = data.data;
    const d = new Date(r.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    el.innerHTML = '<div class="resume-info">'
      + '<div class="resume-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>'
      + '<div><div class="resume-name">' + escapeHTML(r.filename) + '</div>'
      + '<div class="resume-date">Uploaded on ' + d + '</div></div>'
      + '</div>'
      + '<div class="resume-actions">'
      + '<a href="' + escapeHTML(r.url) + '" target="_blank" rel="noopener" class="btn-ghost">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
      + ' View PDF</a></div>';
  } catch {
    el.innerHTML = '<p class="empty-state" style="padding:12px 0;">Could not load resume info.</p>';
  }
}

// ============================================================
// CONTENT - Load and save mail template content
// ============================================================
const saveContentBtn = document.getElementById('saveContentBtn');
const contentToast   = document.getElementById('contentToast');

function setField(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}
function toLines(arr) { return Array.isArray(arr) ? arr.join('\n') : (arr || ''); }
function fromLines(str) { return (str || '').split('\n').map(s => s.trim()).filter(Boolean); }

async function loadContent() {
  try {
    const res  = await fetch(CONFIG.endpoints.content);
    const data = await res.json();
    if (!data.success) return;
    const c = data.data;
    setField('c-subject',     c.subject);
    setField('c-h-name',      c.header && c.header.name);
    setField('c-h-role',      c.header && c.header.role);
    setField('c-h-email',     c.header && c.header.email);
    setField('c-h-phone',     c.header && c.header.phone);
    setField('c-b-greeting',  c.body && c.body.greeting);
    setField('c-b-intro',     c.body && c.body.intro);
    setField('c-b-current',   c.body && c.body.current);
    setField('c-s-primary',   toLines(c.skills && c.skills.primary));
    setField('c-s-secondary', toLines(c.skills && c.skills.secondary));
    setField('c-highlights',  toLines(c.highlights));
    setField('c-cta',         c.cta);
    setField('c-f-name',      c.footer && c.footer.name);
    setField('c-f-role',      c.footer && c.footer.role);
    setField('c-f-email',     c.footer && c.footer.email);
    setField('c-f-phone',     c.footer && c.footer.phone);
  } catch { /* silent */ }
}

saveContentBtn.addEventListener('click', async () => {
  setBtnLoading(saveContentBtn, true);
  hideToast(contentToast);
  const payload = {
    subject:    document.getElementById('c-subject').value.trim(),
    header: {
      name:     document.getElementById('c-h-name').value.trim(),
      role:     document.getElementById('c-h-role').value.trim(),
      email:    document.getElementById('c-h-email').value.trim(),
      phone:    document.getElementById('c-h-phone').value.trim(),
    },
    body: {
      greeting: document.getElementById('c-b-greeting').value.trim(),
      intro:    document.getElementById('c-b-intro').value.trim(),
      current:  document.getElementById('c-b-current').value.trim(),
    },
    skills: {
      primary:   fromLines(document.getElementById('c-s-primary').value),
      secondary: fromLines(document.getElementById('c-s-secondary').value),
    },
    highlights: fromLines(document.getElementById('c-highlights').value),
    cta:        document.getElementById('c-cta').value.trim(),
    footer: {
      name:     document.getElementById('c-f-name').value.trim(),
      role:     document.getElementById('c-f-role').value.trim(),
      email:    document.getElementById('c-f-email').value.trim(),
      phone:    document.getElementById('c-f-phone').value.trim(),
    },
  };
  try {
    const res  = await fetch(CONFIG.endpoints.content, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    showToast(contentToast, data.success ? 'Content saved successfully!' : (data.message || 'Save failed'), data.success ? 'success' : 'error');
  } catch {
    showToast(contentToast, 'Network error', 'error');
  } finally {
    setBtnLoading(saveContentBtn, false);
  }
});

// ============================================================
// Utilities
// ============================================================
function escapeHTML(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str || '')));
  return d.innerHTML;
}

function showToast(el, msg, type) {
  el.textContent = msg;
  el.className = 'toast ' + type;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 5000);
}

function hideToast(el) { el.classList.add('hidden'); }

function setBtnLoading(btn, loading) {
  btn.disabled = loading;
  btn.querySelector('.btn-text').classList.toggle('hidden', loading);
  btn.querySelector('.btn-loader').classList.toggle('hidden', !loading);
}
