// Equipment Rental System - Simple version (name collected at checkout)
(function() {
    let shopifyClient = null;

    // Format date for display
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    // Set up date picker with min date of today
    function initDatePicker() {
        const coldPlungeDate = document.getElementById('coldPlungeDate');
        if (coldPlungeDate) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            coldPlungeDate.min = tomorrow.toISOString().split('T')[0];
            coldPlungeDate.value = tomorrow.toISOString().split('T')[0];
        }
    }

    // Initialize Shopify buy buttons when services tab is shown
    function initShopifyProducts() {
        if (typeof ShopifyBuy === 'undefined') return;

        const client = ShopifyBuy.buildClient({
            domain: 'h1v0e4-10.myshopify.com',
            storefrontAccessToken: '8b21fe241fcccce731c7502ac837ecb5'
        });

        // Cold Plunge product
        const coldPlungeContainer = document.getElementById('product-cold-plunge');
        if (coldPlungeContainer && !coldPlungeContainer.hasChildNodes()) {
            ShopifyBuy.UI.onReady(client).then(function(ui) {
                ui.createComponent('product', {
                    id: '10246728089919',
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
                                    ":hover": { "background-color": "#5a1a1a" },
                                    "background-color": "#6b1f1f",
                                    ":focus": { "background-color": "#5a1a1a" },
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
                                    const dateInput = document.getElementById('coldPlungeDate');
                                    if (dateInput && dateInput.value) {
                                        const deliveryDate = formatDate(dateInput.value);
                                        const pickupDate = new Date(dateInput.value);
                                        pickupDate.setDate(pickupDate.getDate() + 1);

                                        component.model.selectedVariant.customAttributes = [
                                            { key: 'Delivery', value: deliveryDate + ' at 10am' },
                                            { key: 'Pickup', value: formatDate(pickupDate) + ' by 12pm' }
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
                            }
                        }
                    }
                });
            });
        }

        // Floaties product
        const floatiesContainer = document.getElementById('product-floaties');
        if (floatiesContainer && !floatiesContainer.hasChildNodes()) {
            ShopifyBuy.UI.onReady(client).then(function(ui) {
                ui.createComponent('product', {
                    id: '10246638895423',
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
                                    ":hover": { "background-color": "#5a1a1a" },
                                    "background-color": "#6b1f1f",
                                    ":focus": { "background-color": "#5a1a1a" },
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
                                    "background-color": "#6b1f1f",
                                    ":hover": { "background-color": "#5a1a1a" },
                                    ":focus": { "background-color": "#5a1a1a" },
                                    "border-radius": "0px"
                                }
                            }
                        }
                    }
                });
            });
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initDatePicker();

        // Initialize Shopify products when services tab is clicked
        const servicesTab = document.querySelector('[data-tab="services"]');
        if (servicesTab) {
            servicesTab.addEventListener('click', function() {
                setTimeout(initShopifyProducts, 100);
            });
        }
    });
})();
