// Mock data for items
const mockItems = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Item Name ${i + 1}`,
    quantity: Math.floor(Math.random() * 100),
    price: Number((Math.random() * 100).toFixed(2)),
    image: '/placeholder.svg'
}));

let currentPage = 1;
let items = [...mockItems];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    showItemList(); // Default view
    updateTotalItems();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('prevPage')?.addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage')?.addEventListener('click', () => changePage(1));
    
    // Add navigation listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            const view = e.target.getAttribute('data-view');
            switch(view) {
                case 'create':
                    showCreateItemForm();
                    break;
                case 'import':
                    showImportCSV();
                    break;
                default:
                    showItemList();
            }
        });
    });
}

// Show Item List View
function showItemList() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Item List</h2>
            <span class="text-muted">Total (<span id="totalItems">0</span>)</span>
        </div>
        <div class="position-relative mb-4">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3"></i>
            <input type="text" id="searchInput" class="form-control ps-5" placeholder="Item to search">
        </div>
        <div class="row g-4" id="itemsGrid"></div>
    `;
    renderItems();
    setupEventListeners();
}

{/* <div class="pagination-container d-flex justify-content-between align-items-center">
<button class="btn btn-outline-primary" id="prevPage">Previous</button>
<span class="text-muted">Current Page: <span id="currentPage">1</span>/23</span>
<button class="btn btn-outline-primary" id="nextPage">Next</button>
</div> */}


// Show Create Item Form
function showCreateItemForm() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Create New Item</h2>
        </div>
        <form id="createItemForm" class="needs-validation" novalidate>
            <div class="mb-3">
                <label for="itemName" class="form-label">Item Name</label>
                <input type="text" class="form-control" id="itemName" required>
            </div>
            <div class="mb-3">
                <label for="itemQuantity" class="form-label">Quantity</label>
                <input type="number" class="form-control" id="itemQuantity" required min="0">
            </div>
            <div class="mb-3">
                <label for="itemPrice" class="form-label">Price</label>
                <input type="number" class="form-control" id="itemPrice" required min="0" step="0.01">
            </div>
            <div class="mb-3">
                <label for="itemImage" class="form-label">Image URL</label>
                <input type="url" class="form-control" id="itemImage" required>
            </div>
            <button type="submit" class="btn btn-primary">Create Item</button>
        </form>
    `;

    document.getElementById('createItemForm')?.addEventListener('submit', handleCreateItem);
}

// Show Import CSV View
function showImportCSV() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Import CSV Data</h2>
        </div>
        <div class="card p-4">
            <div class="mb-3">
                <label for="csvFile" class="form-label">Choose CSV File</label>
                <input type="file" class="form-control" id="csvFile" accept=".csv">
            </div>
            <div class="mb-3">
                <p class="text-muted">CSV should have the following columns:</p>
                <ul class="text-muted">
                    <li>name</li>
                    <li>quantity</li>
                    <li>price</li>
                    <li>image_url</li>
                </ul>
            </div>
            <button type="button" class="btn btn-primary" onclick="handleImportCSV()">Import Data</button>
        </div>
    `;
}

// Handle Create Item
function handleCreateItem(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const newItem = {
        id: items.length + 1,
        name: document.getElementById('itemName').value,
        quantity: parseInt(document.getElementById('itemQuantity').value),
        price: parseFloat(document.getElementById('itemPrice').value),
        image: document.getElementById('itemImage').value
    };

    items.unshift(newItem);
    showToast('Item Created', 'New item has been created successfully.', 'success');
    showItemList();
}

// Handle Import CSV
function handleImportCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Error', 'Please select a CSV file.', 'danger');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const rows = text.split('\n');
            const headers = rows[0].split(',');
            
            // Simple validation
            if (!headers.includes('name') || !headers.includes('quantity') || !headers.includes('price')) {
                throw new Error('Invalid CSV format');
            }

            showToast('Success', 'CSV data imported successfully.', 'success');
            showItemList();
        } catch (error) {
            showToast('Error', 'Failed to import CSV: ' + error.message, 'danger');
        }
    };
    reader.readAsText(file);
}

function renderItems() {
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = items.map(item => `
        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
            <div class="card item-card h-100">
                <img src="${item.image}" class="card-img-top item-image" alt="${item.name}">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">
                        Quantity: ${item.quantity}<br>
                        Price: $${item.price.toFixed(2)}
                    </p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary flex-grow-1" onclick="handleUpdate(${item.id})">Update</button>
                        <button class="btn btn-danger flex-grow-1" onclick="handleRemove(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    items = mockItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
    );
    renderItems();
    updateTotalItems();
}

// Handle pagination
function changePage(delta) {
    currentPage = Math.max(1, currentPage + delta);
    document.getElementById('currentPage').textContent = currentPage;
    renderItems();
}

// Update total items count
function updateTotalItems() {
    document.getElementById('totalItems').textContent = items.length;
}

// Handle update item
function handleUpdate(id) {
    showToast('Item Updated', `Item ${id} has been updated successfully.`, 'success');
}

// Handle remove item
function handleRemove(id) {
    items = items.filter(item => item.id !== id);
    renderItems();
    updateTotalItems();
    showToast('Item Removed', `Item ${id} has been removed successfully.`, 'danger');
}

// Show toast notification
function showToast(title, message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    const toastHtml = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}
