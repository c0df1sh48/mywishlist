/* =========================================================
   MYWISHLIST EDIT PAGE
   ========================================================= */

console.log("========================================");
console.log("🔧 edit.js LOADED");
console.log("========================================");


/* =========================================================
   STATE
========================================================= */

let editCurrentUser = null;
let editCurrentMode = null;

/*
    null = ADDING a new item
    number = EDITING an existing item
*/
let editCurrentItemIndex = null;

let editCurrentProfileIndex = null;

/* =========================================================
   ITEM IMAGE EDITOR STATE
========================================================= */

/*
    Each image is stored as either:

    {
        type: "existing",
        path: "/uploads/example.jpg"
    }

    OR

    {
        type: "new",
        file: File,
        previewUrl: "blob:..."
    }
*/

let editItemImageState = [];

/* =========================================================
   DEBUG
========================================================= */

function editDebug(message, data = null) {

    if (data !== null) {
        console.log("[EDIT]", message, data);
    } else {
        console.log("[EDIT]", message);
    }

}


/* =========================================================
   URL
========================================================= */

function getEditURLParams() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const user =
        params.get("user");

    const mode =
        params.get("mode");

    console.log("========================================");
    console.log("🔍 EDIT URL");
    console.log("========================================");
    console.log("Full URL:", window.location.href);
    console.log("User:", user);
    console.log("Mode:", mode);

    return {
        user,
        mode
    };

}


/* =========================================================
   INITIALIZE ITEM EDITOR
========================================================= */

function initializeItemEditor() {

    console.log("========================================");
    console.log("🛒 INITIALIZE ITEM EDITOR");
    console.log("========================================");

    const params =
        getEditURLParams();

    editCurrentUser =
        params.user;

    editCurrentMode =
        params.mode || "items";


    if (!window.PERSONS ||
        !Array.isArray(window.PERSONS)) {

        console.error(
            "❌ window.PERSONS is missing!"
        );

        return;
    }


    if (!window.WISHLIST_ITEMS ||
        !Array.isArray(window.WISHLIST_ITEMS)) {

        console.error(
            "❌ window.WISHLIST_ITEMS is missing!"
        );

        return;
    }


    console.log(
        "📦 PERSONS:",
        window.PERSONS
    );

    console.log(
        "📦 WISHLIST_ITEMS:",
        window.WISHLIST_ITEMS
    );


    /* ---------------------------------------------------------
       Find current user
    --------------------------------------------------------- */

    let person =
        window.PERSONS.find(
            p =>
                String(p.username).toLowerCase() ===
                String(editCurrentUser).toLowerCase()
        );


    if (!person && window.PERSONS.length > 0) {

        person =
            window.PERSONS[0];

        editCurrentUser =
            person.username;

    }


    if (!person) {

        console.error(
            "❌ No profiles exist."
        );

        return;
    }


    /* ---------------------------------------------------------
       Page title
    --------------------------------------------------------- */

    const title =
        document.getElementById(
            "editPageTitle"
        );

    const description =
        document.getElementById(
            "editPageDescription"
        );


    if (title) {
        title.textContent =
            "Edit Items";
    }


    if (description) {

        description.textContent =
            "Editing wishlist for " +
            person.username +
            ".";

    }


    /* ---------------------------------------------------------
       Profile dropdown
    --------------------------------------------------------- */

    const select =
        document.getElementById(
            "itemUserSelect"
        );


    if (!select) {

        console.error(
            "❌ itemUserSelect does not exist!"
        );

        return;
    }


    select.innerHTML = "";


    window.PERSONS.forEach(
        person => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                person.username;

            option.textContent =
                person.username;

            select.appendChild(
                option
            );

        }
    );


    select.value =
        person.username;


    /* ---------------------------------------------------------
       Profile changed
    --------------------------------------------------------- */

    select.onchange =
        function () {

            console.log(
                "👤 Profile changed:",
                this.value
            );

            editCurrentUser =
                this.value;

            renderItemsForUser(
                this.value
            );

        };


    /* ---------------------------------------------------------
       Render
    --------------------------------------------------------- */

    renderItemsForUser(
        person.username
    );

}


/* =========================================================
   GET ITEMS FOR USER
========================================================= */

function getItemsForUser(username) {

    if (!Array.isArray(window.WISHLIST_ITEMS)) {
        return [];
    }


    return window.WISHLIST_ITEMS.filter(
        item => {

            if (!item) {
                return false;
            }

            return (
                String(item.user).toLowerCase() ===
                String(username).toLowerCase()
            );

        }
    );

}


/* =========================================================
   SORT ITEMS
========================================================= */

function sortItemsByPrice(items) {

    return [...items].sort(
        (a, b) => {

            const aUnknown =
                a.amount === "unk" ||
                a.amount === "" ||
                a.amount === null ||
                a.amount === undefined;


            const bUnknown =
                b.amount === "unk" ||
                b.amount === "" ||
                b.amount === null ||
                b.amount === undefined;


            if (aUnknown && !bUnknown) {
                return 1;
            }


            if (!aUnknown && bUnknown) {
                return -1;
            }


            if (aUnknown && bUnknown) {
                return 0;
            }


            return (
                Number(a.amount) -
                Number(b.amount)
            );

        }
    );

}


/* =========================================================
   RENDER USER ITEMS
========================================================= */

