require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const docs = await mongoose.connection.collection('knowledges').find({}, { projection: { embedding: 0, text: 0 } }).limit(3).toArray();
    fs.writeFileSync('docs-utf8.json', JSON.stringify(docs, null, 2));
    mongoose.disconnect();
});
