// DOM Elements
const noteModal = document.getElementById('note-modal');
const deleteModal = document.getElementById('delete-modal');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const addNoteBtn = document.getElementById('add-note-btn');
const closeModalBtn = document.getElementById('close-modal');
const closeLoginModalBtn = document.getElementById('close-login-modal');
const closeRegisterModalBtn = document.getElementById('close-register-modal');
const saveNoteBtn = document.getElementById('save-note');
const pinNoteBtn = document.getElementById('pin-note');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const lastUpdatedSpan = document.getElementById('last-updated');
const searchInput = document.getElementById('search-notes');
const pinnedNotesGrid = document.getElementById('pinned-notes-grid');
const notesGrid = document.getElementById('notes-grid');
const themeToggle = document.getElementById('theme-toggle');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const loadingSpinner = document.getElementById('loading-spinner');
const colorButtons = document.querySelectorAll('.color-btn');

// Auth Elements
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const showLoginLink = document.getElementById('show-login');
const showRegisterLink = document.getElementById('show-register');
const authButtons = document.getElementById('auth-buttons');
const userProfile = document.getElementById('user-profile');
const userName = document.getElementById('user-name');

// State
let notes = [];
let currentNoteId = null;
let currentNoteColor = '#ffffff';
let currentNotePinned = false;
let isEditing = false;
let currentUser = null;

// API URLs
const API_URL = '/api/notes';
const AUTH_API_URL = '/api/auth';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  initTheme();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  // Add note button
  addNoteBtn.addEventListener('click', () => {
    if (currentUser) {
      openNoteModal();
    } else {
      openLoginModal();
      showError('Please login to add notes');
    }
  });
  
  // Profile picture container click event
  const profilePicContainer = document.getElementById('profile-pic-container');
  if (profilePicContainer) {
    profilePicContainer.addEventListener('click', () => {
      if (currentUser) {
        document.getElementById('profile-pic-upload').click();
      }
    });
  }
  
  // Profile picture upload event
  const profilePicUpload = document.getElementById('profile-pic-upload');
  if (profilePicUpload) {
    profilePicUpload.addEventListener('change', handleProfilePicUpload);
  }

  // Close modals
  closeModalBtn.addEventListener('click', closeNoteModal);
  closeLoginModalBtn.addEventListener('click', closeLoginModal);
  closeRegisterModalBtn.addEventListener('click', closeRegisterModal);

  // Save note
  saveNoteBtn.addEventListener('click', saveNote);

  // Pin note
  pinNoteBtn.addEventListener('click', togglePinNote);

  // Search notes
  searchInput.addEventListener('input', searchNotes);

  // Theme toggle
  themeToggle.addEventListener('change', toggleTheme);

  // Delete modal buttons
  cancelDeleteBtn.addEventListener('click', () => closeDeleteModal());
  confirmDeleteBtn.addEventListener('click', confirmDeleteNote);

  // Color buttons
  colorButtons.forEach(button => {
    button.addEventListener('click', () => {
      setNoteColor(button.dataset.color);
    });
  });

  // Auth buttons
  loginBtn.addEventListener('click', openLoginModal);
  registerBtn.addEventListener('click', openRegisterModal);
  logoutBtn.addEventListener('click', logout);
  
  // Auth forms
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  
  // Switch between login and register
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeRegisterModal();
    openLoginModal();
  });
  
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeLoginModal();
    openRegisterModal();
  });

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === noteModal) {
      closeNoteModal();
    }
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
    if (e.target === loginModal) {
      closeLoginModal();
    }
    if (e.target === registerModal) {
      closeRegisterModal();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (noteModal.classList.contains('show')) {
        closeNoteModal();
      }
      if (deleteModal.classList.contains('show')) {
        closeDeleteModal();
      }
      if (loginModal.classList.contains('show')) {
        closeLoginModal();
      }
      if (registerModal.classList.contains('show')) {
        closeRegisterModal();
      }
    }
  });
}

// Check Authentication Status
async function checkAuthStatus() {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  
  if (userId && userName) {
    // User is logged in
    currentUser = {
      id: userId,
      name: userName
    };
    updateAuthUI(true);
    loadNotes();
  } else {
    // User is not logged in
    currentUser = null;
    updateAuthUI(false);
    renderEmptyState('Please login to view your notes');
  }
}

