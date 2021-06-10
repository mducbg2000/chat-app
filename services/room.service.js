const Room = require('../models/room')
const User = require('../models/user')
const messageService = require('./message.service')

module.exports = {

    createGroup: async (name, avatar, members) => {
        try {
            return await Room.create({
                name: name,
                avatar: avatar,
                members: members,
                group: true
            })
        } catch (e) {
            throw e
        }
    },

    joinGroup: async (userId, roomId) => {
        try {
            await Room.findByIdAndUpdate(roomId, {
                $push: {
                    members: userId
                }
            })
        } catch (e) {
            throw e
        }
    },

    outGroup: async (userId, roomId) => {
        try {
            await Room.findByIdAndUpdate(roomId, {
                $pull: {
                    members: userId
                }
            })
        } catch (e) {
            throw e
        }
    },

    contact: async (meId, anotherUserId) => {
        try {
            return await Room.create({members: [meId, anotherUserId], group: false})
        } catch (e) {
            console.log(e)
            throw e
        }
    },

    getRoomsByUserId: async (userId) => {
        try {
            let listRoom = await Room
                .find({members: userId})
                .sort({updatedAt: -1})

            return await listRoom.map(async room => {
                if (room.group === false) {
                    let anotherId = room.members.filter(item => item.toString() !== userId.toString())[0];
                    let anotherUser = await User.findById(anotherId)
                    return {
                        _id: room._id,
                        members: room.members,
                        name: anotherUser.name,
                        avatar: anotherUser.avatar,
                        group: false,
                        online: anotherUser.online
                    }
                }
                return room
            })
        } catch (e) {
            throw e
        }
    },



}
