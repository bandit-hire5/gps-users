import User from "../models/entity/pg/User";
import { isEmail, isUUID } from "validator";
import { v4 as getUuid } from "uuid";

import checkPassword from "../helpers/validation/password";
import errorMessages from "../constants/errorMessages";

export default async (req, res) => {
    const {email, password, name} = req.body;

    const user = await User.findByEmail(email, ["id"]);

    let errorType = checkPassword(password);

    if (!email || !isEmail(email)) {
        errorType = "INVALID_EMAIL_ERR";
    } else if (user) {
        errorType = "USER_ALREADY_EXISTS";
    }

    if (errorType) {
        res.status(400).json({
            code: 400,
            type: errorType,
            message: errorMessages[errorType],
        });

        return;
    }

    const newUser = await User.insert({
        id: getUuid(),
        email: email.toLowerCase(),
        name: name,
        password: User.saltPassword(password),
    });

    const authToken = await newUser.getAuthToken();

    res.status(200).json({
        data: {
            id: newUser.id,
            token: authToken,
        },
    });
};