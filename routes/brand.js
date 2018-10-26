var express = require('express');
var router = express.Router();
const uesrsModel = require('../model/usersModel.js');
var path = require('path');
var fs = require('fs');

//手机图片提交所用插件
var multer = require('multer');
const upload = multer({
    dest: 'F:/htmlThree/mobile-imgs'
})

//品牌新增
router.post('/brandadd', upload.single('brandimg'), function (req, res, next) {
    console.log(req.file);//包含上传的图片的信息
    if (req.file) {
        fs.readFile(req.file.path, function (err, data) {
            if (err) {
                console.log('读文件失败', err);
            } else {
                var filename = new Date().getTime() + '_' + req.file.originalname;
                var writfile = path.resolve(__dirname, '../public/brandimg', filename);
                fs.writeFile(writfile, data, function (err) {
                    if (err) {
                        console.log('写入失败');
                        res.send('werror', err);
                    } else {
                        console.log('写入成功');
                        //把手机添加进数据库里面
                        var brandurl = 'brandimg/' + filename;
                        var result = {
                            brandname: req.body.brandname, //手机名
                            brandurl: brandurl,   //图片地址
                        }
                        //调用函数把手机存进数据库里面
                        uesrsModel.brandadd(result, function (err) {
                            if (err) {
                                res.send('werror', err);
                            } else {
                                //注册成功,跳转到登录页面
                                console.log('手机添加成功');
                                //index.js里面的路由读取接收
                                res.send({code:0,msg:'写入成功'});
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

//输出所有品牌
router.get('/addall',function (req,res,next) {
    uesrsModel.addall({
        page: req.query.page,
        pageSize: req.query.pageSize
    }, function (err,data) {
        if (err) {
            res.send('werror', err);
        } else {
            //index.js里面的路由读取接收
            res.send(data);
        }

    })
})

//删除品牌按钮
router.get('/delete',function (req,res,next) {
    console.log(req.query);
    uesrsModel.delete({
        brandname: req.query.brandname
    },function(err,data) {
        if (err) {
            res.send({code:1,msg:'删除失败'});
        }else{
            console.log('删除品牌成功');
            res.send({code:0});
        }
    })
})

//修改手机信息
router.post('/amend', upload.single('brandimg'), function (req, res, next) {
    console.log(req.file);//包含上传的图片的信息
    if (req.file) {
        fs.readFile(req.file.path, function (err, data) {
            if (err) {
                console.log('读文件失败', err);
            } else {
                var filename = new Date().getTime() + '_' + req.file.originalname;
                var writfile = path.resolve(__dirname, '../public/brandimg', filename);
                fs.writeFile(writfile, data, function (err) {
                    if (err) {
                        console.log('写入失败');
                        res.send('werror', err);
                    } else {
                        console.log('写入成功');
                        //把手机添加进数据库里面
                        var brandurl = 'brandimg/' + filename;
                        var result = {
                            brandname: req.body.brandname, //手机名
                            brandurl: brandurl,   //图片地址
                        }
                        //调用函数把手机存进数据库里面
                        uesrsModel.amend(result, function (err) {
                            if (err) {
                                res.send('werror', err);
                            } else {
                                //注册成功,跳转到登录页面
                                console.log('手机修改成功');
                                //index.js里面的路由读取接收
                                res.send({ code: 0, msg: '修改成功' });
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
module.exports = router;