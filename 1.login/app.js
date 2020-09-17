// 核心模块
const path = require('path');
// 第三方模块
const express = require('express');
const iconv = require('iconv-lite');
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
app.use(bodyParser.json());
app.use(expressSession({
    secret: 'itcast',
    resave: false,
    saveUninitialized: false,
    cookie: {
        domain: 'sso.com',
        httpOnly: false,
    }
}));
app.use(cookieParser());

// token 参数
const secret = 'sso_cookie_token';
const options = {
    algorithm: 'HS384',
    expiresIn: '1h',         // 单位是 秒   对应的是 exp
    // noTimestamp: true,  // 不会自动添加 iat
};

app.get('/', (req, res) => {
    res.render('index.html');
});


const account = {
    'zx': '123',
    'zx2': '123',
};
app.post('/ssoLogin', (req, res) => {

    const { username, password } = req.body;

    if (account[username] !== password) {
        return res.json({
            code: 500,
            msg: '',
        });
    }

    // 默认跳转页面 -- 与标记的跳转的页面的区别
    let { target } = req.query;
    if (!target) {
        target = 'http://main.sso.com:3001';
    }

    // 校验通过，生成 token
    const payload = { username, password };
    jsonWebToken.sign(payload, secret, options, (err, token) => {
        if (err) {
            return res.json({ code: 500 });
        }

        res.setHeader("Set-Cookie", `authorization=${token}; domain=sso.com;`);
        res.json({ code: 200, target });
    });

});

app.use('/ssoLoginOut', (req, res) => {
    res.setHeader("Set-Cookie", `authorization=; domain=sso.com; expires=${new Date('1970-01-01').toString()}`);
    res.render('index.html');
});


app.listen(3000, () => {
    console.log('running......');
});



