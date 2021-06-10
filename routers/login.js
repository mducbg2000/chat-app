const router = require('express').Router();
const userService = require('../services/user.service')
const jwt = require('jsonwebtoken')

router.get('/', (req, res) => {
    res.render('login')
})


router.post('/', async (req, res) => {
    try {
        let user = await userService.login(req.body.email, req.body.pwd);
        if (user !== null) {
            const token = jwt.sign({
                id: user._id
            }, process.env.SECRETKEY);
            res.cookie('token', token);
            res.json({token: token, msg: 'OK', status: 'success'});
        } else {
            res.status(400).json({
                status: 'error',
                msg: 'e'
            })
        }
    } catch (e) {
        console.log(e);
    }
})

module.exports = router
