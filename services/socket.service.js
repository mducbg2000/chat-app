const User = require('../models/user')


module.exports = {
    connected: async (userId, socketId) => {
        try {
            await User.findByIdAndUpdate(userId, {
                $set: {
                    socketId: socketId,
                    online: true
                }
            })
        } catch (e) {
            throw e
        }
    },

    disconnect: async (socketId) => {
        try {
            await User.findOneAndUpdate({socketId: socketId}, {
                $set: {
                    socketId: '',
                    online: false
                }
            })
        } catch (e) {
            throw e
        }
    }
}
