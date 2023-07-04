// `sinirli` middleware'ını `auth-middleware.js` dan require edin. Buna ihtiyacınız olacak!
const router = require('express').Router();
const userModel = require('./users-model');
const mw = require('../auth/auth-middleware')

/**
  [GET] /api/users

  Bu uç nokta SINIRLIDIR: sadece kullanıcı girişi yapmış kullanıcılar
  ulaşabilir.

  response:
  status: 200
  [
    {
      "user_id": 1,
      "username": "bob"
    },
    // etc
  ]

  response giriş yapılamadıysa:
  status: 401
  {
    "message": "Geçemezsiniz!"
  }
 */
router.get('/',mw.sinirli,async(req,res,next)=>{
  try {
    const userData = await userModel.bul();
    res.json(userData)   
  } catch (error) {
    next(error)
  }
})



// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.

module.exports=router