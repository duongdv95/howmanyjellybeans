try {
  const config = require("./config");
  module.exports = config
} catch(e) {
  module.exports = 
  {
    client: "pg",
    connection: {
      host: process.env.DBHOST,
      port: process.env.DBPORT,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBDATABASE,
      ssl: true
    }
  }
}