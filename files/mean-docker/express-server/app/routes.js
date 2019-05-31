var BuyRecord = require('./models/buyRecord');
var User = require('./models/user')
var MD5 = require('./md5.js')
var md5 = new MD5();

function getUsers(res) {
    User.find(function (err, users) {
        if (err) {
            res.send(err);
        }
        res.json(users);
    });
};

module.exports = function (app) {
    // api ---------------------------------------------------------------------
    app.post('/api/createUser', function (req, res) {
        User.create({
            name: req.body.name,
            password: req.body.password,
            done: false
        }, function (err, user) {
            if (err)
                res.send(err);

            getUsers(res);
        });
    });

    app.post('/api/login', function (req, res) {
        check_login(req, function (status) {
            if (status === "login-success")
                User.find({
                    name: req.body.name,
                }, function (err, user) {
                    if (err)
                        res.send(err);
                    res.json(user)
                });
        })
    });

    app.get('/api/info', function (req, res) {
        // 查询数据库，根据用户名
        // req.body.name
        // res.send() 返回余额，理财金额
        User.find(function (err, users) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err) {
                res.send(err);
            }
            res.json(users); // return all todos in JSON format
        });
    })

    app.post('/api/deposit', function (req, res) {
        // 存钱
        // req.body.amount
        check_login(req, function (status) {
            if (status === "login-success")
                User.find({
                    name: req.body.name,
                    password: req.body.password,
                }, function (err, user1) {
                    if (user1.length != 0) {
                        let oldBalance = Number(user1[0].balance)
                        let amount = Number(req.body.amount)
                        if (amount < 0)
                            amount = 0
                        User.update({
                            name: req.body.name,
                            password: req.body.password,
                        }, {
                            $set: {
                                'balance': oldBalance + amount
                            }
                        }, function () {
                            User.find({
                                    name: req.body.name,
                                    password: req.body.password,
                                },
                                function (err, user2) {
                                    res.json(user2)
                                })
                        })
                    }
                });
        })
    })

    app.post('/api/withdraw', function (req, res) {
        // 取钱
        // req.body.amount
        check_login(req, function (status) {
            if (status === "login-success")
                User.find({
                    name: req.body.name,
                    password: req.body.password,
                }, function (err, user1) {
                    if (user1.length != 0) {
                        let oldBalance = Number(user1[0].balance)
                        let amount = Number(req.body.amount)
                        if (amount < 0)
                            amount = 0
                        if (amount >= oldBalance)
                            amount = oldBalance
                        User.update({
                            name: req.body.name,
                            password: req.body.password,
                        }, {
                            $set: {
                                'balance': oldBalance - amount
                            }
                        }, function () {
                            User.find({
                                    name: req.body.name,
                                    password: req.body.password,
                                },
                                function (err, user2) {
                                    res.json(user2)
                                })
                        })
                    }
                });
        })
    })

    app.post('/api/transfer', function (req, res) {
        // 转账
        // req.body.amount
        check_login(req, function (status) {
            if (status === "login-success")
                User.find({
                    name: req.body.name,
                    password: req.body.password,
                }, function (err, user1) {
                    if (user1.length != 0) {
                        User.find({
                            name: req.body.receiver,
                        }, function (err, user2) {
                            if (user2.length != 0) {
                                let oldBalance1 = Number(user1[0].balance)
                                let oldBalance2 = Number(user2[0].balance)
                                let amount = Number(req.body.amount)
                                if (amount < 0)
                                    amount = 0
                                if (amount >= oldBalance1)
                                    amount = oldBalance1
                                User.update({
                                    name: req.body.name,
                                }, {
                                    $set: {
                                        'balance': oldBalance1 - amount
                                    }
                                }, function () {
                                    User.update({
                                        name: req.body.receiver,
                                    }, {
                                        $set: {
                                            'balance': oldBalance2 + amount
                                        }
                                    }, function () {
                                        User.find({
                                                name: req.body.name,
                                                password: req.body.password,
                                            },
                                            function (err, user2) {
                                                res.json(user2)
                                            })
                                    })
                                });

                            }
                        })
                    }
                });
        })
    })

    app.post('/api/buy1', function (req, res) {
        // 购买理财产品
        check_login(req, function (status) {
            if (status === "login-success")
                User.find({
                    name: req.body.name,
                    password: req.body.password,
                }, function (err, user1) {
                    if (user1.length != 0) {
                        var finance = Number(user1[0].financing)
                        var amount = Number(req.body.amount)
                        User.update({
                            name: req.body.name,
                        }, {
                            $set: {
                                'financing': finance + amount
                            }
                        }, function () {
                            User.find({
                                    name: req.body.name,
                                },
                                function (err, user2) {
                                    res.json(user2)
                                })
                        })
                    }
                })
        })
    })

    app.post('/api/buy2', function (req, res) {
        check_login(req, function (status) {
            if (status === "login-success")
                User.find({
                    name: req.body.name,
                    password: req.body.password,
                }, function (err, user1) {
                    var time = new Date().getTime();
                    var amount = Number(req.body.amount)
                    if (user1.length != 0) {
                        BuyRecord.create({
                            name: req.body.name,
                            product: req.body.product,
                            amount: amount,
                            time: time,
                        }, function () {
                            BuyRecord.find({
                                name: req.body.name
                            }, function (err, records) {
                                if (err) {
                                    res.send(err);
                                }
                                res.json(records);
                            });
                        })
                    }
                })
        })
    })

    app.get('/api/buyRecord', function (req, res) {
        check_login(req, function (status) {
            if (status === "login-success")
                User.find({
                    name: req.body.name,
                    password: req.body.password,
                }, function (err, user1) {
                    if (user1.length != 0) {
                        BuyRecord.find({
                            name: req.body.name
                        }, function (err, records) {
                            if (err) {
                                res.send(err);
                            }
                            res.json(records);
                        });
                    }
                })
        })
    })

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html');
    });
};

function check_login(req, callback) {
    let name = req.body.name;
    let pw = req.body.password;
    let time = req.body.time;
    let now = Date.now();

    if (now - time > 15 * 60)
        callback("re-login");
    else {
        User.find({
            name: name,
        }, function (err, user) {
            if (user.length === 0)
                callback("no-user");
            else {
                let pw_right = md5.b64_hmac_md5(user[0].password, time)
                if (pw_right === pw)
                    callback("login-success");
                else
                    callback("wrong-password");
            }
        })
    }
}