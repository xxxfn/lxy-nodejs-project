var express = require('express');
var router = express.Router();
const uesrsModel = require('../model/usersModel.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('这是users下的‘/’');
});


//注册处理
router.post('/register', function (req, res, next) {
  // console.log('后台传过来的post请求数据'); 
  console.log(req.body.username);
  console.log(/\w{2,8}/.test(req.body.username));
  //用户名必须是5-10位字符
  if (/^ \w{5,10} || [\u4e00-\u9fa5]{2,10} $ /.test(req.body.username)) {
    uesrsModel.add(req.body, function (err) {
      if (err) {
        res.render('werror',err);
      }else{
        //注册成功,跳转到登录页面
        console.log('注册成功');

        //index.js里面的路由读取接收
        res.redirect('/login.html');
      }
    })
  }else{
    res.render('werror',{code:-102,msg:'用户名必须在五到十位'});
    return true;
  } 
});

//登录处理
router.post('/login', function (req, res, next) {
  
  uesrsModel.login(req.body, function (err,data) {
    if (err) {
      console.log('登录失败，原因是',err);
      res.render('werror',err);
    }else{
      //注册成功,用户信息存入cookie，跳转到首页
      console.log('登录成功');
  
      res.cookie('username', data.username,{
        maxAge:1000 * 60 * 60 
      });

      res.cookie('nickname', data.nickname,{
        maxAge:1000 * 60 * 60
      });
  
      res.cookie('is_admin', data.is_admin,{
        maxAge: 1000 * 60 * 60
      });
  
      res.redirect('/');
    }
  })
});

//退出处理
router.get('/loginout', function (req, res, next) {
  res.clearCookie('username');
  res.clearCookie('is_admin');
  res.clearCookie('nickname');
  //防止网页上往回退要使用location。replace
  res.send('<script> location.replace("/")</script>');
})





module.exports = router;
