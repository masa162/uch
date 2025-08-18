"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/upload/route";
exports.ids = ["app/api/upload/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_nakayamamasayuki_Documents_GitHub_uch_src_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/upload/route.ts */ \"(rsc)/./src/app/api/upload/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/upload/route\",\n        pathname: \"/api/upload\",\n        filename: \"route\",\n        bundlePath: \"app/api/upload/route\"\n    },\n    resolvedPagePath: \"/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/api/upload/route.ts\",\n    nextConfigOutput,\n    userland: _Users_nakayamamasayuki_Documents_GitHub_uch_src_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/upload/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ1cGxvYWQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm5ha2F5YW1hbWFzYXl1a2klMkZEb2N1bWVudHMlMkZHaXRIdWIlMkZ1Y2glMkZzcmMlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGbmFrYXlhbWFtYXNheXVraSUyRkRvY3VtZW50cyUyRkdpdEh1YiUyRnVjaCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD1zdGFuZGFsb25lJnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ3dCO0FBQ3JHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdWNoLz9lMjE2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9uYWtheWFtYW1hc2F5dWtpL0RvY3VtZW50cy9HaXRIdWIvdWNoL3NyYy9hcHAvYXBpL3VwbG9hZC9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJzdGFuZGFsb25lXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3VwbG9hZC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3VwbG9hZFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdXBsb2FkL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL25ha2F5YW1hbWFzYXl1a2kvRG9jdW1lbnRzL0dpdEh1Yi91Y2gvc3JjL2FwcC9hcGkvdXBsb2FkL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS91cGxvYWQvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/upload/route.ts":
/*!*************************************!*\
  !*** ./src/app/api/upload/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var cloudinary__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! cloudinary */ \"(rsc)/./node_modules/cloudinary/cloudinary.js\");\n/* harmony import */ var cloudinary__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(cloudinary__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n\n\n// Cloudinary設定\ncloudinary__WEBPACK_IMPORTED_MODULE_1__.v2.config({\n    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,\n    api_key: process.env.CLOUDINARY_API_KEY,\n    api_secret: process.env.CLOUDINARY_API_SECRET\n});\nasync function POST(request) {\n    try {\n        const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n        if (!session?.user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                message: \"ログインが必要です\"\n            }, {\n                status: 401\n            });\n        }\n        // ゲストユーザーの書き込み権限チェック\n        if (session.user.role === _prisma_client__WEBPACK_IMPORTED_MODULE_4__.Role.GUEST) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                message: \"権限がありません\"\n            }, {\n                status: 403\n            });\n        }\n        const data = await request.formData();\n        const file = data.get(\"file\");\n        if (!file) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                message: \"ファイルがありません\"\n            }, {\n                status: 400\n            });\n        }\n        const bytes = await file.arrayBuffer();\n        const buffer = Buffer.from(bytes);\n        // Cloudinaryにアップロード\n        const result = await new Promise((resolve, reject)=>{\n            cloudinary__WEBPACK_IMPORTED_MODULE_1__.v2.uploader.upload_stream({\n                folder: \"uchinokiroku_uploads\"\n            }, (error, result)=>{\n                if (error) {\n                    console.error(\"Cloudinary upload error:\", error);\n                    return reject(error);\n                }\n                resolve(result);\n            }).end(buffer);\n        });\n        // @ts-ignore\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            url: result.secure_url\n        }, {\n            status: 201\n        });\n    } catch (error) {\n        console.error(\"Upload API error:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"ファイルのアップロードに失敗しました\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS91cGxvYWQvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBdUQ7QUFDVjtBQUNJO0FBQ1Q7QUFFSDtBQUVyQyxlQUFlO0FBQ2ZFLDBDQUFVQSxDQUFDSSxNQUFNLENBQUM7SUFDaEJDLFlBQVlDLFFBQVFDLEdBQUcsQ0FBQ0MscUJBQXFCO0lBQzdDQyxTQUFTSCxRQUFRQyxHQUFHLENBQUNHLGtCQUFrQjtJQUN2Q0MsWUFBWUwsUUFBUUMsR0FBRyxDQUFDSyxxQkFBcUI7QUFDL0M7QUFFTyxlQUFlQyxLQUFLQyxPQUFvQjtJQUM3QyxJQUFJO1FBQ0YsTUFBTUMsVUFBVSxNQUFNZCxnRUFBZ0JBLENBQUNDLGtEQUFXQTtRQUVsRCxJQUFJLENBQUNhLFNBQVNDLE1BQU07WUFDbEIsT0FBT2xCLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUN0QjtnQkFBRUMsU0FBUztZQUFZLEdBQ3ZCO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxxQkFBcUI7UUFDckIsSUFBSUosUUFBUUMsSUFBSSxDQUFDSSxJQUFJLEtBQUtqQixnREFBSUEsQ0FBQ2tCLEtBQUssRUFBRTtZQUNwQyxPQUFPdkIscURBQVlBLENBQUNtQixJQUFJLENBQ3RCO2dCQUFFQyxTQUFTO1lBQVcsR0FDdEI7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE1BQU1HLE9BQU8sTUFBTVIsUUFBUVMsUUFBUTtRQUNuQyxNQUFNQyxPQUFvQkYsS0FBS0csR0FBRyxDQUFDO1FBRW5DLElBQUksQ0FBQ0QsTUFBTTtZQUNULE9BQU8xQixxREFBWUEsQ0FBQ21CLElBQUksQ0FBQztnQkFBRUMsU0FBUztZQUFhLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUNwRTtRQUVBLE1BQU1PLFFBQVEsTUFBTUYsS0FBS0csV0FBVztRQUNwQyxNQUFNQyxTQUFTQyxPQUFPQyxJQUFJLENBQUNKO1FBRTNCLG9CQUFvQjtRQUNwQixNQUFNSyxTQUFTLE1BQU0sSUFBSUMsUUFBUSxDQUFDQyxTQUFTQztZQUN6Q2xDLDBDQUFVQSxDQUFDbUMsUUFBUSxDQUFDQyxhQUFhLENBQy9CO2dCQUFFQyxRQUFRO1lBQXVCLEdBQ2pDLENBQUNDLE9BQU9QO2dCQUNOLElBQUlPLE9BQU87b0JBQ1RDLFFBQVFELEtBQUssQ0FBQyw0QkFBNEJBO29CQUMxQyxPQUFPSixPQUFPSTtnQkFDaEI7Z0JBQ0FMLFFBQVFGO1lBQ1YsR0FDQVMsR0FBRyxDQUFDWjtRQUNSO1FBRUEsYUFBYTtRQUNiLE9BQU85QixxREFBWUEsQ0FBQ21CLElBQUksQ0FBQztZQUFFd0IsS0FBS1YsT0FBT1csVUFBVTtRQUFDLEdBQUc7WUFBRXZCLFFBQVE7UUFBSTtJQUVyRSxFQUFFLE9BQU9tQixPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyxxQkFBcUJBO1FBQ25DLE9BQU94QyxxREFBWUEsQ0FBQ21CLElBQUksQ0FDdEI7WUFBRUMsU0FBUztRQUFxQixHQUNoQztZQUFFQyxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL3VjaC8uL3NyYy9hcHAvYXBpL3VwbG9hZC9yb3V0ZS50cz81MTIyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IHYyIGFzIGNsb3VkaW5hcnkgfSBmcm9tICdjbG91ZGluYXJ5J1xuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gJ25leHQtYXV0aC9uZXh0J1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICdAL2xpYi9hdXRoJ1xuaW1wb3J0IHR5cGUgeyBTZXNzaW9uIH0gZnJvbSAnbmV4dC1hdXRoJ1xuaW1wb3J0IHsgUm9sZSB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG4vLyBDbG91ZGluYXJ56Kit5a6aXG5jbG91ZGluYXJ5LmNvbmZpZyh7XG4gIGNsb3VkX25hbWU6IHByb2Nlc3MuZW52LkNMT1VESU5BUllfQ0xPVURfTkFNRSxcbiAgYXBpX2tleTogcHJvY2Vzcy5lbnYuQ0xPVURJTkFSWV9BUElfS0VZLFxuICBhcGlfc2VjcmV0OiBwcm9jZXNzLmVudi5DTE9VRElOQVJZX0FQSV9TRUNSRVQsXG59KVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKSBhcyBTZXNzaW9uIHwgbnVsbFxuICAgIFxuICAgIGlmICghc2Vzc2lvbj8udXNlcikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IG1lc3NhZ2U6ICfjg63jgrDjgqTjg7PjgYzlv4XopoHjgafjgZknIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIOOCsuOCueODiOODpuODvOOCtuODvOOBruabuOOBjei+vOOBv+aoqemZkOODgeOCp+ODg+OCr1xuICAgIGlmIChzZXNzaW9uLnVzZXIucm9sZSA9PT0gUm9sZS5HVUVTVCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IG1lc3NhZ2U6ICfmqKnpmZDjgYzjgYLjgorjgb7jgZvjgpMnIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDMgfVxuICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXF1ZXN0LmZvcm1EYXRhKClcbiAgICBjb25zdCBmaWxlOiBGaWxlIHwgbnVsbCA9IGRhdGEuZ2V0KCdmaWxlJykgYXMgdW5rbm93biBhcyBGaWxlXG5cbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IG1lc3NhZ2U6ICfjg5XjgqHjgqTjg6vjgYzjgYLjgorjgb7jgZvjgpMnIH0sIHsgc3RhdHVzOiA0MDAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBieXRlcyA9IGF3YWl0IGZpbGUuYXJyYXlCdWZmZXIoKVxuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGJ5dGVzKVxuXG4gICAgLy8gQ2xvdWRpbmFyeeOBq+OCouODg+ODl+ODreODvOODiVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNsb3VkaW5hcnkudXBsb2FkZXIudXBsb2FkX3N0cmVhbShcbiAgICAgICAgeyBmb2xkZXI6ICd1Y2hpbm9raXJva3VfdXBsb2FkcycgfSwgLy8gQ2xvdWRpbmFyeeOBruODleOCqeODq+ODgFxuICAgICAgICAoZXJyb3IsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ2xvdWRpbmFyeSB1cGxvYWQgZXJyb3I6JywgZXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgfVxuICAgICAgKS5lbmQoYnVmZmVyKVxuICAgIH0pXG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgdXJsOiByZXN1bHQuc2VjdXJlX3VybCB9LCB7IHN0YXR1czogMjAxIH0pXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdVcGxvYWQgQVBJIGVycm9yOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgbWVzc2FnZTogJ+ODleOCoeOCpOODq+OBruOCouODg+ODl+ODreODvOODieOBq+WkseaVl+OBl+OBvuOBl+OBnycgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgIClcbiAgfVxufSJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJ2MiIsImNsb3VkaW5hcnkiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJSb2xlIiwiY29uZmlnIiwiY2xvdWRfbmFtZSIsInByb2Nlc3MiLCJlbnYiLCJDTE9VRElOQVJZX0NMT1VEX05BTUUiLCJhcGlfa2V5IiwiQ0xPVURJTkFSWV9BUElfS0VZIiwiYXBpX3NlY3JldCIsIkNMT1VESU5BUllfQVBJX1NFQ1JFVCIsIlBPU1QiLCJyZXF1ZXN0Iiwic2Vzc2lvbiIsInVzZXIiLCJqc29uIiwibWVzc2FnZSIsInN0YXR1cyIsInJvbGUiLCJHVUVTVCIsImRhdGEiLCJmb3JtRGF0YSIsImZpbGUiLCJnZXQiLCJieXRlcyIsImFycmF5QnVmZmVyIiwiYnVmZmVyIiwiQnVmZmVyIiwiZnJvbSIsInJlc3VsdCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidXBsb2FkZXIiLCJ1cGxvYWRfc3RyZWFtIiwiZm9sZGVyIiwiZXJyb3IiLCJjb25zb2xlIiwiZW5kIiwidXJsIiwic2VjdXJlX3VybCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/upload/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions),\n/* harmony export */   getAuthSession: () => (/* binding */ getAuthSession)\n/* harmony export */ });\n/* harmony import */ var _next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @next-auth/prisma-adapter */ \"(rsc)/./node_modules/@next-auth/prisma-adapter/dist/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var next_auth_providers_line__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/providers/line */ \"(rsc)/./node_modules/next-auth/providers/line.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! bcrypt */ \"bcrypt\");\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(bcrypt__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\n\n\n\nconst authOptions = {\n    adapter: (0,_next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__.PrismaAdapter)(_prisma__WEBPACK_IMPORTED_MODULE_5__.prisma),\n    providers: [\n        ... true ? [\n            // 開発環境ではダミーのCredentialsProviderのみ\n            (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_4__[\"default\"])({\n                name: \"Development Credentials\",\n                credentials: {\n                    email: {\n                        label: \"email\",\n                        type: \"email\",\n                        placeholder: \"dev@example.com\"\n                    },\n                    password: {\n                        label: \"Password\",\n                        type: \"password\",\n                        placeholder: \"password\"\n                    }\n                },\n                async authorize (credentials, req) {\n                    // 開発環境では常に認証成功とみなす\n                    return {\n                        id: \"dev-user-id\",\n                        name: \"Dev User\",\n                        email: credentials?.email || \"dev@example.com\",\n                        username: undefined,\n                        role: \"USER\"\n                    };\n                }\n            }),\n            (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_4__[\"default\"])({\n                id: \"guest\",\n                name: \"Guest\",\n                credentials: {},\n                async authorize (credentials) {\n                    // ゲストユーザーを検索または作成\n                    let guestUser = await _prisma__WEBPACK_IMPORTED_MODULE_5__.prisma.user.findFirst({\n                        where: {\n                            role: \"GUEST\"\n                        }\n                    });\n                    if (!guestUser) {\n                        // ゲストユーザーが存在しない場合は作成\n                        guestUser = await _prisma__WEBPACK_IMPORTED_MODULE_5__.prisma.user.create({\n                            data: {\n                                name: \"ゲストユーザー\",\n                                username: \"guest\",\n                                role: \"GUEST\"\n                            }\n                        });\n                    }\n                    return {\n                        id: guestUser.id,\n                        name: guestUser.name,\n                        email: guestUser.email,\n                        username: guestUser.username || undefined,\n                        role: guestUser.role\n                    };\n                }\n            })\n        ] : 0\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.username = user.username;\n                token.role = user.role;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n                session.user.username = token.username;\n                session.user.role = token.role;\n            }\n            return session;\n        },\n        async redirect ({ url, baseUrl }) {\n            // 認証成功後のリダイレクト処理\n            if (url.startsWith(\"/\")) {\n                // 相対パスの場合は、baseUrlと結合\n                return `${baseUrl}${url}`;\n            } else if (new URL(url).origin === baseUrl) {\n                // 同じオリジンの場合は、そのまま使用\n                return url;\n            }\n            // 外部URLの場合は、baseUrlにリダイレクト\n            return baseUrl;\n        }\n    },\n    pages: {\n        signIn: \"/auth/signin\"\n    }\n};\nconst getAuthSession = ()=>(0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(authOptions);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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T0FBTztRQUNMQyxRQUFRO0lBQ1Y7QUFDRixFQUFFO0FBRUssTUFBTUMsaUJBQWlCLElBQU1uRCwyREFBZ0JBLENBQUNNLGFBQWEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly91Y2gvLi9zcmMvbGliL2F1dGgudHM/NjY5MiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFBZGFwdGVyIH0gZnJvbSBcIkBuZXh0LWF1dGgvcHJpc21hLWFkYXB0ZXJcIjtcbmltcG9ydCB7IE5leHRBdXRoT3B0aW9ucywgVXNlciwgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCBHb29nbGVQcm92aWRlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9nb29nbGVcIjtcbmltcG9ydCBMaW5lUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvbGluZVwiO1xuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHNcIjtcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gXCIuL3ByaXNtYVwiO1xuaW1wb3J0IGJjcnlwdCBmcm9tIFwiYmNyeXB0XCI7XG5pbXBvcnQgeyBSb2xlIH0gZnJvbSAnQHByaXNtYS9jbGllbnQnO1xuXG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuICBhZGFwdGVyOiBQcmlzbWFBZGFwdGVyKHByaXNtYSksXG4gIHByb3ZpZGVyczogW1xuICAgIC4uLihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50J1xuICAgICAgPyBbXG4gICAgICAgICAgLy8g6ZaL55m655Kw5aKD44Gn44Gv44OA44Of44O844GuQ3JlZGVudGlhbHNQcm92aWRlcuOBruOBv1xuICAgICAgICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgICAgICAgbmFtZTogXCJEZXZlbG9wbWVudCBDcmVkZW50aWFsc1wiLFxuICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgZW1haWw6IHsgbGFiZWw6IFwiZW1haWxcIiwgdHlwZTogXCJlbWFpbFwiLCBwbGFjZWhvbGRlcjogXCJkZXZAZXhhbXBsZS5jb21cIiB9LFxuICAgICAgICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJQYXNzd29yZFwiLCB0eXBlOiBcInBhc3N3b3JkXCIsIHBsYWNlaG9sZGVyOiBcInBhc3N3b3JkXCIgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMsIHJlcSkge1xuICAgICAgICAgICAgICAvLyDplovnmbrnkrDlooPjgafjga/luLjjgavoqo3oqLzmiJDlip/jgajjgb/jgarjgZlcbiAgICAgICAgICAgICAgcmV0dXJuIHsgaWQ6IFwiZGV2LXVzZXItaWRcIiwgbmFtZTogXCJEZXYgVXNlclwiLCBlbWFpbDogY3JlZGVudGlhbHM/LmVtYWlsIHx8IFwiZGV2QGV4YW1wbGUuY29tXCIsIHVzZXJuYW1lOiB1bmRlZmluZWQsIHJvbGU6ICdVU0VSJyBhcyBSb2xlIH0gYXMgVXNlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICAgICAgICBpZDogJ2d1ZXN0JyxcbiAgICAgICAgICAgIG5hbWU6ICdHdWVzdCcsXG4gICAgICAgICAgICBjcmVkZW50aWFsczoge30sXG4gICAgICAgICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgICAgLy8g44Ky44K544OI44Om44O844K244O844KS5qSc57Si44G+44Gf44Gv5L2c5oiQXG4gICAgICAgICAgICAgIGxldCBndWVzdFVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kRmlyc3Qoe1xuICAgICAgICAgICAgICAgIHdoZXJlOiB7IHJvbGU6ICdHVUVTVCcgfSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBpZiAoIWd1ZXN0VXNlcikge1xuICAgICAgICAgICAgICAgIC8vIOOCsuOCueODiOODpuODvOOCtuODvOOBjOWtmOWcqOOBl+OBquOBhOWgtOWQiOOBr+S9nOaIkFxuICAgICAgICAgICAgICAgIGd1ZXN0VXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICfjgrLjgrnjg4jjg6bjg7zjgrbjg7wnLFxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogJ2d1ZXN0JyxcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ0dVRVNUJyxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQ6IGd1ZXN0VXNlci5pZCxcbiAgICAgICAgICAgICAgICBuYW1lOiBndWVzdFVzZXIubmFtZSxcbiAgICAgICAgICAgICAgICBlbWFpbDogZ3Vlc3RVc2VyLmVtYWlsLFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBndWVzdFVzZXIudXNlcm5hbWUgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJvbGU6IGd1ZXN0VXNlci5yb2xlLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXVxuICAgICAgOiBbXG4gICAgICAgICAgLy8g5pys55Wq55Kw5aKD55So44Gu44OX44Ot44OQ44Kk44OA44O8XG4gICAgICAgICAgR29vZ2xlUHJvdmlkZXIoe1xuICAgICAgICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQgfHwgXCJcIixcbiAgICAgICAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQgfHwgXCJcIixcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBMaW5lUHJvdmlkZXIoe1xuICAgICAgICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkxJTkVfQ0xJRU5UX0lEIHx8IFwiXCIsXG4gICAgICAgICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkxJTkVfQ0xJRU5UX1NFQ1JFVCB8fCBcIlwiLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgICAgICAgbmFtZTogXCJDcmVkZW50aWFsc1wiLFxuICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgZW1haWw6IHsgbGFiZWw6IFwiZW1haWxcIiwgdHlwZTogXCJlbWFpbFwiLCBwbGFjZWhvbGRlcjogXCJlbWFpbFwiIH0sXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiBcIlBhc3N3b3JkXCIsIHR5cGU6IFwicGFzc3dvcmRcIiB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscywgcmVxKSB7XG4gICAgICAgICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kRmlyc3Qoe1xuICAgICAgICAgICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgICAgICAgICBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyDjg5Hjgrnjg6/jg7zjg4njgYzoqK3lrprjgZXjgozjgabjgYTjgarjgYTloLTlkIjjga/oqo3oqLzlpLHmlZdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgaXNQYXNzd29yZFZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoXG4gICAgICAgICAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgIHVzZXIucGFzc3dvcmRcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIGlmICghaXNQYXNzd29yZFZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICAgICAgICAuLi51c2VyLCBcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlci51c2VybmFtZSB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgcm9sZTogdXNlci5yb2xlIFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcbiAgICAgICAgICAgIGlkOiAnZ3Vlc3QnLFxuICAgICAgICAgICAgbmFtZTogJ0d1ZXN0JyxcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7fSxcbiAgICAgICAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICAgICAgICBsZXQgZ3Vlc3RVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZEZpcnN0KHtcbiAgICAgICAgICAgICAgICB3aGVyZTogeyByb2xlOiAnR1VFU1QnIH0sXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaWYgKCFndWVzdFVzZXIpIHtcbiAgICAgICAgICAgICAgICBndWVzdFVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAn44Ky44K544OI44Om44O844K244O8JyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6ICdndWVzdCcsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdHVUVTVCcsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBndWVzdFVzZXIuaWQsXG4gICAgICAgICAgICAgICAgbmFtZTogZ3Vlc3RVc2VyLm5hbWUsXG4gICAgICAgICAgICAgICAgZW1haWw6IGd1ZXN0VXNlci5lbWFpbCxcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogZ3Vlc3RVc2VyLnVzZXJuYW1lIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByb2xlOiBndWVzdFVzZXIucm9sZSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0pLFxuICBdLFxuICBzZXNzaW9uOiB7XG4gICAgc3RyYXRlZ3k6IFwiand0XCIsXG4gIH0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRva2VuLmlkID0gdXNlci5pZDtcbiAgICAgICAgdG9rZW4udXNlcm5hbWUgPSB1c2VyLnVzZXJuYW1lO1xuICAgICAgICB0b2tlbi5yb2xlID0gdXNlci5yb2xlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIGlmIChzZXNzaW9uLnVzZXIpIHtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4uaWQgYXMgc3RyaW5nO1xuICAgICAgICBzZXNzaW9uLnVzZXIudXNlcm5hbWUgPSB0b2tlbi51c2VybmFtZSBhcyBzdHJpbmc7XG4gICAgICAgIHNlc3Npb24udXNlci5yb2xlID0gdG9rZW4ucm9sZSBhcyBSb2xlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgfSxcbiAgICBhc3luYyByZWRpcmVjdCh7IHVybCwgYmFzZVVybCB9KSB7XG4gICAgICAvLyDoqo3oqLzmiJDlip/lvozjga7jg6rjg4DjgqTjg6zjgq/jg4jlh6bnkIZcbiAgICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIC8vIOebuOWvvuODkeOCueOBruWgtOWQiOOBr+OAgWJhc2VVcmzjgajntZDlkIhcbiAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmx9JHt1cmx9YDtcbiAgICAgIH0gZWxzZSBpZiAobmV3IFVSTCh1cmwpLm9yaWdpbiA9PT0gYmFzZVVybCkge1xuICAgICAgICAvLyDlkIzjgZjjgqrjg6rjgrjjg7Pjga7loLTlkIjjga/jgIHjgZ3jga7jgb7jgb7kvb/nlKhcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH1cbiAgICAgIC8vIOWklumDqFVSTOOBruWgtOWQiOOBr+OAgWJhc2VVcmzjgavjg6rjg4DjgqTjg6zjgq/jg4hcbiAgICAgIHJldHVybiBiYXNlVXJsO1xuICAgIH0sXG4gIH0sXG4gIHBhZ2VzOiB7XG4gICAgc2lnbkluOiBcIi9hdXRoL3NpZ25pblwiLFxuICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IGdldEF1dGhTZXNzaW9uID0gKCkgPT4gZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7Il0sIm5hbWVzIjpbIlByaXNtYUFkYXB0ZXIiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiR29vZ2xlUHJvdmlkZXIiLCJMaW5lUHJvdmlkZXIiLCJDcmVkZW50aWFsc1Byb3ZpZGVyIiwicHJpc21hIiwiYmNyeXB0IiwiYXV0aE9wdGlvbnMiLCJhZGFwdGVyIiwicHJvdmlkZXJzIiwicHJvY2VzcyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGxhY2Vob2xkZXIiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsInJlcSIsImlkIiwidXNlcm5hbWUiLCJ1bmRlZmluZWQiLCJyb2xlIiwiZ3Vlc3RVc2VyIiwidXNlciIsImZpbmRGaXJzdCIsIndoZXJlIiwiY3JlYXRlIiwiZGF0YSIsImNsaWVudElkIiwiZW52IiwiR09PR0xFX0NMSUVOVF9JRCIsImNsaWVudFNlY3JldCIsIkdPT0dMRV9DTElFTlRfU0VDUkVUIiwiTElORV9DTElFTlRfSUQiLCJMSU5FX0NMSUVOVF9TRUNSRVQiLCJpc1Bhc3N3b3JkVmFsaWQiLCJjb21wYXJlIiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJyZWRpcmVjdCIsInVybCIsImJhc2VVcmwiLCJzdGFydHNXaXRoIiwiVVJMIiwib3JpZ2luIiwicGFnZXMiLCJzaWduSW4iLCJnZXRBdXRoU2Vzc2lvbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNkM7QUFFN0MsTUFBTUMsa0JBQWtCQztBQUlqQixNQUFNQyxTQUFTRixnQkFBZ0JFLE1BQU0sSUFBSSxJQUFJSCx3REFBWUEsR0FBRTtBQUVsRSxJQUFJSSxJQUF5QixFQUFjSCxnQkFBZ0JFLE1BQU0sR0FBR0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly91Y2gvLi9zcmMvbGliL3ByaXNtYS50cz8wMWQ3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMge1xuICBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/PyBuZXcgUHJpc21hQ2xpZW50KClcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWEiXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsInByaXNtYSIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/@next-auth","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/@panva","vendor-chunks/oidc-token-hash","vendor-chunks/lodash","vendor-chunks/cloudinary","vendor-chunks/q"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();