function renderItemsForUser(username) {

    console.log("========================================");
    console.log("🛒 RENDERING ITEMS");
    console.log("========================================");
    console.log("👤 User:", username);


    editCurrentUser =
        username;


    const list =
        document.getElementById(
            "itemEditorList"
        );

    const listSection =
        document.getElementById(
            "itemListSection"
        );

    const emptyMessage =
        document.getElementById(
            "noItemsMessage"
        );

    const count =
        document.getElementById(
            "itemCount"
        );

    const selectedName =
        document.getElementById(
            "selectedPersonName"
        );


    if (!list) {

        console.error(
            "❌ itemEditorList not found!"
        );

        return;
    }


    let items =
        getItemsForUser(
            username
        );


    items =
        sortItemsByPrice(
            items
        );


    if (selectedName) {

        selectedName.textContent =
            username +
            "'s Items";

    }


    if (count) {

        count.textContent =
            items.length +
            (
                items.length === 1
                    ? " item"
                    : " items"
            );

    }


    list.innerHTML = "";


    if (emptyMessage) {

        emptyMessage.classList.toggle(
            "hidden",
            items.length !== 0
        );

    }


    /* ---------------------------------------------------------
       Add Item button
    --------------------------------------------------------- */

    const addButton =
        document.createElement(
            "button"
        );

    addButton.type =
        "button";

    addButton.className =
        "editor-button primary add-item-button";

    addButton.textContent =
        "＋ Add Item";

    addButton.addEventListener(
        "click",
        () => {

            openAddItemEditor();

        }
    );


    list.appendChild(
        addButton
    );


    /* ---------------------------------------------------------
       Render cards
    --------------------------------------------------------- */

    items.forEach(
        item => {

            const originalIndex =
                window.WISHLIST_ITEMS.indexOf(
                    item
                );


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "edit-item-card";


            let price;


            if (
                item.amount === "unk" ||
                item.amount === "" ||
                item.amount === null ||
                item.amount === undefined
            ) {

                price =
                    "Unknown";

            } else {

                price =
                    "$" +
                    Number(item.amount)
                        .toFixed(2);

            }


            card.innerHTML = `

                <div class="edit-item-info">

                    <div class="edit-item-name">
                        ${escapeEditHTML(
                            item.name ||
                            "Unnamed Item"
                        )}
                    </div>

                    <div class="edit-item-meta">
                        ${price}
                    </div>

                </div>

                <button
                    type="button"
                    class="editor-button primary edit-item-button"
                >
                    Edit
                </button>

            `;


            const button =
                card.querySelector(
                    ".edit-item-button"
                );


            button.addEventListener(
                "click",
                () => {

                    openItemEditor(
                        originalIndex
                    );

                }
            );


            list.appendChild(
                card
            );

        }
    );


    listSection?.classList.remove(
        "hidden"
    );


    console.log(
        "✅ Rendered",
        items.length,
        "items."
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeEditHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   POPULATE USER DROPDOWN
========================================================= */

function populateItemUserDropdown(
    selectedUser
) {

    const userSelect =
        document.getElementById(
            "editItemUser"
        );


    if (!userSelect) {
        return;
    }


    userSelect.innerHTML = "";


    window.PERSONS.forEach(
        person => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                person.username;

            option.textContent =
                person.username;


            if (
                String(person.username).toLowerCase() ===
                String(selectedUser).toLowerCase()
            ) {

                option.selected =
                    true;

            }


            userSelect.appendChild(
                option
            );

        }
    );

}

/* =========================================================
   ITEM IMAGE PREVIEW
========================================================= */

function renderEditItemImages() {

    const preview =
        document.getElementById(
            "editImagePreviewContainer"
        );

    if (!preview) {
        return;
    }


    preview.innerHTML = "";


    if (!editItemImageState.length) {

        return;

    }


    editItemImageState.forEach(
        (image, index) => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "edit-image-preview-item";


            const img =
                document.createElement(
                    "img"
                );


            if (image.type === "new") {

                img.src =
                    image.previewUrl;

            } else {

                img.src =
                    image.path;

            }


            img.alt =
                "Item image";


            img.className =
                "edit-image-preview";


            /* -------------------------------------------------
               Delete button
            ------------------------------------------------- */

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";

            deleteButton.className =
                "edit-image-delete-button";

            deleteButton.textContent =
                "🗑️";


            deleteButton.title =
                "Delete image";

            deleteButton.setAttribute(
                "aria-label",
                "Delete image"
            );


            deleteButton.addEventListener(
                "click",
                () => {

                    removeEditItemImage(
                        index
                    );

                }
            );


            wrapper.appendChild(
                img
            );

            wrapper.appendChild(
                deleteButton
            );


            preview.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   REMOVE ITEM IMAGE
========================================================= */

function removeEditItemImage(index) {

    if (
        index < 0 ||
        index >= editItemImageState.length
    ) {

        return;

    }


    const image =
        editItemImageState[index];


    console.log(
        "🗑️ Removing item image:",
        image
    );


    /*
        Release the temporary browser URL
        for newly selected files.
    */

    if (
        image &&
        image.type === "new" &&
        image.previewUrl
    ) {

        URL.revokeObjectURL(
            image.previewUrl
        );

    }


    editItemImageState.splice(
        index,
        1
    );


    renderEditItemImages();

}


/* =========================================================
   INITIALIZE ITEM IMAGE UPLOAD
========================================================= */

function initializeItemImagePreview() {

    const input =
        document.getElementById(
            "editItemImages"
        );


    if (!input) {

        console.error(
            "❌ editItemImages input not found."
        );

        return;

    }


    /*
        Prevent adding the same event listener
        more than once.
    */

    if (
        input.dataset.imagePreviewInitialized ===
        "true"
    ) {

        return;

    }


    input.dataset.imagePreviewInitialized =
        "true";


    input.addEventListener(
        "change",
        () => {

            const files =
                Array.from(
                    input.files || []
                );


            if (!files.length) {

                return;

            }


            console.log(
                "🖼️ New images selected:",
                files
            );


            files.forEach(
                file => {

                    /*
                        Only accept actual image files.
                    */

                    if (
                        !file.type ||
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        return;

                    }


                    const previewUrl =
                        URL.createObjectURL(
                            file
                        );


                    editItemImageState.push({

                        type:
                            "new",

                        file,

                        previewUrl

                    });

                }
            );


            /*
                Show images immediately.
            */

            renderEditItemImages();


            /*
                Clear the input so the same file
                can be selected again later if needed.
            */

            input.value = "";

        }
    );

}
/* =========================================================
   OPEN ITEM EDITOR
========================================================= */

function openItemEditor(index) {

    console.log(
        "✏️ Opening item:",
        index
    );


    const item =
        window.WISHLIST_ITEMS[index];


    if (!item) {

        console.error(
            "❌ Item not found:",
            index
        );

        return;
    }


    editCurrentItemIndex =
        index;


    document
        .getElementById(
            "itemsEditor"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "itemFormSection"
        )
        ?.classList.remove(
            "hidden"
        );


    populateItemUserDropdown(
        item.user
    );


    const name =
        document.getElementById(
            "editItemName"
        );

    const bio =
        document.getElementById(
            "editItemBio"
        );

    const longBio =
        document.getElementById(
            "editItemLongBio"
        );

    const link =
        document.getElementById(
            "editItemLink"
        );

    const amount =
        document.getElementById(
            "editItemAmount"
        );

    const unknown =
        document.getElementById(
            "editUnknownAmount"
        );


    if (name) {
        name.value =
            item.name || "";
    }


    if (bio) {
        bio.value =
            item.bio || "";
    }


    if (longBio) {
        longBio.value =
            item.longBio || "";
    }


    if (link) {
        link.value =
            item.link || "";
    }


    if (item.amount === "unk") {

        if (unknown) {
            unknown.checked =
                true;
        }


        if (amount) {

            amount.value =
                "";

            amount.disabled =
                true;

        }

    } else {

        if (unknown) {
            unknown.checked =
                false;
        }


        if (amount) {

            amount.value =
                item.amount ?? "";

            amount.disabled =
                false;

        }

    }


    const preview =
        document.getElementById(
            "editImagePreviewContainer"
        );


    if (preview) {

        preview.innerHTML = "";


        const images =
            Array.isArray(item.images)
                ? item.images
                : item.imgUrl
                    ? [item.imgUrl]
                    : [];


        images.forEach(
            path => {

                const img =
                    document.createElement(
                        "img"
                    );

                img.src =
                    path;

                img.alt =
                    "Item image";

                preview.appendChild(
                    img
                );

            }
        );

    }


    const files =
        document.getElementById(
            "editItemImages"
        );


    if (files) {
        files.value = "";
    }


    const title =
        document.getElementById(
            "itemFormTitle"
        );


    if (title) {

        title.textContent =
            "Edit " +
            (
                item.name ||
                "Item"
            );

    }


    const deleteButton =
        document.getElementById(
            "deleteItemButton"
        );


    if (deleteButton) {
        deleteButton.style.display =
            "";
    }


    const saveButton =
        document.getElementById(
            "saveItemButton"
        );


    if (saveButton) {
        saveButton.textContent =
            "Save Changes";
    }


    const status =
        document.getElementById(
            "itemFormStatus"
        );


    if (status) {
        status.textContent = "";
    }


    console.log(
        "✅ Item editor populated."
    );

}


/* =========================================================
   ADD ITEM
========================================================= */

function openAddItemEditor() {

    console.log("========================================");
    console.log("➕ ADD ITEM");
    console.log("========================================");


    editCurrentItemIndex =
        null;


    /*
        Reset image state.
    */

    editItemImageState = [];


    document
        .getElementById(
            "itemsEditor"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "itemFormSection"
        )
        ?.classList.remove(
            "hidden"
        );


    populateItemUserDropdown(
        editCurrentUser
    );


    const name =
        document.getElementById(
            "editItemName"
        );

    const bio =
        document.getElementById(
            "editItemBio"
        );

    const longBio =
        document.getElementById(
            "editItemLongBio"
        );

    const link =
        document.getElementById(
            "editItemLink"
        );

    const amount =
        document.getElementById(
            "editItemAmount"
        );

    const unknown =
        document.getElementById(
            "editUnknownAmount"
        );

    const files =
        document.getElementById(
            "editItemImages"
        );


    if (name) {

        name.value =
            "";

    }


    if (bio) {

        bio.value =
            "";

    }


    if (longBio) {

        longBio.value =
            "";

    }


    if (link) {

        link.value =
            "";

    }


    if (amount) {

        amount.value =
            "";

        amount.disabled =
            false;

    }


    if (unknown) {

        unknown.checked =
            false;

    }


    if (files) {

        files.value =
            "";

    }


    renderEditItemImages();


    /* ---------------------------------------------------------
       Title
    --------------------------------------------------------- */

    const title =
        document.getElementById(
            "itemFormTitle"
        );


    if (title) {

        title.textContent =
            "Add Item";

    }


    /* ---------------------------------------------------------
       Delete button
    --------------------------------------------------------- */

    const deleteButton =
        document.getElementById(
            "deleteItemButton"
        );


    if (deleteButton) {

        deleteButton.style.display =
            "none";

    }


    /* ---------------------------------------------------------
       Save button
    --------------------------------------------------------- */

    const saveButton =
        document.getElementById(
            "saveItemButton"
        );


    if (saveButton) {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Add Item";

    }


    /* ---------------------------------------------------------
       Status
    --------------------------------------------------------- */

    const status =
        document.getElementById(
            "itemFormStatus"
        );


    if (status) {

        status.textContent =
            "";

    }


    console.log(
        "✅ Add item editor ready."
    );

}

/* =========================================================
   SHOW ITEM LIST
========================================================= */

function showItemList() {

    console.log(
        "↩️ Returning to item list"
    );


    document
        .getElementById(
            "itemFormSection"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "itemsEditor"
        )
        ?.classList.remove(
            "hidden"
        );


    editCurrentItemIndex =
        null;


    if (editCurrentUser) {

        renderItemsForUser(
            editCurrentUser
        );

    }

}


/* =========================================================
   SAVE ITEM
========================================================= */

async function saveItem() {

    console.log("========================================");
    console.log("💾 SAVE ITEM");
    console.log("========================================");


    const index =
        editCurrentItemIndex;


    const isAdding =
        index === null ||
        index === undefined;


    let item = null;


    if (!isAdding) {

        item =
            window.WISHLIST_ITEMS[index];


        if (!item) {

            console.error(
                "❌ Original item not found:",
                index
            );

            return;
        }

    }


    const user =
        document.getElementById(
            "editItemUser"
        )?.value;


    const name =
        document.getElementById(
            "editItemName"
        )?.value.trim();


    const bio =
        document.getElementById(
            "editItemBio"
        )?.value.trim();


    const longBio =
        document.getElementById(
            "editItemLongBio"
        )?.value.trim();


    const link =
        document.getElementById(
            "editItemLink"
        )?.value.trim();


    const unknown =
        document.getElementById(
            "editUnknownAmount"
        )?.checked;


    const amountInput =
        document.getElementById(
            "editItemAmount"
        );


    if (!user || !name || !bio) {

        alert(
            "Please fill in all required fields."
        );

        return;
    }


    /* =====================================================
       PRICE
    ===================================================== */

    let amount;


    if (unknown) {

        amount = "unk";

    } else {

        amount =
            amountInput?.value;


        if (
            amount === "" ||
            amount === null ||
            amount === undefined
        ) {

            alert(
                "Please enter a price or select Unknown price."
            );

            return;
        }


        amount =
            parseFloat(
                amount
            );


        if (Number.isNaN(amount)) {

            alert(
                "Please enter a valid price."
            );

            return;
        }

    }


    /* =====================================================
       OLD IMAGES
    ===================================================== */

    const oldImagePaths =
        !isAdding
            ? (
                Array.isArray(item.images)
                    ? [...item.images]
                    : item.imgUrl
                        ? [item.imgUrl]
                        : []
            )
            : [];


    /*
        These are the images currently being kept
        in the editor.
    */

    let imagePaths =
        !isAdding
            ? getCurrentEditImagePaths()
            : [];


    console.log(
        "🖼️ Existing images:",
        oldImagePaths
    );

    console.log(
        "🖼️ Images being kept:",
        imagePaths
    );


    /* =====================================================
       NEW IMAGE FILES
    ===================================================== */

    const imageFiles =
        document.getElementById(
            "editItemImages"
        )?.files;


    const saveButton =
        document.getElementById(
            "saveItemButton"
        );


    const status =
        document.getElementById(
            "itemFormStatus"
        );


    try {

        /* =================================================
           UPLOAD NEW IMAGES
        ================================================= */

        if (
            imageFiles &&
            imageFiles.length > 0
        ) {

            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Uploading...";

            }


            const formData =
                new FormData();


            Array.from(
                imageFiles
            ).forEach(
                file => {

                    formData.append(
                        "images",
                        file
                    );

                }
            );


            const uploadResponse =
                await fetch(
                    "/api/upload-image",
                    {
                        method:
                            "POST",

                        body:
                            formData
                    }
                );


            const uploadResult =
                await uploadResponse.json();


            if (!uploadResponse.ok) {

                throw new Error(
                    uploadResult.error ||
                    "Image upload failed."
                );

            }


            const uploadedPaths =
                uploadResult.paths ||
                [];


            /*
                New uploads are added to the
                images we're keeping.
            */

            imagePaths =
                imagePaths.concat(
                    uploadedPaths
                );


            console.log(
                "📤 New uploaded images:",
                uploadedPaths
            );

        }


        /* =================================================
           CREATE ITEM
        ================================================= */

        const newItem = {

            user,

            name,

            amount,

            bio,

            longBio,

            link,

            imgUrl:
                imagePaths.length
                    ? imagePaths[0]
                    : "",

            images:
                imagePaths

        };


        const updatedItem =
            isAdding
                ? newItem
                : {
                    ...item,
                    ...newItem
                };


        /* =================================================
           SAVE ITEM TO SERVER
        ================================================= */

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                isAdding
                    ? "Adding..."
                    : "Saving...";

        }


        const endpoint =
            isAdding
                ? "/api/add-item"
                : "/api/edit-item";


        const body =
            isAdding
                ? {
                    item:
                        updatedItem
                }
                : {
                    index,

                    item:
                        updatedItem
                };


        console.log(
            "📡 Sending:",
            endpoint,
            body
        );


        const response =
            await fetch(
                endpoint,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            body
                        )
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                (
                    isAdding
                        ? "Failed to add item."
                        : "Failed to save item."
                )
            );

        }


        /* =================================================
           DELETE OLD IMAGES THAT ARE NO LONGER USED
        ================================================= */

        if (!isAdding) {

            const imagesToDelete =
                oldImagePaths.filter(
                    oldPath =>
                        !imagePaths.includes(
                            oldPath
                        )
                );


            if (
                imagesToDelete.length > 0
            ) {

                console.log(
                    "🗑️ Removing old images:",
                    imagesToDelete
                );


                try {

                    const deleteResponse =
                        await fetch(
                            "/api/delete-images",
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        paths:
                                            imagesToDelete
                                    })
                            }
                        );


                    const deleteResult =
                        await deleteResponse.json();


                    if (!deleteResponse.ok) {

                        console.warn(
                            "⚠️ Some old images could not be deleted:",
                            deleteResult
                        );

                    } else {

                        console.log(
                            "✅ Old images deleted:",
                            deleteResult
                        );

                    }

                }
                catch (deleteError) {

                    /*
                        Don't fail the whole save if
                        the item itself was successfully
                        saved.
                    */

                    console.warn(
                        "⚠️ Image cleanup failed:",
                        deleteError
                    );

                }

            }

        }


        /* =================================================
           UPDATE LOCAL DATA
        ================================================= */

        if (isAdding) {

            const serverItem =
                result.item ||
                updatedItem;


            window.WISHLIST_ITEMS.push(
                serverItem
            );


            console.log(
                "✅ Item added:",
                serverItem
            );

        } else {

            window.WISHLIST_ITEMS[index] =
                updatedItem;


            console.log(
                "✅ Item updated:",
                updatedItem
            );

        }


        /* =================================================
           SUCCESS
        ================================================= */

        if (status) {

            status.textContent =
                isAdding
                    ? "✓ Item added successfully."
                    : "✓ Changes saved successfully.";

            status.style.color =
                "#2ecc71";

        }


        setTimeout(
            () => {

                showItemList();

            },
            700
        );


    }
    catch (error) {

        console.error(
            "❌ Save item error:",
            error
        );


        if (status) {

            status.textContent =
                "Error: " +
                error.message;

            status.style.color =
                "#e05252";

        }

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                isAdding
                    ? "Add Item"
                    : "Save Changes";

        }

    }

}
/* =========================================================
   ITEM IMAGE EDITOR
========================================================= */


