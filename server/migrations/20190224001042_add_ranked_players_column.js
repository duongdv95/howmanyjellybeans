exports.up = function(knex, Promise) {
    return knex.schema.table("games", function(table) {
        table.json("ranked_players").notNullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('games', function(table) {
        table.dropColumn("ranked_players");
    })
};