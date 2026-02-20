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

// Settings elements
const botSettingsForm = document.getElementById('botSettingsForm');
const botNameInput = document.getElementById('botName');
const welcomeMessageInput = document.getElementById('welcomeMessage');
const settingsStatus = document.getElementById('settingsStatus');
const undoIdentityBtn = document.getElementById('undoIdentityBtn');
const avatarUploadForm = document.getElementById('avatarUploadForm');
const avatarInput = document.getElementById('avatarInput');
const currentAvatarImg = document.getElementById('currentAvatar');
const avatarStatus = document.getElementById('avatarStatus');
const undoAvatarBtn = document.getElementById('undoAvatarBtn');

let originalSettings = null;
let previousAvatarUrl = null;
let previousIdentity = null;

// Documents elements
const documentsList = document.getElementById('documentsList');
const refreshDocsBtn = document.getElementById('refreshDocsBtn');
const reindexBtn = document.getElementById('reindexBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Conversation elements
const conversationsList = document.getElementById('conversationsList');
const refreshConvsBtn = document.getElementById('refreshConvsBtn');
const conversationModal = document.getElementById('conversationModal');
const closeModal = document.getElementById('closeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const downloadConvBtn = document.getElementById('downloadConvBtn');
const modalBody = document.getElementById('modalBody');
const modalTitle = document.getElementById('modalTitle');
let currentViewedConversation = null;

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
        loadSettings();
        loadConversations();
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

    botSettingsForm.addEventListener('submit', handleSettingsUpdate);
    avatarUploadForm.addEventListener('submit', handleAvatarUpload);
    undoIdentityBtn.addEventListener('click', handleUndoIdentity);
    undoAvatarBtn.addEventListener('click', handleUndoAvatar);

    refreshDocsBtn.addEventListener('click', loadDocuments);
    refreshConvsBtn.addEventListener('click', loadConversations);
    reindexBtn.addEventListener('click', handleReindex);
    clearAllBtn.addEventListener('click', handleClearAll);

    // File input label update
    fileInput.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name || 'Choose File';
        document.querySelector('.file-label-text').textContent = fileName;
    });

    // Avatar input label update
    avatarInput.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name || 'New Avatar';
        document.querySelector('.avatar-label-text').textContent = fileName;
    });

    // Password visibility toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            passwordToggle.classList.toggle('visible', !isPassword);
        });
    }

    // Modal listeners
    closeModal.addEventListener('click', () => conversationModal.style.display = 'none');
    closeModalBtn.addEventListener('click', () => conversationModal.style.display = 'none');
    downloadConvBtn.addEventListener('click', handleDownloadConversation);
    window.addEventListener('click', (e) => {
        if (e.target === conversationModal) conversationModal.style.display = 'none';
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
    window.location.href = 'index.html';
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
        } else {
            const error = await response.json();
            console.error('Analytics failed:', error);
            totalDocsEl.textContent = 'Err';
            totalChunksEl.textContent = 'Err';
        }
    } catch (error) {
        console.error('Analytics error:', error);
        totalDocsEl.textContent = 'Err';
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
        } else {
            const error = await response.json();
            documentsList.innerHTML = `<div class="error-message">Failed to load documents: ${error.error || 'Server error'}</div>`;
        }
    } catch (error) {
        console.error('Documents error:', error);
        documentsList.innerHTML = `<div class="error-message">Failed to load documents: ${error.message}</div>`;
    }
}

