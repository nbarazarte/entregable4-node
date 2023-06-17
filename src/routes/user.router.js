const { getAll, create, getOne, remove, update, verifyCode, login, logged, reset, updatePassword } = require('../controllers/user.controller');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT');

const routerUser = express.Router();

routerUser.route('/')
    .get(getAll)
    .post(create);


routerUser.route('/login')
    .post(login)
    
routerUser.route('/me')
    .get(verifyJWT,logged)

routerUser.route('/reset_password')
.post(reset)

routerUser.route('/:id')
    .get(verifyJWT,getOne)
    .delete(verifyJWT,remove)
    .put(verifyJWT,update);

    routerUser.route('/verify/:code')
    .get(verifyCode)

routerUser.route('/reset_password/:code')
    .post(updatePassword)


module.exports = routerUser;