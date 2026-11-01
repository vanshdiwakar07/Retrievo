const KEY = 'retrievo_items_v1';

const demo = [
  {id:'d1',type:'Found',name:'Blue Water Bottle',category:'Other',date:'2026-10-06',location:'Central Library',description:'Blue reusable bottle found near the reading tables.',reporter:'Demo Student',email:'demo@example.com',phone:'',status:'active'},
  {id:'d2',type:'Lost',name:'Black Wireless Earbuds',category:'Electronics',date:'2026-10-04',location:'Computer Lab 2',description:'Small black earbuds case. Verify details with the owner.',reporter:'Demo Student',email:'demo@example.com',phone:'',status:'active'},
  {id:'d3',type:'Found',name:'Green Notebook',category:'Books',date:'2026-10-03',location:'Block B, Room 104',description:'Notebook found after a lecture.',reporter:'Demo Student',email:'demo@example.com',phone:'',status:'active'},
  {id:'d4',type:'Lost',name:'Card Holder',category:'Accessories',date:'2026-10-02',location:'Cafeteria',description:'Dark card holder. Do not share card numbers.',reporter:'Demo Student',email:'demo@example.com',phone:'',status:'active'},
  {id:'d5',type:'Found',name:'Two Keys on Keychain',category:'Other',date:'2026-10-01',location:'Sports Ground Entrance',description:'Small keychain found near the entrance.',reporter:'Demo Student',email:'demo@example.com',phone:'',status:'active'},
  {id:'d6',type:'Lost',name:'Grey Laptop Sleeve',category:'Accessories',date:'2026-09-29',location:'Study Lounge',description:'Grey laptop sleeve possibly left beside a desk.',reporter:'Demo Student',email:'demo@example.com',phone:'',status:'active'}
];

const $ = id => document.getElementById(id);
const dialog = $('reportDialog');
const form = $('reportForm');
const grid = $('itemsGrid');

let items = [];

try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  items = Array.isArray(saved) ? saved : demo.slice();
} catch (error) {
  items = demo.slice();
}

const icons = {
  Electronics: '🎧',
  Accessories: '🎒',
  Documents: '📄',
  Books: '📚',
  Other: '📦'
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function getToday() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
}

function dateText(value) {
  if (!value) return '';

  return new Date(value + 'T12:00:00').toLocaleDateString(
    undefined,
    {day: 'numeric', month: 'short', year: 'numeric'}
  );
}

