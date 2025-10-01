// admin-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('adminLoginForm');
  const dashboard = document.getElementById('adminDashboard');
  const logoutBtn = document.getElementById('logoutBtn');
  const visitsContainer = document.getElementById('visitsContainer');
  const contactsContainer = document.getElementById('contactsContainer');
  const errorMessage = document.getElementById('errorMessage');

  function setAuthToken(token) {
    localStorage.setItem('adminToken', token);
  }

  function getAuthToken() {
    return localStorage.getItem('adminToken');
  }

  function clearAuthToken() {
    localStorage.removeItem('adminToken');
  }

  async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');
    options.headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
    };
    const res = await fetch(url, options);
    if (!res.ok) {
      if (res.status === 401) {
        clearAuthToken();
        showLogin();
      }
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error fetching data');
    }
    return res.json();
  }

  function showLogin() {
    loginForm.style.display = 'block';
    dashboard.style.display = 'none';
    errorMessage.textContent = '';
  }

  function showDashboard() {
    loginForm.style.display = 'none';
    dashboard.style.display = 'block';
    errorMessage.textContent = '';
  }

  async function loadDashboardData() {
    try {
      const visitsData = await fetchWithAuth('/api/admin/visits');
      const contactsData = await fetchWithAuth('/api/admin/contacts');
      renderVisits(visitsData.visits);
      renderContacts(contactsData.contactsByService);
    } catch (error) {
      errorMessage.textContent = error.message || 'Failed to load dashboard data';
    }
  }

  function renderVisits(visits) {
    visitsContainer.innerHTML = '';
    if (!visits || visits.length === 0) {
      visitsContainer.textContent = 'No visit data available';
      return;
    }
    const list = document.createElement('ul');
    visits.forEach(v => {
      const { year, month, day } = v._id;
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const listItem = document.createElement('li');
      listItem.textContent = `${dateStr}: ${v.count} visits`;
      list.appendChild(listItem);
    });
    visitsContainer.appendChild(list);
  }

  function renderContacts(contacts) {
    contactsContainer.innerHTML = '';
    if (!contacts || contacts.length === 0) {
      contactsContainer.textContent = 'No contact data available';
      return;
    }
    const list = document.createElement('ul');
    contacts.forEach(c => {
      const service = c._id || 'Unknown';
      const count = c.count;
      const listItem = document.createElement('li');
      listItem.textContent = `${service}: ${count} inquiries`;
      list.appendChild(listItem);
    });
    contactsContainer.appendChild(list);
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = '';
    const username = loginForm.elements['username'].value;
    const password = loginForm.elements['password'].value;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Login failed');
      }
      const data = await res.json();
      setAuthToken(data.token);
      showDashboard();
      await loadDashboardData();
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });

  logoutBtn.addEventListener('click', () => {
    clearAuthToken();
    showLogin();
  });

  // On page load, show either login or dashboard based on token
  if (getAuthToken()) {
    showDashboard();
    loadDashboardData();
  } else {
    showLogin();
  }
});