// Update Auth UI
function updateAuthUI(isLoggedIn) {
  if (isLoggedIn && currentUser) {
    authButtons.style.display = 'none';
    userProfile.style.display = 'flex';
    userName.textContent = currentUser.name;
    
    // Set user initial in the circle
    const userInitial = document.getElementById('user-initial');
    const userProfilePic = document.getElementById('user-profile-pic');
    
    // Check if user has a profile picture
    const profilePicUrl = localStorage.getItem('userProfilePic');
    
    if (profilePicUrl) {
      // If profile picture exists, show it and hide the initial
      userProfilePic.src = profilePicUrl;
      userProfilePic.style.display = 'block';
      userInitial.style.display = 'none';
    } else {
      // If no profile picture, show the initial
      if (userInitial && currentUser.name) {
        userInitial.textContent = currentUser.name.charAt(0);
        userInitial.style.display = 'block';
      }
      userProfilePic.style.display = 'none';
    }
  } else {
    authButtons.style.display = 'flex';
    userProfile.style.display = 'none';
    userName.textContent = '';
  }
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (!email || !password) {
    loginError.textContent = 'Please enter both email and password';
    return;
  }
  
  showLoading();
  try {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Save user info to localStorage
      localStorage.setItem('userId', data.data.id);
      localStorage.setItem('userName', data.data.name);
      
      // Update current user
      currentUser = {
        id: data.data.id,
        name: data.data.name
      };
      
      // Update UI
      updateAuthUI(true);
      closeLoginModal();
      loadNotes();
      showSuccess('Login successful');
    } else {
      loginError.textContent = data.message || 'Login failed';
    }
  } catch (error) {
    console.error('Login error:', error);
    loginError.textContent = 'Failed to connect to the server';
  } finally {
    hideLoading();
  }
}

