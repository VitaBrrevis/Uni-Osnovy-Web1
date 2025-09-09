const socket = io();

const joinWrap = document.querySelector('.join');
const chatWrap = document.querySelector('.chat');
const joinBtn = document.getElementById('joinBtn');
const usernameEl = document.getElementById('username');
const roomEl = document.getElementById('room');
const roomName = document.getElementById('roomName');
const me = document.getElementById('me');
const userList = document.getElementById('userList');
const messages = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const msgInput = document.getElementById('msgInput');
const errorEl = document.getElementById('error');

joinBtn.addEventListener('click', () => {
  const username = (usernameEl.value || '').trim();
  const room = (roomEl.value || '').trim();
  if (!username || !room) {
    showError('Введіть ім’я та ID кімнати');
    return;
  }
  hideError();
  socket.emit('joinRoom', { username, room });
});

socket.on('joinError', ({ error }) => {
  showError(error || 'Join error');
});

socket.on('message', ({ from, text, ts }) => {
  const li = document.createElement('li');
  li.className = from === 'Admin' ? 'msg admin' : (from === me.textContent ? 'msg me' : 'msg other');
  li.innerHTML = `<span class="meta">${from}<span class="time"> ${new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></span><div class="text">${escapeHtml(text)}</div>`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('roomData', ({ room, username, users }) => {
  roomName.textContent = room;
  if (!me.textContent || me.textContent === '-') me.textContent = username || '';
  userList.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u;
    userList.appendChild(li);
  });
  if (chatWrap.classList.contains('hidden')) {
    joinWrap.classList.add('hidden');
    chatWrap.classList.remove('hidden');
    msgInput.focus();
  }
});

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = msgInput.value.trim();
  if (!text) return;
  socket.emit('chatMessage', text);
  msgInput.value = '';
  msgInput.focus();
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function showError(t) {
  errorEl.textContent = t;
  errorEl.classList.add('show');
}

function hideError() {
  errorEl.textContent = '';
  errorEl.classList.remove('show');
}
