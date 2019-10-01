import { Pool } from "pg";
import { each, isUndefined, isObject, isArray, concat, map } from "lodash";

import * as dotenv from "dotenv";

dotenv.config();

const pgConf = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
};

const pool = new Pool(pgConf);

export default class PgModel {
    static tableName;
    static primaryKeyName;
    static op = {
        in: Symbol(),
    };

    static insert(data) {
        const keys = [];
        const params = [];
        const template = [];
        let i = 1;

        each(data, (value, key) => {
            template.push(`$${i}`);
            keys.push(key);
            params.push(value);
            i += 1;
        });

        const query = `INSERT INTO ${this.tableName} ("${keys.join('","')}") VALUES (${template.join(",")})`;

        return this.execute(query, params).then(() => new this(data));
    }

    static updateById(id, data) {
        const params = [];
        const template = [];
        let i = 1;

        each(data, (value, key) => {
            if (!isUndefined(value)) {
                template.push(`${key} = $${i} `); // need left space at the end
                params.push(value);
                i += 1;
            }
        });

        const query = `UPDATE ${this.tableName}  SET ${template.join(",")} WHERE "${this.primaryKeyName}" = '${id}'`;

        return this.execute(query, params).then(() => new this(data));
    }

    static update(where, update) {
        const { whereQuery, params } = this.getWhereQuery(where);
        let query = `UPDATE "${this.tableName}" SET `;
        let i = params.length + 1;

        each(update, (value, key) => {
            query += `"${key}"=$${i}`;
            params.push(value);
            query += ",";
            i++;
        });

        query = query.substring(0, query.length - 1);
        if (whereQuery) {
            query += ` WHERE ${whereQuery}`;
        }

        return this.execute(query, params).then(result => map(result.rows, value => new this(value)));
    }

    static updateBy(criteria, data) {
        const { whereQuery, params } = this.getWhereQuery(criteria);
        const template = [];
        let i = 1;

        each(data, (value, key) => {
            if (value) {
                template.push(`${key} = $${i} `);
                params.push(value);
                i += 1;
            }
        });

        const query = `UPDATE ${this.tableName}  SET ${template.join(",")} WHERE ${whereQuery}`;

        return this.execute(query, params).then(() => new this(data));
    }

    static findById(id, fields) {
        const { whereQuery, params } = this.getWhereQuery({
            [this.primaryKeyName]: id,
        });

        const query = `SELECT "${fields.join('","')}" FROM ${this.tableName} WHERE ${whereQuery}`;

        return this.execute(query, params).then((result) => {
            if (!result.rows[0]) {
                return null;
            }
            return new this(result.rows[0]);
        });
    }

    static findBy(criteria, fields) {
        const { whereQuery, params } = this.getWhereQuery(criteria);
        const query = `SELECT "${fields.join('","')}" FROM ${this.tableName} WHERE ${whereQuery}`;

        return this.execute(query, params).then((result) => {
            if (!result.rows) {
                return null;
            }
            return result.rows;
        });
    }

    static count(criteria, likeQuery) {
        const { whereQuery, params } = likeQuery ? this.getLikeQuery(criteria) : this.getWhereQuery(criteria);
        const query = !criteria
            ? `SELECT COUNT(*) FROM ${this.tableName}`
            : `SELECT COUNT(*) FROM ${this.tableName} WHERE ${whereQuery}`;

        return this.execute(query, params).then((result) => {
            return parseInt(result.rows[0].count, 10);
        });
    }

    static findOne(where, fields) {
        const {whereQuery, params} = this.getWhereQuery(where);

        const query = `SELECT "${fields.join('","')}" FROM ${this.tableName} WHERE ${whereQuery} LIMIT 1`;

        return this.execute(query, params).then((result) => {
            if (!result.rows[0]) {
                return null;
            }

            return new this(result.rows[0]);
        });
    }

    static deleteById(id) {
        const { whereQuery, params } = this.getWhereQuery({
            [this.primaryKeyName]: id,
        });

        const query = `DELETE FROM ${this.tableName} WHERE ${whereQuery}`;

        return this.execute(query, params);
    }

    static getWhereQuery(where, params) {
        let whereQuery = "";
        let newParams = params;
        let i = 1;

        each(where, (value, key) => {
            if (newParams.length) {
                whereQuery += " AND ";
            }

            if (isObject(value) && isArray(value[this.op.in])) {
                const template = [];

                each(value[this.op.in], () => {
                    template.push(`$${i}`);
                    i += 1;
                });

                whereQuery += `"${key}" IN (${template.join(",")})`;
                newParams = concat(newParams, value[this.op.in]);
            } else {
                whereQuery += `"${key}" = $${i}`;
                newParams.push(value);
                i += 1;
            }
        });

        return {
            whereQuery,
            params: newParams,
        };
    }

    static execute(query, params) {
        return pool.connect().then((client) =>
            client
                .query(query, params)
                .then((res) => {
                    client.release();
                    return res;
                })
                .catch((error) => {
                    client.release();
                    throw error;
                }),
        );
    }
}