// Handle Register
async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
  if (!name || !email || !password) {
    registerError.textContent = 'Please fill in all fields';
    return;
  }
  
  if (password.length < 6) {
    registerError.textContent = 'Password must be at least 6 characters';
    return;
  }
  
  showLoading();
  try {
    const response = await fetch(`${AUTH_API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      closeRegisterModal();
      openLoginModal();
      showSuccess('Registration successful. Please login.');
    } else {
      registerError.textContent = data.message || 'Registration failed';
    }
  } catch (error) {
    console.error('Register error:', error);
    registerError.textContent = 'Failed to connect to the server';
  } finally {
    hideLoading();
  }
}

// Logout
function logout() {
  // Clear user data
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userProfilePic');
  currentUser = null;
  
  // Update UI
  updateAuthUI(false);
  notes = [];
  renderEmptyState('Please login to view your notes');
  showSuccess('Logged out successfully');
}

// Handle Profile Picture Upload
function handleProfilePicUpload(e) {
  const file = e.target.files[0];
  if (file) {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      showError('Please select an image file');
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('Image size should be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      // Save profile picture to localStorage
      localStorage.setItem('userProfilePic', event.target.result);
      
      // Update UI
      updateAuthUI(true);
      showSuccess('Profile picture updated');
    };
    reader.readAsDataURL(file);
  }
}

// Auth Modal Functions
function openLoginModal() {
  loginModal.classList.add('show');
  document.getElementById('login-email').focus();
  loginError.textContent = '';
}

function closeLoginModal() {
  loginModal.classList.remove('show');
  loginForm.reset();
  loginError.textContent = '';
}

function openRegisterModal() {
  registerModal.classList.add('show');
  document.getElementById('register-name').focus();
  registerError.textContent = '';
}

function closeRegisterModal() {
  registerModal.classList.remove('show');
  registerForm.reset();
  registerError.textContent = '';
}

// Load Notes from API
async function loadNotes() {
  if (!currentUser) return;
  
  showLoading();
  try {
    const response = await fetch(API_URL, {
      headers: {
        'x-auth-user': currentUser.id
      }
    });
    const data = await response.json();
    
    if (data.success) {
      notes = data.data;
      renderNotes();
    } else {
      showError('Failed to load notes');
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    showError('Failed to connect to the server');
  } finally {
    hideLoading();
  }
}

// Render Notes
function renderNotes() {
  const filteredNotes = filterNotes();
  
  // Clear grids
  pinnedNotesGrid.innerHTML = '';
  notesGrid.innerHTML = '';
  
  // Check if there are any notes after filtering
  if (filteredNotes.length === 0) {
    renderEmptyState();
    return;
  }
  
  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);
  
  // Render pinned notes
  if (pinnedNotes.length === 0) {
    document.querySelector('.pinned-notes').style.display = 'none';
  } else {
    document.querySelector('.pinned-notes').style.display = 'block';
    pinnedNotes.forEach(note => {
      pinnedNotesGrid.appendChild(createNoteCard(note));
    });
  }
  
  // Render unpinned notes
  if (unpinnedNotes.length === 0) {
    document.querySelector('.other-notes').style.display = 'none';
  } else {
    document.querySelector('.other-notes').style.display = 'block';
    unpinnedNotes.forEach(note => {
      notesGrid.appendChild(createNoteCard(note));
    });
  }
}

// Create Note Card Element
function createNoteCard(note) {
  const noteCard = document.createElement('div');
  noteCard.className = `note-card ${note.isPinned ? 'pinned' : ''}`;
  noteCard.style.backgroundColor = note.color || '#ffffff';
  noteCard.style.animationDelay = `${Math.random() * 0.5}s`;
  
  const formattedDate = formatDate(new Date(note.updatedAt));
  
  noteCard.innerHTML = `
    <div class="note-header">
      <div class="note-title">${escapeHtml(note.title)}</div>
      <div class="note-actions">
        <button class="icon-btn edit-btn" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="icon-btn pin-btn" title="${note.isPinned ? 'Unpin' : 'Pin'}">
          <i class="fas fa-thumbtack"></i>
        </button>
        <button class="icon-btn delete-btn" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="note-content">${escapeHtml(note.content)}</div>
    <div class="note-footer">
      ${formattedDate}
    </div>
  `;
  
  // Add event listeners to buttons
  noteCard.querySelector('.edit-btn').addEventListener('click', () => {
    openNoteModal(note);
  });
  
  noteCard.querySelector('.pin-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleNotePinStatus(note._id);
  });
  
  noteCard.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openDeleteModal(note._id);
  });
  
  // Make the whole card clickable for editing
  noteCard.addEventListener('click', () => {
    openNoteModal(note);
  });
  
  return noteCard;
}

// Render Empty State
function renderEmptyState(message = null) {
  const searchTerm = searchInput.value.trim();
  
  // Hide section titles
  document.querySelector('.pinned-notes').style.display = 'none';
  document.querySelector('.other-notes').style.display = 'none';
  
  // Create empty state element
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  
  if (searchTerm) {
    emptyState.innerHTML = `
      <i class="fas fa-search"></i>
      <h3>No matching notes found</h3>
      <p>We couldn't find any notes matching "${escapeHtml(searchTerm)}"</p>
      <button class="btn primary-btn" id="clear-search-btn">Clear Search</button>
    `;
    
    // Append to notes grid
    notesGrid.appendChild(emptyState);
    
    // Add event listener to clear search button
    document.getElementById('clear-search-btn').addEventListener('click', () => {
      searchInput.value = '';
      searchNotes();
    });
  } else if (!currentUser) {
    emptyState.innerHTML = `
      <i class="fas fa-user-lock"></i>
      <h3>Authentication Required</h3>
      <p>${message || 'Please login to view and create notes'}</p>
    `;
    
    // Append to notes grid
    notesGrid.appendChild(emptyState);
  } else {
    emptyState.innerHTML = `
      <i class="fas fa-sticky-note"></i>
      <h3>No notes yet</h3>
      <p>${message || 'Click the "Add New Note" button to create your first note'}</p>
    `;
    
    // Append to notes grid
    notesGrid.appendChild(emptyState);
  }
}

// Filter Notes based on search
function filterNotes() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (!searchTerm) {
    return notes;
  }
  
  return notes.filter(note => {
    return (
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
    );
  });
}

// Search Notes
function searchNotes() {
  renderNotes();
}

// Open Note Modal
function openNoteModal(note = null) {
  isEditing = !!note;
  currentNoteId = note ? note._id : null;
  currentNotePinned = note ? note.isPinned : false;
  
  // Reset form
  noteTitleInput.value = note ? note.title : '';
  noteContentInput.value = note ? note.content : '';
  
  // Set note color
  currentNoteColor = note ? note.color : '#ffffff';
  setNoteColor(currentNoteColor);
  
  // Update pin button
  updatePinButtonState();
  
  // Show last updated time if editing
  if (isEditing) {
    const formattedDate = formatDate(new Date(note.updatedAt));
    lastUpdatedSpan.textContent = `Last updated: ${formattedDate}`;
  } else {
    lastUpdatedSpan.textContent = '';
  }
  
  // Show modal
  noteModal.classList.add('show');
  noteTitleInput.focus();
}

// Close Note Modal
function closeNoteModal() {
  noteModal.classList.remove('show');
  setTimeout(() => {
    // Reset form after animation completes
    noteTitleInput.value = '';
    noteContentInput.value = '';
    currentNoteId = null;
    currentNotePinned = false;
    currentNoteColor = '#ffffff';
    isEditing = false;
  }, 300);
}

// Save Note
async function saveNote() {
  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value.trim();
  
  if (!title) {
    alert('Please add a title for your note');
    noteTitleInput.focus();
    return;
  }
  
  if (!content) {
    alert('Please add some content to your note');
    noteContentInput.focus();
    return;
  }
  
  showLoading();
  
  const noteData = {
    title,
    content,
    color: currentNoteColor,
    isPinned: currentNotePinned
  };
  
  try {
    let response;
    
    if (isEditing) {
      // Update existing note
      response = await fetch(`${API_URL}/${currentNoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-user': currentUser.id
        },
        body: JSON.stringify(noteData)
      });
    } else {
      // Create new note
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-user': currentUser.id
        },
        body: JSON.stringify(noteData)
      });
    }
    
    const data = await response.json();
    
    if (data.success) {
      closeNoteModal();
      await loadNotes();
    } else {
      showError(data.error || 'Failed to save note');
    }
  } catch (error) {
    console.error('Error saving note:', error);
    showError('Failed to connect to the server');
  } finally {
    hideLoading();
  }
}

