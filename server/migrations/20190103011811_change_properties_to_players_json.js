exports.up = function(knex, Promise) {
    return knex.schema.table("games", function(table) {
        table.dropColumn("properties");
        table.json("players").notNullable();
        table.boolean("game_end").defaultTo(false);
        table.integer("winning_number").notNullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('games', function(table) {
        table.json("properties").notNullable()
        table.dropColumn('players')
        table.dropColumn('game_end')
        table.dropColumn('winning_number')
    })
};