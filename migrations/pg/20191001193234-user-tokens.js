'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
    return db.createTable("user_tokens", {
        token: {
            type: "string",
            notNull: true,
            primaryKey: true
        },
        user_id: {
            type: "uuid",
            notNull: true,
            foreignKey: {
                name: "user_tokens_user_fk",
                table: "users",
                rules: {
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE"
                },
                mapping: "id"
            }
        },
        client: {
            type: "string"
        },
        expires_at: {
            type: "datetime",
            notNull: true,
        },
        created_at: {
            type: "datetime",
            defaultValue: "now()",
            notNull: true,
        },
        updated_at: {
            type: "datetime",
            defaultValue: "now()"
        },
        deleted_at: {
            type: "datetime"
        }
    })
        .then(() => db.runSql(`CREATE INDEX user_tokens_expires_at_index ON user_tokens (expires_at);`))
        .then(() => db.runSql(`CREATE INDEX user_tokens_deleted_at_index ON user_tokens (deleted_at);`));
};

exports.down = function(db) {
    return db.dropTable('user_tokens');
};

exports._meta = {
  "version": 1
};
