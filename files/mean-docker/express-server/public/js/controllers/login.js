var MD5 = require('./md5.js');
var md5 = new MD5();

angular.module('userLoginController', [])
    //
    .controller('loginController', ['$scope', '$http', 'Services', function ($scope, $http, Services) {
        $scope.formData = {};
        $scope.state = "未登录";
        $scope.userData = {};
        $scope.loading = true;

        // CREATE ==================================================================
        // when submitting the add form, send the text to the node API
        $scope.login = function () {

            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            if ($scope.formData.name != undefined && $scope.formData.password != undefined) {
                $scope.formData.time = Date.now();
                $scope.formData.password = md5.b64_hmac_md5(md5.b64_hmac_md5($scope.formData.name, $scope.formData.password), $scope.formData.time);

                $scope.loading = true;

                // call the create function from our service (returns a promise object)
                Services.login($scope.formData)

                    // if successful creation, call our get function to get all the new todos
                    .success(function (data) {
                        $scope.loading = false;
                        $scope.userData = data;
                        if ($scope.userData.length !== 0) {
                            window.location.href = "./bank2.html?name=" + $scope.formData.name + "&password=" + $scope.formData.password +
                                "&time=" + $scope.formData.time;
                            $scope.state = "登录成功"
                        } else
                            $scope.state = "登录失败"
                        $scope.formData = {}; // clear the form so our user is ready to enter another
                    });

            }

        };
    }]);