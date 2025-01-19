<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Magicly Admin Portal</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Header -->
    <header>
        <div class="header-content">
            <h1><i class="fas fa-magic"></i> Magicly Admin Portal</h1>
        </div>
    </header>

    <div class="dashboard-container">
        <!-- Sidebar -->
        <nav class="sidebar">
            <ul>
                <li><button onclick="showSection('dashboard')"><i class="fas fa-home"></i> Dashboard</button></li>
                <li><button onclick="showSection('trial-codes')"><i class="fas fa-key"></i> Manage Trial Codes</button></li>
                <li><button onclick="showSection('users')"><i class="fas fa-users"></i> Manage Users</button></li>
                <li><button onclick="showSection('questions')"><i class="fas fa-question-circle"></i> Manage Questions</button></li>
                <li><button onclick="showSection('results')"><i class="fas fa-chart-bar"></i> View Results</button></li>
            </ul>
        </nav>

        <!-- Main Content -->
        <main>
            <!-- Dashboard Section -->
            <section id="dashboard" class="section">
                <h2>Welcome, <span id="admin-username">Admin</span>!</h2>
                <div class="stats-container">
                    <div class="stat-box">
                        <h3><i class="fas fa-tasks"></i> Tests Taken</h3>
                        <p id="tests-taken">0</p>
                    </div>
                    <div class="stat-box">
                        <h3><i class="fas fa-envelope"></i> Applications Received</h3>
                        <p id="applications-received">0</p>
                    </div>
                </div>
            </section>

            <!-- Trial Code Management -->
            <section id="trial-codes" class="section hidden">
                <h2><i class="fas fa-key"></i> Manage Trial Codes</h2>
                <div class="centered-container">
                    <form id="add-trial-code-form">
                        <input type="text" id="trial-code" placeholder="Enter Trial Code" required>
                        <button type="submit"><i class="fas fa-plus"></i> Add Trial Code</button>
                    </form>
                </div>
                <h3>All Trial Codes</h3>
                <div class="centered-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Used</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="trial-codes-table-body">
                            <!-- Trial codes dynamically populated -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- User Management -->
            <section id="users" class="section hidden">
                <h2><i class="fas fa-users"></i> Manage Users</h2>
                <div class="centered-container">
                    <form id="add-user-form">
                        <input type="text" id="new-username" placeholder="Username" required>
                        <select id="new-role">
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                        </select>
                        <input type="password" id="new-password" placeholder="Password" required>
                        <button type="submit"><i class="fas fa-plus"></i> Add User</button>
                    </form>
                </div>
                <h3>All Users</h3>
                <div class="centered-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <!-- Users dynamically populated -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Questions Management -->
            <section id="questions" class="section hidden">
                <h2><i class="fas fa-question-circle"></i> Manage Questions</h2>
                <div class="centered-container">
                    <button class="toggle-button" onclick="showSubSection('add-questions')">Add Questions</button>
                    <button class="toggle-button" onclick="showSubSection('read-questions')">Read Questions</button>
                </div>
                <div id="add-questions" class="sub-section hidden">
                    <form id="add-question-form" class="centered-container">
                        <input type="text" id="question" placeholder="Enter Question" required>
                        <input type="text" id="option1" placeholder="Option 1" required>
                        <input type="text" id="option2" placeholder="Option 2" required>
                        <input type="text" id="option3" placeholder="Option 3" required>
                        <input type="text" id="option4" placeholder="Option 4" required>
                        <select id="correct-answer" required>
                            <option value="0">Option 1</option>
                            <option value="1">Option 2</option>
                            <option value="2">Option 3</option>
                            <option value="3">Option 4</option>
                        </select>
                        <select id="category" required>
                            <option value="Moderation">Moderation</option>
                            <option value="ModMail">ModMail</option>
                        </select>
                        <button type="submit"><i class="fas fa-plus"></i> Add Question</button>
                    </form>
                </div>
                <div id="read-questions" class="sub-section hidden">
                    <div class="centered-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Category</th>
                                    <th>Correct Answer</th>
                                </tr>
                            </thead>
                            <tbody id="questions-table-body">
                                <!-- Questions dynamically populated -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- Test Results -->
            <section id="results" class="section hidden">
                <h2><i class="fas fa-chart-bar"></i> View Test Results</h2>
                <div class="centered-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>ID</th>
                                <th>Score</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="results-table-body">
                            <!-- Results dynamically populated -->
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>

    <script>
        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(sectionId).classList.remove('hidden');
        }

        function showSubSection(subSectionId) {
            document.querySelectorAll('.sub-section').forEach(subSection => {
                subSection.classList.add('hidden');
            });
            document.getElementById(subSectionId).classList.remove('hidden');
        }

        // Default Section
        showSection('dashboard');
    </script>
</body>
</html>
