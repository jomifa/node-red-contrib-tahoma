"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpResponse = void 0;
var HttpResponse;
(function (HttpResponse) {
    HttpResponse[HttpResponse["OK"] = 200] = "OK";
    HttpResponse[HttpResponse["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpResponse[HttpResponse["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpResponse[HttpResponse["SERVER_ERROR"] = 500] = "SERVER_ERROR";
})(HttpResponse || (exports.HttpResponse = HttpResponse = {}));
