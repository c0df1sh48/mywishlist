document.addEventListener("DOMContentLoaded", function () {

    const amountButtons =
        document.querySelectorAll("#searchbyamountdiv button");

    const categories =
        document.querySelectorAll("#itemlist .item");

    let activeButton = null;


    /* =====================================================
       PRICE RANGES
       ===================================================== */

    const priceRanges = {
        "$0 - $25": {
            min: 0,
            max: 25
        },

        "$25 - $50": {
            min: 25,
            max: 50
        },

        "$50 - $75": {
            min: 50,
            max: 75
        },

        "$75 - $100": {
            min: 75,
            max: 100
        },

        "$100 - $500": {
            min: 100,
            max: 500
        },

        "$500+": {
            min: 500,
            max: Infinity
        },

        "Unknown Amount": {
            min: null,
            max: null
        }
    };


    /* =====================================================
       RESET BUTTON STYLES
       ===================================================== */

    function resetButtons() {

        amountButtons.forEach(button => {

            button.classList.remove("active");

        });
    }


    /* =====================================================
       SHOW ALL CATEGORIES
       ===================================================== */

    function showAllCategories() {

        categories.forEach(category => {

            category.style.display = "block";

        });
    }


    /* =====================================================
       BUTTON CLICK
       ===================================================== */

    amountButtons.forEach(button => {

        button.addEventListener("click", function () {

            const label = button.textContent.trim();


            /* ---------------------------------------------
               CLICK ACTIVE BUTTON AGAIN = RESET
               --------------------------------------------- */

            if (activeButton === button) {

                resetButtons();

                showAllCategories();

                activeButton = null;

                return;
            }


            /* ---------------------------------------------
               GET PRICE RANGE
               --------------------------------------------- */

            const range = priceRanges[label];

            if (!range) return;


            /* ---------------------------------------------
               ACTIVATE BUTTON
               --------------------------------------------- */

            resetButtons();

            button.classList.add("active");

            activeButton = button;


            /* ---------------------------------------------
               FILTER CATEGORIES
               --------------------------------------------- */

            categories.forEach(category => {

                const categoryPrice =
                    category.getAttribute("data-price");

                const price =
                    parseFloat(categoryPrice);


                /* Unknown price category */

                if (label === "Unknown Amount") {

                    category.style.display =
                        category.id === "item-unk"
                            ? "block"
                            : "none";

                    return;
                }


                /* Normal price categories */

                if (isNaN(price)) {

                    category.style.display = "none";

                    return;
                }


                const show =
                    price >= range.min &&
                    price <= range.max;

                category.style.display =
                    show ? "block" : "none";

            });

        });

    });

});