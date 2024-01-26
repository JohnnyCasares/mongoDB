const { MongoClient } = require("mongodb");


let dbConnection; //late initialization
let uri = 'link here';
module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(uri) //async function
            .then((client) => {
                console.log(client);
                dbConnection = client.db(); //init variable
                return cb(); //callback function 
            })
            .catch((err) => {
                console.log(err);
                return cb(err);
            });
    }, // connect to database

    getDb: () => dbConnection // return db connection after successfully connecting to it
};
