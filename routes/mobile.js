var express = require('express');
var router = express.Router();
const uesrsModel = require('../model/usersModel.js');
var path = require('path');
var fs = require('fs');

//手机图片提交所用插件
var multer = require('multer');
const upload = multer({
    dest:'F:/htmlThree/mobile-imgs'
})

//手机新增
router.post('/add', upload.single('mobile') ,function (req, res, next) {
    console.log(req.file);//包含上传的图片的信息
    if (req.file) {
        fs.readFile(req.file.path, function (err, data) {
            if (err) {
                console.log('读文件失败', err);
            } else {
                var filename = new Date().getTime() + '_' + req.file.originalname;
                var writfile = path.resolve(__dirname, '../public/mobileImgs', filename);
                fs.writeFile(writfile, data, function (err) {
                    if (err) {
                        console.log('写入失败');
                            res.render('werror',err);
                    } else {
                        console.log('写入成功');
                        //把手机添加进数据库里面
                        var mobileurl = 'mobileImgs/' + filename;
                        var result = {
                            mobilename: req.body.mobilename, //手机名
                            mobileplate: req.body.mobileplate,  // 手机牌子
                            mobilemoney: req.body.mobilemoney,  //手机官方价
                            mobileprice: req.body.mobileprice,  //手机二手价
                            mobileurl: mobileurl,   //图片地址
                        }
                        //调用函数把手机存进数据库里面
                        uesrsModel.addmobile(result, function (err) {
                            if (err) {
                                res.render('werror', err);
                            } else {
                                //注册成功,跳转到登录页面
                                console.log('手机添加成功');
                                //index.js里面的路由读取接收
                                res.redirect('/mobile-manager');
                            }
                            
                        })
                    }
                })
            }
        })
    } else {
        res.render('werror',{code:-101,msg:'必须上传图片'});
    }
});

//获取品牌种类
router.get('/findbrand',function (req,res) {
    uesrsModel.Findmead(function (err,data) {
        if (err) {
            res.send('werror', err);
        } else {
            res.send(data);
        }
    })
})




//修改手机信息
router.post('/mobilexiugai', upload.single('mobile'), function (req, res, next) {
    if (req.file) {
        fs.readFile(req.file.path, function (err, data) {
            if (err) {
                console.log('读文件失败', err);
            } else {
                var filename = new Date().getTime() + '_' + req.file.originalname;//让每次保存的手机名不一样
                var writfile = path.resolve(__dirname, '../public/mobileImgs', filename);//要重新保存手机图片的地址
                fs.writeFile(writfile, data, function (err) {
                    if (err) {
                        console.log('写入失败');
                        res.render('werror', err);
                    } else {
                        //把手机添加进数据库里面
                        var mobileurl = 'mobileImgs/' + filename;//读取手机地址

                        var result = {//要修改保存的数据
                            mobilename: req.body.mobilename, //手机名，查找修改
                            mobilemoney: req.body.mobilemoney,  //手机官方价
                            mobileprice: req.body.mobileprice,  //手机二手价
                            mobileurl: mobileurl,   //图片地址
                        }
                        console.log(result.mobilename,'有数据');
                        
                        //调用函数把手机存进数据库里面
                        uesrsModel.mobilexiugai(result, function (err) {
                            if (err) {
                                res.render('werror', err);
                            } else {
                                //注册成功,跳转到登录页面
                                console.log('手机添加成功');
                                //index.js里面的路由读取接收
                                res.redirect('/mobile-manager');
                            }
                        })
                    }
                })
            }
        })
    } else {
        res.render('werror', { code: -101, msg: '必须上传图片' });
    }
});

//手机删除
router.get('/mobileshangchu', function (req, res, next) {
    console.log(req.query.shangchu);
    if (req.query.shangchu) {
        //删除一个用户的数据
        uesrsModel.mobileshangchu({ mobilename: req.query.shangchu }, function (err, data) {
            if (err) {
                res.render('werror', err);
            } else {
                console.log('手机删除成功');
                res.redirect('/mobile-manager');
            }
        })
    }
});

//手机修改
router.get('/mobilexiugai', function (req, res, next) {
    console.log(req.query.xiugai);
    if (req.query.xiugai) {
        //删除一个用户的数据
        uesrsModel.mobilexiugai({ mobilename: req.query.shangchu }, function (err, data) {
            if (err) {
                res.render('werror', err);
            } else {
                console.log('手机信息修改成功');
                res.redirect('/mobile-manager');
            }
        })
    }
});
module.exports = router;