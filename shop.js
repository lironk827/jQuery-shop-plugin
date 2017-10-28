
$.fn.shopcart = function (cartContainer, options) {
    var categoryUrl = window.location.pathname.slice(1);
    var plugInProducts = this;
    plugInProducts.addClass('products');
    var settings = $.extend({
        add_to_cart_image_url: undefined,
        products_load_json: undefined,
        products_load_url: undefined,
        url_load_page_count: 4,
    }, options);

    var rangeToLoadObj = {
        from: 0,
        to: settings.url_load_page_count,
    }


    var myObj = {
        cartOffset: '',
        categories: '',

        init: function () {
            this.createMainWrapper();
            this.createShopWrapper();
            this.createCart(cartContainer);
            var isIdExist = this.getUserId();
            if (isIdExist) {
                this.getCartFromServer()
            }
            this.sourceOfProducts();
            this.getCategories();
            var initialCartContainerOffsetTop = $('.cartContainer').position().top;
            myObj.cartOffset = initialCartContainerOffsetTop;
        },

        getCategories: function () {
            $.get('http://localhost:8888/categories', function (data) {
                myObj.categories = data;
                myObj.createCategories();
            })
        },

        getUserId: function () {
            if (localStorage.getItem('cartUserId') !== null) {
                return true;
            } else {
                $.get('http://localhost:8888/getNewId', function (data, status) {
                    localStorage.setItem('cartUserId', data['cartUserId']);
                });
                return false;
            }
        },

        getCartFromServer: function () {
            var userId = localStorage.getItem('cartUserId');
            $.get('http://localhost:8888/loadCart', { 'userId': userId }, function (data) {
                if (data !== undefined) {
                    for (var i = 0; i < data.length; i++) {
                        var name = data[i]['name'];
                        var qty = data[i]['quantity'];
                        var price = data[i]['price'];
                        myObj.addNewProduct(price, name, qty);
                    }
                    myObj.updateTotalCart();
                }
            });
        },

        collectCartData: function () {
            var cart = []
            $('.itemRow ').each(function () {
                var item = {};
                $(this).find('.itemNameColumn').each(function () {
                    item['name'] = $(this).text();
                })
                $(this).find('.ItemQuantityInput').each(function () {
                    item['quantity'] = $(this).val();
                })
                $(this).find('.priceColumn').each(function () {
                    item['price'] = $(this).text();
                })
                cart.push(item);
            });
            return cart;
        },

        sendCartToServer: function (cart) {
            var cartString = JSON.stringify(cart);
            var userId = localStorage.getItem('cartUserId');
            $.get('http://localhost:8888/saveCart', { 'cart': cartString, 'userId': userId });
        },

        sourceOfProducts: function () {
            if (settings.products_load_url != undefined) {
                var path = settings.products_load_url + '/' + rangeToLoadObj.from + '/' + rangeToLoadObj.to + '/' + categoryUrl;
                $.post(path, function (data) {
                    myObj.addProducts(data);
                });
            } else {
                if (settings.products_load_json != undefined) {
                    var jsonObj = JSON.parse(settings.products_load_json);
                    myObj.addProducts(jsonObj);
                }
            }
        },

        createCategories: function () {
            var categoryContainer = $('<div>').addClass('container');
            for (var i = 0; i < myObj.categories.length; i++) {
                var categoryName = myObj.categories[i];
                var category = $('<a href=' + '/' + categoryName + ' class="btn btn-info" role="button">')
                    .text(categoryName);
                categoryContainer.append(category);
            }
            var categoryHolder = $('#categoryHolder').append(categoryContainer);
            var clickedCategory = $('a[href="/' + categoryUrl + '"]');
            clickedCategory.css({ 'background': '#fff', 'color': '#31b0d5' }).attr('href', '#');
        },

        createMainWrapper: function () {
            var mainWrapper = $('<div>').addClass('mainWrapper');
            mainWrapper.appendTo($('body'));
            var h1 = $('<h1>').text('My Shop');
            h1.appendTo(mainWrapper);
            var categoryHolder = $('<div>', { 'id': 'categoryHolder' });
            categoryHolder.appendTo(mainWrapper);
        },

        createShopWrapper: function () {
            var wrapper = $('<div>').addClass('shopWrapper');
            wrapper.appendTo($('.mainWrapper'));
            wrapper.append(plugInProducts);
            var bottomBorderDiv = $('<div>', { id: 'bottomBorderDiv' });
            $('.mainWrapper').append(bottomBorderDiv);
        },

        createCart: function (cart) {
            var cartObj;

            if (typeof cart == 'string') {
                cartObj = $(cart);
            } else {
                cartObj = cart;
            }
            cartObj.addClass('cartContainer');
            var cart = $('<table>').addClass('cartTable');

            this.createTableHead(cart);
            this.createTableBody(cart);
            this.createTableFoot(cart);

            $('div.shopWrapper').append(cart);
            cartObj.append(cart);
            $('.shopWrapper').append(cartObj);
        },

        createTableHead: function (cart) {
            var thead = $('<thead>');
            var theadTr = $('<tr>');
            var theadThElem = $('<th>', { colspan: 5 }).text('CART');
            cart.append(thead);
            thead.append(theadTr);
            theadTr.append(theadThElem);
        },
        createTableBody: function (cart) {
            var tbody = $('<tbody>');
            var tbodyTr = $('<tr>');
            var tbodyTh = $('<th>');
            var tbodyThProduct = $('<th>').text('Product');
            var tbodyThQty = $('<th>').text('Qty');
            var tbodyThPrice = $('<th>').text('Price');
            var tbodyThTotal = $('<th>').text('Total');
            cart.append(tbody);
            tbody.append(tbodyTr);
            tbodyTr.append(tbodyTh);
            tbodyTr.append(tbodyThProduct);
            tbodyTr.append(tbodyThQty);
            tbodyTr.append(tbodyThPrice);
            tbodyTr.append(tbodyThTotal);
        },
        createTableFoot: function (cart) {
            var tfoot = $('<tfoot>');
            var tfootTr = $('<tr>');
            var tfootTh1 = $('<th>');
            var tfootTh2 = $('<th>');
            var tfootThSummery = $('<th>').text('Summary:');
            var tfootThTotalQty = $('<th>').text('0').addClass('totalQty');
            var tfootThTotalResult = $('<th>').text('0').addClass('totalResult');
            cart.append(tfoot);
            tfoot.append(tfootTr);
            tfootTr.append(tfootTh1);
            tfootTr.append(tfootThSummery);
            tfootTr.append(tfootThTotalQty);
            tfootTr.append(tfootTh2);
            tfootTr.append(tfootThTotalResult);
            var paypalLogo = $('<img src="/images/paypal_button.png" width=40%>').attr('id','paypalLogo');
            var logoTr = $('<tr>');
            var logoTh = $('<th colspan=5>');
            var btn = $('<button width=100%>').css({'backgroundColor':'inherit','border':'none'});
            btn.append(paypalLogo);
            logoTh.append(btn);
            logoTr.append(logoTh);
            tfoot.append(logoTr);
        },

        addProducts: function (productsList) {
            for (var i = 0; i < productsList.length; i++) {
                this.addProductToShop(productsList[i]);
            }
            myObj.reloadPics();
        },

        addProductToShop: function (product) {
            var name = product.name;
            var image = product.image;
            var price = product.price;
            var singleProduct = $('<div>').addClass('singleProduct');
            var imgElement = $('<img>', { src: image });
            var h3NameElement = $('<h4>').text(name);
            var divElement = $('<div>');
            var labelPriceElement = $('<label>').addClass('priceLabel addDollarSign')
                .text(parseFloat(price).toFixed(2));
            var addButton;
            if (settings.add_to_cart_image_url != undefined) {
                addButton = $('<img>')
            } else {
                addButton = $('<button>').text('Add to cart');
            }
            addButton.data('attachedObj', product).addClass('addToCart').click(this.addToCartClicked);
            singleProduct.append(imgElement);
            singleProduct.append(h3NameElement);
            singleProduct.append(divElement);
            divElement.append(labelPriceElement);
            divElement.append(addButton);
            plugInProducts.append(singleProduct);
        },


        animateItem: function (originItem) {
            var cloned = originItem.clone();
            var Cords = originItem.position();
            var originProductWidth = originItem.width();
            var originProductHeight = originItem.height();
            cloned.css({
                width: originProductWidth,
                height: originProductHeight,
                top: Cords.top,
                left: Cords.left,
                position: 'absolute', margin: 0, padding: 0, background: 'white'
            });

            var cart = $('.cartTable');
            var cartPosition = (cart.position());
            var cartTop = cartPosition.top;
            var cartLeft = cartPosition.left;
            var tableHeight = cart.height() / 2;
            var tableWidth = cart.width() / 2;
            cloned.appendTo($('#products'));
            cloned.animate({
                left: cartLeft + tableWidth, top: cartTop + tableHeight, width: 10,
                height: 10, opacity: 0.3
            }, 500, function () {
                this.remove();
            }).fadeOut('slow');
        },

        addToCartClicked: function () {
            var singleProduct = $(this).parent().parent();

            myObj.animateItem(singleProduct);

            //update cart or add new product
            var price = $(this).data('attachedObj').price;
            var name = $(this).data('attachedObj').name;
            var isInCart = false;
            var itemName = '';
            $('.itemNameColumn').each(function () {
                if ($(this).text() === name) {
                    isInCart = true;
                    itemName = $(this);
                    return false;
                }
            });
            if (!isInCart) {
                myObj.addNewProduct(price, name);
            } else {
                var tdParent = itemName.parent();
                var itemRow = tdParent.parent();
                myObj.updateCart(itemRow, 'button');
            }
            myObj.updateTotalCart();
        },

        addNewProduct: function (price, name, quantity) {
            quantity = quantity || 1;
            var mainTr = $('<tr>').addClass('itemRow');
            var cancelTd = $('<td>');
            var cancelButton = $('<button>').addClass('removeItemButton').text('x').change(myObj.removeProduct);
            cancelTd.append(cancelButton);
            cancelButton.click(myObj.removeProduct);
            var nameTd = $('<td>');
            var itemNameLabel = $('<label>').addClass('itemNameColumn').text(name);
            nameTd.append(itemNameLabel);
            var qtyTd = $('<td>');
            var input = $('<input>', { min: '1', type: 'number', value: quantity })
                .addClass('ItemQuantityInput').click(myObj.changeQtyInput);
            qtyTd.append(input);
            var priceTd = $('<td>').addClass('priceColumn addDollarSign').text(price);
            var resultTd = $('<td>').addClass('resultColumn addDollarSign')
                .text(Math.round(parseFloat(price * input.val()).toFixed(2)));
            mainTr.append(cancelTd);
            mainTr.append(nameTd);
            mainTr.append(qtyTd);
            mainTr.append(priceTd);
            mainTr.append(resultTd);
            var table = $('.cartTable');
            table.append(mainTr);
        },

        updateTotalCart: function () {
            var cart = myObj.collectCartData();
            myObj.sendCartToServer(cart);


            var totalProducts = 0;
            var totalresult = 0;
            $('.itemRow .ItemQuantityInput').each(function () {
                totalProducts += parseInt($(this).val());
            });
            $('.itemRow .resultColumn').each(function () {
                totalresult += Math.round(parseFloat($(this).text()));
            });
            $('.totalQty').text(totalProducts);
            $('.totalResult').addClass('addDollarSign').text(totalresult);
        },

        updateCart: function (itemRow, source) {
            var value = itemRow.find('td .ItemQuantityInput');
            var price = itemRow.find('.priceColumn')
            var result = itemRow.find('.resultColumn');
            if (source == 'button') {
                value.val(parseInt(value.val()) + 1);
            }
            result.html(Math.round(parseFloat((value.val() * price.html()))));
        },

        changeQtyInput: function () {
            var parentTd = $(this);
            var itemRow = $(parentTd).parent().parent();
            myObj.updateCart(itemRow, 'input');
            myObj.updateTotalCart();
        },

        removeProduct: function (event) {
            var itemRow = $(event.currentTarget).parent().parent();
            itemRow.fadeOut(250, function () {
                this.remove();
                myObj.updateTotalCart();
            })
        },

        reloadPics: function () {
            var documentScrollTop = $(document).scrollTop();
            var windowHeight = $(window).height();
            var divTop = $('#bottomBorderDiv').position().top;
            if ($(window).scrollTop() >= ($(document).height() - windowHeight)) {
                rangeToLoadObj.from = rangeToLoadObj.to + 1;
                rangeToLoadObj.to += settings.url_load_page_count + 1;
                var path = settings.products_load_url + '/' + rangeToLoadObj.from + '/' + rangeToLoadObj.to + '/' + categoryUrl;
                $.post(path, function (data) {
                    myObj.addProducts(data);

                });
            }
        },

        getFixedCart: function (event) {
            var scrollTop = $(document).scrollTop();
            if (scrollTop > myObj.cartOffset) {
                $('.cartContainer').addClass('fixedTable');
            } else {
                $('.cartContainer').removeClass('fixedTable');
            }
        },
    }

    $(window).scroll(function () {
        myObj.reloadPics();
        setTimeout(2000);
    });

    myObj.init();

    return this;
}


$(window).ready(function () {
    $('#products').shopcart('#cart', {
        products_load_url: '/api/products',
        url_load_page_count: 3
    });
});


