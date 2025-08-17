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
exports.id = "app/api/articles/tags/route";
exports.ids = ["app/api/articles/tags/route"];
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

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Farticles%2Ftags%2Froute&page=%2Fapi%2Farticles%2Ftags%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Farticles%2Ftags%2Froute.ts&appDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Farticles%2Ftags%2Froute&page=%2Fapi%2Farticles%2Ftags%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Farticles%2Ftags%2Froute.ts&appDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_nakayamamasayuki_Documents_GitHub_uch_src_app_api_articles_tags_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/articles/tags/route.ts */ \"(rsc)/./src/app/api/articles/tags/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/articles/tags/route\",\n        pathname: \"/api/articles/tags\",\n        filename: \"route\",\n        bundlePath: \"app/api/articles/tags/route\"\n    },\n    resolvedPagePath: \"/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/api/articles/tags/route.ts\",\n    nextConfigOutput,\n    userland: _Users_nakayamamasayuki_Documents_GitHub_uch_src_app_api_articles_tags_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/articles/tags/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhcnRpY2xlcyUyRnRhZ3MlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFydGljbGVzJTJGdGFncyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFydGljbGVzJTJGdGFncyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm5ha2F5YW1hbWFzYXl1a2klMkZEb2N1bWVudHMlMkZHaXRIdWIlMkZ1Y2glMkZzcmMlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGbmFrYXlhbWFtYXNheXVraSUyRkRvY3VtZW50cyUyRkdpdEh1YiUyRnVjaCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD1zdGFuZGFsb25lJnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQytCO0FBQzVHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdWNoLz83Mjc2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9uYWtheWFtYW1hc2F5dWtpL0RvY3VtZW50cy9HaXRIdWIvdWNoL3NyYy9hcHAvYXBpL2FydGljbGVzL3RhZ3Mvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwic3RhbmRhbG9uZVwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hcnRpY2xlcy90YWdzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXJ0aWNsZXMvdGFnc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXJ0aWNsZXMvdGFncy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9uYWtheWFtYW1hc2F5dWtpL0RvY3VtZW50cy9HaXRIdWIvdWNoL3NyYy9hcHAvYXBpL2FydGljbGVzL3RhZ3Mvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2FydGljbGVzL3RhZ3Mvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Farticles%2Ftags%2Froute&page=%2Fapi%2Farticles%2Ftags%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Farticles%2Ftags%2Froute.ts&appDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/articles/tags/route.ts":
/*!********************************************!*\
  !*** ./src/app/api/articles/tags/route.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_3__.PrismaClient();\nasync function GET() {\n    try {\n        const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Unauthorized\"\n            }, {\n                status: 401\n            });\n        }\n        // 過去に使用されたタグを取得（使用頻度順）\n        const articles = await prisma.article.findMany({\n            select: {\n                tags: true\n            },\n            where: {\n                tags: {\n                    isEmpty: false\n                }\n            }\n        });\n        // タグの使用頻度をカウント\n        const tagCount = {};\n        articles.forEach((article)=>{\n            article.tags.forEach((tag)=>{\n                if (typeof tag === \"string\") {\n                    tagCount[tag] = (tagCount[tag] || 0) + 1;\n                }\n            });\n        });\n        // 頻度順にソートして上位20個を取得\n        const sortedTags = Object.entries(tagCount).sort(([, a], [, b])=>b - a).slice(0, 20).map(([tag])=>tag);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            tags: sortedTags,\n            totalCount: Object.keys(tagCount).length\n        });\n    } catch (error) {\n        console.error(\"Tags API error:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal Server Error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hcnRpY2xlcy90YWdzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUMwQztBQUNPO0FBQ1Q7QUFDSztBQUU3QyxNQUFNSSxTQUFTLElBQUlELHdEQUFZQTtBQUV4QixlQUFlRTtJQUNwQixJQUFJO1FBQ0YsTUFBTUMsVUFBVSxNQUFNTCxnRUFBZ0JBLENBQUNDLGtEQUFXQTtRQUVsRCxJQUFJLENBQUNJLFNBQVM7WUFDWixPQUFPTixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO2dCQUFFQyxPQUFPO1lBQWUsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ3BFO1FBRUEsdUJBQXVCO1FBQ3ZCLE1BQU1DLFdBQVcsTUFBTU4sT0FBT08sT0FBTyxDQUFDQyxRQUFRLENBQUM7WUFDN0NDLFFBQVE7Z0JBQ05DLE1BQU07WUFDUjtZQUNBQyxPQUFPO2dCQUNMRCxNQUFNO29CQUNKRSxTQUFTO2dCQUNYO1lBQ0Y7UUFDRjtRQUVBLGVBQWU7UUFDZixNQUFNQyxXQUFzQyxDQUFDO1FBQzdDUCxTQUFTUSxPQUFPLENBQUNQLENBQUFBO1lBQ2ZBLFFBQVFHLElBQUksQ0FBQ0ksT0FBTyxDQUFDQyxDQUFBQTtnQkFDbkIsSUFBSSxPQUFPQSxRQUFRLFVBQVU7b0JBQzNCRixRQUFRLENBQUNFLElBQUksR0FBRyxDQUFDRixRQUFRLENBQUNFLElBQUksSUFBSSxLQUFLO2dCQUN6QztZQUNGO1FBQ0Y7UUFFQSxvQkFBb0I7UUFDcEIsTUFBTUMsYUFBYUMsT0FBT0MsT0FBTyxDQUFDTCxVQUMvQk0sSUFBSSxDQUFDLENBQUMsR0FBRUMsRUFBRSxFQUFFLEdBQUVDLEVBQUUsR0FBS0EsSUFBSUQsR0FDekJFLEtBQUssQ0FBQyxHQUFHLElBQ1RDLEdBQUcsQ0FBQyxDQUFDLENBQUNSLElBQUksR0FBS0E7UUFFbEIsT0FBT25CLHFEQUFZQSxDQUFDTyxJQUFJLENBQUM7WUFDdkJPLE1BQU1NO1lBQ05RLFlBQVlQLE9BQU9RLElBQUksQ0FBQ1osVUFBVWEsTUFBTTtRQUMxQztJQUVGLEVBQUUsT0FBT3RCLE9BQU87UUFDZHVCLFFBQVF2QixLQUFLLENBQUMsbUJBQW1CQTtRQUNqQyxPQUFPUixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBd0IsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDN0U7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL3VjaC8uL3NyYy9hcHAvYXBpL2FydGljbGVzL3RhZ3Mvcm91dGUudHM/MDViYiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgnXG5pbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgvbmV4dCdcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSAnQC9saWIvYXV0aCdcbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG5jb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KClcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucykgYXMgU2Vzc2lvbiB8IG51bGxcbiAgICBcbiAgICBpZiAoIXNlc3Npb24pIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pXG4gICAgfVxuXG4gICAgLy8g6YGO5Y6744Gr5L2/55So44GV44KM44Gf44K/44Kw44KS5Y+W5b6X77yI5L2/55So6aC75bqm6aCG77yJXG4gICAgY29uc3QgYXJ0aWNsZXMgPSBhd2FpdCBwcmlzbWEuYXJ0aWNsZS5maW5kTWFueSh7XG4gICAgICBzZWxlY3Q6IHtcbiAgICAgICAgdGFnczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB3aGVyZToge1xuICAgICAgICB0YWdzOiB7XG4gICAgICAgICAgaXNFbXB0eTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyDjgr/jgrDjga7kvb/nlKjpoLvluqbjgpLjgqvjgqbjg7Pjg4hcbiAgICBjb25zdCB0YWdDb3VudDogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSA9IHt9XG4gICAgYXJ0aWNsZXMuZm9yRWFjaChhcnRpY2xlID0+IHtcbiAgICAgIGFydGljbGUudGFncy5mb3JFYWNoKHRhZyA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgdGFnID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRhZ0NvdW50W3RhZ10gPSAodGFnQ291bnRbdGFnXSB8fCAwKSArIDFcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy8g6aC75bqm6aCG44Gr44K944O844OI44GX44Gm5LiK5L2NMjDlgIvjgpLlj5blvpdcbiAgICBjb25zdCBzb3J0ZWRUYWdzID0gT2JqZWN0LmVudHJpZXModGFnQ291bnQpXG4gICAgICAuc29ydCgoWyxhXSwgWyxiXSkgPT4gYiAtIGEpXG4gICAgICAuc2xpY2UoMCwgMjApXG4gICAgICAubWFwKChbdGFnXSkgPT4gdGFnKVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHRhZ3M6IHNvcnRlZFRhZ3MsXG4gICAgICB0b3RhbENvdW50OiBPYmplY3Qua2V5cyh0YWdDb3VudCkubGVuZ3RoXG4gICAgfSlcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1RhZ3MgQVBJIGVycm9yOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyB9LCB7IHN0YXR1czogNTAwIH0pXG4gIH1cbn0iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2VydmVyU2Vzc2lvbiIsImF1dGhPcHRpb25zIiwiUHJpc21hQ2xpZW50IiwicHJpc21hIiwiR0VUIiwic2Vzc2lvbiIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImFydGljbGVzIiwiYXJ0aWNsZSIsImZpbmRNYW55Iiwic2VsZWN0IiwidGFncyIsIndoZXJlIiwiaXNFbXB0eSIsInRhZ0NvdW50IiwiZm9yRWFjaCIsInRhZyIsInNvcnRlZFRhZ3MiLCJPYmplY3QiLCJlbnRyaWVzIiwic29ydCIsImEiLCJiIiwic2xpY2UiLCJtYXAiLCJ0b3RhbENvdW50Iiwia2V5cyIsImxlbmd0aCIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/articles/tags/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions),\n/* harmony export */   getAuthSession: () => (/* binding */ getAuthSession)\n/* harmony export */ });\n/* harmony import */ var _next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @next-auth/prisma-adapter */ \"(rsc)/./node_modules/@next-auth/prisma-adapter/dist/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var next_auth_providers_line__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/providers/line */ \"(rsc)/./node_modules/next-auth/providers/line.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! bcrypt */ \"bcrypt\");\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(bcrypt__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\n\n\n\nconst authOptions = {\n    adapter: (0,_next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__.PrismaAdapter)(_prisma__WEBPACK_IMPORTED_MODULE_5__.prisma),\n    providers: [\n        ... true ? [\n            // 開発環境ではダミーのCredentialsProviderのみ\n            (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_4__[\"default\"])({\n                name: \"Development Credentials\",\n                credentials: {\n                    email: {\n                        label: \"email\",\n                        type: \"email\",\n                        placeholder: \"dev@example.com\"\n                    },\n                    password: {\n                        label: \"Password\",\n                        type: \"password\",\n                        placeholder: \"password\"\n                    }\n                },\n                async authorize (credentials, req) {\n                    // 開発環境では常に認証成功とみなす\n                    return {\n                        id: \"dev-user-id\",\n                        name: \"Dev User\",\n                        email: credentials?.email || \"dev@example.com\",\n                        username: undefined\n                    };\n                }\n            })\n        ] : 0\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.username = user.username;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n                session.user.username = token.username;\n            }\n            return session;\n        },\n        async redirect ({ url, baseUrl }) {\n            // 認証成功後のリダイレクト処理\n            if (url.startsWith(\"/\")) {\n                // 相対パスの場合は、baseUrlと結合\n                return `${baseUrl}${url}`;\n            } else if (new URL(url).origin === baseUrl) {\n                // 同じオリジンの場合は、そのまま使用\n                return url;\n            }\n            // 外部URLの場合は、baseUrlにリダイレクト\n            return baseUrl;\n        }\n    },\n    pages:  true ? {} : 0\n};\nconst getAuthSession = ()=>(0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(authOptions);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBMEQ7QUFDVTtBQUNaO0FBQ0o7QUFDYztBQUNoQztBQUNOO0FBMEJyQixNQUFNTyxjQUErQjtJQUMxQ0MsU0FBU1Isd0VBQWFBLENBQUNLLDJDQUFNQTtJQUM3QkksV0FBVztXQUNMQyxLQUF5QixHQUN6QjtZQUNFLGtDQUFrQztZQUNsQ04sMkVBQW1CQSxDQUFDO2dCQUNsQk8sTUFBTTtnQkFDTkMsYUFBYTtvQkFDWEMsT0FBTzt3QkFBRUMsT0FBTzt3QkFBU0MsTUFBTTt3QkFBU0MsYUFBYTtvQkFBa0I7b0JBQ3ZFQyxVQUFVO3dCQUFFSCxPQUFPO3dCQUFZQyxNQUFNO3dCQUFZQyxhQUFhO29CQUFXO2dCQUMzRTtnQkFDQSxNQUFNRSxXQUFVTixXQUFXLEVBQUVPLEdBQUc7b0JBQzlCLG1CQUFtQjtvQkFDbkIsT0FBTzt3QkFBRUMsSUFBSTt3QkFBZVQsTUFBTTt3QkFBWUUsT0FBT0QsYUFBYUMsU0FBUzt3QkFBbUJRLFVBQVVDO29CQUFVO2dCQUNwSDtZQUNGO1NBQ0QsR0FDRCxDQThDQztLQUNOO0lBQ0RhLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0lBQ0FDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRVQsSUFBSSxFQUFFO1lBQ3ZCLElBQUlBLE1BQU07Z0JBQ1JTLE1BQU1uQixFQUFFLEdBQUdVLEtBQUtWLEVBQUU7Z0JBQ2xCbUIsTUFBTWxCLFFBQVEsR0FBR1MsS0FBS1QsUUFBUTtZQUNoQztZQUNBLE9BQU9rQjtRQUNUO1FBQ0EsTUFBTUosU0FBUSxFQUFFQSxPQUFPLEVBQUVJLEtBQUssRUFBRTtZQUM5QixJQUFJSixRQUFRTCxJQUFJLEVBQUU7Z0JBQ2hCSyxRQUFRTCxJQUFJLENBQUNWLEVBQUUsR0FBR21CLE1BQU1uQixFQUFFO2dCQUMxQmUsUUFBUUwsSUFBSSxDQUFDVCxRQUFRLEdBQUdrQixNQUFNbEIsUUFBUTtZQUN4QztZQUNBLE9BQU9jO1FBQ1Q7UUFDQSxNQUFNSyxVQUFTLEVBQUVDLEdBQUcsRUFBRUMsT0FBTyxFQUFFO1lBQzdCLGlCQUFpQjtZQUNqQixJQUFJRCxJQUFJRSxVQUFVLENBQUMsTUFBTTtnQkFDdkIsc0JBQXNCO2dCQUN0QixPQUFPLENBQUMsRUFBRUQsUUFBUSxFQUFFRCxJQUFJLENBQUM7WUFDM0IsT0FBTyxJQUFJLElBQUlHLElBQUlILEtBQUtJLE1BQU0sS0FBS0gsU0FBUztnQkFDMUMsb0JBQW9CO2dCQUNwQixPQUFPRDtZQUNUO1lBQ0EsMkJBQTJCO1lBQzNCLE9BQU9DO1FBQ1Q7SUFDRjtJQUNBSSxPQUFPcEMsS0FBeUIsR0FBZ0IsQ0FBQyxJQUFJLENBRXBEO0FBQ0gsRUFBRTtBQUVLLE1BQU1zQyxpQkFBaUIsSUFBTS9DLDJEQUFnQkEsQ0FBQ00sYUFBYSIsInNvdXJjZXMiOlsid2VicGFjazovL3VjaC8uL3NyYy9saWIvYXV0aC50cz82NjkyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUFkYXB0ZXIgfSBmcm9tIFwiQG5leHQtYXV0aC9wcmlzbWEtYWRhcHRlclwiO1xuaW1wb3J0IHsgTmV4dEF1dGhPcHRpb25zLCBVc2VyLCBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSBcIm5leHQtYXV0aFwiO1xuaW1wb3J0IEdvb2dsZVByb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2dvb2dsZVwiO1xuaW1wb3J0IExpbmVQcm92aWRlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9saW5lXCI7XG5pbXBvcnQgQ3JlZGVudGlhbHNQcm92aWRlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFsc1wiO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIi4vcHJpc21hXCI7XG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRcIjtcblxuLy8gTmV4dEF1dGguanPjga7lnovjgpLmi6HlvLVcbmRlY2xhcmUgbW9kdWxlIFwibmV4dC1hdXRoXCIge1xuICBpbnRlcmZhY2UgU2Vzc2lvbiB7XG4gICAgdXNlcjoge1xuICAgICAgaWQ6IHN0cmluZztcbiAgICAgIG5hbWU/OiBzdHJpbmcgfCBudWxsO1xuICAgICAgZW1haWw/OiBzdHJpbmcgfCBudWxsO1xuICAgICAgaW1hZ2U/OiBzdHJpbmcgfCBudWxsO1xuICAgICAgdXNlcm5hbWU/OiBzdHJpbmc7XG4gICAgfTtcbiAgfVxuICBpbnRlcmZhY2UgVXNlciB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB1c2VybmFtZT86IHN0cmluZztcbiAgfVxufVxuXG5kZWNsYXJlIG1vZHVsZSBcIm5leHQtYXV0aC9qd3RcIiB7XG4gIGludGVyZmFjZSBKV1Qge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdXNlcm5hbWU/OiBzdHJpbmc7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XG4gIGFkYXB0ZXI6IFByaXNtYUFkYXB0ZXIocHJpc21hKSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgLi4uKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnXG4gICAgICA/IFtcbiAgICAgICAgICAvLyDplovnmbrnkrDlooPjgafjga/jg4Djg5/jg7zjga5DcmVkZW50aWFsc1Byb3ZpZGVy44Gu44G/XG4gICAgICAgICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICAgICAgICBuYW1lOiBcIkRldmVsb3BtZW50IENyZWRlbnRpYWxzXCIsXG4gICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJlbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIsIHBsYWNlaG9sZGVyOiBcImRldkBleGFtcGxlLmNvbVwiIH0sXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiBcIlBhc3N3b3JkXCIsIHR5cGU6IFwicGFzc3dvcmRcIiwgcGxhY2Vob2xkZXI6IFwicGFzc3dvcmRcIiB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscywgcmVxKSB7XG4gICAgICAgICAgICAgIC8vIOmWi+eZuueSsOWig+OBp+OBr+W4uOOBq+iqjeiovOaIkOWKn+OBqOOBv+OBquOBmVxuICAgICAgICAgICAgICByZXR1cm4geyBpZDogXCJkZXYtdXNlci1pZFwiLCBuYW1lOiBcIkRldiBVc2VyXCIsIGVtYWlsOiBjcmVkZW50aWFscz8uZW1haWwgfHwgXCJkZXZAZXhhbXBsZS5jb21cIiwgdXNlcm5hbWU6IHVuZGVmaW5lZCB9IGFzIFVzZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICBdXG4gICAgICA6IFtcbiAgICAgICAgICAvLyDmnKznlarnkrDlooPnlKjjga7jg5fjg63jg5DjgqTjg4Djg7xcbiAgICAgICAgICBHb29nbGVQcm92aWRlcih7XG4gICAgICAgICAgICBjbGllbnRJZDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCB8fCBcIlwiLFxuICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX1NFQ1JFVCB8fCBcIlwiLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIExpbmVQcm92aWRlcih7XG4gICAgICAgICAgICBjbGllbnRJZDogcHJvY2Vzcy5lbnYuTElORV9DTElFTlRfSUQgfHwgXCJcIixcbiAgICAgICAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuTElORV9DTElFTlRfU0VDUkVUIHx8IFwiXCIsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICAgICAgICBuYW1lOiBcIkNyZWRlbnRpYWxzXCIsXG4gICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJlbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIsIHBsYWNlaG9sZGVyOiBcImVtYWlsXCIgfSxcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6IFwiUGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzLCByZXEpIHtcbiAgICAgICAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5wYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRGaXJzdCh7XG4gICAgICAgICAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICAgICAgICAgIGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICghdXNlci5wYXNzd29yZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIOODkeOCueODr+ODvOODieOBjOioreWumuOBleOCjOOBpuOBhOOBquOBhOWgtOWQiOOBr+iqjeiovOWkseaVl1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBpc1Bhc3N3b3JkVmFsaWQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShcbiAgICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzLnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgICAgdXNlci5wYXNzd29yZFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiB7IC4uLnVzZXIsIHVzZXJuYW1lOiB1c2VyLnVzZXJuYW1lIHx8IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSksXG4gIF0sXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogXCJqd3RcIixcbiAgfSxcbiAgY2FsbGJhY2tzOiB7XG4gICAgYXN5bmMgand0KHsgdG9rZW4sIHVzZXIgfSkge1xuICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgdG9rZW4uaWQgPSB1c2VyLmlkO1xuICAgICAgICB0b2tlbi51c2VybmFtZSA9IHVzZXIudXNlcm5hbWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmc7XG4gICAgICAgIHNlc3Npb24udXNlci51c2VybmFtZSA9IHRva2VuLnVzZXJuYW1lIGFzIHN0cmluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgIH0sXG4gICAgYXN5bmMgcmVkaXJlY3QoeyB1cmwsIGJhc2VVcmwgfSkge1xuICAgICAgLy8g6KqN6Ki85oiQ5Yqf5b6M44Gu44Oq44OA44Kk44Os44Kv44OI5Yem55CGXG4gICAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICAvLyDnm7jlr77jg5Hjgrnjga7loLTlkIjjga/jgIFiYXNlVXJs44Go57WQ5ZCIXG4gICAgICAgIHJldHVybiBgJHtiYXNlVXJsfSR7dXJsfWA7XG4gICAgICB9IGVsc2UgaWYgKG5ldyBVUkwodXJsKS5vcmlnaW4gPT09IGJhc2VVcmwpIHtcbiAgICAgICAgLy8g5ZCM44GY44Kq44Oq44K444Oz44Gu5aC05ZCI44Gv44CB44Gd44Gu44G+44G+5L2/55SoXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9XG4gICAgICAvLyDlpJbpg6hVUkzjga7loLTlkIjjga/jgIFiYXNlVXJs44Gr44Oq44OA44Kk44Os44Kv44OIXG4gICAgICByZXR1cm4gYmFzZVVybDtcbiAgICB9LFxuICB9LFxuICBwYWdlczogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyB7fSA6IHtcbiAgICBzaWduSW46IFwiL2F1dGgvbG9naW5cIixcbiAgfSxcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBdXRoU2Vzc2lvbiA9ICgpID0+IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpOyJdLCJuYW1lcyI6WyJQcmlzbWFBZGFwdGVyIiwiZ2V0U2VydmVyU2Vzc2lvbiIsIkdvb2dsZVByb3ZpZGVyIiwiTGluZVByb3ZpZGVyIiwiQ3JlZGVudGlhbHNQcm92aWRlciIsInByaXNtYSIsImJjcnlwdCIsImF1dGhPcHRpb25zIiwiYWRhcHRlciIsInByb3ZpZGVycyIsInByb2Nlc3MiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBsYWNlaG9sZGVyIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJyZXEiLCJpZCIsInVzZXJuYW1lIiwidW5kZWZpbmVkIiwiY2xpZW50SWQiLCJlbnYiLCJHT09HTEVfQ0xJRU5UX0lEIiwiY2xpZW50U2VjcmV0IiwiR09PR0xFX0NMSUVOVF9TRUNSRVQiLCJMSU5FX0NMSUVOVF9JRCIsIkxJTkVfQ0xJRU5UX1NFQ1JFVCIsInVzZXIiLCJmaW5kRmlyc3QiLCJ3aGVyZSIsImlzUGFzc3dvcmRWYWxpZCIsImNvbXBhcmUiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJjYWxsYmFja3MiLCJqd3QiLCJ0b2tlbiIsInJlZGlyZWN0IiwidXJsIiwiYmFzZVVybCIsInN0YXJ0c1dpdGgiLCJVUkwiLCJvcmlnaW4iLCJwYWdlcyIsInNpZ25JbiIsImdldEF1dGhTZXNzaW9uIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

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
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/@next-auth","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/@panva","vendor-chunks/oidc-token-hash"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Farticles%2Ftags%2Froute&page=%2Fapi%2Farticles%2Ftags%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Farticles%2Ftags%2Froute.ts&appDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();