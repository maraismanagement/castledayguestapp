// Equipment Rental System - Simple version (name collected at checkout)
(function() {
    var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    var rentalProductsInitialized = false;

    // Format date for display
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    // Set up date picker with min date of tomorrow
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
                                    }
                                },
                                text: {
                                    total: 'Subtotal',
                                    button: 'Checkout'
                                },
                                popup: false
                            },
                            toggle: {
                                styles: {
                                    toggle: {
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658" },
                                        ":focus": { "background-color": "#c15658" }
                                    }
                                }
                            }
                        }
                    });
                }

                // Floaties product
                var floatiesContainer = document.getElementById('product-floaties');
                if (floatiesContainer && !floatiesContainer.hasChildNodes()) {
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
                                    }
                                },
                                text: {
                                    total: 'Subtotal',
                                    button: 'Checkout'
                                },
                                popup: false
                            },
                            toggle: {
                                styles: {
                                    toggle: {
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658" },
                                        ":focus": { "background-color": "#c15658" }
                                    }
                                }
                            }
                        }
                    });
                }

                rentalProductsInitialized = true;
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
