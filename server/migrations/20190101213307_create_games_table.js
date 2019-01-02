exports.up = function(knex, Promise) {
    return knex.schema.createTable("games", function(table) {
        table.string("access_code").primary()
        table.json("properties").notNullable()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("games");
};