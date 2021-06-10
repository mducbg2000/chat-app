const mongoose = require ('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

const userSchema = new schema({
    // mail
    email: {type: String, unique: true, required: true, trim: true},
    // họ tên
    name: {type: String, required: true, trim: true},
    // password
    pwd: {type: String, required: true, trim: true},
    // avatar
    avatar: {type: String},
    socketId: {type: String},
    online: {type: Boolean}
}, {
    timestamps: true,
    versionKey: false
});

userSchema.pre('save', function (next) {
    if (!this.isModified('pwd')) {
        return next();
    }
    this.pwd = bcrypt.hashSync(this.pwd, 4);
    next()
})

userSchema.methods.comparePwd = function (plainText) {
    return bcrypt.compareSync(plainText, this.pwd);
}

module.exports = mongoose.model("User", userSchema);

