document.addEventListener('DOMContentLoaded', function() {
    const managementTab = document.getElementById('management');
    if (!managementTab) return;
    const tableContainer = document.createElement('div');
    tableContainer.id = 'usersTableContainer';
    managementTab.appendChild(tableContainer);

    let currentSort = { column: 'ID', order: 'asc' };

    function fetchUsers() {
        fetch(`fetch_users.php?sort=${currentSort.column}&order=${currentSort.order}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderTable(data.data);
                } else {
                    tableContainer.innerHTML = '<div class="alert alert-danger">' + data.message + '</div>';
                }
            })
            .catch(() => {
                tableContainer.innerHTML = '<div class="alert alert-danger">Failed to fetch users.</div>';
            });
    }

    function renderTable(users) {
        // Add new entry form
        let formHtml = `
            <form id="addUserForm" class="row g-2 align-items-end mb-3">
                <div class="col-auto"><input type="text" class="form-control" name="ID" placeholder="ID" required></div>
                <div class="col-auto"><input type="text" class="form-control" name="vorname" placeholder="Vorname" required></div>
                <div class="col-auto"><input type="text" class="form-control" name="Nachname" placeholder="Nachname" required></div>
                <div class="col-auto"><input type="text" class="form-control" name="PLZ" placeholder="PLZ" required></div>
                <div class="col-auto"><input type="text" class="form-control" name="ORT" placeholder="ORT" required></div>
                <div class="col-auto"><button type="submit" class="btn btn-success">Add</button></div>
            </form>
        `;
        if (!users.length) {
            tableContainer.innerHTML = '<div class="alert alert-info">No users found.</div>';
            return;
        }
        let html = '<table class="table table-bordered table-striped mt-3"><thead><tr>';
        const columns = [
            { key: 'ID', label: 'ID' },
            { key: 'vorname', label: 'Vorname' },
            { key: 'Nachname', label: 'Nachname' },
            { key: 'PLZ', label: 'PLZ' },
            { key: 'ORT', label: 'ORT' },
            { key: 'actions', label: 'Actions' }
        ];
        columns.forEach(col => {
            if (col.key !== 'actions') {
                html += `<th style="cursor:pointer" data-sort="${col.key}">${col.label} ` +
                    (currentSort.column === col.key ? (currentSort.order === 'asc' ? '▲' : '▼') : '') + '</th>';
            } else {
                html += `<th>${col.label}</th>`;
            }
        });
        html += '</tr></thead><tbody>';
        users.forEach(user => {
            html += `<tr data-id="${user.ID}">
                <td>${user.ID}</td>
                <td contenteditable="true" class="editable" data-field="vorname">${user.vorname}</td>
                <td contenteditable="true" class="editable" data-field="Nachname">${user.Nachname}</td>
                <td contenteditable="true" class="editable" data-field="PLZ">${user.PLZ}</td>
                <td contenteditable="true" class="editable" data-field="ORT">${user.ORT}</td>
                <td><button class="btn btn-danger btn-sm delete-btn">Delete</button></td>
            </tr>`;
        });
        html += '</tbody></table>';

        // Add export button
        let exportBtnHtml = '<button id="exportCsvBtn" class="btn btn-outline-primary mb-3">Export CSV</button>';
        tableContainer.innerHTML = formHtml + exportBtnHtml + html;

        // Export button handler
        const exportBtn = document.getElementById('exportCsvBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                window.open('export_users.php', '_blank');
            });
        }

        // Add user form handler
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(addUserForm);
                const data = {};
                formData.forEach((value, key) => { data[key] = value; });
                fetch('add_user.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(res => {
                    if (res.success) {
                        addUserForm.reset();
                        fetchUsers();
                    } else {
                        alert('Add failed: ' + (res.message || 'Unknown error'));
                    }
                })
                .catch(() => {
                    alert('Add failed.');
                });
            });
        }

        // Sorting
        tableContainer.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', function() {
                const col = this.getAttribute('data-sort');
                if (currentSort.column === col) {
                    currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.column = col;
                    currentSort.order = 'asc';
                }
                fetchUsers();
            });
        });

        // Inline editing
        tableContainer.querySelectorAll('.editable').forEach(cell => {
            cell.addEventListener('blur', function() {
                const tr = this.closest('tr');
                const id = tr.getAttribute('data-id');
                const field = this.getAttribute('data-field');
                const value = this.textContent.trim();
                // Gather all fields for update
                const updated = {
                    ID: id,
                    vorname: tr.querySelector('[data-field="vorname"]').textContent.trim(),
                    Nachname: tr.querySelector('[data-field="Nachname"]').textContent.trim(),
                    PLZ: tr.querySelector('[data-field="PLZ"]').textContent.trim(),
                    ORT: tr.querySelector('[data-field="ORT"]').textContent.trim()
                };
                fetch('update_user.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated)
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        alert('Update failed: ' + (data.message || 'Unknown error'));
                        fetchUsers();
                    }
                })
                .catch(() => {
                    alert('Update failed.');
                    fetchUsers();
                });
            });
        });

        // Deleting
        tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!confirm('Delete this user?')) return;
                const tr = this.closest('tr');
                const id = tr.getAttribute('data-id');
                fetch('delete_user.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ID: id })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        fetchUsers();
                    } else {
                        alert('Delete failed: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(() => {
                    alert('Delete failed.');
                });
            });
        });
    }

    // Listen for tab shown event
    const managementTabBtn = document.querySelector('button[data-bs-target="#management"]');
    if (managementTabBtn) {
        managementTabBtn.addEventListener('shown.bs.tab', fetchUsers);
    }
});
