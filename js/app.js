const form = document.getElementById('mailForm');
const emailInput = document.getElementById('emailInput');
const sendBtn = document.getElementById('sendBtn');
const btnText = sendBtn.querySelector('.btn-text');
const btnLoader = sendBtn.querySelector('.btn-loader');
const toast = document.getElementById('toast');
const historyList = document.getElementById('historyList');
const refreshBtn = document.getElementById('refreshBtn');

// Send mail
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return;

  setLoading(true);
  hideToast();

  try {
    const res = await fetch(CONFIG.endpoints.send, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message, 'success');
      emailInput.value = '';
      loadHistory();
    } else {
      showToast(data.message || 'Failed to send mail', 'error');
    }
  } catch (err) {
    showToast('Network error. Is the server running?', 'error');
  } finally {
    setLoading(false);
  }
});

// Load history
async function loadHistory() {
  try {
    const res = await fetch(CONFIG.endpoints.history);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      historyList.innerHTML = data.data
        .map((item) => {
          const date = new Date(item.createdAt);
          const timeStr = date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }) + ', ' + date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return `
            <div class="history-item">
              <span class="email">${escapeHTML(item.recipientEmail)}</span>
              <div class="meta">
                <span class="time">${timeStr}</span>
                <span class="status-badge ${item.status}">${item.status}</span>
              </div>
            </div>`;
        })
        .join('');
    } else {
      historyList.innerHTML = '<p class="empty-state">No mails sent yet.</p>';
    }
  } catch {
    historyList.innerHTML = '<p class="empty-state">Could not load history.</p>';
  }
}

refreshBtn.addEventListener('click', loadHistory);

// Helpers
function setLoading(loading) {
  sendBtn.disabled = loading;
  btnText.classList.toggle('hidden', loading);
  btnLoader.classList.toggle('hidden', !loading);
}

function showToast(message, type) {
  toast.textContent = message;
  toast.className = `toast ${type}`;
}

function hideToast() {
  toast.className = 'toast hidden';
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// Init
loadHistory();
