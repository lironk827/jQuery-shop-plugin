//revealing modoule - return object with two properties (register and route)
module.exports = (function () {
    //data : save all key-value when we call register property (which call register function)
    var data = {};
    var fs = require('fs');
    var url = require('url');

    function register(pathName, fn) {
        var validInput = (typeof fn === 'function' &&
            typeof pathName === 'string' &&
            pathName.charAt(0) === '/' &&
            pathName.indexOf(' ') === -1);

        if (!validInput) {
            throw new Error('first argument must be a valid url path and second argument must be function');
        }
        if (data.hasOwnProperty(pathName)) {
            throw new Error('path name already exists');
        } else {
            data[pathName] = fn;
        }
    }

    function router(request, response) {
        var urlParts = url.parse(request.url);
        var urlPath = urlParts.pathname;

        if (data.hasOwnProperty(urlPath)) {
            data[urlPath](request, response);
        } else {

            if (!isPathExist(request,response, urlPath)) {
                isFileExist(request, response, urlPath);
            }
        }
    }

    function getContentType(file) {
        var extensions = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.jpg': 'image/jpeg'
        };
        var l = file.match(/(\.)\w+/);
        if (l !== null) {
            return { 'content-type': extensions[l[0]] }
        } else {
            return undefined;
        }
    }

    function isPathExist(request, response,urlPath) {
        var arr = (urlPath.match(/[^\/]+/g));
        if (arr.length > 1) {

            var j = arr.length - 1;
            var disposal = [];
            disposal.unshift(arr[j]);
            while (j >= 0) {
                var str = '';
                for (var i = 0; i < j; i++) {
                    str += '/' + arr[i];
                }
                if (data.hasOwnProperty(str)) {
                    disposal.unshift(response);
                    data[str].apply(null, disposal);
                    return true;
                } else {
                    disposal.unshift(arr[i - 1]);
                }
                j--;
            }
        } else {
            return false;
        }
    }

    function isFileExist(request, response, urlPath) {
        var path = urlPath.replace('/', '');
        fs.access(path, fs.constants.R_OK, function (err) {
            if (!err) {
                ReadFile(response, path);
            } else {
                fs.access(path + '.html', fs.constants.R_OK, function (err) {
                    if (!err) {
                        ReadFile(response, path + '.html');
                    } else {
                        pageNotFound(request, response)
                    }
                });
            }
        });
    }

    function ReadFile(response, path) {
        var contentType = getContentType(path);
        fs.readFile(path, function (err, data) {
            response.writeHead(200, contentType);
            response.write(data);
            response.end();
        });
    }

    function pageNotFound(request, response) {
        response.writeHead(404, { 'content-type': 'text/html' });
        response.write('<h1>404: Page not found </h1>');
        response.end();
    }

    return {
        register: register,
        route: router,
    }

})();



















// //revealing modoule - return object with two properties (register and route)

// //data : save all key-value when we call register property (which call register function)
// var data = {};
// var fs = require('fs');
// var url = require('url');

// function register(pathName, fn) {
//     var validInput = (typeof fn === 'function' &&
//         typeof pathName === 'string' &&
//         pathName.charAt(0) === '/' &&
//         pathName.indexOf(' ') === -1);

//     if (!validInput) {
//         throw new Error('first argument must be a valid url path and second argument must be function');
//     }
//     if (data.hasOwnProperty(pathName)) {
//         throw new Error('path name already exists');
//     } else {
//         data[pathName] = fn;
//     }
// }

// function router(request, response) {
//     var urlParts = url.parse(request.url);
//     var urlPath = urlParts.pathname;

//     if (data.hasOwnProperty(urlPath)) {
//         data[urlPath](request, response);
//     } else {

//         if (!isPathExist(response, urlPath)) {
//             isFileExist(request, response, urlPath);
//         }
//     }
// }

// function getContentType(file) {
//     var extensions = {
//         '.html': 'text/html',
//         '.css': 'text/css',
//         '.js': 'application/javascript',
//         '.png': 'image/png',
//         '.gif': 'image/gif',
//         '.jpg': 'image/jpeg'
//     };
//     var l = file.match(/(\.)\w+/);
//     if (l !== null) {
//         return { 'content-type': extensions[l[0]] }
//     } else {
//         return undefined;
//     }
// }

// function isPathExist(response, urlPath) {
//     var arr = (urlPath.match(/[^\/]+/g));
//     if (arr.length > 1) {

//         var j = arr.length - 1;
//         var disposal = [];
//         disposal.unshift(arr[j]);
//         while (j >= 0) {
//             var str = '';
//             for (var i = 0; i < j; i++) {
//                 str += '/' + arr[i];
//             }
//             if (data.hasOwnProperty(str)) {
//                 disposal.unshift(response);
//                 data[str].apply(null, disposal);
//                 return true;
//             } else {
//                 disposal.unshift(arr[i - 1]);
//             }
//             j--;
//         }
//     } else {
//         return false;
//     }
// }

// function isFileExist(request, response, urlPath) {
//     var path = urlPath.replace('/', '');
//     fs.access(path, fs.constants.R_OK, function (err) {
//         if (!err) {
//             ReadFile(response, path);
//         } else {
//             fs.access(path + '.html', fs.constants.R_OK, function (err) {
//                 if (!err) {
//                     ReadFile(response, path + '.html');
//                 } else {
//                     pageNotFound(request, response)
//                 }
//             });
//         }
//     });
// }

// function ReadFile(response, path) {
//     var contentType = getContentType(path);
//     fs.readFile(path, function (err, data) {
//         response.writeHead(200, contentType);
//         response.write(data);
//         response.end();
//     });
// }

// function pageNotFound(request, response) {
//     response.writeHead(404, { 'content-type': 'text/html' });
//     response.write('<h1>404: Page not found </h1>');
//     response.end();
// }



