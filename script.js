'use strict';

const KEY = 'retrievo_items_v1';

const demo = [
    { id: 'd1', type: 'found', name: 'Blue Water Bottle', category: 'Other', date: '2026-10-06', location: 'Central Library', description: 'Blue reusable bottle found near the reading tables.', reporter: 'Demo Student', email: 'demo@example.com', phone: '9000000001', status: 'active' },
    { id: 'd2', type: 'lost', name: 'Black Wireless Earbuds', category: 'Electronics', date: '2026-10-04', location: 'Computer Lab 2', description: 'Small black earbuds case. Verify details with the owner.', reporter: 'Demo Student', email: 'demo@example.com', phone: '9000000002', status: 'active' },
    { id: 'd3', type: 'found', name: 'Green Notebook', category: 'Books & Notes', date: '2026-10-03', location: 'Block B, Room 104', description: 'Notebook found after a lecture.', reporter: 'Demo Student', email: 'demo@example.com', phone: '9000000003', status: 'active' },
    { id: 'd4', type: 'lost', name: 'Card Holder', category: 'Wallets & Cards', date: '2026-10-02', location: 'Cafeteria', description: 'Dark card holder. Do not share card numbers.', reporter: 'Demo Student', email: 'demo@example.com', phone: '9000000004', status: 'active' },
    { id: 'd5', type: 'found', name: 'Two Keys on Keychain', category: 'Keys', date: '2026-10-01', location: 'Sports Ground Entrance', description: 'Small keychain found near the entrance.', reporter: 'Demo Student', email: 'demo@example.com', phone: '9000000005', status: 'active' },
    { id: 'd6', type: 'lost', name: 'Grey Laptop Sleeve', category: 'Bags', date: '2026-09-29', location: 'Study Lounge', description: 'Grey laptop sleeve possibly left beside a desk.', reporter: 'Demo Student', email: 'demo@example.com', phone: '9000000006', status: 'active' }
];

const $ = id => document.getElementById(id);
const dlg = $('modal');
const icons = {
    'Electronics': '🎧', 'Books & Notes': '📚', 'Wallets & Cards': '👛',
    'Keys': '🔑', 'Bags': '🎒', 'Clothing': '🧥', 'Other': '📦'
};

function loadItems() {
    try {
        const saved = JSON.parse(localStorage.getItem(KEY));
        return Array.isArray(saved) ? saved : demo.map(item => ({ ...item }));
    } catch {
        return demo.map(item => ({ ...item }));
    }
}

let items = loadItems();

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

function persist() {
    localStorage.setItem(KEY, JSON.stringify(items));
}