// Display Documents
function displayDocuments(documents) {
    if (!documents || documents.length === 0) {
        documentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <p>No documents uploaded yet</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Upload documents to start building your knowledge base</p>
            </div>
        `;
        return;
    }

    // Sort documents: pending first, then active, then by creation date
    const sortedDocs = [...documents].sort((a, b) => {
        if (a.isActive === b.isActive) {
            return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
        }
        return a.isActive ? 1 : -1; // Pending (false) comes before active (true)
    });

    documentsList.innerHTML = sortedDocs.map(doc => `
        <div class="document-item ${doc.isActive ? 'active-border' : 'pending-border'}">
            <div class="document-info">
                <div class="document-title">${escapeHtml(doc.filename)}</div>
                <div class="document-meta">
                    ${doc.category ? `<span class="category-badge">${escapeHtml(doc.category)}</span>` : ''}
                    <span>${doc.type === 'webpage' ? '🌐 URL' : '📄 ' + doc.mimetype}</span>
                    <span>🧩 ${doc.chunks} parts</span>
                    <span>🕒 ${formatDate(doc.createdAt)}</span>
                    <span class="status-badge ${doc.isActive ? 'active' : 'pending'}">
                        ${doc.isActive ? '✅ Included in Chat' : '⏳ Pending Review'}
                    </span>
                </div>
                ${doc.summary ? `
                <div class="document-summary">
                    <strong>🤖 AI Training Highlights:</strong>
                    <p>${escapeHtml(doc.summary)}</p>
                </div>
                ` : ''}
            </div>
            <div class="document-actions">
                ${!doc.isActive ? `
                <button class="btn-icon approve" title="Include in Chatbot" onclick="approveDocumentBySource('${escapeHtml(doc.source)}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 6L9 17L4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                ` : `
                <button class="btn-icon deactivate" title="Exclude from Chatbot" onclick="deactivateDocumentBySource('${escapeHtml(doc.source)}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                `}
                ${doc.type !== 'webpage' ? `
                <button class="btn-icon download" title="Download Original File" onclick="downloadDocumentBySource('${escapeHtml(doc.source)}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                ` : ''}
                <button class="btn-icon delete" title="Delete Document" onclick="deleteDocumentBySource('${escapeHtml(doc.source)}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Download Document By Source
async function downloadDocumentBySource(source) {
    // Find and update the download button to show loading state
    const buttons = document.querySelectorAll('.btn-icon.download');
    let clickedBtn = null;
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(source.replace(/'/g, "\\'"))) {
            clickedBtn = btn;
        }
    });

    if (clickedBtn) {
        clickedBtn.disabled = true;
        clickedBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-dasharray="30" stroke-dashoffset="10" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></circle></svg>`;
    }

    try {
        const response = await fetch(`${API_URL}/api/admin/document/download?source=${encodeURIComponent(source)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Try to get filename from content-disposition header
            const contentDisposition = response.headers.get('content-disposition');
            let filename = source.split('/').pop() || source;
            if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
                filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '').trim();
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('✅ Download started!', 'success');
        } else if (response.status === 404) {
            showToast('⚠️ Original file not available. This document was indexed but the original file was not stored. Please re-upload the document to enable downloads.', 'warning');
        } else if (response.status === 401) {
            handleLogout();
        } else {
            const error = await response.json().catch(() => ({ error: 'Server error' }));
            showToast(`❌ Download failed: ${error.error || 'Server error'}`, 'error');
        }
    } catch (error) {
        console.error('Download error:', error);
        showToast('❌ Failed to download document. Please check your connection.', 'error');
    } finally {
        // Restore button
        if (clickedBtn) {
            clickedBtn.disabled = false;
            clickedBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        }
    }
}

// Approve Document By Source
async function approveDocumentBySource(source) {
    try {
        const response = await fetch(`${API_URL}/api/admin/document/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ source })
        });

        if (response.ok) {
            loadAnalytics();
            loadDocuments();
        } else if (response.status === 401) {
            handleLogout();
        } else {
            alert('Failed to approve document');
        }
    } catch (error) {
        console.error('Approve error:', error);
        alert('Failed to approve document');
    }
}

// Deactivate Document By Source
async function deactivateDocumentBySource(source) {
    try {
        const response = await fetch(`${API_URL}/api/admin/document/deactivate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ source })
        });

        if (response.ok) {
            loadAnalytics();
            loadDocuments();
        } else if (response.status === 401) {
            handleLogout();
        } else {
            alert('Failed to deactivate document');
        }
    } catch (error) {
        console.error('Deactivate error:', error);
        alert('Failed to deactivate document');
    }
}

// Delete Document By Source
async function deleteDocumentBySource(source) {
    if (!confirm(`Are you sure you want to delete "${source}" and all its parts?`)) return;

    try {
        const response = await fetch(`${API_URL}/api/admin/document/source?source=${encodeURIComponent(source)}`, {
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
        } else {
            alert('Failed to delete document');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete document');
    }
}

// This function is replaced by deleteDocumentBySource

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

            // Wait a moment for the server to finish all tasks before refreshing
            console.log('Upload successful, refreshing dashboard in 500ms...');
            setTimeout(() => {
                loadAnalytics();
                loadDocuments();
            }, 500);
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
            showStatus(urlUploadStatus, '✅ URL processed and ready for review', 'success');
            urlInput.value = '';
            loadDocuments();
            loadAnalytics();
        } else {
            showStatus(urlUploadStatus, `❌ ${data.error || 'Failed to process URL'}`, 'error');
        }
    } catch (error) {
        console.error('URL upload error:', error);
        showStatus(urlUploadStatus, '❌ Processing failed', 'error');
    }
}

