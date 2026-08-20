// ============================================================
// PRINT WISHES
// ============================================================

console.log("🖨️ printwishes.js loaded");


// ------------------------------------------------------------
// OPEN MODAL
// ------------------------------------------------------------

function openPrintWishes() {

    console.log("🖨️ Opening Print Wishes");

    const overlay =
        document.getElementById("print-wishes-overlay");

    if (!overlay) {
        console.error(
            "Print Wishes overlay not found"
        );

        return;
    }

    buildPrintPeopleList();

    overlay.classList.add("active");

}


// ------------------------------------------------------------
// CLOSE MODAL
// ------------------------------------------------------------

function closePrintWishes() {

    const overlay =
        document.getElementById("print-wishes-overlay");

    if (!overlay) {
        return;
    }

    overlay.classList.remove("active");

}


// ------------------------------------------------------------
// BUILD PEOPLE LIST
// ------------------------------------------------------------

function buildPrintPeopleList() {

    const container =
        document.getElementById(
            "print-people-list"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const people =
        Array.isArray(window.PERSONS)
            ? window.PERSONS
            : [];


    people.forEach((person, index) => {

        const username =
            person.username || `Person ${index + 1}`;


        const label =
            document.createElement("label");

        label.className =
            "print-option";


        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.className =
            "print-person-checkbox";

        checkbox.dataset.username =
            username;


        checkbox.addEventListener(
            "change",
            updateEveryoneCheckbox
        );


        const span =
            document.createElement("span");

        span.textContent =
            username;


        label.appendChild(
            checkbox
        );

        label.appendChild(
            span
        );


        container.appendChild(
            label
        );

    });

}


// ------------------------------------------------------------
// EVERYONE CHECKBOX
// ------------------------------------------------------------

function togglePrintEveryone() {

    const everyone =
        document.getElementById(
            "print-everyone"
        );


    const people =
        document.querySelectorAll(
            ".print-person-checkbox"
        );


    people.forEach(
        checkbox => {

            checkbox.checked =
                everyone.checked;

        }
    );

}


// ------------------------------------------------------------
// UPDATE EVERYONE CHECKBOX
// ------------------------------------------------------------

function updateEveryoneCheckbox() {

    const everyone =
        document.getElementById(
            "print-everyone"
        );


    const people =
        Array.from(
            document.querySelectorAll(
                ".print-person-checkbox"
            )
        );


    if (
        people.length === 0
    ) {

        everyone.checked = false;

        return;

    }


    everyone.checked =
        people.every(
            checkbox =>
                checkbox.checked
        );

}


// ------------------------------------------------------------
// GET SELECTED PEOPLE
// ------------------------------------------------------------

function getSelectedPrintPeople() {

    const everyone =
        document.getElementById(
            "print-everyone"
        );


    if (
        everyone &&
        everyone.checked
    ) {

        return Array.isArray(
            window.PERSONS
        )
            ? window.PERSONS.map(
                person =>
                    person.username
            )
            : [];

    }


    return Array.from(
        document.querySelectorAll(
            ".print-person-checkbox:checked"
        )
    ).map(
        checkbox =>
            checkbox.dataset.username
    );

}


// ------------------------------------------------------------
// FORMAT PRICE
// ------------------------------------------------------------

function formatPrintPrice(amount) {

    if (
        amount === "unk" ||
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {

        return "Unknown price";

    }


    const number =
        Number(amount);


    if (
        !Number.isFinite(number)
    ) {

        return String(amount);

    }


    return `$${number.toFixed(2)}`;

}


// ------------------------------------------------------------
// ESCAPE HTML
// ------------------------------------------------------------

function escapePrintHTML(value) {

    return String(
        value ?? ""
    )
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


// ------------------------------------------------------------
// PRINT WISHES
// ------------------------------------------------------------

function printWishes() {

    console.log(
        "🖨️ Preparing wishes for printing"
    );


    const selectedPeople =
        getSelectedPrintPeople();


    if (
        selectedPeople.length === 0
    ) {

        alert(
            "Please select at least one person."
        );

        return;

    }


    const includePrices =
        document.getElementById(
            "print-prices"
        ).checked;


    const includeDescriptions =
        document.getElementById(
            "print-descriptions"
        ).checked;


    const includeImages =
        document.getElementById(
            "print-images"
        ).checked;


    const includeLinks =
        document.getElementById(
            "print-links"
        ).checked;


    const includeCheckboxes =
        document.getElementById(
            "print-checkboxes"
        ).checked;


    const allItems =
        Array.isArray(
            window.WISHLIST_ITEMS
        )
            ? window.WISHLIST_ITEMS
            : [];


    let output = "";


    selectedPeople.forEach(
        username => {

            const personItems =
                allItems.filter(
                    item =>
                        item.user === username
                );


            output += `

                <section class="print-person">

                    <div class="print-person-header">

                        <h1>
                            ${escapePrintHTML(username)}'s Wishlist
                        </h1>

                        <div class="print-line"></div>

                    </div>

            `;


            if (
                personItems.length === 0
            ) {

                output += `

                    <p class="print-empty">
                        No wishlist items.
                    </p>

                `;

            }


            personItems.forEach(
                (item, index) => {

                    const checkbox =
                        includeCheckboxes
                            ? `<span class="wish-checkbox">☐</span>`
                            : "";


                    const price =
                        includePrices
                            ? `
                                <div class="print-price">
                                    ${formatPrintPrice(item.amount)}
                                </div>
                              `
                            : "";


                    const description =
                        includeDescriptions &&
                        (
                            item.bio ||
                            item.longBio
                        )
                            ? `
                                <div class="print-description">
                                    ${escapePrintHTML(
                                        item.longBio ||
                                        item.bio
                                    )}
                                </div>
                              `
                            : "";


                    let imageHTML =
                        "";


                    if (
                        includeImages
                    ) {

                        let image =
                            "";


                        if (
                            Array.isArray(
                                item.images
                            ) &&
                            item.images.length > 0
                        ) {

                            image =
                                item.images[0];

                        } else if (
                            item.imgUrl
                        ) {

                            image =
                                item.imgUrl;

                        }


                        if (
                            image
                        ) {

                            imageHTML = `

                                <div class="print-image-container">

                                    <img
                                        src="${escapePrintHTML(image)}"
                                        class="print-image"
                                        alt=""
                                    >

                                </div>

                            `;

                        }

                    }


                    const link =
                        includeLinks &&
                        item.link
                            ? `

                                <div class="print-link">

                                    ${escapePrintHTML(
                                        item.link
                                    )}

                                </div>

                              `
                            : "";


                    output += `

                        <article class="print-wish">

                            <div class="print-wish-main">

                                ${checkbox}

                                <div class="print-wish-content">

                                    <h2>
                                        ${escapePrintHTML(
                                            item.name
                                        )}
                                    </h2>

                                    ${price}

                                    ${description}

                                    ${link}

                                </div>

                                ${imageHTML}

                            </div>

                        </article>

                    `;

                }
            );


            output += `

                </section>

            `;

        }
    );


    const container =
        document.getElementById(
            "print-container"
        );


    if (!container) {

        console.error(
            "Print container not found"
        );

        return;

    }


    container.innerHTML =
        output;


    closePrintWishes();


    setTimeout(
        () => {

            window.print();

        },
        200
    );

}


// ------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------

window.openPrintWishes =
    openPrintWishes;

window.closePrintWishes =
    closePrintWishes;

window.printWishes =
    printWishes;

window.togglePrintEveryone =
    togglePrintEveryone;

console.log(
    "🖨️ Print Wishes functions exported"
);