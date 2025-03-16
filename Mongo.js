const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://Me123:Croptalk@croptalk.2iljc.mongodb.net/?retryWrites=true&w=majority&appName=CropTalk";
const dbName = "Accounts";
const collectionName = "Username";
let collection;

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        const db = client.db(dbName);
        collection = db.collection(collectionName);

    } catch (err) {
        console.error("Error:", err);
    }
}

async function checkLogin(username, password) {
    if (!collection) {
        console.error("Database collection is not ready.log");
        return;
    }

    try {
        const user = await collection.findOne({ username: username, password: password });

        if (user) {
            console.log("Login successful!");
            return true;
        } else {
            console.log("Login failed. Username or password incorrect.");
            return false;
        }
    } catch (err) {
        console.error("Error during login check:", err);
        return false;
    }
}

async function insertUser(type, username, email, name, password, admin) {
    if (!collection) {
        console.error("Database collection is not ready.sign");
        return;
    }

    try {
        await collection.insertOne({ type, username, email, name, password, admin });
        console.log("User inserted successfully!");
    } catch (err) {
        console.error("Error inserting user:", err);
    }
}

async function insertPost(type, username, question, upvotes, downvotes, reports, date) {
    if (!collection) {
        console.error("Database collection is not ready.sign");
        return;
    }

    try {
        await collection.insertOne({ type, username, question, upvotes, downvotes, reports, date });
        console.log("Post inserted successfully!");
    } catch (err) {
        console.error("Error inserting post:", err);
    } 
};

async function getPosts() {
    if (!collection) {
        console.error("Database collection is not ready.");
        return;
    }

    try {
        // Fetch all documents where type is 'post'
        const posts = await collection.find({ type: 'post' }).toArray();
        return posts;
    } catch (err) {
        console.error("Error fetching posts:", err);
        throw err;
    }
}


function print() {
    console.log("hi");
}

module.exports = {
    main,
    checkLogin,
    insertUser,
    insertPost
};

main();



