import PgModel from "./PgModel"

export default class UserToken extends PgModel {
    static tableName = "user_tokens";
    static primaryKeyName = "token";

    token;
    user_id;
    client;
    expires_at;
    created_at;
    updated_at;
    deleted_at;

    constructor(args) {
        super();

        this.token = args.token;
        this.user_id = args.user_id;
        this.client = args.client;
        this.expires_at = args.expires_at;
        this.created_at = args.created_at;
        this.updated_at = args.updated_at;
        this.deleted_at = args.deleted_at;
    }
}