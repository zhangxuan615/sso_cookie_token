// 核心模块
const path = require('path');
const http = require('http');
// 第三方模块
const express = require('express');
const expressArtTpl = require('express-art-template');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const expressJwt = require('express-jwt');
const jsonWebToken = require("jsonwebtoken");


// app 配置
var app = express();
app.use('/public/', express.static(path.join(__dirname, './public/')));
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')));
app.engine('html', expressArtTpl);
app.set('views', path.join(__dirname, './views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressSession({
    secret: 'itcast',
    resave: false,
    saveUninitialized: false,
    httpOnly: false,
}));
app.use(cookieParser());

// token 参数
const secret = 'sso_cookie_token';
const options = {
    algorithm: 'HS384',
    expiresIn: '1h',         // 单位是 秒   对应的是 exp
    // noTimestamp: true,  // 不会自动添加 iat
};

const expressJwtMiddle = expressJwt({
    secret,
    algorithms: ['HS384'],
    requestProperty: 'auth',
    getToken: req => {
        if (req.cookies && req.cookies.authorization) {
            return req.cookies.authorization;
        }

        return null;
    }
});
app.get('/', expressJwtMiddle, (req, res) => {

    const { username, password } = req.auth;
    return res.render('index.html', { username });
});

// 错误处理
app.use((err, req, res, next) => {

    const { name } = err;
    if (name && name === 'UnauthorizedError') {
        return res.render('index.html');
    }

    res.status(500).json({ code: 500, msg: err.message });
});


app.listen(3002, () => {
    console.log('running......');
});



