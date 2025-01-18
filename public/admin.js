// Add New User
document.getElementById('add-user').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('new-username').value;
    const role = document.getElementById('new-role').value;
    const password = document.getElementById('new-password').value;

    const response = await fetch('/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role, password }),
    });

    if (response.ok) {
        alert('User added successfully');
        document.getElementById('new-username').value = '';
        document.getElementById('new-role').value = 'Admin';
        document.getElementById('new-password').value = '';
        document.getElementById('view-users').click();
    } else {
        alert('Error adding user');
    }
});

// View All Users
document.getElementById('view-users').addEventListener('click', async () => {
    const response = await fetch('/admin/users', { method: 'GET' });
    const users = await response.json();
    const userList = document.getElementById('user-list');
    userList.innerHTML = users.map(user => `
        <p>
            ${user.username} (${user.role}) - ${user.isEnabled ? 'Enabled' : 'Disabled'}
            <button onclick="toggleUser('${user._id}', ${!user.isEnabled})">
                ${user.isEnabled ? 'Disable' : 'Enable'}
            </button>
            <button onclick="updatePassword('${user._id}')">Change Password</button>
        </p>
    `).join('');
});

// Enable/Disable User
async function toggleUser(userId, isEnabled) {
    await fetch(`/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled }),
    });
    document.getElementById('view-users').click(); // Refresh the user list
}

// Change User Password
async function updatePassword(userId) {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    const response = await fetch(`/admin/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
    });

    if (response.ok) {
        alert('Password updated successfully');
        document.getElementById('view-users').click();
    } else {
        alert('Error updating password');
    }
}

// Add New Trial Code
document.getElementById('add-trial-code').addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = document.getElementById('trial-code').value;

    const response = await fetch('/admin/trial-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });

    if (response.ok) {
        alert('Trial code added successfully');
        document.getElementById('trial-code').value = '';
        document.getElementById('view-trial-codes').click();
    } else {
        alert('Error adding trial code');
    }
});

// View All Trial Codes
document.getElementById('view-trial-codes').addEventListener('click', async () => {
    const response = await fetch('/admin/trial-codes', { method: 'GET' });
    const codes = await response.json();
    const trialCodeList = document.getElementById('trial-code-list');
    trialCodeList.innerHTML = codes.map(code => `
        <p>
            Code: ${code.code} - Used: ${code.used ? 'Yes' : 'No'}
            <button onclick="deleteTrialCode('${code._id}')">Delete</button>
        </p>
    `).join('');
});

// Delete Trial Code
async function deleteTrialCode(codeId) {
    await fetch(`/admin/trial-codes/${codeId}`, { method: 'DELETE' });
    document.getElementById('view-trial-codes').click(); // Refresh the trial codes list
}
