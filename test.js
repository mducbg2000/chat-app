const User = require('./models/user');
const faker = require('faker')
require('dotenv').config();
require('./config/db');

for (let i = 0; i<10; i++){
    User.create({
        email: faker.internet.email(),
        name: faker.name.findName(),
        pwd: '1234',
        avatar: faker.internet.avatar()
    }).then(r => console.log(r))
}