// This function is replaced by deleteDocumentBySource

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

// Load Settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/api/settings`);
        if (response.ok) {
            const settings = await response.json();
            originalSettings = { ...settings }; // Store original state

            botNameInput.value = settings.botName || 'MelissAI';
            welcomeMessageInput.value = settings.welcomeMessage || '';
            currentAvatarImg.src = settings.avatarUrl || 'images/melissai-new-avatar.jpg';

            // Initialize previous states
            previousAvatarUrl = null;
            previousIdentity = null;

            // Show undo buttons
            undoIdentityBtn.style.display = 'block';
            undoAvatarBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Settings load error:', error);
    }
}

// Update Settings
async function handleSettingsUpdate(e) {
    e.preventDefault();

    const botName = botNameInput.value.trim();
    const welcomeMessage = welcomeMessageInput.value.trim();

    showStatus(settingsStatus, 'Updating settings...', 'loading');

    try {
        const response = await fetch(`${API_URL}/api/settings/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ botName, welcomeMessage })
        });

        if (response.ok) {
            const data = await response.json();

            // Store previous identity before updating
            previousIdentity = {
                botName: originalSettings.botName,
                welcomeMessage: originalSettings.welcomeMessage
            };

            // Update our local memory of the current settings
            originalSettings = { ...data.settings };

            // Update preview
            currentAvatarImg.src = data.settings.avatarUrl;
            showStatus(settingsStatus, '✅ Identity saved', 'success');
        } else {
            showStatus(settingsStatus, '❌ Update failed', 'error');
        }
    } catch (error) {
        console.error('Update settings error:', error);
        showStatus(settingsStatus, '❌ Error updating settings', 'error');
    }
}

// Upload Avatar
async function handleAvatarUpload(e) {
    e.preventDefault();

    const file = avatarInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    showStatus(avatarStatus, 'Uploading avatar...', 'loading');

    try {
        const response = await fetch(`${API_URL}/api/settings/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();

            // The NEW previous becomes the one we had right before this upload
            previousAvatarUrl = originalSettings.avatarUrl;

            // The NEW current is what the server just gave us
            originalSettings.avatarUrl = data.avatarUrl;

            showStatus(avatarStatus, '✅ Avatar updated', 'success');
            currentAvatarImg.src = data.avatarUrl;

            avatarUploadForm.reset();
            document.querySelector('.avatar-label-text').textContent = 'Select New Photo';
        } else {
            const data = await response.json();
            showStatus(avatarStatus, `❌ ${data.error || 'Upload failed'}`, 'error');
        }
    } catch (error) {
        console.error('Avatar upload error:', error);
        showStatus(avatarStatus, '❌ Error connecting to server', 'error');
    }
}

async function handleUndoAvatar() {
    if (!previousAvatarUrl) {
        showStatus(avatarStatus, 'ℹ️ No previous photo in this session', 'error');
        return;
    }

    showStatus(avatarStatus, 'Restoring previous photo...', 'loading');

    try {
        const response = await fetch(`${API_URL}/api/settings/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ avatarUrl: previousAvatarUrl })
        });

        if (response.ok) {
            const data = await response.json();

            // Swap them so another "Undo" toggles back
            const oldCurrent = originalSettings.avatarUrl;
            originalSettings.avatarUrl = previousAvatarUrl;
            previousAvatarUrl = oldCurrent;

            currentAvatarImg.src = originalSettings.avatarUrl;

            showStatus(avatarStatus, '✅ Photo restored', 'success');
        } else {
            showStatus(avatarStatus, '❌ Restore failed', 'error');
        }
    } catch (error) {
        console.error('Undo avatar error:', error);
        showStatus(avatarStatus, '❌ Error connecting to server', 'error');
    }
}

// Dedicated function to restore a specific avatar URL (used as helper)
async function restoreAvatar(url) {
    if (!url) return;
    showStatus(avatarStatus, 'Restoring photo...', 'loading');
    try {
        const response = await fetch(`${API_URL}/api/settings/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ avatarUrl: url })
        });

        if (response.ok) {
            currentAvatarImg.src = url;
            previousAvatarUrl = originalSettings.avatarUrl;
            originalSettings.avatarUrl = url;
            showStatus(avatarStatus, '✅ Photo restored', 'success');
        } else {
            showStatus(avatarStatus, '❌ Restore failed', 'error');
        }
    } catch (error) {
        console.error('Restore error:', error);
        showStatus(avatarStatus, '❌ Error restoring photo', 'error');
    }
}

