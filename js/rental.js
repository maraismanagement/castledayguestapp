// Equipment Rental System
(function() {
    var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    var rentalProductsInitialized = false;

    // Set up date picker with min date of tomorrow
    function initDatePicker() {
        var coldPlungeDate = document.getElementById('coldPlungeDate');
        if (coldPlungeDate) {
            var today = new Date();
            var tomorrow = new Date(today);
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
                // Cold Plunge product (ID: 10246728089919)
                var coldPlungeContainer = document.getElementById('product-cold-plunge');
                if (coldPlungeContainer && !coldPlungeContainer.hasChildNodes()) {
                    ui.createComponent('product', {
                        id: '10246728089919',
                        node: coldPlungeContainer,
                        moneyFormat: '%24%7B%7Bamount%7D%7D',
                        options: {
                            product: {
                                styles: {
                                    button: {
                                        "font-family": "Advercase, sans-serif",
                                        "color": "#edecde",
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658" },
                                        ":focus": { "background-color": "#c15658" },
                                        "border-radius": "0px"
                                    }
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
                                contents: {
                                    note: true
                                },
                                styles: {
                                    button: {
                                        "color": "#edecde",
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658" },
                                        "border-radius": "0px"
                                    },
                                    cart: { "background-color": "#edecde" },
                                    footer: { "background-color": "#edecde" }
                                },
                                text: {
                                    noteDescription: 'Enter delivery date for cold plunge:'
                                }
                            }
                        }
                    });
                }

                // Floaties product (ID: 10246638895423)
                var floatiesContainer = document.getElementById('product-floaties');
                if (floatiesContainer && !floatiesContainer.hasChildNodes()) {
                    ui.createComponent('product', {
                        id: '10246638895423',
                        node: floatiesContainer,
                        moneyFormat: '%24%7B%7Bamount%7D%7D',
                        options: {
                            product: {
                                styles: {
                                    button: {
                                        "font-family": "Advercase, sans-serif",
                                        "color": "#edecde",
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658" },
                                        ":focus": { "background-color": "#c15658" },
                                        "border-radius": "0px"
                                    }
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
                                contents: {
                                    note: true
                                },
                                styles: {
                                    button: {
                                        "color": "#edecde",
                                        "background-color": "#d65f62",
                                        ":hover": { "background-color": "#c15658" },
                                        "border-radius": "0px"
                                    },
                                    cart: { "background-color": "#edecde" },
                                    footer: { "background-color": "#edecde" }
                                },
                                text: {
                                    noteDescription: 'Enter delivery date for cold plunge:'
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
