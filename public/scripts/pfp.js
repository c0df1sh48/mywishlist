/* =========================================================
   PROFILE MENU
   ========================================================= */

const prdiv = document.getElementById("accountdiv");
const prcont = document.getElementById("pfcontent");
const users = window.PERSONS;


/* =========================================================
   MAKE PROFILE BUTTONS
   ========================================================= */

users.forEach(user => {
    const td = document.createElement("td");
    td.id = "pftd";
    td.classList.add("profile-cell");

    const button = document.createElement("button");
    button.id = "pfbutton";
    button.classList.add("profile-button");

    const pfpimg = document.createElement("img");
    pfpimg.id = "pfpImg";
    pfpimg.classList.add("profile-image");

    const pfusername = document.createElement("p");
    pfusername.id = "pfuser";
    pfusername.classList.add("profile-username");

    pfpimg.src = user.pfp;
    pfpimg.alt = user.username + " profile picture";

    pfusername.textContent = user.username;

    button.appendChild(pfpimg);
    button.appendChild(pfusername);

    td.appendChild(button);

    button.onclick = function () {
        window.location.href =
            "index.html?user=" + encodeURIComponent(user.username);
    };

    prcont.appendChild(td);
});


/* =========================================================
   OPEN / CLOSE PROFILE MENU
   ========================================================= */

function accountdivactive() {
    if (prdiv.style.display === "flex") {
        prdiv.style.display = "none";
    } else {
        prdiv.style.display = "flex";
    }
}

function acountdivactive() {
    accountdivactive();
}


/* =========================================================
   PROFILE PICTURE + MENU LOGIC
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const username = getQueryParam("user");

    const userObj = window.PERSONS.find(
        user => user.username === username
    );


    /* ---------------------------------------------------------
       Set navbar profile picture
       --------------------------------------------------------- */

    const pfpImg = document.getElementById("accountpfp");

    if (pfpImg) {

        if (userObj) {

            pfpImg.src = userObj.pfp;

            pfpImg.alt =
                userObj.username + " profile picture";

            pfpImg.style.display = "block";

        } else {

            pfpImg.style.display = "none";
        }
    }


    /* ---------------------------------------------------------
       Add username next to navbar profile picture
       --------------------------------------------------------- */

    const accountBtn =
        document.getElementById("accountbutton");

    if (accountBtn && userObj) {

        const existing =
            document.getElementById("navbar-username");

        if (existing) {
            existing.remove();
        }

        const nameSpan =
            document.createElement("span");

        nameSpan.id = "navbar-username";

        nameSpan.textContent =
            userObj.username;

        accountBtn.after(nameSpan);
    }


    /* ---------------------------------------------------------
       Open profile selector if no profile selected
       --------------------------------------------------------- */

    if (!username) {
        prdiv.style.display = "flex";
    } else {
        prdiv.style.display = "none";
    }
});