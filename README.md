# howmanyjellybeans

## Getting Started

git clone https://github.com/duongdv95/howmanyjellybeans.git

Create a config.js file in the root folder with the following:

```javascript
module.exports = 

{
  client: "pg",
  connection: {
    host: "your credentials",
    port: "your credentials",
    user: "your credentials",
    password: "your credentials",
    database: "your credentials",
    ssl: true
  }
}
```

npm install
npm install concurrently nodemon
concurrently "npm start" "nodemon server/app.js"
### Prerequisites

1. Node version 7+

### Installing


## Built With

## Authors

* **Daniel Duong** - [duongdv95](https://github.com/duongdv95)


## License


## Acknowledgments

* Thank you to PurpleBooth for creating this readme template
