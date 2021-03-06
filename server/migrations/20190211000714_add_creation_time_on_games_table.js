exports.up = function(knex, Promise) {
    return knex.schema.table("games", function(table) {
        table.timestamp("created_at").defaultTo(knex.fn.now(0))
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('games', function(table) {
        table.dropColumn("created_at")
    })
};