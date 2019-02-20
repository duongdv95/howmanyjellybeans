# howmanyjellybeans

## Getting Started

git clone https://github.com/duongdv95/trello-clone.git

Create a config.js file in the root folder with the following:

```javascript
module.exports = 

{
  client: "pg",
  connection: {
    host: "ec2-54-235-247-209.compute-1.amazonaws.com",
    port: "5432",
    user: "ojxxmnsncgadwv",
    password: "08c7b621ed0482dd95c9a73ba6a49ac2258a6fe4ba6439c249e762411cf68498",
    database: "df2es3f1dhks7b",
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
