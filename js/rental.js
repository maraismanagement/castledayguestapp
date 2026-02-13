// Equipment Rental System
(function() {
    let guestReservation = null;
    let shopifyClient = null;
    let shopifyCheckout = null;

    // Initialize Shopify client
    function initShopify() {
        if (typeof ShopifyBuy !== 'undefined') {
            shopifyClient = ShopifyBuy.buildClient({
                domain: 'h1v0e4-10.myshopify.com',
                storefrontAccessToken: '8b21fe241fcccce731c7502ac837ecb5'
            });
        }
    }

    // Format date for display
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    // Look up guest reservation
    async function lookupGuest() {
        const guestName = document.getElementById('guestNameInput')?.value.trim();
        const errorDiv = document.getElementById('rentalError');
        const lookupBtn = document.getElementById('lookupBtn');

        if (!guestName || guestName.length < 2) {
            errorDiv.textContent = 'Please enter your name.';
            return;
        }

        // Show loading state
        lookupBtn.textContent = 'Looking up...';
        lookupBtn.disabled = true;
        errorDiv.textContent = '';

        try {
            const response = await fetch('/.netlify/functions/guesty-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guestName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Lookup failed');
            }

            if (data.reservations && data.reservations.length > 0) {
                // Use the first matching reservation
                guestReservation = data.reservations[0];
                showRentalOptions();
            } else {
                errorDiv.textContent = 'No active reservation found. Please check your name matches your booking.';
            }
        } catch (error) {
            console.error('Lookup error:', error);
            errorDiv.textContent = error.message || 'Unable to look up reservation. Please try again.';
        } finally {
            lookupBtn.textContent = 'Look Up My Stay';
            lookupBtn.disabled = false;
        }
    }

    // Show rental options after successful lookup
    function showRentalOptions() {
        const rentalOptions = document.getElementById('rentalOptions');
        const guestNameDisplay = document.getElementById('guestNameDisplay');
        const stayDates = document.getElementById('stayDates');
        const coldPlungeDate = document.getElementById('coldPlungeDate');

        if (!rentalOptions || !guestReservation) return;

        // Display guest info
        guestNameDisplay.textContent = guestReservation.guestName;
        stayDates.textContent = `${formatDate(guestReservation.checkIn)} - ${formatDate(guestReservation.checkOut)}`;

        // Set up date picker constraints
        const checkIn = new Date(guestReservation.checkIn);
        const checkOut = new Date(guestReservation.checkOut);

        // Cold plunge delivery can be any day during stay (last day needs next-day pickup)
        // Set min to check-in date, max to day before checkout
        const maxDelivery = new Date(checkOut);
        maxDelivery.setDate(maxDelivery.getDate() - 1);

        if (coldPlungeDate) {
            coldPlungeDate.min = checkIn.toISOString().split('T')[0];
            coldPlungeDate.max = maxDelivery.toISOString().split('T')[0];
            coldPlungeDate.value = checkIn.toISOString().split('T')[0];
        }

        // Show the rental options
        rentalOptions.style.display = 'block';

        // Hide the lookup form
        document.querySelector('.rental-lookup').style.display = 'none';

        // Initialize Shopify products
        initShopifyProducts();
    }

    // Initialize Shopify buy buttons
    function initShopifyProducts() {
        if (!shopifyClient) {
            initShopify();
        }

        // Cold Plunge product
        const coldPlungeContainer = document.getElementById('product-cold-plunge');
        if (coldPlungeContainer && shopifyClient) {
            ShopifyBuy.UI.onReady(shopifyClient).then(function(ui) {
                ui.createComponent('product', {
                    id: '9859098214697', // Replace with actual cold plunge product ID
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
                                    ":hover": {
                                        "background-color": "#5a1a1a"
                                    },
                                    "background-color": "#6b1f1f",
                                    ":focus": {
                                        "background-color": "#5a1a1a"
                                    },
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
                            events: {
                                beforeAddToCart: function(component) {
                                    // Add delivery date as line item property
                                    const dateInput = document.getElementById('coldPlungeDate');
                                    if (dateInput && dateInput.value) {
                                        const deliveryDate = formatDate(dateInput.value);
                                        const pickupDate = new Date(dateInput.value);
                                        pickupDate.setDate(pickupDate.getDate() + 1);

                                        component.model.selectedVariant.customAttributes = [
                                            { key: 'Delivery Date', value: deliveryDate + ' at 10am' },
                                            { key: 'Pickup Date', value: formatDate(pickupDate) + ' by 12pm' },
                                            { key: 'Guest Name', value: guestReservation.guestName },
                                            { key: 'Reservation', value: guestReservation.id }
                                        ];
                                    }
                                }
                            }
                        },
                        cart: {
                            styles: {
                                button: {
                                    "font-family": "Advercase, sans-serif",
                                    "background-color": "#6b1f1f",
                                    ":hover": { "background-color": "#5a1a1a" },
                                    ":focus": { "background-color": "#5a1a1a" },
                                    "border-radius": "0px"
                                }
                            },
                            text: {
                                total: 'Subtotal',
                                button: 'Checkout'
                            }
                        }
                    }
                });
            });
        }

        // Floaties product
        const floatiesContainer = document.getElementById('product-floaties');
        if (floatiesContainer && shopifyClient) {
            ShopifyBuy.UI.onReady(shopifyClient).then(function(ui) {
                ui.createComponent('product', {
                    id: '9859098247465', // Replace with actual floaties product ID
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
                                    ":hover": {
                                        "background-color": "#5a1a1a"
                                    },
                                    "background-color": "#6b1f1f",
                                    ":focus": {
                                        "background-color": "#5a1a1a"
                                    },
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
                            events: {
                                beforeAddToCart: function(component) {
                                    component.model.selectedVariant.customAttributes = [
                                        { key: 'Guest Name', value: guestReservation.guestName },
                                        { key: 'Stay Dates', value: `${formatDate(guestReservation.checkIn)} - ${formatDate(guestReservation.checkOut)}` },
                                        { key: 'Reservation', value: guestReservation.id }
                                    ];
                                }
                            }
                        },
                        cart: {
                            styles: {
                                button: {
                                    "font-family": "Advercase, sans-serif",
                                    "background-color": "#6b1f1f",
                                    ":hover": { "background-color": "#5a1a1a" },
                                    ":focus": { "background-color": "#5a1a1a" },
                                    "border-radius": "0px"
                                }
                            },
                            text: {
                                total: 'Subtotal',
                                button: 'Checkout'
                            }
                        }
                    }
                });
            });
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Set up lookup button click handler
        const lookupBtn = document.getElementById('lookupBtn');
        if (lookupBtn) {
            lookupBtn.addEventListener('click', lookupGuest);
        }

        // Allow Enter key to trigger lookup
        const guestInput = document.getElementById('guestNameInput');
        if (guestInput) {
            guestInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    lookupGuest();
                }
            });
        }

        // Initialize Shopify
        initShopify();
    });
})();
