const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

mongoose.connection.on('connected', () => {
    console.log('DB connected');
})

mongoose.connection.on('disconnected', () => {
    console.log('DB connected');
})
