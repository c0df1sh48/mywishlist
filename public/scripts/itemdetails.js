function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const itemId = getQueryParam('id');
const item = window.WISHLIST_ITEMS.find(i => i.name === itemId); // Use ID if you have one

if (item) {
    const container = document.getElementById('item-details');
    container.innerHTML = `
        <h2>${item.name}</h2>
        <div class="slideshow">
            <img src="${item.imgUrl || 'assets/images/other/placeholder.jpeg'}" alt="${item.name}" style="max-width:300px;">
            <!-- Add more images for a real slideshow if you want -->
        </div>
        <p><strong>Price:</strong> ${item.amount === "unk" ? "Unknown" : "$" + Number(item.amount).toFixed(2)}</p>
        <p><strong>Bio:</strong> ${item.bio}</p>
        <p><strong>Longer Bio:</strong> ${item.longBio || "No additional info."}</p>
        <a href="index.html">Back to Wishlist</a>
    `;
} else {
    document.getElementById('item-details').innerText = "Item not found.";
}