import PgModel from "./PgModel"
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

import UserToken from "./UserToken";

export default class User extends PgModel {
    static tableName = "users";
    static primaryKeyName = "uuid";

    id;
    email;
    name;
    password;
    created_at;
    odometer;

    constructor(args) {
        super();

        this.id = args.id;
        this.email = args.email;
        this.name = args.name;
        this.password = args.password;
        this.created_at = args.created_at;
        this.odometer = args.odometer;
    }

    static saltPassword(password) {
        return bcrypt.hashSync(password, salt);
    }

    static findByToken(token, fields) {
        const query = `SELECT "${fields.join('","')}" FROM ${this.tableName} INNER JOIN "user_tokens" ON "${
            this.tableName
            }"."id" = "user_tokens"."user_id" WHERE "user_tokens"."token" = '${token}';`;

        return this.execute(query).then((result) => {
            if (!result.rows[0]) {
                return null;
            }
            return new this(result.rows[0]);
        });
    }

    static findByEmail(email, fields) {
        const query = `SELECT "${fields.join('","')}" FROM ${this.tableName} WHERE "email" = '${email}';`;

        return this.execute(query).then((result) => {
            if (!result.rows[0]) {
                return null;
            }
            return new this(result.rows[0]);
        });
    }

    isPasswordValid(password) {
        return bcrypt.compareSync(password, this.password);
    }

    async getAuthToken() {
        const token = crypto.randomBytes(64).toString("hex");
        const today = new Date();

        today.setHours(today.getHours() + 1);

        await UserToken.insert({
            token,
            user_id: this.id,
            expires_at: today,
        });
        return token;
    }

    async setNewPassword(newPassword) {
        const query = `UPDATE ${User.tableName} 
            SET "password" = '${newPassword}' 
            WHERE "id" = '${this.id}'`;

        return PgModel.execute(query);
    }
}