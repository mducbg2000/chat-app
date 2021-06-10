const User = require('../models/user');
const roomService = require('../services/room.service')
const Room = require('../models/room')
module.exports = {
    register: async (name, email, pwd) => {
        try {
            return await User.create({
                name: name,
                email: email,
                pwd: pwd,
                avatar: '/img/avatar.png'
            })
        } catch (e) {
            throw e
        }
    },

    login: async (email, pwd) => {
        try {
            let user = await User.findOne({'email': email});
            if (!user) return null;
            if (user.comparePwd(pwd)) return user;
            return null;
        } catch (e) {
            throw e
        }
    },

    searchByName: async (name, userId) => {
        try {
            let userList =  await User.find({name: new RegExp(name, 'i')}).select('_id name avatar')
            let result = []
            for (let user of userList) {
                let r = await Room.findOne({
                    $and: [{
                        members: {
                            $all: [userId, user._id]
                        }
                    }, {
                        members: {
                            $size: 2
                        }
                    }, {
                        group: false
                    }]
                })
                user.isContact = r != null;
                if (user._id.toString() !== userId.toString()) result.push(user)
            }
            return result
        } catch (e) {
            throw e
        }
    },

    getContactList: async (userId) => {
        try {
            let listRoom = await Room
                .find({members: userId, group: false})
                .sort({updatedAt: -1})
            return await listRoom.map(async room => {
                let anotherId = room.members.filter(item => item.toString() !== userId.toString())[0];
                return User.findById(anotherId).select('_id name avatar');
            })
        } catch (e) {
            throw e
        }
    }

}
