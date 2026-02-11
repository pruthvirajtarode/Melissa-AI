// Configuration
const API_URL = window.location.origin;
let authToken = localStorage.getItem('adminToken');

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Analytics elements
const totalDocsEl = document.getElementById('totalDocs');
const totalChunksEl = document.getElementById('totalChunks');
const storageSizeEl = document.getElementById('storageSize');

// Upload elements
const fileUploadForm = document.getElementById('fileUploadForm');
const fileInput = document.getElementById('fileInput');
const fileUploadStatus = document.getElementById('fileUploadStatus');
const urlUploadForm = document.getElementById('urlUploadForm');
const urlInput = document.getElementById('urlInput');
const urlUploadStatus = document.getElementById('urlUploadStatus');

// Documents elements
const documentsList = document.getElementById('documentsList');
const refreshDocsBtn = document.getElementById('refreshDocsBtn');
const reindexBtn = document.getElementById('reindexBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check Authentication
function checkAuth() {
    if (authToken) {
        showAdmin();
        loadAnalytics();
        loadDocuments();
    } else {
        showLogin();
    }
}

function showLogin() {
    loginContainer.style.display = 'flex';
    adminContainer.style.display = 'none';
}

function showAdmin() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'block';
}

// Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    fileUploadForm.addEventListener('submit', handleFileUpload);
    urlUploadForm.addEventListener('submit', handleUrlUpload);

    refreshDocsBtn.addEventListener('click', loadDocuments);
    reindexBtn.addEventListener('click', handleReindex);
    clearAllBtn.addEventListener('click', handleClearAll);

    // File input label update
    fileInput.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name || 'Choose File';
        document.querySelector('.file-label-text').textContent = fileName;
    });
}

// Login
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            showAdmin();
            loadAnalytics();
            loadDocuments();
        } else {
            showError(loginError, data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(loginError, 'Login failed. Please try again.');
    }
}

// Logout
function handleLogout() {
    authToken = null;
    localStorage.removeItem('adminToken');
    showLogin();
}

// Load Analytics
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/api/admin/analytics`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            totalDocsEl.textContent = data.totalDocuments;
            totalChunksEl.textContent = data.totalChunks;
            storageSizeEl.textContent = formatBytes(data.storageSize);
        } else if (response.status === 401) {
            handleLogout();
        }
    } catch (error) {
        console.error('Analytics error:', error);
    }
}

// Load Documents
async function loadDocuments() {
    try {
        documentsList.innerHTML = '<div class="loading">Loading documents...</div>';

        const response = await fetch(`${API_URL}/api/admin/documents`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayDocuments(data.documents);
        } else if (response.status === 401) {
            handleLogout();
        }
    } catch (error) {
        console.error('Documents error:', error);
        documentsList.innerHTML = '<div class="error-message">Failed to load documents</div>';
    }
}

// Display Documents
function displayDocuments(documents) {
    if (documents.length === 0) {
        documentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <p>No documents uploaded yet</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Upload documents to start building your knowledge base</p>
            </div>
        `;
        return;
    }

    documentsList.innerHTML = documents.map(doc => `
        <div class="document-item" data-id="${doc.id}">
            <div class="document-info">
                <div class="document-title">${escapeHtml(doc.metadata?.filename || doc.text)}</div>
                <div class="document-meta">
                    <span>📄 ${doc.metadata?.mimetype || 'Unknown type'}</span>
                    <span>🕒 ${formatDate(doc.createdAt)}</span>
                    ${doc.metadata?.chunkIndex !== undefined ? `<span>🧩 Chunk ${doc.metadata.chunkIndex + 1}/${doc.metadata.totalChunks}</span>` : ''}
                </div>
            </div>
            <div class="document-actions">
                <button class="btn-icon delete" onclick="deleteDocument('${doc.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// File Upload
async function handleFileUpload(e) {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    showStatus(fileUploadStatus, 'Uploading and processing...', 'loading');

    try {
        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showStatus(fileUploadStatus, `✅ ${data.message} (${data.chunks} chunks created)`, 'success');
            fileUploadForm.reset();
            document.querySelector('.file-label-text').textContent = 'Choose File';
            loadAnalytics();
            loadDocuments();
        } else {
            showStatus(fileUploadStatus, `❌ ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showStatus(fileUploadStatus, '❌ Upload failed', 'error');
    }
}

// URL Upload
async function handleUrlUpload(e) {
    e.preventDefault();

    const url = urlInput.value.trim();
    if (!url) return;

    showStatus(urlUploadStatus, 'Fetching and processing...', 'loading');

    try {
        const response = await fetch(`${API_URL}/api/upload/url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (response.ok) {
            showStatus(urlUploadStatus, `✅ ${data.message} (${data.chunks} chunks created)`, 'success');
            urlUploadForm.reset();
            loadAnalytics();
            loadDocuments();
        } else {
            showStatus(urlUploadStatus, `❌ ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('URL upload error:', error);
        showStatus(urlUploadStatus, '❌ Processing failed', 'error');
    }
}

// Delete Document
async function deleteDocument(id) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
        const response = await fetch(`${API_URL}/api/admin/document/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            loadAnalytics();
            loadDocuments();
        } else if (response.status === 401) {
            handleLogout();
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete document');
    }
}

// Re-index
async function handleReindex() {
    if (!confirm('Re-indexing will regenerate embeddings for all documents. This may take some time. Continue?')) return;

    reindexBtn.disabled = true;
    reindexBtn.textContent = 'Re-indexing...';

    try {
        const response = await fetch(`${API_URL}/api/admin/reindex`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            alert('Re-indexing completed successfully!');
        } else if (response.status === 401) {
            handleLogout();
        } else {
            alert('Re-indexing failed');
        }
    } catch (error) {
        console.error('Reindex error:', error);
        alert('Re-indexing failed');
    } finally {
        reindexBtn.disabled = false;
        reindexBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 20V10M12 10L8 14M12 10l4 4M3 3l18 18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Re-index All
        `;
    }
}

// Clear All
async function handleClearAll() {
    if (!confirm('⚠️ WARNING: This will delete ALL documents from the knowledge base. This action cannot be undone. Are you sure?')) return;

    try {
        const response = await fetch(`${API_URL}/api/admin/clear-all`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            loadAnalytics();
            loadDocuments();
            alert('All documents cleared successfully');
        } else if (response.status === 401) {
            handleLogout();
        } else {
            alert('Failed to clear documents');
        }
    } catch (error) {
        console.error('Clear all error:', error);
        alert('Failed to clear documents');
    }
}

// Utility Functions
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `upload-status ${type}`;

    if (type === 'success') {
        setTimeout(() => {
            element.className = 'upload-status';
        }, 5000);
    }
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