// Toggle Pin Note in Modal
function togglePinNote() {
  currentNotePinned = !currentNotePinned;
  updatePinButtonState();
}

// Update Pin Button State
function updatePinButtonState() {
  if (currentNotePinned) {
    pinNoteBtn.classList.add('active');
    pinNoteBtn.querySelector('i').style.color = 'var(--warning-color)';
  } else {
    pinNoteBtn.classList.remove('active');
    pinNoteBtn.querySelector('i').style.color = '';
  }
}

// Toggle Note Pin Status in API
async function toggleNotePinStatus(noteId) {
  showLoading();
  
  try {
    const response = await fetch(`${API_URL}/${noteId}/pin`, {
      method: 'PATCH',
      headers: {
        'x-auth-user': currentUser.id
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      await loadNotes();
    } else {
      showError(data.error || 'Failed to update note');
    }
  } catch (error) {
    console.error('Error updating note:', error);
    showError('Failed to connect to the server');
  } finally {
    hideLoading();
  }
}

// Set Note Color
function setNoteColor(color) {
  currentNoteColor = color;
  
  // Update modal background
  document.querySelector('.modal-content').style.backgroundColor = color;
  
  // Update active color button
  colorButtons.forEach(button => {
    if (button.dataset.color === color) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

// Open Delete Modal
function openDeleteModal(noteId) {
  currentNoteId = noteId;
  deleteModal.classList.add('show');
}

// Close Delete Modal
function closeDeleteModal() {
  deleteModal.classList.remove('show');
  setTimeout(() => {
    currentNoteId = null;
  }, 300);
}

// Confirm Delete Note
async function confirmDeleteNote() {
  if (!currentNoteId) return;
  
  showLoading();
  
  try {
    const response = await fetch(`${API_URL}/${currentNoteId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-user': currentUser.id
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      closeDeleteModal();
      await loadNotes();
    } else {
      showError(data.error || 'Failed to delete note');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    showError('Failed to connect to the server');
  } finally {
    hideLoading();
  }
}

// Theme Functions
function initTheme() {
  // Check for saved theme preference
  const darkMode = localStorage.getItem('dark-mode') === 'true';
  
  // Apply theme
  if (darkMode) {
    document.body.classList.add('dark-theme');
    themeToggle.checked = true;
  }
}

function toggleTheme() {
  const isDarkMode = themeToggle.checked;
  
  if (isDarkMode) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  
  // Save preference
  localStorage.setItem('dark-mode', isDarkMode);
}

// Helper Functions
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showLoading() {
  loadingSpinner.classList.add('show');
}

function hideLoading() {
  loadingSpinner.classList.remove('show');
}

function showError(message) {
  alert(message);
}

function showSuccess(message) {
  alert(message);
}

// Get Note by ID
async function getNote(id) {
  if (!currentUser) return null;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        'x-auth-user': currentUser.id
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      showError('Failed to get note');
      return null;
    }
  } catch (error) {
    console.error('Error getting note:', error);
    showError('Failed to connect to the server');
    return null;
  }
}