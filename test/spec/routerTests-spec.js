var router = require('../../router.js');
describe("register", function () {

    it(" should be error", function () {
        expect(router.register('/test', 6).toThrow());
    });
});