//模板，是用来处理users相关的后台数据库处理的代码
// 注册操作
// 登录操作
// 修改操作
// 删除操作
// 查询列表操作 
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');


const usersModel = {
    /**
     *注册方法
    * @param {*} data
    * @param {*} cb
    */
    add (data,cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                //不用清除，没连接
                console.log('数据库连接失败');
                cb({ code: -100, msg: '链接数据库失败' });
                return;
            };
            const db = client.db('lxy');
            let usersData = {
                username: data.username,
                password: data.password,
                nickname: data.nickname,
                phone: data.phone,
                is_admin: data.isAdmin,
                sex: data.sex,
                age: data.age
            };
            async.series([
                function (callback) {
                    //查询是否已注册
                    db.collection('users').find({ username: usersData.username }).count(function (err, num) {
                        if (err) {
                            callback({ code: -101, msg: '查询是否已经注册' });
                        } else if (num !== 0) {
                            console.log('该用户已经注册');
                            callback({ code: -102, msg: '该用户已经注册' });
                        } else {
                            console.log('该用户可以保存');
                            callback(null);
                        }
                    })
                },
                function (callback) {
                    //查询所有表记录
                    db.collection('users').find().count(function (err, num) {
                        if (err) {
                            callback({ code: -101, msg: '查询表的记录数据失败' });
                        } else {
                            usersData.id = num + 1;
                            callback(null);
                        }
                    })
                },
                function (callback) {
                    //写入数据库操作
                    db.collection('users').insertOne(usersData,function (err) {
                        if (err) {
                            console.log('用户写入数据库失败');
                            callback({code:-101,msg:'网络有问题'});
                        } else {
                            callback(null);
                        }
                    })
                }

            ], function (err, results) {
                //不管之前的函数是否执行成功否会进入到最后的回调里面
                if (err) {
                    console.log('上面的查询，写入等三个步骤可能出现了问题', err);
                    //错误传给前端
                    cb(err);
                } else {
                    cb(null);
                }
                //清除进入数据库的缓存
                client.close();
            });
        })  
    },

    /**
     *登录方法
     * @param {*} data
     * @param {*} cb
     */
    login (data,cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('数据可连接失败');
                cb({code:-100,msg:'连接数据库失败'});
                return;
            };
            const db = client.db('lxy');
            db.collection('users').find({
                username: data.username ,
                password: data.password
            }).toArray(function (err, results) {
                if (err) {
                    console.log('登录失败',err);
                    cb({code:-102,msg:'用户名不存在'});
                    client.close();
                } else if (results.length <= 0) {
                    console.log('用户名或密码错误');
                    cb({ code: -102, msg: '密码错误' });
                    client.close();                   
                } else{
                    cb(null,{
                        username: results[0].username,
                        nickname: results[0].nickname,
                        is_admin: results[0].is_admin
                    });    
                    client.close();                
                }
            });
        })
    },

    /**
    *查找所有用户信息并分页传给前端的方法
    * @param {*} data //里面包含第几页的页数及每页的条数
    * @param {*} cb
    */
    findUsers(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('lxy');

            var limitNum = parseInt(data.pageSize);//每页显示的条数
            var skipNum = data.page * data.pageSize - data.pageSize; //规定从第几条开始查找的数字

            async.parallel([
                //查找所有用户，确认用户数量
                function (callback) {
                    db.collection('users').find().count(function (err, num) {
                        if (err) {
                            callback({ code: -101, msg: '查询数据库失败' });
                        } else {
                            callback(null, num);//得到串行的第一个数据
                        }
                    })
                },
                // 查询分页的数据
                function (callback) {
                    db.collection('users').find().limit(limitNum).skip(skipNum).toArray(function (err, data) {
                        if (err) {
                            callback({ code: -101, msg: '查询数据库失败' });
                        } else {
                            callback(null, data);//返回查寻到的分页数据
                        }
                    })
                }
            ], function (err, results) {
                if (err) {//如果上面有错误，最终把错误汇总到这
                    cb(err);
                } else {
                    cb(null, {//没有错误，把前端需要用到的数据传递回去
                        totalPage: Math.ceil(results[0] / data.pageSize),//总条数除以每页的条数向上取整得到分页数
                        userList: results[1],//这里是得到分页获取的用户信息
                        page: data.page,
                    })
                }
                // 关闭连接
                client.close();
            });
        })
    },

    /**
     *前端查找指定用户方法
     * @param {*} data
     * @param {*} cb
     */
    findones(data,cb){
        MongoClient.connect(url, function (err, client){
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('lxy');
            db.collection('users').find({ username: data.username}).toArray(function (err,data) {
                if (err) {
                    console.log('查找单个用户时出错，可能是该用户不存在');
                    cb({code:-102,msg:'该用户不存在'});
                    client.close();
                }else if (data.length <= 0) {
                    console.log('chucuowule');
                    cb({code:-102,msg:'该用户不存在'});
                }else {
                    console.log('查找单个用户成功');
                    console.log(data[0].length);
                    var userList = data[0];
                    console.log(userList._id);
                    cb(null, {
                        userList: userList
                    });
                    client.close();
                }
            });
        })
    },

    /**
     *删除某个用户方法
     * @param {*} data
     * @param {*} cb
     */
    shangchu(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('lxy');
            db.collection('users').remove({ username: data.username },function (err){
                if (err) {
                    console.log('查找单个用户时出错，可能是该用户不存在');
                    cb({ code: -102, msg: '该用户不存在' });
                    client.close();
                } else {
                    console.log('删除单个用户成功');
                    cb(null);
                    client.close();
                }
            }); 
        })
    },

    /**
     *修改某个用户
     * @param {*} data
     * @param {*} cb
     */
    xiugai(data, cb) {
        console.log(data);
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('lxy');
            db.collection('users').update({ username: data.username},{$set:{
                nickname:data.nickname,
                phone:data.phone,
                sex:data.sex,
                age:data.age
            }}, function (err) {
                if (err) {
                    console.log('查找单个用户时出错，可能是该用户不存在');
                    cb({ code: -102, msg: '该用户不存在' });
                    client.close();
                } else {
                    console.log('修改单个用户成功');
                    cb(null)
                    client.close();
                }
            });
        })
    },


    /**
     *添加手机操作
     * @param {*} data
     * @param {*} cb
     */
    addmobile(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                //不用清除，没连接
                console.log('数据库连接失败');
                cb({ code: -100, msg: '链接数据库失败' });
                return;
            };
            const db = client.db('lxy');
            let saveData = {
                mobilename: data.mobilename, //手机名
                mobileplate: data.mobileplate,  // 手机牌子
                mobilemoney: data.mobilemoney,  //手机官方价
                mobileprice: data.mobileprice,  //手机二手价
                mobileurl: data.mobileurl, //手机路径
            };
            async.series([
                function (callback) {
                    //查询是否已注册
                    db.collection('mobile').find({ mobilename: saveData.mobilename }).count(function (err, num) {
                        if (err) {
                            callback({ code: -101, msg: '查询是否已经保存手机' });
                        } else if (num !== 0) {
                            console.log('该手机已经保存');
                            callback({ code: -102, msg: '该手机已经保存' });
                        } else {
                            console.log('该手机可以保存');
                            callback(null);
                        }
                    })
                },
                function (callback) {
                    //查询所有表记录
                    db.collection('mobile').find().count(function (err, num) {
                        if (err) {
                            callback({ code: -101, msg: '查询表的记录数据失败' });
                        } else {
                            saveData.id = num + 1;
                            callback(null);
                        }
                    })
                },
                function (callback) {
                    //写入数据库操作
                    db.collection('mobile').insertOne(saveData, function (err) {
                        if (err) {
                            callback({ code: -101, msg: '写入数据失败' });
                        } else {
                            callback(null);
                        }
                    })
                }

            ], function (err, results) {
                //不管之前的函数是否执行成功否会进入到最后的回调里面
                if (err) {
                    console.log('上面的查询，写入等三个步骤可能出现了问题', err);
                    //错误传给前端
                    cb(err);
                } else {
                    cb(null);
                }
                //清除进入数据库的缓存
                client.close();
            });
        })      
    },

    /*
     *查找所有手机
     * @param {*} data
     * @param {*} cb
     */
    findmobile(data,cb){
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('lxy');

            var limitNum = parseInt(data.pageSize);//每页显示的条数
            var skipNum = data.page * data.pageSize - data.pageSize; //规定从第几条开始查找的数字

            async.parallel([
                //查找所有用户，确认用户数量
                function (callback) {
                    db.collection('mobile').find().count(function (err, num) {
                        if (err) {
                            callback({ code: -101, msg: '查询数据库失败' });
                        } else {
                            callback(null, num);//得到串行的第一个数据
                        }
                    })
                },
                // 查询分页的数据
                function (callback) {
                    db.collection('mobile').find().limit(limitNum).skip(skipNum).toArray(function (err, data) {
                        if (err) {
                            callback({ code: -101, msg: '查询数据库失败' });
                        } else {
                            callback(null, data);//返回查寻到的分页数据
                        }
                    })
                }
            ], function (err, results) {
                if (err) {//如果上面有错误，最终把错误汇总到这
                    cb(err);
                } else {
                    cb(null, {//没有错误，把前端需要用到的数据传递回去
                        totalPage: Math.ceil(results[0] / data.pageSize),//总条数除以每页的条数向上取整得到分页数
                        userList: results[1],//这里是得到分页获取的用户信息
                        page: data.page,
                    })
                }
                // 关闭连接
                client.close();
            });
        })
    },
    
    /**
     *删除某款手机方法
     * @param {*} data
     * @param {*} cb
     */
    mobileshangchu(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '信号不好稍后重试' });
                return;
            }
            const db = client.db('lxy');
            db.collection('mobile').remove({ mobilename: data.mobilename }, function (err) {
                if (err) {
                    console.log('查找手机时出错，可能是该手机不存在');
                    cb({ code: -102, msg: '该手机不存在' });
                    client.close();
                } else {
                    console.log('删除手机成功');
                    cb(null);
                    client.close();
                }
            });
        })
    },

    /**
    *修改某款手机
    * @param {*} data
    * @param {*} cb
    */
    mobilexiugai(data, cb) {
        console.log(data);
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('lxy');
            db.collection('mobile').update({ mobilename: data.mobilename }, {
                $set: {
                    mobilemoney: data.mobilemoney,  //手机官方价
                    mobileprice: data.mobileprice,  //手机二手价
                    mobileurl: data.mobileurl,   //图片地址
                }
            }, function (err) {
                if (err) {
                    console.log('修改单个手机时出错，有个bug要处理');
                    cb({ code: -102, msg: '网络较慢，稍后重试' });
                    client.close();
                } else {
                    console.log('修改这款手机信息成功');
                    cb(null)
                    client.close();
                }
            });
        })
    },

    /**
     *添加品牌操作
     * @param {*} data
     * @param {*} cb
     */
    brandadd(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                //不用清除，没连接
                console.log('数据库连接失败');
                cb({ code: -100, msg: '链接数据库失败' });
                return;
            };
            const db = client.db('lxy');
            let saveData = {
                brandname: data.brandname, //品牌名
                brandurl: data.brandurl, //品牌logo路径
            };
            async.series([
                function (callback) {
                    //查询是否已注册
                    db.collection('brand').find({ brandname: saveData.brandname }).count(function (err, num) {
                        if (err) {
                            callback({ code: -101, msg: '查询是否已经保存手机' });
                        } else if (num !== 0) {
                            console.log('该手机已经保存');
                            callback({ code: -102, msg: '该手机已经保存' });
                        } else {
                            console.log('该手机可以保存');
                            callback(null);
                        }
                    })
                },
                function (callback) {
                    //写入数据库操作
                    db.collection('brand').insertOne(saveData, function (err) {
                        if (err) {
                            callback({ code: -101, msg: '写入数据失败' });
                        } else {
                            callback(null);
                        }
                    })
                }
            ], function (err, results) {
                //不管之前的函数是否执行成功否会进入到最后的回调里面
                if (err) {
                    console.log('上面的查询，写入等三个步骤可能出现了问题', err);
                    //错误传给前端
                    cb(err);
                } else {
                    cb(null);
                }
                //清除进入数据库的缓存
                client.close();
            });
        })
    },

    /**
     *渲染品牌操作
     * @param {*} data
     * @param {*} cb
     */
    addall(data,cb){
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('lxy');

            var limitNum = parseInt(data.pageSize);//每页显示的条数
            var skipNum = data.page * data.pageSize - data.pageSize; //规定从第几条开始查找的数字

            async.parallel([
                //查找所有用户，确认用户数量
                function (callback) {
                    db.collection('brand').find().count(function (err, num) {
                        if (err) {
                            callback({ code: -101, msg: '查询数据库失败' });
                        } else {
                            callback(null, num);//得到串行的第一个数据
                        }
                    })
                },
                // 查询分页的数据
                function (callback) {
                    db.collection('brand').find().limit(limitNum).skip(skipNum).toArray(function (err, data) {
                        if (err) {
                            callback({ code: -101, msg: '查询数据库失败' });
                        } else {
                            callback(null, data);//返回查寻到的分页数据
                        }
                    })
                }
            ], function (err, results) {
                if (err) {//如果上面有错误，最终把错误汇总到这
                    cb(err);
                } else {
                    cb(null, {//没有错误，把前端需要用到的数据传递回去
                        totalPage: Math.ceil(results[0] / data.pageSize),//总条数除以每页的条数向上取整得到分页数
                        userList: results[1],//这里是得到分页获取的品牌信息
                        page: data.page,
                    })
                }
                // 关闭连接
                client.close();
            });
        })
    },

    /**
     *查找品牌名字
     * @param {*} data
     * @param {*} cb
     */
    Findmead(cb){
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('lxy');
            // 查询分页的数据
            db.collection('brand').find().toArray(function (err, data) {
                if (err) {
                    cb({ code: -101, msg: '查询数据库失败' });
                    client.close();
                }else {
                    cb(null, data);//返回查寻到的分页数据
                    client.close();
                }
            });
        })
    },


    /**
     *删除某个牌子
     * @param {*} data
     * @param {*} cb
     */
    delete(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '信号不好稍后重试' });
                return;
            }
            const db = client.db('lxy');
            db.collection('brand').remove({ brandname: data.brandname }, function (err) {
                if (err) {
                    console.log('查找手机时出错，可能是该手机不存在');
                    cb({ code: -102, msg: '该牌子不存在' });
                    client.close();
                } else {
                    console.log('删除手机成功');
                    cb(null);
                    client.close();
                }
            });
        })
    },

    /**
     *修改某个品牌
     * @param {*} data
     * @param {*} cb
     */
    amend(data, cb) {
        console.log(data);
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('查所有时链接失败');
                cb({ code: -101, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('lxy');
            db.collection('brand').update({ brandname: data.brandname }, {
                $set: {
                    brandname: data.brandname,  //名字
                    brandurl: data.brandurl,  //logo
                }
            }, function (err) {
                if (err) {
                    console.log('修改单个偏僻时出错，有个bug要处理');
                    cb({ code: -102, msg: '网络较慢，稍后重试' });
                    client.close();
                } else {
                    console.log('修改这款品牌信息成功');
                    cb(null)
                    client.close();
                }
            });
        })
    },
    
}


module.exports = usersModel; //暴露这个对象