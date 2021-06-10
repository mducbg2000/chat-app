const mongoose = require ('mongoose');
const schema = mongoose.Schema;

const roomSchema = new schema({
    members: [{
        type: schema.Types.ObjectId,
        ref: 'User'
    }],
    name: {type: String},
    avatar: {type: String},
    group: {type: Boolean, default: false},
}, {
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('Room', roomSchema)
