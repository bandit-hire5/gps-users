import User from "../src/models/entity/pg/User";
import { v4 as getUuid } from "uuid";

const mainUserPassword = "12345678";

const users = [
    {
        id: getUuid(),
        email: "ruslannaeltok@gmail.com",
        name: "Bandit",
        password: User.saltPassword(mainUserPassword),
    },
];

const up = async () => {
    await User.insert(users[0]);
};

const down = async () => {
    await User.deleteById(users[1].id);
};

export {
    up,
    down,
}