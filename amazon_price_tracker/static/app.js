document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userControls = document.getElementById('user-controls');
    const userGreeting = document.getElementById('user-greeting');
    const chartContainer = document.getElementById('chart-container');
    const chartTitle = document.getElementById('chart-title');
    const ctx = document.getElementById('priceChart').getContext('2d');

    let chartInstance = null;
    let currentItems = [];

    // Check Auth Status
    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const scraperKey = localStorage.getItem('scraper_api_key');
        if (token && scraperKey) {
            authSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            userControls.classList.remove('hidden');
            userGreeting.textContent = `User ID: ${token}`;
            fetchItems();
        } else {
            authSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
            userControls.classList.add('hidden');
        }
    };

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('scraper_api_key');
        checkAuth();
    });

    // Login Form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.user_id);
                localStorage.setItem('scraper_api_key', data.scraper_api_key);
                checkAuth();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Register Form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const email = document.getElementById('reg-email').value;
        const scraper_api_key = document.getElementById('reg-scraper-key').value;
        const telegram_chat_id = document.getElementById('reg-telegram').value;

        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email, scraper_api_key, telegram_chat_id })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.user_id);
                localStorage.setItem('scraper_api_key', data.scraper_api_key);
                checkAuth();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Add Item Form
    document.getElementById('add-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('item-url').value;
        const target_price = document.getElementById('item-target-price').value;
        const msgDiv = document.getElementById('add-msg');
        msgDiv.textContent = 'Adding item... Please wait.';

        try {
            const res = await fetch('/api/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    url,
                    target_price,
                    scraper_api_key: localStorage.getItem('scraper_api_key')
                })
            });
            const data = await res.json();
            if (res.ok) {
                msgDiv.textContent = `Success! Added: ${data.title} at ₹${data.current_price}`;
                fetchItems();
                document.getElementById('add-item-form').reset();
            } else {
                msgDiv.textContent = `Error: ${data.error}`;
            }
        } catch (err) {
            msgDiv.textContent = 'Failed to add item.';
        }
    });

    // Fetch and Display Items
    const fetchItems = async () => {
        try {
            const res = await fetch('/api/items', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                currentItems = data.items;
                renderItemsTable();
            }
        } catch (err) {
            console.error('Failed to fetch items', err);
        }
    };

    const renderItemsTable = () => {
        const tbody = document.getElementById('items-body');
        tbody.innerHTML = '';
        currentItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><a href="${item.url}" target="_blank" title="${item.title}">${item.title.substring(0, 50)}...</a></td>
                <td>₹${item.current_price !== null ? item.current_price : 'N/A'}</td>
                <td>₹${item.target_price}</td>
                <td>
                    <button onclick="viewGraph(${item.id})">View Graph</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Chart logic
    window.viewGraph = (itemId) => {
        const item = currentItems.find(i => i.id === itemId);
        if (!item) return;

        chartContainer.classList.remove('hidden');
        chartTitle.textContent = item.title;

        const labels = item.history.map(h => new Date(h.timestamp).toLocaleString());
        const dataPoints = item.history.map(h => h.price);

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price (₹)',
                    data: dataPoints,
                    borderColor: '#f0c14b',
                    backgroundColor: 'rgba(240, 193, 75, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

        // Scroll to chart
        chartContainer.scrollIntoView({ behavior: 'smooth' });
    };

    document.getElementById('close-chart').addEventListener('click', () => {
        chartContainer.classList.add('hidden');
        if (chartInstance) {
            chartInstance.destroy();
        }
    });

    // Initial check
    checkAuth();
});
