// Utility: Fetch data and populate tables
async function fetchData(url, tableId, mapFn) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const tableBody = document.getElementById(tableId);
        tableBody.innerHTML = data.map(mapFn).join('');
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
    }
}

// Utility: Toggle sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    const section = document.getElementById(sectionId);
    if (section) section.classList.remove('hidden');
}

// Utility: Toggle subsections
function showSubSection(subSectionId) {
    document.querySelectorAll('.sub-section').forEach(subSection => {
        subSection.classList.add('hidden');
    });
    const subSection = document.getElementById(subSectionId);
    if (subSection) subSection.classList.remove('hidden');
}

// Fetch and Display Trial Codes
async function fetchTrialCodes() {
    await fetchData('/admin/trial-codes', 'trial-codes-table-body', code => `
        <tr>
            <td>${code.code}</td>
            <td>${code.used ? 'Yes' : 'No'}</td>
            <td>
                <button onclick="deleteTrialCode('${code._id}')">Delete</button>
            </td>
        </tr>
    `);
}

// Add a Trial Code
document.getElementById('add-trial-code-form').addEventListener('submit', async event => {
    event.preventDefault();
    const trialCode = document.getElementById('trial-code').value;

    try {
        await fetch('/admin/trial-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: trialCode }),
        });
        document.getElementById('trial-code').value = ''; // Clear the input
        fetchTrialCodes();
    } catch (error) {
        console.error('Error adding trial code:', error);
    }
});

// Delete a Trial Code
async function deleteTrialCode(id) {
    try {
        await fetch(`/admin/trial-codes/${id}`, { method: 'DELETE' });
        fetchTrialCodes();
    } catch (error) {
        console.error(`Error deleting trial code with ID ${id}:`, error);
    }
}

// Fetch and Display Users
async function fetchUsers() {
    await fetchData('/admin/users', 'users-table-body', user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>${user.isEnabled ? 'Enabled' : 'Disabled'}</td>
            <td>
                <button onclick="toggleUserStatus('${user._id}', ${!user.isEnabled})">
                    ${user.isEnabled ? 'Disable' : 'Enable'}
                </button>
                <button onclick="updateUserPassword('${user._id}')">Change Password</button>
            </td>
        </tr>
    `);
}

// Add a User
document.getElementById('add-user-form').addEventListener('submit', async event => {
    event.preventDefault();
    const username = document.getElementById('new-username').value;
    const role = document.getElementById('new-role').value;
    const password = document.getElementById('new-password').value;

    try {
        await fetch('/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, role, password }),
        });
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
        fetchUsers();
    } catch (error) {
        console.error('Error adding user:', error);
    }
});

// Toggle User Status
async function toggleUserStatus(id, isEnabled) {
    try {
        await fetch(`/admin/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isEnabled }),
        });
        fetchUsers();
    } catch (error) {
        console.error(`Error toggling user status for ID ${id}:`, error);
    }
}

// Update User Password
async function updateUserPassword(id) {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    try {
        await fetch(`/admin/users/${id}/password`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword }),
        });
        fetchUsers();
    } catch (error) {
        console.error(`Error updating password for user ID ${id}:`, error);
    }
}

// Fetch and Display Questions
async function fetchQuestions() {
    await fetchData('/admin/questions', 'questions-table-body', question => `
        <tr>
            <td>${question.question}</td>
            <td>${question.category}</td>
            <td>${question.options[question.correctAnswer]}</td>
        </tr>
    `);
}

// Add a Question
document.getElementById('add-question-form').addEventListener('submit', async event => {
    event.preventDefault();
    const question = document.getElementById('question').value;
    const options = [
        document.getElementById('option1').value,
        document.getElementById('option2').value,
        document.getElementById('option3').value,
        document.getElementById('option4').value,
    ];
    const correctAnswer = parseInt(document.getElementById('correct-answer').value, 10);
    const category = document.getElementById('category').value;

    try {
        await fetch('/admin/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, options, correctAnswer, category }),
        });
        document.getElementById('add-question-form').reset(); // Clear the form
        fetchQuestions();
    } catch (error) {
        console.error('Error adding question:', error);
    }
}

// Initialize and Fetch Data
function initialize() {
    showSection('dashboard'); // Default section
    fetchTrialCodes();
    fetchUsers();
    fetchQuestions();
}

// Call initialize on page load
window.onload = initialize;
