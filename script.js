document.addEventListener('DOMContentLoaded', () => {
    let cart = []; // Global cart array to store items

    // Function to load cart from localStorage
    const loadCart = () => {
        const storedCart = localStorage.getItem('groceryHubCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    };

    // Function to save cart to localStorage
    const saveCart = () => {
        localStorage.setItem('groceryHubCart', JSON.stringify(cart));
    };

    // Function to update cart count display in the header
    const updateCartCountDisplay = () => {
        const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);
        const cartIcon = document.querySelector('.nav-icons .fa-shopping-cart');
        let cartLink = cartIcon.closest('a'); // Get the parent <a> tag for "Cart"
        let cartSpan = cartLink.querySelector('.cart-count'); // Check if span already exists within the link

        if (!cartSpan) {
            cartSpan = document.createElement('span');
            cartSpan.classList.add('cart-count');
            cartLink.appendChild(cartSpan); // Append the span inside the <a> tag
        }

        cartSpan.textContent = ` (${totalItemsInCart})`;
        if (totalItemsInCart === 0) {
            cartSpan.style.display = 'none';
        } else {
            cartSpan.style.display = 'inline';
        }
    };

    // Helper function to get product details from a product card
    const getProductDetailsFromCard = (productCard) => {
        const productNameElement = productCard.querySelector('h3 a, h3');
        const productName = productNameElement ? productNameElement.textContent.trim() : 'Unknown Product';
        const productPrice = parseFloat(productCard.querySelector('.current-price').textContent.replace('₹', '').trim());
        const productWeight = productCard.querySelector('.weight-info') ? productCard.querySelector('.weight-info').textContent.trim() : 'N/A';
        return { productName, productPrice, productWeight };
    };

    // Function to update the UI of a single product card
    const updateProductCardUI = (productCard, productName) => {
        const existingItem = cart.find(item => item.name === productName);
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        let quantityControls = productCard.querySelector('.quantity-controls');

        if (existingItem && existingItem.quantity > 0) {
            // If item is in cart, show quantity controls
            if (!quantityControls) {
                quantityControls = document.createElement('div');
                quantityControls.classList.add('quantity-controls');
                quantityControls.innerHTML = `
                    <button class="decrease-quantity-btn">-</button>
                    <span class="product-quantity">${existingItem.quantity}</span>
                    <button class="increase-quantity-btn">+</button>
                `;
                // Insert quantity controls right before the add-to-cart-btn
                addToCartBtn.parentNode.insertBefore(quantityControls, addToCartBtn);
            } else {
                quantityControls.querySelector('.product-quantity').textContent = existingItem.quantity;
                quantityControls.style.display = 'flex'; // Ensure it's visible
            }
            addToCartBtn.style.display = 'none'; // Hide the original add button
        } else {
            // If item is not in cart or quantity is 0, show add to cart button
            if (quantityControls) {
                quantityControls.style.display = 'none'; // Hide quantity controls
            }
            addToCartBtn.style.display = 'block'; // Show the original add button
        }
    };

    // Function to handle quantity changes (add or decrease)
    const handleQuantityChange = (productCard, changeType) => {
        const { productName, productPrice, productWeight } = getProductDetailsFromCard(productCard);

        let productIndex = cart.findIndex(item => item.name === productName);

        if (changeType === 'add') {
            if (productIndex > -1) {
                cart[productIndex].quantity++;
            } else {
                cart.push({
                    name: productName,
                    price: productPrice,
                    weight: productWeight,
                    quantity: 1
                });
            }
            alert(`${productName} added to cart!`);
        } else if (changeType === 'decrease') {
            if (productIndex > -1) {
                cart[productIndex].quantity--;
                if (cart[productIndex].quantity <= 0) {
                    cart.splice(productIndex, 1); // Remove item if quantity becomes 0 or less
                    alert(`${productName} removed from cart.`);
                } else {
                    alert(`Quantity of ${productName} decreased.`);
                }
            } else {
                alert(`${productName} not found in cart.`);
            }
        }

        saveCart();
        updateCartCountDisplay();
        updateProductCardUI(productCard, productName); // Update specific card UI
        console.log('Current Cart:', cart);
    };

    // --- Initialization ---
    loadCart();
    updateCartCountDisplay();

    // Event Listeners for product cards
    const productCards = document.querySelectorAll('.product-card1');
    productCards.forEach(productCard => {
        const { productName } = getProductDetailsFromCard(productCard);
        // Initial UI update for each product card based on current cart
        updateProductCardUI(productCard, productName);

        // Add event listener for the initial "Add to Cart" button
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                handleQuantityChange(productCard, 'add');
            });
        }

        // Add event listeners for dynamically created quantity control buttons
        // Use event delegation on the productCard itself, as buttons are added dynamically
        productCard.addEventListener('click', (event) => {
            if (event.target.classList.contains('increase-quantity-btn')) {
                handleQuantityChange(productCard, 'add');
            } else if (event.target.classList.contains('decrease-quantity-btn')) {
                handleQuantityChange(productCard, 'decrease');
            }
        });
    });

    // Event Listener for the "Cart" Navigation Icon
    const cartLink = document.querySelector('.nav-icons a[href="cart.html"]');
    if (cartLink) {
        cartLink.addEventListener('click', (event) => {
            // For now, prevent default and show alert if cart is empty.
            // In a real app, cart.html would display the cart even if empty.
            if (cart.length === 0) {
                alert('Your cart is empty! Add some items first.');
                event.preventDefault(); // Prevent navigation if cart is empty
            }
            // If cart has items, allow navigation to cart.html
        });
    }

    // Simulated Checkout function
    const checkout = () => {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before checking out.');
            return;
        }

        const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        let checkoutMessage = "--- Your Order Summary ---\n\n";
        cart.forEach(item => {
            checkoutMessage += `${item.name} (${item.weight}) x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}\n`;
        });
        checkoutMessage += `\nTotal: ₹${totalAmount.toFixed(2)}\n\n`;
        checkoutMessage += "Thank you for your purchase!\n(This is a simulated checkout)";

        alert(checkoutMessage);
        console.log('Checkout initiated. Final Cart:', cart, 'Total:', totalAmount.toFixed(2));

        // Clear the cart after a successful (simulated) checkout
        cart = [];
        saveCart();
        updateCartCountDisplay();
        // After checkout, reset the UI of all product cards
        productCards.forEach(productCard => {
            const { productName } = getProductDetailsFromCard(productCard);
            updateProductCardUI(productCard, productName);
        });
    };

    // Existing Event Listeners for Search and Liked (Wishlist) icons
    const searchIconParent = document.querySelector('.nav-icons a:nth-child(1)');
    const likedIconParent = document.querySelector('.nav-icons a:nth-child(3)');

    if (searchIconParent) {
        searchIconParent.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Search functionality coming soon!');
        });
    }

    if (likedIconParent) {
        likedIconParent.addEventListener('click', () => {
            alert('Navigating to your wishlist!');
        });
    }

    // UI Enhancements (Sticky Navbar)
    const mainNavbar = document.querySelector('.main-navbar');
    const topBar = document.querySelector('.top-bar');

    if (mainNavbar && topBar) {
        const topBarHeight = topBar.offsetHeight;
        window.addEventListener('scroll', () => {
            if (window.scrollY > topBarHeight) {
                mainNavbar.classList.add('sticky-navbar');
            } else {
                mainNavbar.classList.remove('sticky-navbar');
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    let cart = []; // Global cart array to store items

    // Function to load cart from localStorage
    const loadCart = () => {
        const storedCart = localStorage.getItem('groceryHubCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    };

    // Function to save cart to localStorage
    const saveCart = () => {
        localStorage.setItem('groceryHubCart', JSON.stringify(cart));
    };

    // Function to calculate total cart value (items only)
    const calculateCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Function to calculate total quantity of items in cart
    const getTotalItemsInCart = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    // Function to render cart items in the sidebar
    const renderCartItems = () => {
        const cartContent = document.querySelector('.cart-content');
        cartContent.innerHTML = ''; // Clear existing content

        if (cart.length === 0) {
            cartContent.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                // Store product name using a data attribute for easier lookup in event listeners
                cartItemDiv.dataset.productName = item.name;

                cartItemDiv.innerHTML = `
                    <div class="item-info">
                        <p class="item-name">${item.name}</p>
                        <span class="item-weight">${item.weight}</span>
                    </div>
                    <div class="item-controls">
                        <button class="decrease-qty-btn">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="increase-qty-btn">+</button>
                    </div>
                    <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item-btn" data-product-name="${item.name}">&times;</button>
                `;
                cartContent.appendChild(cartItemDiv);
            });
        }
    };

    // Function to update bill details (total quantity, subtotal, total to pay)
    const updateBillDetails = () => {
        const totalQtyText = document.querySelector('.bill-row:nth-child(2) span:first-child');
        const totalAmountSpan = document.querySelector('.bill-row:nth-child(2) span:last-child');
        const toPaySpan = document.querySelector('.bill-row.total-row span:last-child');
        const itemCountP = document.querySelector('.item-count');

        const totalItems = getTotalItemsInCart();
        const subtotal = calculateCartTotal();
        const handlingFee = 10.00; // Fixed handling fee from the provided HTML snippet

        const totalToPay = subtotal + handlingFee;

        itemCountP.textContent = `${totalItems} Items`;
        totalQtyText.textContent = `Total qty (${totalItems})`;
        totalAmountSpan.textContent = `₹${subtotal.toFixed(2)}`;
        toPaySpan.textContent = `₹${totalToPay.toFixed(2)}/-`;

        // Also update the cart count in the header, assuming cart.html might share the same header structure
        const cartIcon = document.querySelector('.nav-icons .fa-shopping-cart');
        if (cartIcon) {
            let cartLink = cartIcon.closest('a');
            let cartSpan = cartLink.querySelector('.cart-count');

            if (!cartSpan) {
                cartSpan = document.createElement('span');
                cartSpan.classList.add('cart-count');
                cartLink.appendChild(cartSpan);
            }
            cartSpan.textContent = ` (${totalItems})`;
            if (totalItems === 0) {
                cartSpan.style.display = 'none';
            } else {
                cartSpan.style.display = 'inline';
            }
        }
    };

    // Function to update item quantity in cart (used by +/- buttons)
    const updateCartItemQuantity = (productName, change) => {
        const itemIndex = cart.findIndex(item => item.name === productName);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remove item if quantity drops to 0 or less
            }
            saveCart();
            renderCartItems(); // Re-render the cart display to reflect changes
            updateBillDetails(); // Update bill summary
        }
    };

    // Function to remove an item completely from cart (used by 'x' button on each item)
    const removeItemCompletely = (productName) => {
        const initialCartLength = cart.length;
        cart = cart.filter(item => item.name !== productName);
        if (cart.length < initialCartLength) {
            alert(`${productName} completely removed from cart.`);
            saveCart();
            renderCartItems();
            updateBillDetails();
        } else {
            alert(`${productName} not found in cart.`);
        }
    };

    // Simulated Checkout function
    const checkout = () => {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before checking out.');
            return;
        }

        const totalAmount = calculateCartTotal() + 10.00; // Add handling fee for the final checkout summary

        let checkoutMessage = "--- Your Order Summary ---\n\n";
        cart.forEach(item => {
            checkoutMessage += `${item.name} (${item.weight}) x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}\n`;
        });
        checkoutMessage += `\nHandling Fee: ₹10.00\n`;
        checkoutMessage += `Total: ₹${totalAmount.toFixed(2)}\n\n`;
        checkoutMessage += "Thank you for your purchase!\n(This is a simulated checkout)";

        alert(checkoutMessage);
        console.log('Checkout initiated. Final Cart:', cart, 'Total:', totalAmount.toFixed(2));

        // Clear the cart after a successful (simulated) checkout
        cart = [];
        saveCart();
        renderCartItems(); // Re-render the cart to show it's empty
        updateBillDetails(); // Update bill summary to show 0
        // In a real application, you would typically navigate to an order confirmation page here:
        // window.location.href = 'order-confirmation.html';
    };

    // --- Initialization ---
    loadCart();        // Load cart data from local storage
    renderCartItems(); // Display initial cart items on page load
    updateBillDetails(); // Update bill summary on page load

    // --- Event Listeners ---

    // Event listener for the close button (assuming the cart sidebar can be hidden)
    const closeBtn = document.querySelector('.close-btn');
    const absContainer = document.querySelector('.abs'); // The main container for the cart sidebar

    if (closeBtn && absContainer) {
        closeBtn.addEventListener('click', () => {
            // If cart.html is a dedicated page, clicking close might navigate back
            // For now, it will hide the entire cart container for demonstration.
            absContainer.style.display = 'none'; 
            alert('Cart sidebar closed. ');
        });
        // Uncomment the line below if you want the cart sidebar to be hidden by default
        // and shown by a separate trigger (e.g., a button on index.html)
        // absContainer.style.display = 'block'; // Ensure it's visible when the page loads if it's the main content
    }

    // Event listener for dynamically added quantity control buttons (+/-) and remove (x) button
    // Using event delegation on the cart-content container for efficiency
    const cartContent = document.querySelector('.cart-content');
    if (cartContent) {
        cartContent.addEventListener('click', (event) => {
            const productName = event.target.closest('.cart-item')?.dataset.productName;

            if (!productName) return; // Exit if the click was not on a cart item button

            if (event.target.classList.contains('increase-qty-btn')) {
                updateCartItemQuantity(productName, 1);
            } else if (event.target.classList.contains('decrease-qty-btn')) {
                updateCartItemQuantity(productName, -1);
            } else if (event.target.classList.contains('remove-item-btn')) {
                removeItemCompletely(productName);
            }
        });
    }

    // Event listener for the "Buy Now" button
    const buyNowBtn = document.querySelector('.buy-now-btn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', checkout);
    }
});