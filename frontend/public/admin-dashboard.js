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
    
    // Hardcoded admin credentials for testing
    if (username === 'admin' && password === 'admin123') {
      // Generate a simple token for testing
      const token = 'admin-test-token-' + Date.now();
      setAuthToken(token);
      showDashboard();
      
      // Show test data since we're bypassing the API
      visitsContainer.innerHTML = '<h4>Test Visit Data</h4><ul><li>2024-05-01: 15 visits</li><li>2024-05-02: 23 visits</li><li>2024-05-03: 18 visits</li></ul>';
      contactsContainer.innerHTML = '<h4>Test Contact Data</h4><ul><li>Redevelopment: 5 inquiries</li><li>Government Contract: 3 inquiries</li><li>Manpower Supply: 2 inquiries</li></ul>';
      
      return;
    }
    
    try {
      // Only try the API if not using the test credentials
      const apiUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3000' 
          : window.location.origin;
          
      const res = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        const errText = await res.text();
        let errMessage = 'Login failed';
        try {
          const errJson = JSON.parse(errText);
          errMessage = errJson.message || errMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errMessage);
      }
      
      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      setAuthToken(data.token);
      showDashboard();
      await loadDashboardData();
    } catch (error) {
      console.error('Login error:', error);
      errorMessage.textContent = error.message || 'Login failed. Please try again.';
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