function dateText(value) {
    if (!value) return '';
    return new Date(value + 'T12:00:00').toLocaleDateString(undefined, {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

function setDateLimits() {
    const dateInput = $('date');
    const today = new Date();
    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');
    dateInput.min = '2026-01-01';
    dateInput.max = localToday;
    dateInput.value = localToday;
}

function render() {
    const query = $('search').value.toLowerCase().trim();
    const type = $('type').value;
    const category = $('category').value;
    const status = $('status').value;

    const visibleItems = items
        .filter(item =>
            (!query || [item.name, item.location, item.description, item.category, item.reporter]
                .join(' ').toLowerCase().includes(query)) &&
            (type === 'all' || item.type === type) &&
            (category === 'all' || item.category === category) &&
            (status === 'all' || item.status === status)
        )
        .sort((a, b) => b.date.localeCompare(a.date));

    $('grid').innerHTML = visibleItems.map(item => `
        <article class="card">
            <div class="cardtop">
                <span class="pill ${item.status === 'returned' ? 'returned' : item.type}">
                    ${item.status === 'returned' ? 'Returned' : item.type === 'lost' ? 'Lost item' : 'Found item'}
                </span>
                <span class="cat">${esc(item.category)}</span>
            </div>
            <div class="emoji">${icons[item.category] || '📦'}</div>
            <h3>${esc(item.name)}</h3>
            <p class="desc">${esc(item.description)}</p>
            <div class="meta">⌖ ${esc(item.location)} &nbsp; · &nbsp; ◷ ${dateText(item.date)}</div>
            <div class="actions">
                <button class="secondary" data-act="view" data-id="${esc(item.id)}">View details</button>
                ${item.status === 'active' ? `<button data-act="return" data-id="${esc(item.id)}">Mark returned</button>` : ''}
            </div>
        </article>
    `).join('');

    $('empty').hidden = visibleItems.length > 0;
    $('grid').hidden = visibleItems.length === 0;
    $('total').textContent = items.length;
    $('lost-count').textContent = items.filter(item => item.type === 'lost' && item.status === 'active').length;
    $('found-count').textContent = items.filter(item => item.type === 'found' && item.status === 'active').length;
    $('returned-count').textContent = items.filter(item => item.status === 'returned').length;
}

function openForm(type = 'lost') {
    $('form').reset();
    $('item-type').value = type;
    $('modal-title').textContent = type === 'lost' ? 'Report a lost item' : 'Report a found item';
    setDateLimits();
    dlg.showModal();
}

function toast(message) {
    const element = $('toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 2600);
}

['search', 'type', 'category', 'status'].forEach(id => {
    $(id).addEventListener(id === 'search' ? 'input' : 'change', render);
});

['open-report', 'add-report'].forEach(id => {
    $(id).addEventListener('click', () => openForm());
});
$('lost-btn').addEventListener('click', () => openForm('lost'));
$('found-btn').addEventListener('click', () => openForm('found'));
$('close').addEventListener('click', () => dlg.close());
$('cancel').addEventListener('click', () => dlg.close());

$('item-type').addEventListener('change', event => {
    $('modal-title').textContent = event.target.value === 'lost'
        ? 'Report a lost item' : 'Report a found item';
});

$('form').addEventListener('submit', event => {
    event.preventDefault();

    const phone = $('phone').value.trim();
    const date = $('date').value;
    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');

    if (!/^[6-9]\d{9}$/.test(phone)) {
        $('phone').setCustomValidity('Enter a valid 10-digit Indian mobile number starting with 6–9.');
        $('phone').reportValidity();
        $('phone').setCustomValidity('');
        return;
    }

    if (date < '2026-01-01' || date > todayString) {
        $('date').setCustomValidity('Choose a date between 1 January 2026 and today.');
        $('date').reportValidity();
        $('date').setCustomValidity('');
        return;
    }

    const item = {
        id: 'i' + Date.now(),
        type: $('item-type').value,
        name: $('name').value.trim(),
        category: $('item-category').value,
        date,
        location: $('location').value.trim(),
        reporter: $('reporter').value.trim(),
        email: $('email').value.trim(),
        phone,
        description: $('description').value.trim(),
        status: 'active'
    };

    if (!item.name || !item.location || !item.reporter || !item.email || !item.description) {
        toast('Please complete all required fields.');
        return;
    }

    items.unshift(item);
    try {
        persist();
    } catch (error) {
        items.shift();
        toast('Could not save in this browser. Check browser storage.');
        return;
    }

    dlg.close();
    $('search').value = '';
    $('type').value = 'all';
    $('category').value = 'all';
    $('status').value = 'active';
    render();
    $('browse').scrollIntoView({ behavior: 'smooth' });
    toast('Report saved in this browser.');
});

$('grid').addEventListener('click', event => {
    const button = event.target.closest('button[data-act]');
    if (!button) return;

    const item = items.find(record => record.id === button.dataset.id);
    if (!item) return;

    if (button.dataset.act === 'view') {
        alert(`${item.name}\n\nType: ${item.type.toUpperCase()}\nCategory: ${item.category}\nDate: ${dateText(item.date)}\nLocation: ${item.location}\n\nDescription: ${item.description}\n\nReported by: ${item.reporter}\nContact email: ${item.email}\nContact phone: ${item.phone || 'Not provided'}\n\nVerify ownership before returning an item.`);
    } else if (button.dataset.act === 'return' &&
        confirm(`Mark "${item.name}" as returned?`)) {
        item.status = 'returned';
        try {
            persist();
            render();
            toast('Status updated.');
        } catch {
            item.status = 'active';
            toast('Could not update this report.');
        }
    }
});

setDateLimits();
render();
