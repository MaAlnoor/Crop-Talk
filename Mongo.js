const { MongoClient } = require("mongodb");
const bcrypt = require('bcrypt');

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
        console.error("Database collection is not ready.");
        return false;
    }

    try {
        // First check if the input matches a username
        const userByUsername = await collection.findOne({ username: username });
        
        if (userByUsername) {
            // Compare the plaintext password with the stored hash
            const passwordMatch = await bcrypt.compare(password, userByUsername.password);
            if (passwordMatch) {
                console.log("Login successful (username)!");
                return true;
            }
        }
        
        // If no match by username, check if it matches an email
        const userByEmail = await collection.findOne({ email: username });
        
        if (userByEmail) {
            // Compare the plaintext password with the stored hash
            const passwordMatch = await bcrypt.compare(password, userByEmail.password);
            if (passwordMatch) {
                console.log("Login successful (email)!");
                return true;
            }
        }
        
        console.log("Login failed. Username/email or password incorrect.");
        return false;
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

async function insertReply(type, username, question, answer, upvotes, downvotes, reports, date) {
    if (!collection) {
        console.error("Database collection is not ready.");
        return;
    }

    try {
        await collection.insertOne({ type, username, question, answer, upvotes, downvotes, reports, date });
        console.log("Reply inserted successfully!");
    } catch (err) {
        console.error("Error inserting reply:", err);
    }
}

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

async function getReplies() {
    if (!collection) {
        console.error("Database collection is not ready.");
        return;
    }

    try {
        // Fetch all documents where type is 'reply'
        const replies = await collection.find({ type: 'reply' }).toArray();
        return replies;
    } catch (err) {
        console.error("Error fetching replies:", err);
        throw err;
    }
}



module.exports = {
    main,
    checkLogin,
    insertUser,
    insertPost,
    insertReply,
    getPosts,
    getReplies,
    collection
};

main();



