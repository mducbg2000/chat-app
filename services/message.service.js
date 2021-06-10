const User = require('../models/user')
const Room = require('../models/room')
const MessageBucket = require('../models/message-bucket')
const roomService = require('./room.service')
module.exports = {

    addSingleMessage: async (from, to, content, img) => {
        try {
            let room = await roomService.getSingleChatRoom(from, to);
            return await module.exports.addMessage(from, room, content, img)
        } catch (e) {
            throw e
        }
    },

    addMessage: async (from, room, content, img) => {
        try {
            let message = {
                from: from,
                content: content,
                img: img
            }
            await Room.findByIdAndUpdate(room, {
                $set: {
                    updatedAt: Date.now()
                }
            })
            await MessageBucket.updateOne({
                room: room,
                count: {$lt: 10}
            }, {
                $push: {
                    messages: message
                },
                $inc: {count: 1},
            }, {
                upsert: true
            })
            return message
        } catch (e) {
            throw e
        }
    },

    getSomeMessagesInSingleRoom: async (userId1, userId2, page) => {
        try {
            let room = roomService.getSingleChatRoom(userId1, userId2);
            return await module.exports.getSomeMessagesInRoom(room, page)
        } catch (e) {
            throw e
        }
    },

    getSomeMessagesInRoom: async (roomId, page) => {
        try {
            let msgBucket = await
                MessageBucket.find({room: roomId})
                    .sort({updatedAt: -1})
                    .skip(page - 1)
                    .limit(1)
                    .lean()
            if (msgBucket[0] == null) return [];
            return msgBucket[0].messages.map(message => {
                let time = message.createdAt;
                return {
                    ...message,
                    createdAt: `${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${time.getMonth()+1}`
                }
            })
        } catch (e) {
            console.log(e)
            throw e
        }
    },


}
