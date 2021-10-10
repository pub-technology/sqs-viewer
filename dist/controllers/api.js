"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApi = void 0;
/**
 * List of API examples.
 * @route GET /api
 */
const getApi = (req, res) => {
    res.render("api/index", {
        title: "API Examples"
    });
};
exports.getApi = getApi;
//# sourceMappingURL=api.js.map