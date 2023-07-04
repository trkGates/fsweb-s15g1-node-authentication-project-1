// `checkUsernameFree`, `checkUsernameExists` ve `checkPasswordLength` gereklidir (require)
// `auth-middleware.js` deki middleware fonksiyonları. Bunlara burda ihtiyacınız var!
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const userModel = require('../users/users-model')
const mw = require('./auth-middleware');

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status: 201
  {
    "user_id": 2,
    "username": "sue"
  }

  response username alınmış:
  status: 422
  {
    "message": "Username kullaniliyor"
  }

  response şifre 3 ya da daha az karakterli:
  status: 422
  {
    "message": "Şifre 3 karakterden fazla olmalı"
  }
 */
router.post('/register',mw.usernameBostami,mw.sifreGecerlimi, async(req,res,next)=>{
  try {
    const insertedUserData ={
      username:req.body.username,
      password:req.body.password,
    }
    insertedUserData.password = bcrypt.hashSync(insertedUserData.password,2);
    const insertedUser = await userModel.ekle(insertedUserData);
    res.status(201).json(insertedUser);
  } catch (error) {
    next(error)
  }
})


/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status: 200
  {
    "message": "Hoşgeldin sue!"
  }

  response geçersiz kriter:
  status: 401
  {
    "message": "Geçersiz kriter!"
  }
 */
  router.post('/login',mw.usernameVarmi,(req,res,next)=>{
    try {
    req.session.userData = req.userData;
    res.json({message: `Hoşgeldin ${req.userData.username}!`}) 

    } catch (error) {
      next(error)
    }
  })


/**
  3 [GET] /api/auth/logout

  response giriş yapmış kullanıcılar için:
  status: 200
  {
    "message": "Çıkış yapildi"
  }

  response giriş yapmamış kullanıcılar için:
  status: 200
  {
    "message": "Oturum bulunamadı!"
  }
 */

router.get('/logout',(req,res,next)=>{
  if(req.session && req.session.userData){
    //const { Name } = req.session.userData;
    req.session.destroy(err=>{  //server tarafında session'ı destroy eder.
      if(err){
        res.status(422).json({message: "Session error!..."})
      }else{
        res.set('Set-Cookie','cikolatacips=; Path=/;Expires=Mon, 01 Jan 1970 11:33:31 GMT')//1.Client tarfında Cookie expire olsun diye geçmiş tarih verildi.
        res.json({message:"Çıkış yapildi"})
      }
    })
  }else{
    res.status(400).json({message: "Oturum bulunamadı!"})
  }
})

 
// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.

module.exports = router;