import {ValidationError, CustomValidator, body} from "express-validator";
import * as fieldNames from "../constants/fieldNames";
import {auth} from "../services/firebaseServices";
import {DecodedIdToken} from "firebase-admin/lib/auth/token-verifier";

const isValidAge: CustomValidator = (value) => {
    const dateOfBirth: Date = new Date(value);
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

export class ValidationHelper {
    public static readonly authErrorFormatter: ({param}: ValidationError) => string = ({param}: ValidationError) => {
        return `${param} input invalid`;
    };

    public static async decodeFirebaseIdToken(firebaseIdToken: string | undefined): Promise<DecodedIdToken | Error> {
        if (typeof firebaseIdToken !== "undefined") {
            const IdToken: string = firebaseIdToken.split("Bearer ")[1];
            if (!IdToken) {
                return Error("Token does not start with Bearer");
            }
            try {
                const decodedIdToken: DecodedIdToken = await auth.verifyIdToken(IdToken);
                return decodedIdToken;
            } catch (error) {
                if (error instanceof Error) {
                    return error;
                }
                return Error("Invalid Id Token");
            }
        }
        return Error("Token does not exist");
    }

    public static readonly userCreationValidators = [body(fieldNames.emailField).notEmpty().isEmail(),
    body(fieldNames.firstNameField).notEmpty().isLength({max: 50, min: 2}).matches(nameRegExString),
    body(fieldNames.lastNameField).notEmpty().isLength({max: 50, min: 2}).matches(nameRegExString),
    body(fieldNames.dateOfBirthField).notEmpty().custom(isValidAge),
    body(fieldNames.passwordField).notEmpty().isStrongPassword(),
    body(fieldNames.phoneNumberField).optional({checkFalsy: true}).isMobilePhone("en-GB"),
    body(fieldNames.companyNameField).optional({checkFalsy: true}).isLength({max: 50, min: 2}).matches(nameRegExString),
    ];

    public static readonly userLoginValidators = [body(fieldNames.emailField).notEmpty().isEmail()];

    public static readonly userUpdateValidators = [body(fieldNames.firstNameField).notEmpty().isLength({max: 50, min: 2}).matches(nameRegExString), //    eslint-disable-next-line
    body(fieldNames.lastNameField).notEmpty().isLength({max: 50, min: 2}).matches(nameRegExString),
    body(fieldNames.dateOfBirthField).notEmpty().custom(isValidAge),
    body(fieldNames.phoneNumberField).optional({checkFalsy: true}).isMobilePhone("en-GB"),
    body(fieldNames.companyNameField).optional({checkFalsy: true}).isLength({max: 50, min: 2}).matches(nameRegExString),
    ];
}