function saveItems() {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function showToast(message) {
  const toast = $('toast');

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(
    () => toast.classList.remove('show'),
    2600
  );
}

function render() {
  const query = $('searchInput').value.trim().toLowerCase();
  const type = $('typeFilter').value;
  const category = $('categoryFilter').value;

  const filtered = items
    .filter(item => {
      const searchable = [
        item.name,
        item.location,
        item.description,
        item.category
      ].join(' ').toLowerCase();

      return (!query || searchable.includes(query)) &&
        (type === 'all' || item.type.toLowerCase() === type.toLowerCase()) &&
        (category === 'all' || item.category === category);
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  grid.innerHTML = filtered.map(item => `
    <article class="card">
      <div class="cardtop">
        <span class="pill ${item.status === 'returned' ? 'returned' : item.type.toLowerCase()}">
          ${item.status === 'returned' ? 'Returned' : item.type === 'Lost' ? 'Lost item' : 'Found item'}
        </span>
        <span class="cat">${esc(item.category)}</span>
      </div>

      <div class="emoji">${icons[item.category] || '📦'}</div>

      <h3>${esc(item.name)}</h3>
      <p class="desc">${esc(item.description)}</p>

      <div class="meta">
        ⌖ ${esc(item.location)} &nbsp; · &nbsp; ◷ ${dateText(item.date)}
      </div>

      <div class="actions">
        <button type="button" class="secondary"
          data-act="view" data-id="${esc(item.id)}">
          View details
        </button>

        ${item.status !== 'returned'
          ? `<button type="button" data-act="return"
              data-id="${esc(item.id)}">Mark returned</button>`
          : ''}
      </div>
    </article>
  `).join('');

  $('emptyState').hidden = filtered.length !== 0;
  grid.hidden = filtered.length === 0;

  $('totalItems').textContent = items.length;

  $('lostItems').textContent =
    items.filter(item =>
      item.type.toLowerCase() === 'lost' &&
      item.status !== 'returned'
    ).length;

  $('foundItems').textContent =
    items.filter(item =>
      item.type.toLowerCase() === 'found' &&
      item.status !== 'returned'
    ).length;

  $('returnedItems').textContent =
    items.filter(item => item.status === 'returned').length;
}

function openReport(type = 'Lost') {
  form.reset();

  $('type').value = type;
  $('date').min = '2026-01-01';
  $('date').max = getToday();
  $('date').value = getToday();

  const heading = dialog.querySelector('.dialog-header h2');

  heading.textContent =
    type === 'Found'
      ? 'Report a found item'
      : 'Report a lost item';

  if (!dialog.open) {
    dialog.showModal();
  }
}

$('reportBtn').addEventListener('click', () => openReport());
$('heroReportBtn').addEventListener('click', () => openReport());

$('closeDialog').addEventListener('click', () => dialog.close());
$('cancelDialog').addEventListener('click', () => dialog.close());

$('type').addEventListener('change', () => {
  dialog.querySelector('.dialog-header h2').textContent =
    $('type').value === 'Found'
      ? 'Report a found item'
      : 'Report a lost item';
});

['searchInput', 'typeFilter', 'categoryFilter'].forEach(id => {
  $(id).addEventListener(
    id === 'searchInput' ? 'input' : 'change',
    render
  );
});

form.addEventListener('submit', event => {
  event.preventDefault();

  const phone = $('phone').value.trim();
  const date = $('date').value;
  const today = getToday();

  if (!date || date < '2026-01-01' || date > today) {
    showToast('Choose a date between January 1, 2026 and today.');
    $('date').focus();
    return;
  }

  if (!/^[6-9][0-9]{9}$/.test(phone)) {
    showToast('Enter a valid 10-digit Indian mobile number.');
    $('phone').focus();
    return;
  }

  if (!form.reportValidity()) return;

  const newItem = {
    id: 'i' + Date.now(),
    type: $('type').value,
    name: $('name').value.trim(),
    category: $('category').value,
    date: date,
    location: $('location').value.trim(),
    reporter: $('contactName').value.trim(),
    email: $('email').value.trim(),
    phone: phone,
    description: $('description').value.trim(),
    status: 'active'
  };

  items.unshift(newItem);

  try {
    saveItems();
  } catch (error) {
    items.shift();
    showToast('Could not save this report in your browser.');
    return;
  }

  dialog.close();

  $('searchInput').value = '';
  $('typeFilter').value = 'all';
  $('categoryFilter').value = 'all';

  render();

  $('browse').scrollIntoView({behavior: 'smooth'});

  showToast('Report submitted successfully!');
});

grid.addEventListener('click', event => {
  const button = event.target.closest('button[data-act]');

  if (!button) return;

  const item = items.find(entry => entry.id === button.dataset.id);

  if (!item) return;

  if (button.dataset.act === 'view') {
    alert(`${item.name}

Type: ${item.type}
Category: ${item.category}
Date: ${dateText(item.date)}
Location: ${item.location}

Description: ${item.description}

Contact Name: ${item.reporter || 'Not provided'}
Contact Email: ${item.email || 'Not provided'}
Contact Phone: ${item.phone || 'Not provided'}

Please verify ownership before returning an item.`);
  }

  if (button.dataset.act === 'return' && item.status !== 'returned') {
    if (confirm(`Mark "${item.name}" as returned?`)) {
      item.status = 'returned';

      try {
        saveItems();
        render();
        showToast('Item marked as returned.');
      } catch (error) {
        item.status = 'active';
        showToast('Could not save this status update.');
      }
    }
  }
});

render();
