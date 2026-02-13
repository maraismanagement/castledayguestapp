// Equipment Rental System - Simple version (name collected at checkout)
(function() {
    var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    var rentalProductsInitialized = false;
    var selectedDeliveryDate = null;
    var selectedPickupDate = null;

    // Format date for display
    function formatDate(dateStr) {
        var date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    // Set up date picker with min date of tomorrow
    function initDatePicker() {
        var coldPlungeDate = document.getElementById('coldPlungeDate');
        if (coldPlungeDate) {
            var today = new Date();
            var tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            coldPlungeDate.min = tomorrow.toISOString().split('T')[0];
            coldPlungeDate.value = tomorrow.toISOString().split('T')[0];

            // Update selected dates when date changes
            coldPlungeDate.addEventListener('change', updateSelectedDates);
            updateSelectedDates();
        }
    }

    function updateSelectedDates() {
        var coldPlungeDate = document.getElementById('coldPlungeDate');
        if (coldPlungeDate && coldPlungeDate.value) {
            selectedDeliveryDate = formatDate(coldPlungeDate.value) + ' at 10am';
            var pickup = new Date(coldPlungeDate.value);
            pickup.setDate(pickup.getDate() + 1);
            selectedPickupDate = formatDate(pickup) + ' by 12pm';
        }
    }

    // Watch for cart updates and inject date info
    function watchCartForDates() {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    injectDatesIntoCart();
                }
            });
        });

        // Observe the entire document for Shopify cart changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function injectDatesIntoCart() {
        // Find cold plunge items in cart and add date info
        var cartItems = document.querySelectorAll('.shopify-buy__cart-item');
        cartItems.forEach(function(item) {
            var titleEl = item.querySelector('.shopify-buy__cart-item__title');
            if (titleEl && titleEl.textContent.toLowerCase().includes('cold plunge')) {
                // Check if we already added dates
                if (!item.querySelector('.rental-dates-info') && selectedDeliveryDate) {
                    var datesDiv = document.createElement('div');
                    datesDiv.className = 'rental-dates-info';
                    datesDiv.style.cssText = 'font-size: 12px; margin-top: 4px; color: #d65f62;';
                    datesDiv.innerHTML = '<strong>Delivery:</strong> ' + selectedDeliveryDate + '<br><strong>Pickup:</strong> ' + selectedPickupDate;
                    titleEl.parentNode.insertBefore(datesDiv, titleEl.nextSibling);
                }
            }
        });
    }

    // Load Shopify SDK if not already loaded
    function loadShopifySDK(callback) {
        if (window.ShopifyBuy && window.ShopifyBuy.UI) {
            callback();
            return;
        }

        var script = document.createElement('script');
        script.async = true;
        script.src = scriptURL;
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Initialize Shopify buy buttons
    function initShopifyProducts() {
        if (rentalProductsInitialized) return;

        loadShopifySDK(function() {
            var client = ShopifyBuy.buildClient({
                domain: 'h1v0e4-10.myshopify.com',
                storefrontAccessToken: '8b21fe241fcccce731c7502ac837ecb5'
            });

            ShopifyBuy.UI.onReady(client).then(function(ui) {
                // Cold Plunge product
                var coldPlungeContainer = document.getElementById('product-cold-plunge');
                if (coldPlungeContainer && !coldPlungeContainer.hasChildNodes()) {
                    ui.createComponent('product', {
                        id: '10246638895423',
                        node: coldPlungeContainer,
                        moneyFormat: '%24%7B%7Bamount%7D%7D',
                        options: {
                            product: {
                                styles: {
                                    product: {
                                        "@media (min-width: 601px)": {
                                            "max-width": "100%",
                                            "margin-left": "0",
                                            "margin-bottom": "0"
                                        }
                                    },
                                    button: {
                                        "font-family": "Advercase, sans-serif",
                                        "font-size": "14px",
                                        "padding-top": "12px",
                                        "padding-bottom": "12px",
                                        "color": "#edecde",
                                        ":hover": { "background-color": "#c15658", "color": "#edecde" },
                                        "background-color": "#d65f62",
                                        ":focus": { "background-color": "#c15658" },
                                        "border-radius": "0px"
                                    },
                                    title: { display: "none" },
                                    price: { display: "none" }
                                },
                                contents: {
                                    img: false,
                                    title: false,
                                    price: false
                                },
                                text: {
                                    button: 'Add to Cart'
                                },
                                DOMEvents: {
                                    'click .shopify-buy__btn': function() {
                                        updateSelectedDates();
                                        setTimeout(injectDatesIntoCart, 500);
                                    }
                                }
                            },
                            cart: {
                                styles: {
                                    button: {
                                        "font-family": "Advercase, sans-serif",
                                        "color": "#edecde",
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658", "color": "#edecde" },
                                        ":focus": { "background-color": "#c15658" },
                                        "border-radius": "0px"
                                    },
                                    title: { "color": "#d65f62" },
                                    header: { "color": "#d65f62" },
                                    lineItems: { "color": "#d65f62" },
                                    subtotalText: { "color": "#d65f62" },
                                    subtotal: { "color": "#d65f62" },
                                    notice: { "color": "#d65f62" },
                                    currency: { "color": "#d65f62" },
                                    close: { "color": "#d65f62", ":hover": { "color": "#d65f62" } },
                                    empty: { "color": "#d65f62" },
                                    cart: { "background-color": "#edecde" },
                                    footer: { "background-color": "#edecde" }
                                },
                                text: {
                                    total: 'Subtotal',
                                    button: 'Checkout'
                                },
                                popup: false
                            },
                            lineItem: {
                                styles: {
                                    variantTitle: { "color": "#d65f62" },
                                    title: { "color": "#d65f62" },
                                    price: { "color": "#d65f62" },
                                    quantity: { "color": "#d65f62" },
                                    quantityIncrement: { "color": "#d65f62", "border-color": "#d65f62" },
                                    quantityDecrement: { "color": "#d65f62", "border-color": "#d65f62" },
                                    quantityInput: { "color": "#d65f62", "border-color": "#d65f62" }
                                }
                            },
                            toggle: {
                                styles: {
                                    toggle: {
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658" },
                                        ":focus": { "background-color": "#c15658" }
                                    },
                                    count: { "color": "#edecde" },
                                    iconPath: { "fill": "#edecde" }
                                }
                            }
                        }
                    });
                }

                // Floaties product
                var floatiesContainer = document.getElementById('product-floaties');
                if (floatiesContainer && !floatiesContainer.hasChildNodes()) {
                    ui.createComponent('product', {
                        id: '10246728089919',
                        node: floatiesContainer,
                        moneyFormat: '%24%7B%7Bamount%7D%7D',
                        options: {
                            product: {
                                styles: {
                                    product: {
                                        "@media (min-width: 601px)": {
                                            "max-width": "100%",
                                            "margin-left": "0",
                                            "margin-bottom": "0"
                                        }
                                    },
                                    button: {
                                        "font-family": "Advercase, sans-serif",
                                        "font-size": "14px",
                                        "padding-top": "12px",
                                        "padding-bottom": "12px",
                                        "color": "#edecde",
                                        ":hover": { "background-color": "#c15658", "color": "#edecde" },
                                        "background-color": "#d65f62",
                                        ":focus": { "background-color": "#c15658" },
                                        "border-radius": "0px"
                                    },
                                    title: { display: "none" },
                                    price: { display: "none" }
                                },
                                contents: {
                                    img: false,
                                    title: false,
                                    price: false
                                },
                                text: {
                                    button: 'Add to Cart'
                                }
                            },
                            cart: {
                                styles: {
                                    button: {
                                        "font-family": "Advercase, sans-serif",
                                        "color": "#edecde",
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658", "color": "#edecde" },
                                        ":focus": { "background-color": "#c15658" },
                                        "border-radius": "0px"
                                    },
                                    title: { "color": "#d65f62" },
                                    header: { "color": "#d65f62" },
                                    lineItems: { "color": "#d65f62" },
                                    subtotalText: { "color": "#d65f62" },
                                    subtotal: { "color": "#d65f62" },
                                    notice: { "color": "#d65f62" },
                                    currency: { "color": "#d65f62" },
                                    close: { "color": "#d65f62", ":hover": { "color": "#d65f62" } },
                                    empty: { "color": "#d65f62" },
                                    cart: { "background-color": "#edecde" },
                                    footer: { "background-color": "#edecde" }
                                },
                                text: {
                                    total: 'Subtotal',
                                    button: 'Checkout'
                                },
                                popup: false
                            },
                            lineItem: {
                                styles: {
                                    variantTitle: { "color": "#d65f62" },
                                    title: { "color": "#d65f62" },
                                    price: { "color": "#d65f62" },
                                    quantity: { "color": "#d65f62" },
                                    quantityIncrement: { "color": "#d65f62", "border-color": "#d65f62" },
                                    quantityDecrement: { "color": "#d65f62", "border-color": "#d65f62" },
                                    quantityInput: { "color": "#d65f62", "border-color": "#d65f62" }
                                }
                            },
                            toggle: {
                                styles: {
                                    toggle: {
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658" },
                                        ":focus": { "background-color": "#c15658" }
                                    },
                                    count: { "color": "#edecde" },
                                    iconPath: { "fill": "#edecde" }
                                }
                            }
                        }
                    });
                }

                rentalProductsInitialized = true;

                // Start watching for cart updates
                watchCartForDates();
            });
        });
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initDatePicker();

        // Initialize Shopify products when services tab is clicked
        var servicesTab = document.querySelector('[data-tab="services"]');
        if (servicesTab) {
            servicesTab.addEventListener('click', function() {
                setTimeout(initShopifyProducts, 100);
            });
        }
    });
})();
