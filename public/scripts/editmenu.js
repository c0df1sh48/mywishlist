/* =========================================================
   MYWISHLIST EDIT MENU
   ========================================================= */


/* =========================================================
   GET CURRENT USER
   ========================================================= */

function getCurrentEditUser() {

    const params = new URLSearchParams(window.location.search);

    return params.get("user");
}


/* =========================================================
   OPEN EDIT MENU
   ========================================================= */

function openEditMenu() {

    const username = getCurrentEditUser();

    /*
        A user MUST be selected before opening the edit menu.
    */

    if (!username) {
        alert("Please select a profile before editing your wishlist.");
        return;
    }


    /*
        Don't create the popup more than once.
    */

    let existingMenu =
        document.getElementById("editMenuPopup");

    if (existingMenu) {
        existingMenu.remove();
    }


    /* =====================================================
       CREATE POPUP
       ===================================================== */

    const popup =
        document.createElement("div");

    popup.id = "editMenuPopup";

    popup.innerHTML = `

        <div class="edit-menu-backdrop">

            <div class="edit-menu-popup">

                <!-- HEADER -->

                <div class="edit-menu-header">

                    <div>
                        <h2>Edit MyWishlist</h2>

                        <p>
                            Editing as
                            <strong>
                                ${escapeEditHTML(username)}
                            </strong>
                        </p>
                    </div>

                    <button
                        class="edit-menu-close"
                        onclick="closeEditMenu()">
                        &times;
                    </button>

                </div>


                <!-- OPTIONS -->

                <div class="edit-menu-options">


                    <!-- EDIT ITEMS -->

                    <button
                        class="edit-menu-option"
                        onclick="goToEditPage('items')">

                        <div class="edit-menu-icon">
                            📦
                        </div>

                        <div class="edit-menu-option-text">

                            <strong>
                                Edit Items
                            </strong>

                            <span>
                                Add, edit, or remove wishlist items
                            </span>

                        </div>

                        <div class="edit-menu-arrow">
                            ›
                        </div>

                    </button>


                    <!-- EDIT PROFILE -->

                    <button
                        class="edit-menu-option"
                        onclick="goToEditPage('profiles')">

                        <div class="edit-menu-icon">
                            👤
                        </div>

                        <div class="edit-menu-option-text">

                            <strong>
                                Edit Profile
                            </strong>

                            <span>
                                Change your username or profile picture
                            </span>

                        </div>

                        <div class="edit-menu-arrow">
                            ›
                        </div>

                    </button>


                </div>

            </div>

        </div>

    `;


    document.body.appendChild(popup);


    /* =====================================================
       CLICK OUTSIDE TO CLOSE
       ===================================================== */

    const backdrop =
        popup.querySelector(".edit-menu-backdrop");

    backdrop.addEventListener("click", function (event) {

        if (event.target === backdrop) {
            closeEditMenu();
        }

    });

}


/* =========================================================
   GO TO EDIT PAGE
   ========================================================= */

function goToEditPage(mode) {

    const username =
        getCurrentEditUser();


    /*
        Make absolutely sure there is a user.
    */

    if (!username) {

        window.location.href = "index.html";

        return;
    }


    /*
        Build:

        edit.html?user=USERNAME&mode=items

        OR

        edit.html?user=USERNAME&mode=profile
    */

    const params =
        new URLSearchParams();

    params.set("user", username);
    params.set("mode", mode);


    window.location.href =
        "edit.html?" + params.toString();

}


/* =========================================================
   CLOSE EDIT MENU
   ========================================================= */

function closeEditMenu() {

    const popup =
        document.getElementById("editMenuPopup");

    if (popup) {
        popup.remove();
    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeEditHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeEditMenu();

    }

});