// Undo Identity Changes
function handleUndoIdentity() {
    if (!previousIdentity) {
        // If no previous save, just reset to original loaded state
        botNameInput.value = originalSettings.botName || 'MelissAI';
        welcomeMessageInput.value = originalSettings.welcomeMessage || '';
        showStatus(settingsStatus, 'Restored to last saved values', 'success');
        return;
    }

    // Toggle/Restore logic
    const currentName = botNameInput.value.trim();
    const currentMsg = welcomeMessageInput.value.trim();

    botNameInput.value = previousIdentity.botName;
    welcomeMessageInput.value = previousIdentity.welcomeMessage;

    // Allow toggling back
    previousIdentity = {
        botName: currentName,
        welcomeMessage: currentMsg
    };

    showStatus(settingsStatus, 'Restored previous identity values', 'success');
}



// Load Conversations
async function loadConversations() {
    try {
        conversationsList.innerHTML = '<div class="loading">Loading conversations...</div>';
        const response = await fetch(`${API_URL}/api/chat/conversations`);
        if (response.ok) {
            const data = await response.json();
            displayConversations(data.conversations);
        }
    } catch (error) {
        console.error('Conversations load error:', error);
        conversationsList.innerHTML = '<div class="error-message">Failed to load conversations</div>';
    }
}

// Display Conversations
function displayConversations(conversations) {
    if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = '<div class="empty-state"><p>No recent conversations</p></div>';
        return;
    }

    conversationsList.innerHTML = conversations.map(conv => {
        const lastMsg = conv.lastMessage ? conv.lastMessage.content : 'No messages';
        const truncatedMsg = lastMsg.length > 100 ? lastMsg.substring(0, 100) + '...' : lastMsg;

        return `
            <div class="document-item">
                <div class="document-info">
                    <div class="document-title">Session: ${conv.id}</div>
                    <div class="document-meta">
                        <span>💬 ${conv.messageCount} messages</span>
                        <span>📝 Last: ${escapeHtml(truncatedMsg)}</span>
                    </div>
                </div>
                <div class="document-actions">
                    <button class="btn-icon" title="View Details" onclick="viewConversation('${conv.id}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function viewConversation(id) {
    try {
        modalBody.innerHTML = '<div class="loading">Loading conversation details...</div>';
        modalTitle.textContent = `Session: ${id}`;
        conversationModal.style.display = 'flex';

        const response = await fetch(`${API_URL}/api/chat/conversation/${id}`);
        if (response.ok) {
            const data = await response.json();
            currentViewedConversation = data.conversation;
            displayConversationDetails(data.conversation);
        } else {
            modalBody.innerHTML = '<div class="error-message">Failed to load conversation details</div>';
        }
    } catch (e) {
        console.error('View conversation error:', e);
        modalBody.innerHTML = '<div class="error-message">An error occurred while loading details</div>';
    }
}

function displayConversationDetails(messages) {
    if (!messages || messages.length === 0) {
        modalBody.innerHTML = '<p>No messages in this session</p>';
        return;
    }

    modalBody.innerHTML = messages.map(m => `
        <div class="modal-message ${m.role}">
            <strong>${m.role === 'user' ? 'User' : 'MelissAI'}</strong>
            <p>${m.content.replace(/\n/g, '<br>')}</p>
        </div>
    `).join('');
}

function handleDownloadConversation() {
    if (!currentViewedConversation) return;

    const sessionID = modalTitle.textContent.replace('Session: ', '');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentViewedConversation, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Meliss_ai_conv_${sessionID}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// ─── Toast Notification System ────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
    // Create container if it doesn't exist
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    // Auto-dismiss
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
