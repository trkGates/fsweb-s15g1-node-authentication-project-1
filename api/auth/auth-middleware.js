const userModel = require("../users/users-model");
const bcrypt = require("bcryptjs");

/*
  Kullanıcının sunucuda kayıtlı bir oturumu yoksa

  status: 401
  {
    "message": "Geçemezsiniz!"
  }
*/
function sinirli(req, res, next) {
  try {
    if (req.session && req.session.userData) {
      next();
    } else {
      res.status(401).json({ message: "Geçemezsiniz!" });
    }
  } catch (error) {
    next(error);
  }
}

/*
  req.body de verilen username halihazırda veritabanında varsa

  status: 422
  {
    "message": "Username kullaniliyor"
  }
*/
async function usernameBostami(req, res, next) {
  try {
    const userIsExist = await userModel
      .goreBul({ username: req.body.username })
      .first();
    userIsExist
      ? res.status(422).json({ message: "Username kullaniliyor" })
      : next();
  } catch (error) {
    next(error);
  }
}

/*
  req.body de verilen username veritabanında yoksa

  status: 401
  {
    "message": "Geçersiz kriter"
  }
*/
async function usernameVarmi(req, res, next) {
  //step 1 : User is checked first
  const userIsExist = await userModel.goreBul({ username: req.body.username }); // bir array gonderir
  // step 2 : passwordcheck
  if (userIsExist && userIsExist.length > 0) {
    const user = userIsExist[0];
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.userData = user;
      next();
    } else {
      res.status(401).json({ message: "Geçersiz kriter" });
    }
  } else {
    res.status(401).json({
      message: "Geçersiz kriter",
    });
  }
}

/*
  req.body de şifre yoksa veya 3 karakterden azsa

  status: 422
  {
    "message": "Şifre 3 karakterden fazla olmalı"
  }
*/
async function sifreGecerlimi(req, res, next) {
  try {
    const { password } = req.body;
    !password || password.length < 3
      ? res.status(422).json({ message: "Şifre 3 karakterden fazla olmalı" })
      : next();
  } catch (error) {
    next(error);
  }
}

// Diğer modüllerde kullanılabilmesi için fonksiyonları "exports" nesnesine eklemeyi unutmayın.
module.exports = {
  sinirli,
  usernameBostami,
  usernameVarmi,
  sifreGecerlimi,
};
