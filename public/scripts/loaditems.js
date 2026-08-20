// Function to shrink image if overflow
    function resizeImageIfOverflow(container) {
        if (!container) return;
        const img = container.querySelector('img');
        if (!img) return;

        // Reset to natural size first
        img.style.width = '';
        img.style.height = '';

        // If overflow, shrink until it fits
        let scale = 100;
        while (
            (container.scrollWidth > container.clientWidth ||
             container.scrollHeight > container.clientHeight) &&
            scale > 10
        ) {
            scale -= 5;
            img.style.width = scale + '%';
            img.style.height = 'auto';
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        function getQueryParam(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        }

        const itemName = getQueryParam('name');
        const item = window.WISHLIST_ITEMS.find(i => i.name === itemName);

        if (item) {
            let images = Array.isArray(item.images) ? item.images.filter(src => src && src.trim() !== "") : [];
            if (images.length === 0) {
                if (item.imgUrl && item.imgUrl.trim() !== "") {
                    images = [item.imgUrl];
                } else {
                    images = ['assets/images/placeholder.jpeg'];
                }
            }

            let current = 0;

            function showSlide(idx) {
                const imgSrc = images[idx] || 'assets/images/placeholder.jpeg';
                const container = document.getElementById('slideshow-container');

                container.innerHTML = `
                    <img src="${imgSrc}" alt="${item.name}" style="border-radius:16px;">
                    <div style="margin-top:10px;">
                        <button id="prev-slide" ${idx === 0 ? "disabled" : ""}>&lt;</button>
                        <span>${idx + 1} / ${images.length}</span>
                        <button id="next-slide" ${idx === images.length - 1 ? "disabled" : ""}>&gt;</button>
                    </div>
                `;

                // Run overflow check
                resizeImageIfOverflow(container);

                document.getElementById('prev-slide').onclick = () => {
                    if (current > 0) { current--; showSlide(current); }
                };
                document.getElementById('next-slide').onclick = () => {
                    if (current < images.length - 1) { current++; showSlide(current); }
                };
            }
            showSlide(current);

            document.getElementById('item-details').innerHTML = `
                <h1>${item.name}</h1>
                <p><strong>Price:</strong> ${item.amount === "unk" ? "Unknown" : "$" + Number(item.amount).toFixed(2)}</p>
                <p><strong>Bio:</strong> ${item.bio}</p>
                <p><strong>Why I want This Item:</strong> ${item.longBio ? item.longBio : "No additional info."}</p>
            `;

            const samePriceItems = window.WISHLIST_ITEMS.filter(i =>
                i.name !== item.name &&
                i.amount === item.amount &&
                i.amount !== "unk"
            );

            if (samePriceItems.length > 0) {
                let html = `<div class="same-price-title">Other items for the same price:</div>`;
                html += `<div class="same-price-scroll"><div class="same-price-flex">`;
                samePriceItems.forEach(i => {
                    html += `<div class="same-price-item-link-to-page">
                        <a href="item.html?name=${encodeURIComponent(i.name)}">${i.name}</a>
                        <div>$${Number(i.amount).toFixed(2)}</div>
                    </div>`;
                });
                html += `</div></div>`;
                document.getElementById('same-price-items').innerHTML = html;
            } else {
                document.getElementById('same-price-items').style.display = "none";
            }
        } else {
            document.getElementById('item-details').innerHTML = "<p>Item not found.</p>";
            document.getElementById('slideshow-container').innerHTML = "";
            document.getElementById('same-price-items').innerHTML = "";
        }
    });

    function getitem() {
        const itemName = new URLSearchParams(window.location.search).get('name');
        const item = window.WISHLIST_ITEMS.find(i => i.name === itemName);
        if (item && item.link) {
            window.open(item.link, '_blank');
        } else {
            alert("No link available for this item.");
        }
    }