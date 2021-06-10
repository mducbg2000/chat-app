const router = require('express').Router()
const userService = require('../services/user.service')

router.get('/', async (req, res) => {
    try {
        res.render('register');
    } catch (e) {
        res.status(400).send('get register')
    }

})

router.post('/', async (req, res) => {
    try {
        let newUser = await userService.register(req.body.name, req.body.email, req.body.pwd)
        res.status(200).send({
            status: 'success',
            msg: 'OK',
            data: newUser
        });
    } catch (e) {
        res.status(400).send({
            status: 'error',
            msg: e
        });
    }
})

module.exports = router