/*
    Get the images currently being kept.

    Images that have been removed from the preview
    are no longer returned here.
*/

function getCurrentEditImagePaths() {

    const container =
        document.getElementById(
            "editImagePreviewContainer"
        );


    if (!container) {
        return [];
    }


    const imageElements =
        container.querySelectorAll(
            ".edit-existing-image"
        );


    return Array.from(
        imageElements
    )
        .map(
            image =>
                image.dataset.path
        )
        .filter(
            Boolean
        );

}


/* =========================================================
   RENDER IMAGE PREVIEW
========================================================= */

function renderEditItemImages() {

    const container =
        document.getElementById(
            "editImagePreviewContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const index =
        editCurrentItemIndex;


    /*
        Adding a new item has no existing images.
    */

    if (
        index === null ||
        index === undefined
    ) {

        return;
    }


    const item =
        window.WISHLIST_ITEMS[index];


    if (!item) {
        return;
    }


    let images =
        Array.isArray(item.images)
            ? item.images
            : item.imgUrl
                ? [item.imgUrl]
                : [];


    if (!images.length) {
        return;
    }


    images.forEach(
        imagePath => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "edit-image-preview";


            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "edit-existing-image";


            image.dataset.path =
                imagePath;


            image.src =
                imagePath;


            image.alt =
                "Item image";


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "edit-image-delete";


            deleteButton.textContent =
                "×";


            deleteButton.title =
                "Remove image";


            deleteButton.addEventListener(
                "click",
                () => {

                    removeEditItemImage(
                        wrapper
                    );

                }
            );


            wrapper.appendChild(
                image
            );


            wrapper.appendChild(
                deleteButton
            );


            container.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   REMOVE EXISTING IMAGE FROM EDITOR
========================================================= */

function removeEditItemImage(
    wrapper
) {

    if (!wrapper) {
        return;
    }


    const image =
        wrapper.querySelector(
            ".edit-existing-image"
        );


    if (!image) {
        return;
    }


    const imagePath =
        image.dataset.path;


    console.log(
        "🗑️ Marking image for deletion:",
        imagePath
    );


    /*
        IMPORTANT:

        We do NOT delete the actual server file yet.

        The file is deleted only after the item
        successfully saves.

        That means pressing Cancel won't
        accidentally destroy the image.
    */

    wrapper.remove();

}


/* =========================================================
   NEW IMAGE PREVIEW
========================================================= */

function initializeItemImageEditor() {

    const input =
        document.getElementById(
            "editItemImages"
        );


    const container =
        document.getElementById(
            "editImagePreviewContainer"
        );


    if (!input || !container) {
        return;
    }


    input.addEventListener(
        "change",
        () => {

            /*
                Selecting new images replaces
                the existing images visually.

                The actual old files are deleted
                when Save is pressed.
            */

            container.innerHTML = "";


            const files =
                Array.from(
                    input.files || []
                );


            files.forEach(
                file => {

                    const wrapper =
                        document.createElement(
                            "div"
                        );


                    wrapper.className =
                        "edit-image-preview";


                    const image =
                        document.createElement(
                            "img"
                        );


                    image.className =
                        "edit-new-image";


                    image.alt =
                        file.name;


                    image.src =
                        URL.createObjectURL(
                            file
                        );


                    const deleteButton =
                        document.createElement(
                            "button"
                        );


                    deleteButton.type =
                        "button";


                    deleteButton.className =
                        "edit-image-delete";


                    deleteButton.textContent =
                        "×";


                    deleteButton.title =
                        "Remove image";


                    deleteButton.addEventListener(
                        "click",
                        () => {

                            /*
                                Remove this file from
                                the FileList by creating
                                a new DataTransfer.
                            */

                            const currentFiles =
                                Array.from(
                                    input.files || []
                                );


                            const fileIndex =
                                currentFiles.indexOf(
                                    file
                                );


                            if (
                                fileIndex !== -1
                            ) {

                                currentFiles.splice(
                                    fileIndex,
                                    1
                                );

                            }


                            const dataTransfer =
                                new DataTransfer();


                            currentFiles.forEach(
                                remainingFile => {

                                    dataTransfer.items.add(
                                        remainingFile
                                    );

                                }
                            );


                            input.files =
                                dataTransfer.files;


                            wrapper.remove();


                            URL.revokeObjectURL(
                                image.src
                            );

                        }
                    );


                    wrapper.appendChild(
                        image
                    );


                    wrapper.appendChild(
                        deleteButton
                    );


                    container.appendChild(
                        wrapper
                    );

                }
            );

        }
    );


    /*
        Watch for the item editor opening.

        This lets us display existing images
        without having to modify openItemEditor().
    */

    const formSection =
        document.getElementById(
            "itemFormSection"
        );


    if (formSection) {

        const observer =
            new MutationObserver(
                () => {

                    if (
                        !formSection.classList.contains(
                            "hidden"
                        )
                    ) {

                        /*
                            Only render existing images
                            when there are no new files
                            selected.
                        */

                        if (
                            !input.files ||
                            input.files.length === 0
                        ) {

                            renderEditItemImages();

                        }

                    }

                }
            );


        observer.observe(
            formSection,
            {
                attributes:
                    true,

                attributeFilter:
                    ["class"]
            }
        );

    }

}
/* =========================================================
   UNKNOWN PRICE TOGGLE
========================================================= */

function initializeUnknownPriceToggle() {

    const checkbox =
        document.getElementById(
            "editUnknownAmount"
        );

    const amount =
        document.getElementById(
            "editItemAmount"
        );


    if (!checkbox || !amount) {
        return;
    }


    checkbox.addEventListener(
        "change",
        () => {

            amount.disabled =
                checkbox.checked;


            if (checkbox.checked) {

                amount.value =
                    "";

            }

        }
    );

}


/* =========================================================
   DELETE ITEM
========================================================= */

async function deleteItem() {

    const index =
        editCurrentItemIndex;


    if (
        index === null ||
        index === undefined
    ) {

        console.error(
            "❌ No item selected for deletion."
        );

        return;
    }


    const item =
        window.WISHLIST_ITEMS[index];


    if (!item) {

        console.error(
            "❌ Item not found:",
            index
        );

        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${item.name || "this item"}"?\n\nThis cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    const deleteButton =
        document.getElementById(
            "deleteItemButton"
        );


    try {

        if (deleteButton) {

            deleteButton.disabled =
                true;

            deleteButton.textContent =
                "Deleting...";

        }


        const response =
            await fetch(
                "/api/delete-item",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            index
                        })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to delete item."
            );

        }


        window.WISHLIST_ITEMS.splice(
            index,
            1
        );


        editCurrentItemIndex =
            null;


        showItemList();


    } catch (error) {

        console.error(
            "❌ Delete item error:",
            error
        );


        alert(
            "Could not delete the item.\n\n" +
            error.message
        );


    } finally {

        if (deleteButton) {

            deleteButton.disabled =
                false;

            deleteButton.textContent =
                "🗑️ Delete Item";

        }

    }

}


/* =========================================================
   PROFILE EDITOR
========================================================= */

function initializeProfileEditor() {

    console.log("========================================");
    console.log("👤 INITIALIZE PROFILE EDITOR");
    console.log("========================================");


    if (
        !window.PERSONS ||
        !Array.isArray(window.PERSONS)
    ) {

        console.error(
            "❌ window.PERSONS missing!"
        );

        return;
    }


    renderProfiles();

}


/* =========================================================
   RENDER PROFILES
========================================================= */

function renderProfiles() {

    const container =
        document.getElementById(
            "profileEditorList"
        );

    const count =
        document.getElementById(
            "profileCount"
        );

    const empty =
        document.getElementById(
            "noProfilesMessage"
        );


    if (!container) {

        console.error(
            "❌ profileEditorList missing!"
        );

        return;
    }


    container.innerHTML = "";


    if (count) {

        count.textContent =
            window.PERSONS.length +
            (
                window.PERSONS.length === 1
                    ? " profile"
                    : " profiles"
            );

    }


    if (!window.PERSONS.length) {

        empty?.classList.remove(
            "hidden"
        );

        return;
    }


    empty?.classList.add(
        "hidden"
    );


    window.PERSONS.forEach(
        (person, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "edit-profile-card";


            card.innerHTML = `

                <img
                    src="${escapeEditHTML(
                        person.pfp ||
                        "assets/images/defaultpfp.jpeg"
                    )}"
                    alt=""
                    class="edit-profile-image"
                >

                <div class="edit-profile-info">

                    <div class="edit-profile-name">
                        ${escapeEditHTML(
                            person.username
                        )}
                    </div>

                </div>

                <div class="edit-profile-actions">

                    <button
                        type="button"
                        class="editor-button primary edit-profile-button"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="editor-button danger delete-profile-button"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            /* -------------------------------------------------
               EDIT BUTTON
            ------------------------------------------------- */

            const editButton =
                card.querySelector(
                    ".edit-profile-button"
                );


            editButton.addEventListener(
                "click",
                () => {

                    openProfileEditor(
                        index
                    );

                }
            );


            /* -------------------------------------------------
               DELETE BUTTON
            ------------------------------------------------- */

            const deleteButton =
                card.querySelector(
                    ".delete-profile-button"
                );


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteProfile(
                        index
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}

/* =========================================================
   OPEN PROFILE EDITOR
========================================================= */

function openProfileEditor(index) {

    console.log("========================================");
    console.log("✏️ OPEN PROFILE EDITOR");
    console.log("========================================");
    console.log("Profile index:", index);


    const person =
        window.PERSONS[index];


    if (!person) {

        console.error(
            "❌ Profile not found:",
            index
        );

        return;
    }


    /* ---------------------------------------------------------
       Store current profile
    --------------------------------------------------------- */

    editCurrentProfileIndex =
        index;


    /* ---------------------------------------------------------
       Hide profile list
    --------------------------------------------------------- */

    document
        .getElementById("profilesEditor")
        ?.classList.add("hidden");


    /* ---------------------------------------------------------
       Show profile form
    --------------------------------------------------------- */

    document
        .getElementById("profileFormSection")
        ?.classList.remove("hidden");


    /* ---------------------------------------------------------
       Username
    --------------------------------------------------------- */

    const usernameInput =
        document.getElementById(
            "editUsername"
        );


    if (usernameInput) {

        usernameInput.value =
            person.username || "";

    }


    /* ---------------------------------------------------------
       Profile picture
    --------------------------------------------------------- */

    const preview =
        document.getElementById(
            "editPfpPreview"
        );


    if (preview) {

        preview.src =
            person.pfp ||
            "assets/images/defaultpfp.jpeg";

    }


    /* ---------------------------------------------------------
       Clear selected file
    --------------------------------------------------------- */

    const fileInput =
        document.getElementById(
            "editUserPfpFile"
        );


    if (fileInput) {

        fileInput.value =
            "";

    }


    /* ---------------------------------------------------------
       Form title
    --------------------------------------------------------- */

    const title =
        document.getElementById(
            "profileFormTitle"
        );


    if (title) {

        title.textContent =
            "Edit " +
            (person.username || "Profile");

    }


    /* ---------------------------------------------------------
       Clear status
    --------------------------------------------------------- */

    const status =
        document.getElementById(
            "profileFormStatus"
        );


    if (status) {

        status.textContent =
            "";

    }


    /* ---------------------------------------------------------
       Make sure save button is enabled
    --------------------------------------------------------- */

    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );


    if (saveButton) {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Save Changes";

    }


    console.log(
        "✅ Profile editor opened:",
        person.username
    );

}
/* =========================================================
   ADD PROFILE
========================================================= */

function openAddProfileEditor() {

    console.log("========================================");
    console.log("➕ ADD PROFILE");
    console.log("========================================");


    /* ---------------------------------------------------------
       Mark as new profile
    --------------------------------------------------------- */

    editCurrentProfileIndex = null;


    /* ---------------------------------------------------------
       Hide profile list
    --------------------------------------------------------- */

    document
        .getElementById("profilesEditor")
        ?.classList.add("hidden");


    /* ---------------------------------------------------------
       Show profile form
    --------------------------------------------------------- */

    document
        .getElementById("profileFormSection")
        ?.classList.remove("hidden");


    /* ---------------------------------------------------------
       Clear username
    --------------------------------------------------------- */

    const usernameInput =
        document.getElementById("editUsername");


    if (usernameInput) {

        usernameInput.value = "";

    }


    /* ---------------------------------------------------------
       Reset profile picture
    --------------------------------------------------------- */

    const preview =
        document.getElementById("editPfpPreview");


    if (preview) {

        preview.src =
            "assets/images/defaultpfp.jpeg";

    }


    /* ---------------------------------------------------------
       Clear selected file
    --------------------------------------------------------- */

    const fileInput =
        document.getElementById("editUserPfpFile");


    if (fileInput) {

        fileInput.value = "";

    }


    /* ---------------------------------------------------------
       Change title
    --------------------------------------------------------- */

    const title =
        document.getElementById("profileFormTitle");


    if (title) {

        title.textContent =
            "Add Profile";

    }


    /* ---------------------------------------------------------
       Clear status
    --------------------------------------------------------- */

    const status =
        document.getElementById("profileFormStatus");


    if (status) {

        status.textContent = "";

    }


    /* ---------------------------------------------------------
       Reset save button
    --------------------------------------------------------- */

    const saveButton =
        document.getElementById("saveProfileButton");


    if (saveButton) {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Add Profile";

    }


    console.log(
        "✅ Add profile editor ready."
    );

}
/* =========================================================
   DELETE PROFILE
========================================================= */

async function deleteProfile(index) {

    console.log(
        "🗑️ Deleting profile:",
        index
    );


    const person =
        window.PERSONS[index];


    if (!person) {

        console.error(
            "❌ Profile not found."
        );

        return;
    }


    const username =
        person.username;


    const confirmed =
        confirm(
            `Are you sure you want to delete the profile "${username}"?\n\nThis will also delete all wishlist items belonging to this profile.\n\nThis cannot be undone.`
        );


    if (!confirmed) {

        return;

    }


    try {

        const deleteButton =
            document.querySelector(
                `.delete-profile-button`
            );


        if (deleteButton) {

            deleteButton.disabled =
                true;

            deleteButton.textContent =
                "Deleting...";

        }


        const response =
            await fetch(
                "/api/delete-person",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            index
                        })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to delete profile."
            );

        }


        /* -------------------------------------------------
           Remove profile locally
        ------------------------------------------------- */

        window.PERSONS.splice(
            index,
            1
        );


        /* -------------------------------------------------
           Remove their wishlist items locally too
        ------------------------------------------------- */

        window.WISHLIST_ITEMS =
            window.WISHLIST_ITEMS.filter(
                item =>
                    String(item.user).toLowerCase() !==
                    String(username).toLowerCase()
            );


        console.log(
            "✅ Profile deleted:",
            username
        );


        renderProfiles();


    } catch (error) {

        console.error(
            "❌ Delete profile error:",
            error
        );


        alert(
            "Could not delete the profile.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   SHOW PROFILE LIST
========================================================= */

function showProfileList() {

    document
        .getElementById(
            "profileFormSection"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "profilesEditor"
        )
        ?.classList.remove(
            "hidden"
        );


    editCurrentProfileIndex =
        null;


    renderProfiles();

}


/* =========================================================
   DELETE PROFILE
========================================================= */

async function deleteProfile(index) {

    console.log("========================================");
    console.log("🗑️ DELETE PROFILE");
    console.log("========================================");


    if (
        index === null ||
        index === undefined
    ) {

        console.error(
            "❌ No profile selected."
        );

        return;
    }


    const person =
        window.PERSONS[index];


    if (!person) {

        console.error(
            "❌ Profile not found:",
            index
        );

        return;
    }


    /*
        Don't allow deleting the last profile.
    */

    if (window.PERSONS.length <= 1) {

        alert(
            "You cannot delete the only profile."
        );

        return;
    }


    const username =
        person.username;


    const confirmed =
        confirm(
            `Are you sure you want to delete "${username}"?\n\n` +
            `This will also delete all wishlist items belonging to this profile.\n\n` +
            `This cannot be undone.`
        );


    if (!confirmed) {

        console.log(
            "❌ Profile deletion cancelled."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/api/delete-person",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            index
                        })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to delete profile."
            );

        }


        /*
            Remove profile locally.
        */

        window.PERSONS.splice(
            index,
            1
        );


        /*
            Remove wishlist items belonging
            to this profile locally.
        */

        window.WISHLIST_ITEMS =
            window.WISHLIST_ITEMS.filter(
                item =>
                    String(item.user).toLowerCase() !==
                    String(username).toLowerCase()
            );


        editCurrentProfileIndex =
            null;


        console.log(
            "✅ Profile deleted:",
            username
        );


        showProfileList();


    } catch (error) {

        console.error(
            "❌ Delete profile error:",
            error
        );


        alert(
            "Could not delete the profile.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   PROFILE IMAGE PREVIEW
========================================================= */

function initializeProfileImagePreview() {

    const input =
        document.getElementById(
            "editUserPfpFile"
        );

    const preview =
        document.getElementById(
            "editPfpPreview"
        );


    if (!input || !preview) {
        return;
    }


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files[0];


            if (!file) {
                return;
            }


            preview.src =
                URL.createObjectURL(
                    file
                );

        }
    );

}

/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveProfile() {

    console.log("========================================");
    console.log("💾 SAVE PROFILE");
    console.log("========================================");


    /* ---------------------------------------------------------
       DETERMINE ADD VS EDIT
    --------------------------------------------------------- */

    const index =
        editCurrentProfileIndex;

    const isAdding =
        index === null ||
        index === undefined;


    console.log(
        "Mode:",
        isAdding ? "ADDING" : "EDITING"
    );

    console.log(
        "Index:",
        index
    );


    /* ---------------------------------------------------------
       GET CURRENT PERSON
    --------------------------------------------------------- */

    let person = null;

    if (!isAdding) {

        person =
            window.PERSONS[index];


        if (!person) {

            console.error(
                "❌ Profile not found:",
                index
            );

            return;
        }

    }


    /* ---------------------------------------------------------
       GET USERNAME
    --------------------------------------------------------- */

    const username =
        document
            .getElementById("editUsername")
            ?.value
            .trim();


    if (!username) {

        alert(
            "Profile name is required."
        );

        return;
    }


    /* ---------------------------------------------------------
       CHECK DUPLICATE USERNAME
    --------------------------------------------------------- */

    const duplicate =
        window.PERSONS.some(
            (p, i) => {

                if (!isAdding && i === index) {
                    return false;
                }

                return (
                    String(p.username)
                        .toLowerCase() ===
                    username.toLowerCase()
                );

            }
        );


    if (duplicate) {

        alert(
            "That profile name is already being used."
        );

        return;
    }


    /* ---------------------------------------------------------
       PROFILE PICTURE
    --------------------------------------------------------- */

    let pfp =
        isAdding
            ? "assets/images/defaultpfp.jpeg"
            : (person.pfp || "assets/images/defaultpfp.jpeg");


    const file =
        document
            .getElementById("editUserPfpFile")
            ?.files[0];


    const button =
        document.getElementById(
            "saveProfileButton"
        );


    const status =
        document.getElementById(
            "profileFormStatus"
        );


    try {

        /* -----------------------------------------------------
           UPLOAD NEW PROFILE PICTURE
        ----------------------------------------------------- */

        if (file) {

            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "Uploading...";

            }


            const formData =
                new FormData();


            formData.append(
                "images",
                file
            );


            const uploadResponse =
                await fetch(
                    "/api/upload-image",
                    {
                        method:
                            "POST",

                        body:
                            formData
                    }
                );


            const uploadResult =
                await uploadResponse.json();


            if (!uploadResponse.ok) {

                throw new Error(
                    uploadResult.error ||
                    "Profile picture upload failed."
                );

            }


            if (
                !uploadResult.paths ||
                !uploadResult.paths.length
            ) {

                throw new Error(
                    "The server did not return an uploaded image."
                );

            }


            pfp =
                uploadResult.paths[0];

        }


        /* -----------------------------------------------------
           CREATE PROFILE OBJECT
        ----------------------------------------------------- */

        const updatedPerson = {

            username,

            pfp

        };


        /* -----------------------------------------------------
           SAVE TO SERVER
        ----------------------------------------------------- */

        if (button) {

            button.disabled =
                true;

            button.textContent =
                isAdding
                    ? "Adding..."
                    : "Saving...";

        }


        const endpoint =
            isAdding
                ? "/api/add-person"
                : "/api/edit-person";


       const body =
    isAdding
        ? {
            username:
                updatedPerson.username,

            pfp:
                updatedPerson.pfp
        }
        : {
            index,

            person:
                {
                    ...person,
                    ...updatedPerson
                }
        };


        console.log(
            "📡 Sending:",
            endpoint,
            body
        );


        const response =
            await fetch(
                endpoint,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            body
                        )
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                (
                    isAdding
                        ? "Failed to add profile."
                        : "Failed to save profile."
                )
            );

        }


        /* -----------------------------------------------------
           UPDATE LOCAL DATA
        ----------------------------------------------------- */

        if (isAdding) {

            const serverPerson =
                result.person ||
                updatedPerson;


            window.PERSONS.push(
                serverPerson
            );


            console.log(
                "✅ Profile added:",
                serverPerson
            );

        } else {

            const finalPerson = {

                ...person,

                ...updatedPerson

            };


            window.PERSONS[index] =
                finalPerson;


            /* ---------------------------------------------
               If username changed, update wishlist items
            --------------------------------------------- */

            window.WISHLIST_ITEMS =
                window.WISHLIST_ITEMS.map(
                    item => {

                        if (
                            String(item.user)
                                .toLowerCase() ===
                            String(person.username)
                                .toLowerCase()
                        ) {

                            return {

                                ...item,

                                user:
                                    username

                            };

                        }


                        return item;

                    }
                );


            console.log(
                "✅ Profile updated:",
                finalPerson
            );

        }


        /* -----------------------------------------------------
           SUCCESS
        ----------------------------------------------------- */

        if (status) {

            status.textContent =
                isAdding
                    ? "✓ Profile added successfully."
                    : "✓ Profile saved successfully.";

            status.style.color =
                "#2ecc71";

        }


        /* -----------------------------------------------------
           RETURN TO PROFILE LIST
        ----------------------------------------------------- */

        setTimeout(
            () => {

                showProfileList();

            },
            700
        );


    } catch (error) {

        console.error(
            "❌ Save profile error:",
            error
        );


        if (status) {

            status.textContent =
                "Error: " +
                error.message;

            status.style.color =
                "#e05252";

        }

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                isAdding
                    ? "Add Profile"
                    : "Save Changes";

        }

    }

}



/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "📄 edit.js DOM ready"
        );


        initializeUnknownPriceToggle();

        initializeProfileImagePreview();

        initializeItemImageEditor();

    }
);


/* =========================================================
   EXPORT FUNCTIONS
========================================================= */

window.initializeItemEditor =
    initializeItemEditor;

window.initializeProfileEditor =
    initializeProfileEditor;

window.showItemList =
    showItemList;

window.saveItem =
    saveItem;

window.deleteItem =
    deleteItem;

window.showProfileList =
    showProfileList;

window.saveProfile =
    saveProfile;

window.deleteProfile =
    deleteProfile;

window.openItemEditor =
    openItemEditor;

window.openAddItemEditor =
    openAddItemEditor;

window.openProfileEditor =
    openProfileEditor;

console.log("========================================");
console.log("✅ edit.js FUNCTIONS EXPORTED");
console.log("========================================");