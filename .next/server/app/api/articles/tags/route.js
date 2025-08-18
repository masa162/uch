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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_3__.PrismaClient();\nasync function GET() {\n    try {\n        const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        // 認証なしでもタグ一覧を取得可能にする（サイドバー表示用）\n        // 過去に使用されたタグを取得（使用頻度順）\n        const articles = await prisma.article.findMany({\n            select: {\n                tags: true\n            },\n            where: {\n                tags: {\n                    isEmpty: false\n                }\n            }\n        });\n        // タグの使用頻度をカウント\n        const tagCount = {};\n        articles.forEach((article)=>{\n            article.tags.forEach((tag)=>{\n                if (typeof tag === \"string\") {\n                    tagCount[tag] = (tagCount[tag] || 0) + 1;\n                }\n            });\n        });\n        // 頻度順にソートして上位20個を取得\n        const sortedTags = Object.entries(tagCount).sort(([, a], [, b])=>b - a).slice(0, 20).map(([tag])=>tag);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            tags: sortedTags,\n            totalCount: Object.keys(tagCount).length\n        });\n    } catch (error) {\n        console.error(\"Tags API error:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal Server Error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hcnRpY2xlcy90YWdzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUMwQztBQUNPO0FBQ1Q7QUFDSztBQUU3QyxNQUFNSSxTQUFTLElBQUlELHdEQUFZQTtBQUV4QixlQUFlRTtJQUNwQixJQUFJO1FBQ0YsTUFBTUMsVUFBVSxNQUFNTCxnRUFBZ0JBLENBQUNDLGtEQUFXQTtRQUVsRCwrQkFBK0I7UUFDL0IsdUJBQXVCO1FBQ3ZCLE1BQU1LLFdBQVcsTUFBTUgsT0FBT0ksT0FBTyxDQUFDQyxRQUFRLENBQUM7WUFDN0NDLFFBQVE7Z0JBQ05DLE1BQU07WUFDUjtZQUNBQyxPQUFPO2dCQUNMRCxNQUFNO29CQUNKRSxTQUFTO2dCQUNYO1lBQ0Y7UUFDRjtRQUVBLGVBQWU7UUFDZixNQUFNQyxXQUFzQyxDQUFDO1FBQzdDUCxTQUFTUSxPQUFPLENBQUNQLENBQUFBO1lBQ2ZBLFFBQVFHLElBQUksQ0FBQ0ksT0FBTyxDQUFDQyxDQUFBQTtnQkFDbkIsSUFBSSxPQUFPQSxRQUFRLFVBQVU7b0JBQzNCRixRQUFRLENBQUNFLElBQUksR0FBRyxDQUFDRixRQUFRLENBQUNFLElBQUksSUFBSSxLQUFLO2dCQUN6QztZQUNGO1FBQ0Y7UUFFQSxvQkFBb0I7UUFDcEIsTUFBTUMsYUFBYUMsT0FBT0MsT0FBTyxDQUFDTCxVQUMvQk0sSUFBSSxDQUFDLENBQUMsR0FBRUMsRUFBRSxFQUFFLEdBQUVDLEVBQUUsR0FBS0EsSUFBSUQsR0FDekJFLEtBQUssQ0FBQyxHQUFHLElBQ1RDLEdBQUcsQ0FBQyxDQUFDLENBQUNSLElBQUksR0FBS0E7UUFFbEIsT0FBT2hCLHFEQUFZQSxDQUFDeUIsSUFBSSxDQUFDO1lBQ3ZCZCxNQUFNTTtZQUNOUyxZQUFZUixPQUFPUyxJQUFJLENBQUNiLFVBQVVjLE1BQU07UUFDMUM7SUFFRixFQUFFLE9BQU9DLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLG1CQUFtQkE7UUFDakMsT0FBTzdCLHFEQUFZQSxDQUFDeUIsSUFBSSxDQUFDO1lBQUVJLE9BQU87UUFBd0IsR0FBRztZQUFFRSxRQUFRO1FBQUk7SUFDN0U7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL3VjaC8uL3NyYy9hcHAvYXBpL2FydGljbGVzL3RhZ3Mvcm91dGUudHM/MDViYiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgnXG5pbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgvbmV4dCdcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSAnQC9saWIvYXV0aCdcbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG5jb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KClcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucykgYXMgU2Vzc2lvbiB8IG51bGxcbiAgICBcbiAgICAvLyDoqo3oqLzjgarjgZfjgafjgoLjgr/jgrDkuIDopqfjgpLlj5blvpflj6/og73jgavjgZnjgovvvIjjgrXjgqTjg4njg5Djg7zooajnpLrnlKjvvIlcbiAgICAvLyDpgY7ljrvjgavkvb/nlKjjgZXjgozjgZ/jgr/jgrDjgpLlj5blvpfvvIjkvb/nlKjpoLvluqbpoIbvvIlcbiAgICBjb25zdCBhcnRpY2xlcyA9IGF3YWl0IHByaXNtYS5hcnRpY2xlLmZpbmRNYW55KHtcbiAgICAgIHNlbGVjdDoge1xuICAgICAgICB0YWdzOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIHRhZ3M6IHtcbiAgICAgICAgICBpc0VtcHR5OiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIOOCv+OCsOOBruS9v+eUqOmgu+W6puOCkuOCq+OCpuODs+ODiFxuICAgIGNvbnN0IHRhZ0NvdW50OiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9ID0ge31cbiAgICBhcnRpY2xlcy5mb3JFYWNoKGFydGljbGUgPT4ge1xuICAgICAgYXJ0aWNsZS50YWdzLmZvckVhY2godGFnID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGFnQ291bnRbdGFnXSA9ICh0YWdDb3VudFt0YWddIHx8IDApICsgMVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyDpoLvluqbpoIbjgavjgr3jg7zjg4jjgZfjgabkuIrkvY0yMOWAi+OCkuWPluW+l1xuICAgIGNvbnN0IHNvcnRlZFRhZ3MgPSBPYmplY3QuZW50cmllcyh0YWdDb3VudClcbiAgICAgIC5zb3J0KChbLGFdLCBbLGJdKSA9PiBiIC0gYSlcbiAgICAgIC5zbGljZSgwLCAyMClcbiAgICAgIC5tYXAoKFt0YWddKSA9PiB0YWcpXG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgdGFnczogc29ydGVkVGFncyxcbiAgICAgIHRvdGFsQ291bnQ6IE9iamVjdC5rZXlzKHRhZ0NvdW50KS5sZW5ndGhcbiAgICB9KVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignVGFncyBBUEkgZXJyb3I6JywgZXJyb3IpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InIH0sIHsgc3RhdHVzOiA1MDAgfSlcbiAgfVxufSJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJQcmlzbWFDbGllbnQiLCJwcmlzbWEiLCJHRVQiLCJzZXNzaW9uIiwiYXJ0aWNsZXMiLCJhcnRpY2xlIiwiZmluZE1hbnkiLCJzZWxlY3QiLCJ0YWdzIiwid2hlcmUiLCJpc0VtcHR5IiwidGFnQ291bnQiLCJmb3JFYWNoIiwidGFnIiwic29ydGVkVGFncyIsIk9iamVjdCIsImVudHJpZXMiLCJzb3J0IiwiYSIsImIiLCJzbGljZSIsIm1hcCIsImpzb24iLCJ0b3RhbENvdW50Iiwia2V5cyIsImxlbmd0aCIsImVycm9yIiwiY29uc29sZSIsInN0YXR1cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/articles/tags/route.ts\n");

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
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/@next-auth","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/@panva","vendor-chunks/oidc-token-hash"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Farticles%2Ftags%2Froute&page=%2Fapi%2Farticles%2Ftags%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Farticles%2Ftags%2Froute.ts&appDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnakayamamasayuki%2FDocuments%2FGitHub%2Fuch&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();