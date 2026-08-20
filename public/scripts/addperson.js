// Create and inject the add-item modal into the page
function createAddItemModal() {
    const modalHTML = `
    <div id="addItemModal" class="modal hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Item</h2>
                <button class="close-btn" onclick="closeAddItemModal()">&times;</button>
            </div>
            <form id="addItemForm" onsubmit="submitAddItem(event)">
                <div class="form-group">
                    <label for="itemUser">Username: <span class="required">*</span></label>
                    <select id="itemUser" required>
                        <option value="">Select a username</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="itemName">Item Name: <span class="required">*</span></label>
                    <input type="text" id="itemName" placeholder="e.g., GPU Sag Bracket" required>
                </div>

                <div class="form-group">
                    <label for="itemAmount">Amount ($): <span class="required">*</span></label>
                    <input type="number" id="itemAmount" placeholder="e.g., 25.00" step="0.01" min="0">
                    <label class="checkbox-label">
                        <input type="checkbox" id="unknownAmount"> Unknown Amount
                    </label>
                </div>

                <div class="form-group">
                    <label for="itemBio">Short Description: <span class="required">*</span></label>
                    <textarea id="itemBio" placeholder="Brief description of the item" rows="2" required></textarea>
                </div>

                <div class="form-group">
                    <label for="itemLongBio">Long Description:</label>
                    <textarea id="itemLongBio" placeholder="Why you want this item (optional)" rows="3"></textarea>
                </div>

                <div class="form-group">
                    <label for="itemImages">Upload Images: <span class="hint">(JPEG, PNG, GIF, WebP)</span></label>
                    <input type="file" id="itemImages" accept="image/*" multiple>
                    <small style="color: #aaa; margin-top: 5px;">📤 Click to select images or Ctrl+V to paste from clipboard</small>
                    <div id="imagePreviewContainer" style="display: none; margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px;"></div>
                </div>

                <div class="form-group">
                    <label for="itemLink">Purchase Link:</label>
                    <input type="text" id="itemLink" placeholder="e.g., https://amazon.com/...">
                </div>

                <div class="form-actions">
                    <button type="button" class="btn-cancel" onclick="closeAddItemModal()">Cancel</button>
                    <button type="submit" class="btn-submit">Add Item</button>
                </div>
            </form>
        </div>
    </div>
    `;

    // Inject modal into body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);

    // Load usernames into the select dropdown
    loadUsernames();

    // Handle unknown amount checkbox
    const unknownCheckbox = document.getElementById('unknownAmount');
    const itemAmountInput = document.getElementById('itemAmount');

    unknownCheckbox.addEventListener('change', (e) => {
        itemAmountInput.disabled = e.target.checked;
        if (e.target.checked) {
            itemAmountInput.value = '';
        }
    });

    // Handle image preview
    const imageInput = document.getElementById('itemImages');
    const previewContainer = document.getElementById('imagePreviewContainer');

    imageInput.addEventListener('change', (e) => {
        previewContainer.innerHTML = '';
        if (e.target.files && e.target.files.length > 0) {
            previewContainer.style.display = 'flex';
            Array.from(e.target.files).forEach(file => {
                addImagePreview(file, previewContainer);
            });
        } else {
            previewContainer.style.display = 'none';
        }
    });

    // Handle paste image
   let addItemPasteListenerAdded = false;

function setupAddItemPasteListener() {
    if (addItemPasteListenerAdded) return;
    addItemPasteListenerAdded = true;

    document.addEventListener('paste', (e) => {
        const modal = document.getElementById('addItemModal');
        if (!modal || modal.classList.contains('hidden')) return;

        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (!file) continue;

                const dt = new DataTransfer();
                const existingFiles = document.getElementById('itemImages').files;
                for (const f of existingFiles) dt.items.add(f);
                dt.items.add(file);
                document.getElementById('itemImages').files = dt.files;

                const preview = document.getElementById('imagePreviewContainer');
                preview.style.display = 'flex';
                addImagePreview(file, preview);
                break;
            }
        }
    });
}

