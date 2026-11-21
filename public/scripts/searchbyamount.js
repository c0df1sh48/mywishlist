document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll("#searchbyamountdiv button");
    const grid = document.getElementById("wishlist-grid");
    if (!grid) return;

    const ranges = {
        "$0 - $25": [0, 25],
        "$25 - $50": [25, 50],
        "$50 - $75": [50, 75],
        "$75 - $100": [75, 100],
        "$100 - $500": [100, 500],
        "$500+": [500, Infinity],
        "Unknown Amount": "unknown"
    };

    let activeButton = null;
    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const label = button.textContent.trim();
            if (activeButton === button) {
                activeButton = null;
                buttons.forEach(item => item.classList.remove("active"));
                grid.querySelectorAll(".wishlist-item").forEach(card => card.hidden = false);
                return;
            }

            const range = ranges[label];
            if (!range) return;
            activeButton = button;
            buttons.forEach(item => item.classList.toggle("active", item === button));

            grid.querySelectorAll(".wishlist-item").forEach(card => {
                const amount = card.dataset.amount;
                let visible;
                if (range === "unknown") {
                    visible = amount === "unknown";
                } else {
                    const value = Number(amount);
                    visible = amount !== "unknown" && Number.isFinite(value) && value >= range[0] && (range[1] === Infinity ? value >= range[0] : value < range[1]);
                }
                card.hidden = !visible;
            });
        });
    });
});
