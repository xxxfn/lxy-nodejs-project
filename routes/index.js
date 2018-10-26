var express = require('express');
var router = express.Router();
const uesrsModel = require('../model/usersModel.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.cookies.username) {
    res.render('index', { 
      username: req.cookies.username,
      nickname: req.cookies.nickname ,
      is_admin: parseInt(req.cookies.is_admin) ? '(管理员)' : ''
    });
  } else {
    res.render('login');    
  }
});
//注册页面路由
router.get('/register',function (req,res,next) {
  res.render('register');  
});

// 登录页面
router.get('/login.html', function (req, res,next) {
  console.log('登录页面进来');
  res.render('login');
});

//错误页面
router.get('/werror', function (req, res, next) {
  console.log('登录页面进来');
  res.render('werror');
});

//渲染用户管理页面
 router.get('/findUsers', function (req, res, next) {
  // 从前端取得2个参数,
  var page = req.query.page || 1; // 页码，通过查询串方式传递过来（?号后面的内容）
  var pageSize = req.query.pageSize || 5; // 每页显示的条数/
  //调用函数,查找需要得到用户信息及总页数
  uesrsModel.findUsers({
    page: page,//页码
    pageSize: pageSize  //每页显示的条数
  }, function (err, data) {//data里面需要包含查询回调过来的多条用户信息，及总页数
    if (err) {
      res.render('werror', err);
    } else {
      res.render('user-manager', {
        username: req.cookies.username,
        nickname: req.cookies.nickname,
        is_admin: parseInt(req.cookies.is_admin) ? '(管理员)' : '',

        //后台传过来的数据
        totalPage: data.totalPage,//分页数
        userList: data.userList,//这里是得到分页获取的用户信息
      });
    }
  })
});

//删除用户路由
router.get('/shangchu', function (req, res, next) {
  console.log('删除页面进来');
  if (req.query.shangchu) {
    //删除一个用户的数据
   
    uesrsModel.shangchu({ username: req.query.shangchu }, function (err, data) {
      if (err) {
        res.render('werror', err);
      } else {
        console.log('jinali');
        res.redirect('/findUsers');
      }
    })
  }
});

//修改用户路由
router.get('/xiugai', function (req, res, next) {
  console.log('修改页面进来');
  // console.log(req.query);
  uesrsModel.xiugai(req.query, function (err, data) {
    if (err) {
      res.render('werror', err);
    } else {
      console.log('修改好了');
      res.redirect('/findUsers');
    }
  })
});


//用户管理页面处理
router.get('/user-manager', function (req, res, next) {
  //判断是否登录，并且是否是管理员
  if ( req.cookies.username && parseInt( req.cookies.is_admin ) ) {
    if (req.query.username) {
      //查找一个数据
      console.log(req.query.username);
      uesrsModel.findones({ username: req.query.username},function(err,data){
        if (err) {
          res.render('werror', err);
        } else {
          console.log(data.userList);
          res.render('user-manager', {
            username: req.cookies.username,
            nickname: req.cookies.nickname,
            is_admin: parseInt(req.cookies.is_admin) ? '(管理员)' : '',
            //后台传过来的一个用户数据
            userList: data.userList,
            totalPage: data.totalPage || ''//这时候页数为0
          });
        }
      })
    }
  } 
})


//手机管理路由及页面处理
router.get('/mobile-manager', function (req, res, next) {
  console.log('进入品牌管理页面');
  let page = req.query.page || 1; // 页码，通过查询串方式传递过来（?号后面的内容）
  let pageSize = req.query.pageSize || 4; // 每页显示的条数/
  //调用函数,查找需要得到用户信息及总页数

  uesrsModel.findmobile({
    page: page,//页码
    pageSize: pageSize  //每页显示的条数
  }, function (err, data) {//data里面需要包含查询回调过来的多条用户信息，及总页数
    if (err) {
      res.render('werror', err);
    } else {
      res.render('mobile-manager', {
        username: req.cookies.username,
        nickname: req.cookies.nickname,
        is_admin: parseInt(req.cookies.is_admin) ? '(管理员)' : '',

        //后台传过来的数据
        totalPage: data.totalPage,//分页数
        userList: data.userList,//这里是得到分页获取的用户信息
      });
    }
  });
});


//品牌管理路由及页面处理
router.get('/brand-manager', function (req, res, next) {

  console.log('进入手机管理页面');
  res.render('brand-manager', {
    username: req.cookies.username,
    nickname: req.cookies.nickname,
    is_admin: parseInt(req.cookies.is_admin) ? '(管理员)' : ''
  });
});


module.exports = router;