// Helper to add image preview
function addImagePreview(file, container) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.style.maxWidth = '80px';
        img.style.maxHeight = '80px';
        img.style.borderRadius = '5px';
        img.style.objectFit = 'cover';
        img.style.border = '2px solid #4a9eff';
        container.appendChild(img);
    };
    reader.readAsDataURL(file);
}

// Load usernames from person data
function loadUsernames() {
    const select = document.getElementById('itemUser');
    if (window.PERSONS && Array.isArray(window.PERSONS)) {
        window.PERSONS.forEach(person => {
            const option = document.createElement('option');
            option.value = person.username;
            option.textContent = person.username;
            if (activeUser && person.username === activeUser) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }
}

// Open the add-item modal
function openAddItemModal() {
    let modal = document.getElementById('addItemModal');
    if (!modal) {
        createAddItemModal();
        modal = document.getElementById('addItemModal');
    }
    if (modal) {
        modal.classList.remove('hidden');
    }
}
}
// Close the add-item modal
function closeAddItemModal() {
    const modal = document.getElementById('addItemModal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('addItemForm').reset();
        document.getElementById('unknownAmount').checked = false;
        document.getElementById('itemAmount').disabled = false;
        document.getElementById('imagePreviewContainer').innerHTML = '';
        document.getElementById('imagePreviewContainer').style.display = 'none';
    }
}

// Submit the add-item form
async function submitAddItem(event) {
    event.preventDefault();

    const user = document.getElementById('itemUser').value;
    const name = document.getElementById('itemName').value;
    const bio = document.getElementById('itemBio').value;
    const longBio = document.getElementById('itemLongBio').value;
    const itemLink = document.getElementById('itemLink').value;

    let amount;
    if (document.getElementById('unknownAmount').checked) {
        amount = 'unk';
    } else {
        amount = document.getElementById('itemAmount').value;
        if (!amount) {
            alert('Please enter an amount or check "Unknown Amount"');
            return;
        }
    }

    let uploadedImagePaths = [];
    const imageFiles = document.getElementById('itemImages').files;

    if (imageFiles && imageFiles.length > 0) {
        try {
            const btn = event.target.querySelector('.btn-submit');
            const originalText = btn.textContent;
            btn.textContent = '📤 Uploading images...';
            btn.disabled = true;

            const formData = new FormData();
            formData.append('amount', amount);
            Array.from(imageFiles).forEach(file => {
                formData.append('images', file);
            });

            const uploadResponse = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });

            const uploadResult = await uploadResponse.json();

            if (uploadResponse.ok) {
                uploadedImagePaths = uploadResult.paths;
            } else {
                throw new Error(uploadResult.error || 'Failed to upload images');
            }

            btn.textContent = originalText;
            btn.disabled = false;
        } catch (error) {
            console.error('Upload error:', error);
            alert(`❌ Failed to upload images: ${error.message}`);
            return;
        }
    }

    const itemData = {
        user,
        name,
        amount: amount === 'unk' ? 'unk' : parseFloat(amount),
        bio,
        longBio,
        imgUrl: uploadedImagePaths.length > 0 ? uploadedImagePaths[0] : '',
        images: uploadedImagePaths,
        link: itemLink
    };

    try {
        const response = await fetch('/api/add-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`✅ Item "${name}" added successfully!`);
            closeAddItemModal();
            if (!window.WISHLIST_ITEMS) window.WISHLIST_ITEMS = [];
            window.WISHLIST_ITEMS.push(itemData);
            location.reload();
        } else {
            alert(`❌ Error: ${result.error || 'Failed to add item'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Network error: Could not add item');
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    const modal = document.getElementById('addItemModal');
    if (modal && event.target === modal) {
        closeAddItemModal();
    }
});

// Initialize the modal immediately
document.addEventListener('DOMContentLoaded', createAddItemModal);