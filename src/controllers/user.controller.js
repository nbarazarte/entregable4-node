const catchError = require('../utils/catchError');
const User = require('../models/User');

const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');

const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {

    const {email, password, firstName, lastName, country, image, frontBaseUrl} = req.body
    const hashPassword = await bcrypt.hash(password, 10);
    const body = {email, password:hashPassword, firstName, lastName, country, image}

    const result = await User.create(body);

    const code = require('crypto').randomBytes(64).toString('hex')
    const url = `${frontBaseUrl}/verify_email/${code}`

    await sendEmail({
        to:email,
        subject:"Verificacion de la cuenta",
        //text:"Hola, esta es una prueba"
        html:`
        <h2>haz click en el siguiente enlace para verificar tu cuenta:</h2>
        <a href=${url}>
            Click me!
        </a>
        `
    })

    const bodyCode = {code, userId:result.id}
    await EmailCode.create(bodyCode)
    
    
    //return res.json({message:"email enviado"});

    return res.status(201).json(result);
});



const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});


const verifyCode = catchError(async(req, res) => {
    const {code} = req.params

    const codeUser = await EmailCode.findOne({where:{code}})
    if(!codeUser) return res.sendStatus(401)

    const body = {isVerified:true}

    const userUpdate = await User.update(
        body,
        {where:{id:codeUser.userId}, returning:true}
    )

        await codeUser.destroy()
    //const { id } = codeUser.id;
    //await EmailCode.destroy({ where: {id} });
    
    
    //return res.sendStatus(204);
    return res.json(userUpdate[1][0])
})


module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    verifyCode
}