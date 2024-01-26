const express = require("express");
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");
//init app and middleware

const app = express();
app.use(express.json()); //pass any json coming from a request so we can use it in handler functions

//db connection
let db;
connectToDb((err) => {
    if (!err) {
        //start listening to requests
        app.listen(3000, () => { console.log("App listening on port 3000") });
        db = getDb();
    }
});


//routes endpoints

app.get(
    "/books",
    (req, res) => {
        const page = req.query.page || 0; //if request param is not given, then is 0 by default
        const booksPerPage = 5;
        let books = [];
        //find() //returns a cursor (points to a set of docs outlined by the query)
        db
            .collection('books')
            .find()
            .sort({ author: 1 })
            .skip(page * booksPerPage) // at page 1, we skip the first 5 pages
            .limit(booksPerPage) // only show 5 books
            .forEach(book => books.push(book))
            .then(() => {
                res.status(200).json(books);

            })
            .catch(() => {
                res.status(500).json({ error: "Could not fecth the documents" });
            });


    }
);

app.get(
    "/books/:id",
    (req, res) => {

        if (ObjectId.isValid(req.params.id)) {

            const id = new ObjectId(req.params.id);

            db
                .collection('books')
                .findOne({ _id: id }) //this returns a document from the database
                .then(doc => {
                    res.status(200).json(doc);
                })
                .catch(() => {
                    res.status(500).json({ error: "Could not fetch the document" });
                });

        }
        else {
            res.status(500).json({ error: "Not a valid doc id" });
        }
    }
);

app.post(
    '/books',
    (req, res) => {
        //get body of post request
        const book = req.body;
        db.collection('books')
            .insertOne(book)
            .then((result) => {
                res.status(201).json(result);
            })
            .catch((err) => {
                res.status(500).json({ error: "Something went wrong when creating new document" })
            });

    }
);
//post many
app.post(
    '/books/many',
    (req, res) => {
        //get body of post request
        const book = req.body;
        db.collection('books')
            .insertMany(book)
            .then((result) => {
                res.status(201).json(result);
            })
            .catch((err) => {
                res.status(500).json({ error: "Something went wrong when creating new document" })
            });

    }
);

app.delete('/books/:id',
    (req, res) => {
        if (ObjectId.isValid(req.params.id)) {
            const id = new ObjectId(req.params.id);
            db
                .collection('books')
                .deleteOne({ _id: id })
                .then((result) => { res.status(200).json(result) })
                .catch((err) => { res.status(500).json({ error: "Something went wrong when trying to delete a document" }) })
        } else {
            res.status(500).json({ error: "Not a valid doc id" });
        }
    }
);

app.patch(
    '/books/:id',
    (req, res) => {
        const updates = req.body;

        if (ObjectId.isValid(req.params.id)) {
            const id = new ObjectId(req.params.id);

            db
                .collection('books')
                .updateOne({ _id: id }, { $set: updates })
                .then((result) => { res.status(200).json(result) })
                .catch((err) => { res.status(500).json({ error: "Something went wrong when trying to modify a document" }) })
        } else {
            res.status(500).json({ error: "Not a valid doc id" });
        }
    }
);