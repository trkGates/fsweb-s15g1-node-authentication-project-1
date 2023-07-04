//1 Imports
const express = require("express");
const server = express();
const helmet = require("helmet");
const cors = require("cors");
const userRouter = require("./users/users-router")
const authRouter = require('./auth/auth-router')
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

/**
  Kullanıcı oturumlarını desteklemek için `express-session` paketini kullanın!
  Kullanıcıların gizliliğini ihlal etmemek için, kullanıcılar giriş yapana kadar onlara cookie göndermeyin. 
  'saveUninitialized' öğesini false yaparak bunu sağlayabilirsiniz
  ve `req.session` nesnesini, kullanıcı giriş yapana kadar değiştirmeyin.

  Kimlik doğrulaması yapan kullanıcıların sunucuda kalıcı bir oturumu ve istemci tarafında bir cookiesi olmalıdır,
  Cookienin adı "cikolatacips" olmalıdır.

  Oturum memory'de tutulabilir (Production ortamı için uygun olmaz)
  veya "connect-session-knex" gibi bir oturum deposu kullanabilirsiniz.
 */

//2 MiddleWares
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use(
  session(
      {
          name: "cikolatacips",  //connect.sid
          secret: "Ilk defa yapiliyor",  //env'den alınacak.
          cookie: {
              maxAge: 1000*60*60, //3 saat geçerli olacak
              httpOnly: false,
              secure: false,  //https üzerinden iletişim
          },
          resave: false,
          saveUninitialized: false,
          store: new KnexSessionStore({
              tablename: 'sessions',  //Default'u aynısı
              sidfieldname:'sid', //Default'u aynısı
              knex: require('../data/db-config'),  //vermezsem kendi DB oluşturur.
              createtable: true,
              clearInterval: 1000*60 // expire olmuş sessionları 10sn sonra otomatik siler.
          })
      }
  ))
//3 Routes

// server.get("/", (req, res) => {
//   res.json({ api: "up" });
// });

server.use('/api/users',userRouter);
server.use('/api/auth',authRouter)
//4 Errors

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

//5 Exports

module.exports = server;