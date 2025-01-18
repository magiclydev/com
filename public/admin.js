document.getElementById('view-users').addEventListener('click', async () => {
    const response = await fetch('/admin/users', { method: 'GET' });
    const users = await response.json();
    const userList = document.getElementById('user-list');
    userList.innerHTML = users.map(user => `
        <p>
            ${user.username} - ${user.role} - ${user.isEnabled ? 'Enabled' : 'Disabled'}
            <button onclick="toggleUser('${user._id}', ${!user.isEnabled})">
                ${user.isEnabled ? 'Disable' : 'Enable'}
            </button>
        </p>
    `).join('');
});

async function toggleUser(userId, isEnabled) {
    await fetch(`/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled }),
    });
    alert('User updated successfully');
    document.getElementById('view-users').click(); // Refresh the user list
}

document.getElementById('view-results').addEventListener('click', async () => {
    const response = await fetch('/admin/results', { method: 'GET' });
    const results = await response.json();
    const resultList = document.getElementById('result-list');
    resultList.innerHTML = results.map(result => `
        <p>
            User: ${result.userId?.username || 'Unknown'}<br>
            Score: ${result.score}/20<br>
            Date: ${new Date(result.testDate).toLocaleString()}<br>
            Notes: ${result.notes || 'None'}<br>
            Archived: ${result.isArchived ? 'Yes' : 'No'}<br>
            <button onclick="toggleArchive('${result._id}', ${!result.isArchived})">
                ${result.isArchived ? 'Restore' : 'Archive'}
            </button>
            <button onclick="addNotes('${result._id}')">Add Notes</button>
        </p>
    `).join('');
});

async function toggleArchive(resultId, isArchived) {
    await fetch(`/admin/results/${resultId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived }),
    });
    alert('Result updated successfully');
    document.getElementById('view-results').click(); // Refresh the result list
}

async function addNotes(resultId) {
    const notes = prompt('Enter notes:');
    if (!notes) return;
    await fetch(`/admin/results/${resultId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
    });
    alert('Notes added successfully');
    document.getElementById('view-results').click(); // Refresh the result list
}
