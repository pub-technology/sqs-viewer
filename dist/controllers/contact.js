"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postContact = exports.getContact = void 0;
const express_validator_1 = require("express-validator");
/**
 * Contact form page.
 * @route GET /contact
 */
const getContact = (req, res) => {
    res.render("contact", {
        title: "Contact"
    });
};
exports.getContact = getContact;
/**
 * Send a contact form via Nodemailer.
 * @route POST /contact
 */
const postContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield express_validator_1.check("name", "Name cannot be blank").not().isEmpty().run(req);
    yield express_validator_1.check("email", "Email is not valid").isEmail().run(req);
    yield express_validator_1.check("message", "Message cannot be blank").not().isEmpty().run(req);
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/contact");
    }
    req.flash("success", { msg: "Email has been sent successfully!" });
    res.redirect("/contact");
});
exports.postContact = postContact;
//# sourceMappingURL=contact.js.map