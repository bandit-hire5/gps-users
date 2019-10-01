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
    return db.createTable('users', {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
        },
        email: {
            type: "string",
            unique: true,
            notNull: true,
        },
        name: {
            type: 'string',
            notNull: true,
        },
        password: {
            type: 'string',
            notNull: true,
        },
        created_at: {
            type: "datetime",
            defaultValue: "now()",
            notNull: true,
        },
        odometer: {
            type: 'float',
            notNull: true,
            defaultValue: 0,
        },
    })
        .then(() => db.runSql(`CREATE INDEX users_email_index ON users (email);`))
        .then(() => db.runSql(`CREATE INDEX users_odometer_index ON users (odometer);`));
};

exports.down = function(db) {
  return db.dropTable('users');
};

exports._meta = {
  "version": 1
};
