import User from "../models/entity/pg/User";
import { isEmail, isUUID } from "validator";
import { isString } from "lodash";

import errorMessages from "../constants/errorMessages";

export default async (req, res) => {
    const {email, password} = req.body;

    let user;
    let errorType = "";

    if (!email || !password) {
        errorType = "USER_SIGN_IN_ERR";
    } else if (!isEmail(email) || !isString(password)) {
        errorType = "USER_SIGN_IN_INVALID";
    } else {
        user = await User.findByEmail(email.toLowerCase(),
            [
                "id",
                "password",
            ],
        );

        if (!user || !user.isPasswordValid(password)) {
            errorType = "USER_INVALID_CREDENTIALS";
        }
    }

    if (errorType) {
        res.status(400).json({
            code: 400,
            type: errorType,
            message: errorMessages[errorType],
        });

        return;
    }

    const authToken = await user.getAuthToken();

    res.status(200).json({
        data: {
            id: user.id,
            token: authToken,
        },
    });
};