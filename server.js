var http = require('http');
var hostName = 'localhost';
var port = 8888;
var router = require('./router');
var url = require('url');
var fs = require('fs');
var idStorage = [];
var file = JSON.parse(fs.readFileSync('./api/products/products.json', 'utf8'));

registerCategory();

function registerCategory() {
    if (file === undefined) {
        throw new Error('No json available');
    } else {
        for (var cat in file) {
            router.register('/' + cat, loadShop);
        }
    }
}

// function loadCategory(request, response) {
//     loadShop(request, response);
// }

function loadShop(request, response) {
    fs.readFile('shop.html', function (err, data) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
    });
}

function defaultCategoryLaunch(request, response) {
    response.writeHead(302, { location: '/books' });
    response.end();
}

function loadAllProducts(response, from, to, category) {
    from = parseInt(from);
    to = parseInt(to) + 1;
    var jsObject = file[category];
    var sliced = jsObject.slice(from, to);
    var result = JSON.stringify(sliced);
    response.writeHead(200, { 'Content-type': 'application/json' });
    response.write(result);
    response.end();
}

function getNewId(request, response) {
    var newId = idStorage.length + 1;
    idStorage.length++;
    var result = JSON.stringify({ 'cartUserId': newId });
    response.writeHead(200, { 'Content-type': 'application/json' });
    response.write(result);
    response.end();
}

function loadCart(request, response) {
    var params = url.parse(request['url']).query;
    var id = parseInt(params.split('=')[1]);
    var cart = idStorage[id];
    if (cart) {
        response.writeHead(200, { 'Content-type': 'application/json' });
        response.write(cart);
    }
    response.end();
}

function saveCart(request, response) {
    var fullUrl = request['url'];
    var params = url.parse(fullUrl, true).query;
    idStorage[parseInt(params['userId'])] = (params['cart']);
}

function sendCategories(request, response) {
    var keys = Object.keys(file);
    var stringKeys = JSON.stringify(keys);
    response.writeHead(200, { 'Content-type': 'application/json' });
    response.write(stringKeys);
    response.end();
}

router.register('/categories', sendCategories);
router.register('/api/products', loadAllProducts)
router.register('/', defaultCategoryLaunch);
router.register('/getNewId', getNewId);
router.register('/saveCart', saveCart);
router.register('/loadCart', loadCart);

http.createServer(onRequest).listen(port, hostName).on('connection', function (socket) {
    console.log('socket :' + JSON.stringify(socket.address()))
});

function onRequest(request, response) {
    router.route(request, response);
}