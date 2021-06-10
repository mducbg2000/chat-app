const router = require('express').Router();
const roomService = require('../services/room.service')
const userService = require('../services/user.service')
const User = require ('../models/user')
const messageService = require('../services/message.service')
const ejs = require('ejs')
const path = require('path')
router.get('/home', async (req, res) => {
    let listRoom = await roomService.getRoomsByUserId(req.user._id);
    let rooms = await Promise.all(listRoom)
    let user = req.user
    res.render('home', {
        user: user,
        rooms: rooms
    })
})

router.get('/user/:name', async (req, res) => {
    try {
        let listRoom = await userService.searchByName(req.params.name, req.user._id);
        let rooms = await Promise.all(listRoom)
        res.status(200).send({
            msg: 'OK',
            data: rooms
        })
    } catch (e) {
        res.status(400).send({
            msg: e
        })
    }
})

router.get('/out/:roomId', async (req, res) => {
    try {
        await roomService.outGroup(req.user._id, req.params.roomId)
        res.status(200).send({
            msg:'OK'
        })
    } catch (e) {
        res.status(400).send({
            msg: e
        })
    }
})

router.get('/join/:roomId', async (req, res) => {
    try {
        await roomService.joinGroup(req.user._id, req.params.roomId)
        res.redirect('/home')
    } catch (e) {
        res.status(400).send({
            msg: e
        })
    }
})

router.post('/group', async (req, res) => {
    try {
        let newRoom = await roomService.createGroup(req.body.name, req.body.avatar, req.body.members)
        res.status(200).send({
            msg: 'OK',
            data: newRoom
        })
    } catch (e) {
        res.status(400).send({
            msg: e
        })
    }
})

router.get('/messages/:roomId/:page', async (req, res) => {
    try {
        let html = '';
        let listMessages = await messageService.getSomeMessagesInRoom(req.params.roomId, req.params.page)
        for (let msg of listMessages) {
            if (msg.from.toString() === req.user._id.toString()) {
                html += await ejs.renderFile(path.join(process.cwd(), '/views/my-message.ejs'), {
                    owner: req.user,
                    msg: msg
                })
            } else {
                let owner = await User.findById(msg.from);
                html += await ejs.renderFile(path.join(process.cwd(), '/views/other-message.ejs'), {
                    owner: owner,
                    msg: msg
                })
            }
        }
        res.set('Content-Type', 'text/html');
        res.send(html)
    } catch (e) {
        res.status(400).send({
            msg: e
        })
    }
})

router.get('/create-form', async (req, res) => {
    try {
        let contactList = await userService.getContactList(req.user._id)
        let contacts = await Promise.all(contactList)
        let html = await ejs.renderFile(path.join(process.cwd(), '/views/create-group.ejs'), {
            contacts: contacts
        })
        res.set('Content-Type', 'text/html')
        res.send(html)
    } catch (e) {
        res.status(400).send({
            msg: e
        })
    }
})

module.exports = router
