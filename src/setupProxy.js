const proxy = require('http-proxy-middleware');
const env   = process.env.NODE_ENV || "development"

if(env === "development") {
    module.exports = function(app) {
      app.use(proxy('/api', { target: 'http://localhost:5000/'}));
    };
}