"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationHelper = void 0;
const express_validator_1 = require("express-validator");
const fieldNames = require("../constants/fieldNames");
const firebaseServices_1 = require("../services/firebaseServices");
const isValidAge = (value) => {
    const dateOfBirth = new Date(value);
    const today = new Date().setHours(0, 0, 0, 0);
    const diff = today - dateOfBirth.getTime() - 86400000;
    const ageDate = new Date(diff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 18) {
        return Promise.reject(new Error("Invalid age"));
    }
    return true;
};
const nameRegExString = "^[a-zA-Z]+(([',. -][a-zA-Z])?[a-zA-Z]*)*$";
class ValidationHelper {
    static async decodeFirebaseIdToken(firebaseIdToken) {
        if (typeof firebaseIdToken !== "undefined") {
            const IdToken = firebaseIdToken.split("Bearer ")[1];
            if (!IdToken) {
                return Error("Token does not start with Bearer");
            }
            try {
                const decodedIdToken = await firebaseServices_1.auth.verifyIdToken(IdToken);
                return decodedIdToken;
            }
            catch (error) {
                if (error instanceof Error) {
                    return error;
                }
                return Error("Invalid Id Token");
            }
        }
        return Error("Token does not exist");
    }
}
exports.ValidationHelper = ValidationHelper;
ValidationHelper.authErrorFormatter = ({ param }) => {
    return `${param} input invalid`;
};
ValidationHelper.userCreationValidators = [express_validator_1.body(fieldNames.emailField).notEmpty().isEmail(),
    express_validator_1.body(fieldNames.firstNameField).notEmpty().isLength({ max: 50, min: 2 }).matches(nameRegExString),
    express_validator_1.body(fieldNames.lastNameField).notEmpty().isLength({ max: 50, min: 2 }).matches(nameRegExString),
    express_validator_1.body(fieldNames.dateOfBirthField).notEmpty().custom(isValidAge),
    express_validator_1.body(fieldNames.passwordField).notEmpty().isStrongPassword(),
    express_validator_1.body(fieldNames.phoneNumberField).optional({ checkFalsy: true }).isMobilePhone("en-GB"),
    express_validator_1.body(fieldNames.companyNameField).optional({ checkFalsy: true }).isLength({ max: 50, min: 2 }).matches(nameRegExString),
];
ValidationHelper.userLoginValidators = [express_validator_1.body(fieldNames.emailField).notEmpty().isEmail()];
ValidationHelper.userUpdateValidators = [express_validator_1.body(fieldNames.firstNameField).notEmpty().isLength({ max: 50, min: 2 }).matches(nameRegExString),
    express_validator_1.body(fieldNames.lastNameField).notEmpty().isLength({ max: 50, min: 2 }).matches(nameRegExString),
    express_validator_1.body(fieldNames.dateOfBirthField).notEmpty().custom(isValidAge),
    express_validator_1.body(fieldNames.phoneNumberField).optional({ checkFalsy: true }).isMobilePhone("en-GB"),
    express_validator_1.body(fieldNames.companyNameField).optional({ checkFalsy: true }).isLength({ max: 50, min: 2 }).matches(nameRegExString),
];
//# sourceMappingURL=validationHelper.js.map