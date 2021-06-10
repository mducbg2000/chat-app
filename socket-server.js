const socketService = require('./services/socket.service')
const messageService = require('./services/message.service')
const User = require('./models/user')
const Room = require('./models/room')
module.exports = io => {
    io.on("connection", socket => {

        socket.on('disconnect', async (reason) => {
            console.log(`${socket.user} offline: ${reason}`)
            await socketService.disconnect(socket.id)
        })

        socket.on('home', async userId => {
            try {
                console.log(`${userId} online`)
                socket.user = userId;
                await socketService.connected(userId, socket.id)
            } catch (e) {
                console.error(e)
            }
        })

        socket.on('sendMsg', async data => {
            let room = await Room.findById(data.roomId).populate('members', 'avatar socketId online');
            let sender = await User.findById(data.from)
            await messageService.addMessage(data.from, data.roomId, data.content, data.img)
            for (let member of room.members) {
                if (member.online) {
                    io.to(`${member.socketId}`).emit('receiveMsg', {
                        ...data,
                        avatar: sender.avatar,
                        name: sender.name
                    });
                }
            }
        })

    })
}
