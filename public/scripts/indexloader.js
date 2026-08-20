window.addEventListener("DOMContentLoaded", function () {
    if (window.WISHLIST_ITEMS && Array.isArray(window.WISHLIST_ITEMS)) {
        window.WISHLIST_ITEMS.forEach(item => {
            additem(item.user, item.name, item.amount, item.bio, item.imgUrl);
        });
        // After all items are added, fill empty cells for each table
        ["item-0-25", "item-25-50", "item-50-75", "item-75-100", "item-100-500", "item-500", "item-unk"].forEach(id => {
            var itemDiv = document.getElementById(id);
            if (lastRow.cells.length >= 3 && window.innerWidth > 768) {
    lastRow = table.insertRow();
}
        });
    }
});