angular.module('starter.controllers', [])

.run(function($rootScope, $ionicTabsDelegate, $state, $ionicPlatform, $ionicPopup, $ionicActionSheet, $timeout, $cordovaCamera,$ionicLoading, $ionicHistory, $location, $ionicBackdrop, $stateParams, $http) {
    $rootScope.clientVersion = '1.0';
    // $rootScope.baseURL = 'http://app.snaplook.today';
    // $rootScope.baseURL = 'http://app.snaplook.today';
    $rootScope.baseURL = 'http://localhost:8000';
    // $rootScope.baseURL = 'http://192.168.56.1:8000';
    // $rootScope.baseURL = 'http://localhost:8888';
    $rootScope.sampleCount = 4;
    $rootScope.minimumCountToShowSample = 4;
    $rootScope.compareList = [];
    $rootScope.compareIndexList = [];
    $rootScope.nameLengthOnCard = 13;
    $rootScope.stat_height = 0;
    $rootScope.stat_label_height = 0;

    $rootScope.photoPath = function(file_name, size) {
        return helper_generatePhotoPath( $rootScope.baseURL, file_name, size );
    };
    $rootScope.currentTab = function(){
        return $ionicTabsDelegate.selectedIndex();
    };
    $rootScope.routeTab = function(id){
        var tab = 'notAssigned';
        switch(id){
            case 0:
                tab = 'home';
                break;
            case 1:
                tab = 'explore';
                break;
            case 3:
                tab = 'notification';
                break;
            case 4:
                tab = 'account';
                break;
            default:
                tab = 'newTab';
        }
        return tab;
    };
    $rootScope.linkHashTag = function(str){
        if(str){
            var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
            str = str.replace(/(#[a-z\d-_]+)/ig, "<a href='#/tab/explore/$1/"+tab+"'>$1</a>");
            str = str.replace(/(\/#)/g, "/");
            return str;
        }
    };
    $rootScope.goPostDetail = function(id, user, posts, index){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-detail-'+tab,{postId: id, user: user, posts: posts, index: index});
    };
    $rootScope.goPostLikers = function(id){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-likers-'+tab,{postId: id});
    };
    $rootScope.goAccount = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-'+tab,{accountSlug: slug});
    };
    $rootScope.goSchoolDetail = function(id, name){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.school-detail-'+tab,{schoolId: id, schoolName: name});
    };
    $rootScope.goAccountFollowing = function(slug, user){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-following-'+tab,{userSlug: slug, user: user});
    };
    $rootScope.goAccountFollower = function(slug, user){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-follower-'+tab,{userSlug: slug, user: user});
    };
    $rootScope.goAccountLiked = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-liked-'+tab,{userSlug: slug});
    };
    $rootScope.goAccountNotification = function(){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-notification-'+tab);
    };
    $rootScope.handleHttpError = function(error, status){
        if(status == 422){
            // when login error
            for(var key in error){
                $rootScope.popupMessage('', error[key]);
                break;
            }
        }
        if(status == 500){
            $state.go('tab.home');
        }
        else if(typeof (error.status) != 'undefined' && error.status == 401){
            // when validation error
            for(var key in error.data){
                $rootScope.popupMessage('', error.data[key]);
                break;
            }
        }
        else if(typeof (error.error) != 'undefined' && error.error == "token_not_provided"){
            $state.go('auth');
        }
        else if(typeof (error.data) != 'undefined' && typeof (error.data.error) != 'undefined' && error.data.error == "token_not_provided"){
            $state.go('auth');
        }
        console.log('status: '+status);
        console.log(error);
    };
    $rootScope.getCurrentUser = function(){
        var user = JSON.parse(localStorage.getItem('user'));
        if(user){
            return user;
        }
        $state.go('auth');
    };
    $rootScope.goAccountOption = function(id){
        $state.go('tab.option-account',{userId: id});
    };
    $rootScope.getNameOnCard = function(_first_name, _last_name){
        if (_first_name.length >= $rootScope.nameLengthOnCard - 1)
        {
            return _first_name.substring(0, $rootScope.nameLengthOnCard) + "...";
        }
        else if (_first_name.length + _last_name.length >= $rootScope.nameLengthOnCard - 1)
        {
            return (_first_name + " " +_last_name).substring(0, $rootScope.nameLengthOnCard) + "...";
        }
        else
        {
            return _first_name + " " +_last_name;
        }
    };
    $rootScope.openCameraMenu = function(){
        // Show the action sheet
        var navCameraSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Take a Picture' },
                { text: 'Choose from Gallery' }
            ],
            cancelText: 'Cancel',
            cancel: function() {
                // code for cancel if necessary.
            },
            buttonClicked: function(index) {
                $ionicLoading.show();
                switch (index){
                    case 0 :
                        var options = {
                            quality: 100,
                            targetWidth: 600,
                            targetHeight: 600,
                            correctOrientation: true,
                            destinationType: Camera.DestinationType.FILE_URL,
                            sourceType: Camera.PictureSourceType.CAMERA
                        };
                        $cordovaCamera.getPicture(options).then(
                            function(imageData) {
                                localStorage.setItem('photo', imageData);
                                $ionicLoading.show({template: 'Loading Photo', duration:500});
                                $ionicLoading.hide();
                                $state.go('tab.post-create',{photoUrl: imageData});
                            },
                            function(err){
                                $ionicLoading.hide();
                            }
                        )
                        return true;
                    case 1 :
                        var options = {
                            quality: 100,
                            targetWidth: 600,
                            targetHeight: 600,
                            correctOrientation: true,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                        };

                        $cordovaCamera.getPicture(options).then(
                            function(imageURI) {
                                window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
                                    localStorage.setItem('photo', fileEntry.nativeURL);
                                    $ionicLoading.show({template: 'Loading Photo', duration:500});
                                    $ionicLoading.hide();
                                    $state.go('tab.post-create',{photoUrl: fileEntry.nativeURL});
                                });
                            },
                            function(err){
                                $ionicLoading.hide();
                            }
                        )
                        //Handle Move Button
                        return true;
                }
            }
        });
    };
    $rootScope.popupMessage = function(title, message){
        var alertPopup = $ionicPopup.alert({
            title: title,
            template: message
        });
    };
    $rootScope.ifOthersProfile = function(){
        var detect = 'tab.account-home, tab.account-explore, tab.account-notification, tab.account-account';
        if( detect.indexOf($state.current.name) > -1){
            var user = $rootScope.getCurrentUser();
            if(user){
                if($stateParams.accountSlug == ""){
                    return false;
                }
                if(user.slug != $stateParams.accountSlug ){
                    return true;
                }
            }
        }
        return false;
    };
    $rootScope.getMaxStat = function(stat, index) {
        stat = stat[0];
        if (index == "gender")
        {
            if (stat === undefined || stat.female === undefined && stat.male === undefined)
            {
                return "0";
            }
            else if (stat.female === undefined || stat.male === undefined)
            {
                return "100";
            }
            else if (stat.female > stat.male)
            {
                return stat.female/(parseInt(stat.female) + parseInt(stat.male))*100;
            }
            else
            {
                return stat.male/(parseInt(stat.female) + parseInt(stat.male))*100;
            }
        }
        else
        {
            if (stat === undefined)
            {
                return "10-20 0";
            }

            var age = "10-20";
            var count = 0;
            var total = 0;
            if (stat.teens !== undefined)
            {
                total += parseInt(stat.teens);
            }
            if (stat.twenties !== undefined)
            {
                total += parseInt(stat.twenties);
            }
            if (stat.thirties !== undefined)
            {
                total += parseInt(stat.thirties);
            }
            if (stat.forties !== undefined)
            {
                total += parseInt(stat.forties);
            }
            if (stat.fifties !== undefined)
            {
                total += parseInt(stat.fifties);
            }

            if (stat.teens !== undefined && stat.teens > count)
            {
                age = "10-20";
                count = stat.teens;
            }
            if (stat.twenties !== undefined && stat.twenties > count)
            {
                age = "20-30";
                count = stat.twenties;
            }
            if (stat.thirties !== undefined && stat.thirties > count)
            {
                age = "30-40";
                count = stat.thirties;
            }
            if (stat.forties !== undefined && stat.forties > count)
            {
                age = "40-50";
                count = stat.forties;
            }
            if (stat.fifties !== undefined && stat.fifties > count)
            {
                age = "50-60";
                count = stat.fifties;
            }

            if(total == 0)
            {
                return age + " 0";
            }
            else
            {
                return age + " " + (count/total*100);
            }
        }
    };
    $rootScope.getCardGenderStatIcon = function(stat) {
        if (stat.female === undefined && stat.male === undefined)
        {
            return "fa-female";
        }
        else if (stat.female === undefined)
        {
            return "fa-male";
        }
        else if (stat.male === undefined)
        {
            return "fa-female";
        }
        else if (stat.female > stat.male)
        {
            return "fa-female";
        }
        else
        {
            return "fa-male";
        }
    };
    $rootScope.getStatGenderPercent = function(stat, index) {
        if (stat === undefined || stat.female === undefined && stat.male === undefined)
        {
            return "0";
        }
        else if (index == "m")
        {
            if (stat.female === undefined)
            {
                return "100";
            }
            else
            {
                return stat.male/(parseInt(stat.female) + parseInt(stat.male))*100;
            }
        }
        else if (index == "f")
        {
            if (stat.male === undefined)
            {
                return "100";
            }
            else
            {
                return stat.female/(parseInt(stat.female) + parseInt(stat.male))*100;
            }
        }
    };

    $rootScope.getStatGenderPercentForAvatar = function(stat, index) {
        if (stat === undefined || stat.female === undefined && stat.male === undefined)
        {
            return 0;
        }
        else if (index == "m")
        {
            if (stat.female === undefined)
            {
                return 100;
            }
            else
            {
                return stat.male/(parseInt(stat.female) + parseInt(stat.male))*100;
            }
        }
        else if (index == "f")
        {
            if (stat.male === undefined)
            {
                return 100;
            }
            else
            {
                return stat.female/(parseInt(stat.female) + parseInt(stat.male))*100;
            }
        }
    };
    $rootScope.getStatAgePercent = function(stat, index) {
        if (stat === undefined)
        {
            return "0";
        }

        var total = 0;
        if (stat.teens !== undefined)
        {
            total += parseInt(stat.teens);
        }
        if (stat.twenties !== undefined)
        {
            total += parseInt(stat.twenties);
        }
        if (stat.thirties !== undefined)
        {
            total += parseInt(stat.thirties);
        }
        if (stat.forties !== undefined)
        {
            total += parseInt(stat.forties);
        }
        if (stat.fifties !== undefined)
        {
            total += parseInt(stat.fifties);
        }

        if (index == "10")
        {
            if (stat.teens === undefined)
            {
                return "0";
            }
            else
            {
                return stat.teens/total*100;
            }
        }
        if (index == "20")
        {
            if (stat.twenties === undefined)
            {
                return "0";
            }
            else
            {
                return stat.twenties/total*100;
            }
        }
        if (index == "30")
        {
            if (stat.thirties === undefined)
            {
                return "0";
            }
            else
            {
                return stat.thirties/total*100;
            }
        }
        if (index == "40")
        {
            if (stat.forties === undefined)
            {
                return "0";
            }
            else
            {
                return stat.forties/total*100;
            }
        }
        if (index == "50")
        {
            if (stat.fifties === undefined)
            {
                return "0";
            }
            else
            {
                return stat.fifties/total*100;
            }
        }
    };
    $rootScope.ifNGCompare = function(){
        var detect = 'tab.compare-home, tab.compare-explore, tab.compare-notification, tab.compare-account, auth, forgetpassword, register, register2, root, intro';
        if( detect.indexOf($state.current.name) > -1){
            return true;
        }
        return false;
    };
    $rootScope.openCompare = function(){
        if ($rootScope.compareList.length < 2)
        {
            $rootScope.popupMessage("Alert", "Please add more than 2 looks to compare");
        }
        else
        {
            var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
            $state.go('tab.compare-'+tab);
        }
    };
    $rootScope.addCompare = function(_post_id) {
        if ($rootScope.compareList.indexOf(_post_id) != -1)
        {
            $rootScope.compareIndexList[_post_id] = false;
            $rootScope.compareList.splice($rootScope.compareList.indexOf(_post_id), 1);
        }
        else if ($rootScope.compareList.length >= 10)
        {
            $rootScope.popupMessage("Alert", "You can add up to 10 looks for compare");
        }
        else
        {
            $rootScope.compareIndexList[_post_id] = true;
            $rootScope.compareList.push(_post_id);
        }
    };

    $rootScope.openOthersProfileMenu = function(){
        // Show the action sheet
        $ionicActionSheet.show({
            buttons: [
                { text: '<span class="assertive">Block User</span>' },
                { text: '<span class="assertive">Report</span>' }
            ],
            cancelText: 'Cancel',
            cancel: function() {
                // code for cancel if necessary.
            },
            buttonClicked: function(index) {
                switch (index){
                    case 0 :
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Block',
                            template: 'Are you sure to block this user?'
                        });

                        confirmPopup.then(function(res) {
                            if(res) {
                                $ionicLoading.show();
                                $http.post($rootScope.baseURL+'/api/'+$stateParams.accountSlug+'/block').success(function(){
                                    $ionicLoading.hide();
                                    return true;
                                })
                                    .error(function(error){
                                        $rootScope.handleHttpError(error);
                                    });
                            }
                        });
                        return true;
                    case 1 :
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Report',
                            template: 'Are you sure to report this user?'
                        });

                        confirmPopup.then(function(res) {
                            if(res) {
                                $ionicLoading.show();
                                $http.post($rootScope.baseURL+'/api/'+$stateParams.accountSlug+'/report').success(function(){
                                    $ionicLoading.hide();
                                    return true;
                                })
                                    .error(function(error){
                                        $rootScope.handleHttpError(error);
                                    });
                            }
                        });
                        return true;
                }
            }
        });
    };
})
.controller('PostCreateCtrl', function($scope, $state, $stateParams, $rootScope, $cordovaFile, $ionicLoading, $ionicHistory, $location) {
    $location.replace('tab.camera');
    var user = JSON.parse(localStorage.getItem('user'));
    $scope.data = { "ImageURI" :  "Select Image" };
    $scope.picData = $stateParams.photoUrl;

    $scope.sharePost = function(captions) {
        $ionicLoading.show({template: 'Uploading Photo...'});
        var fileURL = $scope.picData;
        var options = new FileUploadOptions();
        var param_caption = '';
        if (typeof captions != 'undefined')
        {
            param_caption = captions;
        }
        options.fileKey = "image";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.chunkedMode = true;

        var params = { 'captions': param_caption, 'user_id': user.id };

        options.params = params;

        var ft = new FileTransfer();
        ft.upload(fileURL, encodeURI($rootScope.baseURL + '/api/post/create'), success, fail, options);

        // Transfer succeeded
        function success(r) {
            $ionicLoading.show({template: 'Upload Success', duration:500});
            $state.go('tab.account-account', {refresh: options.fileName, activateTab:'new'});
        }

        // Transfer failed
        function fail(error) {
            $ionicLoading.show({template: 'Upload Fail', duration:500});
        }
    }

    $scope.back = function() {
        $ionicHistory.goBack();
    }
})
.controller('PostEditCtrl', function($scope, $http, $stateParams, $rootScope, FetchPosts, $ionicHistory, $ionicLoading) {
    $scope.post = $stateParams.post;

    $scope.updatePost = function(post){
        $ionicLoading.show();
        $http({
            method: "POST",
            url: $rootScope.baseURL + '/api/post/' + $scope.post.id + '/edit',
            data: {'content': post.content, 'post-id': $scope.post.id }
        })
        .success(function(response){
            $ionicLoading.hide();
            $ionicHistory.goBack();
        })
        .error(function(error, status){
            $rootScope.handleHttpError(error, status);
        });
    };
})
.controller('IntroCtrl',function($scope, $state, $ionicHistory){
    $scope.slideIndex = 0;
    $scope.enterApplication = function(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        localStorage.setItem('have_seen_intro', true);
        $state.go('auth');
    }
    $scope.slideHasChanged = function(index){
        $scope.slideIndex = index;
    }
    $scope.currentSlide = function(index){
        return $scope.slideIndex == index;
    }
})

.controller('RootCtrl',function($rootScope, $state, $ionicHistory){
    // always start as new state
    //window.location.reload(true);
    $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });
    if(localStorage.getItem('have_seen_intro')){
        if(localStorage.getItem('user') && localStorage.getItem('satellizer_token')){
            $state.go('tab.home');
        }
        else{
            $state.go('auth');
        }
    }
    else{
        $state.go('intro');
    }
})

.controller('RegisterCtrl', function($scope, $ionicHistory, $state, $rootScope, $http, $auth, $ionicLoading, $q) {
    $scope.registerData = {email:'',password:''};
    $scope.register = function(registerData){
        $ionicLoading.show();
        $http({
            method : 'POST',
            url : $rootScope.baseURL+'/api/register',
            data : registerData
        })
        .success(function(response){
            $ionicLoading.hide();
            $ionicHistory.nextViewOptions({
                disableBack: true
            });

            $state.go('register2',registerData);
        })
        .error(function(error, status){
            $ionicLoading.hide();
            $rootScope.handleHttpError(error, status);
        });
    }
    $scope.fbRegister = function() {
        $ionicLoading.show();
        $auth.authenticate('facebook').then(function() {
            // Return an $http request for the authenticated user
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                // Stringify the retured data
                var user = JSON.stringify(response.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $ionicLoading.hide();

                $state.go('tab.home');

            })
            .error(function(){
                $ionicLoading.hide();
                $rootScope.handleHttpError(error, status);
            })
        });
    };
    var fbLoginSuccess = function(response) {
        if (!response.authResponse){
            fbLoginError("Cannot find the authResponse");
            return;
        }

        var authResponse = response.authResponse;

        getFacebookProfileInfo(authResponse).then(function(profileInfo) {
            $http({
                method : 'POST',
                url : $rootScope.baseURL+'/api/facebook',
                data : {profile:profileInfo}
            })
                .success(function(response){
                    localStorage.setItem('satellizer_token', response.token);
                    $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                        // Stringify the retured data
                        var user = JSON.stringify(response.user);

                        // Set the stringified user data into local storage
                        localStorage.setItem('user', user);

                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });

                        $ionicLoading.hide();

                        $state.go('tab.home');
                    })
                        .error(function(){
                            $ionicLoading.hide();
                            $rootScope.handleHttpError(error, status);
                        });
                })
                .error(function(error){
                    $rootScope.handleHttpError(error);
                });
        }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
        });
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error){
        console.log('fbLoginError', error);
        $ionicLoading.hide();
    };

    // This method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
        var info = $q.defer();

        facebookConnectPlugin.api('/me?fields=id,email,first_name,last_name,link,picture.type(large),gender&access_token=' + authResponse.accessToken, null,
            function (response) {
                console.log(response);
                info.resolve(response);
            },
            function (response) {
                console.log(response);
                info.reject(response);
            }
        );
        return info.promise;
    };

    //This method is executed when the user press the "Login with facebook" button
    $scope.facebookSignIn = function() {
        facebookConnectPlugin.getLoginStatus(function(success){
            if(success.status === 'connected'){
                // The user is logged in and has authenticated your app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed request, and the time the access token
                // and signed request each expire
                console.log('getLoginStatus@facebookSignIn-if-connected', success.status);

                $ionicLoading.show({
                    template: 'Logging in...'
                });

                getFacebookProfileInfo(success.authResponse).then(function(profileInfo) {
                    $http({
                        method : 'POST',
                        url : $rootScope.baseURL+'/api/facebook',
                        data : {profile:profileInfo}
                    })
                        .success(function(response){
                            localStorage.setItem('satellizer_token', response.token);
                            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                                // Stringify the retured data
                                var user = JSON.stringify(response.user);

                                // Set the stringified user data into local storage
                                localStorage.setItem('user', user);

                                $ionicHistory.nextViewOptions({
                                    disableBack: true
                                });

                                $ionicLoading.hide();

                                $state.go('tab.home');
                            })
                                .error(function(){
                                    $ionicLoading.hide();
                                    $rootScope.handleHttpError(error, status);
                                });
                        })
                        .error(function(error){
                            $rootScope.handleHttpError(error);
                        });
                }, function(fail){
                    // Fail get profile info
                    console.log('profile info fail', fail);
                });

            } else {
                // If (success.status === 'not_authorized') the user is logged in to Facebook,
                // but has not authenticated your app
                // Else the person is not logged into Facebook,
                // so we're not sure if they are logged into this app or not.

                console.log('getLoginStatus@facebookSignIn-else-connected', success.status);

                $ionicLoading.show({
                    template: 'Logging in...'
                });

                // Ask the permissions you need. You can learn more about
                // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
            }
        });
    };
})

.controller('Register2Ctrl', function($scope, $stateParams, $auth, $rootScope, $http, $ionicLoading, $ionicHistory, $state) {
    $scope.registerData = {};
    var credentials = {
        email: $stateParams.email,
        password: $stateParams.password
    }

    if(!localStorage.getItem('user')){
        $auth.login(credentials).then(function() {
        },
        function(error) {
            $rootScope.handleHttpError(error, status);
        });
    }
    else{
        var user = $rootScope.getCurrentUser();
        $scope.registerData.first_name = user.first_name;
        $scope.registerData.last_name = user.last_name;
        $scope.registerData.gender = user.gender;
    }

    $scope.register2 = function(registerData){
        $ionicLoading.show();
        $http({
            method : 'POST',
            url : $rootScope.baseURL+'/api/register2',
            data : registerData
        })
        .success(function(response){
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                // Stringify the retured data
                var user = JSON.stringify(response.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);
                $ionicLoading.hide();
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $state.go('tab.home',{refresh : true});
            })
            .error(function(){
                $rootScope.handleHttpError(error, status);
            });
        })
        .error(function(error, status){
            $ionicLoading.hide();
            $rootScope.handleHttpError(error, status);
        });
    }
})

.controller('ForgetPasswordCtrl', function($scope, $ionicHistory, $state, $rootScope, $http, $auth, $ionicLoading) {
    $scope.datas = {email:''};
    $scope.sendLink = function(datas){
        $ionicLoading.show({template: 'Sending Password Reset email'});
        $http({
            method : 'POST',
            url : $rootScope.baseURL+'/api/passwordReset',
            data : datas
        })
        .success(function(response){
            $ionicLoading.hide();
            $rootScope.popupMessage("", "Email has been sent");
            $ionicHistory.goBack();
        })
        .error(function(error, status){
            $ionicLoading.hide();
            $rootScope.handleHttpError(error, status);
        });
    }
})

.controller('AuthCtrl', function($scope, $location, $stateParams, $ionicHistory, $http, $state, $auth, $rootScope, $ionicLoading, $q) {

    $scope.loginData = {};
    $scope.loginError = false;
    $scope.loginErrorText;

    $scope.login = function() {

        $ionicLoading.show();

        var credentials = {
            email: $scope.loginData.email,
            password: $scope.loginData.password
        }

        $auth.login(credentials).then(function() {
            // Return an $http request for the authenticated user
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                // Stringify the retured data
                var user = JSON.stringify(response.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $ionicLoading.hide();

                $state.go('tab.home');
            })
            .error(function(){
                $ionicLoading.hide();
                $rootScope.handleHttpError(error, status);
            })
        },
        function(error) {
            $ionicLoading.hide();
            $rootScope.handleHttpError(error, status);
        });
    };
    $scope.fbLogin = function() {
        $ionicLoading.show();
        $auth.authenticate('facebook').then(function() {
            // Return an $http request for the authenticated user
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                // Stringify the retured data
                var user = JSON.stringify(response.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $ionicLoading.hide();

                $state.go('tab.home');
            })
            .error(function(){
                $ionicLoading.hide();
                $rootScope.handleHttpError(error, status);
            })
        });
    };

    var fbLoginSuccess = function(response) {
        if (!response.authResponse){
            fbLoginError("Cannot find the authResponse");
            return;
        }

        var authResponse = response.authResponse;

        getFacebookProfileInfo(authResponse).then(function(profileInfo) {
            $http({
                method : 'POST',
                url : $rootScope.baseURL+'/api/facebook',
                data : {profile:profileInfo}
            })
            .success(function(response){
                localStorage.setItem('satellizer_token', response.token);
                $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                    // Stringify the retured data
                    var user = JSON.stringify(response.user);

                    // Set the stringified user data into local storage
                    localStorage.setItem('user', user);

                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });

                    $ionicLoading.hide();

                    $state.go('tab.home');
                })
                .error(function(){
                    $ionicLoading.hide();
                    $rootScope.handleHttpError(error, status);
                });
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
        });
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error){
        console.log('fbLoginError', error);
        $ionicLoading.hide();
    };

    // This method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
        var info = $q.defer();

        facebookConnectPlugin.api('/me?fields=id,email,first_name,last_name,link,picture.type(large),gender&access_token=' + authResponse.accessToken, null,
            function (response) {
                console.log(response);
                info.resolve(response);
            },
            function (response) {
                console.log(response);
                info.reject(response);
            }
        );
        return info.promise;
    };

    //This method is executed when the user press the "Login with facebook" button
    $scope.facebookSignIn = function() {
        facebookConnectPlugin.getLoginStatus(function(success){
            if(success.status === 'connected'){
                // The user is logged in and has authenticated your app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed request, and the time the access token
                // and signed request each expire
                console.log('getLoginStatus@facebookSignIn-if-connected', success.status);

                $ionicLoading.show({
                    template: 'Logging in...'
                });

                getFacebookProfileInfo(success.authResponse).then(function(profileInfo) {
                    $http({
                        method : 'POST',
                        url : $rootScope.baseURL+'/api/facebook',
                        data : {profile:profileInfo}
                    })
                    .success(function(response){
                        localStorage.setItem('satellizer_token', response.token);
                        $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                            // Stringify the retured data
                            var user = JSON.stringify(response.user);

                            // Set the stringified user data into local storage
                            localStorage.setItem('user', user);

                            $ionicHistory.nextViewOptions({
                                disableBack: true
                            });

                            $ionicLoading.hide();

                            $state.go('tab.home');
                        })
                        .error(function(){
                            $ionicLoading.hide();
                            $rootScope.handleHttpError(error, status);
                        });
                    })
                    .error(function(error){
                        $rootScope.handleHttpError(error);
                    });
                }, function(fail){
                    // Fail get profile info
                    console.log('profile info fail', fail);
                });

            } else {
                // If (success.status === 'not_authorized') the user is logged in to Facebook,
                // but has not authenticated your app
                // Else the person is not logged into Facebook,
                // so we're not sure if they are logged into this app or not.

                console.log('getLoginStatus@facebookSignIn-else-connected', success.status);

                $ionicLoading.show({
                    template: 'Logging in...'
                });

                // Ask the permissions you need. You can learn more about
                // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
            }
        });
    };

})
.controller('HomeCtrl', function($scope, FetchPosts, $http, $state, $rootScope, $stateParams, $ionicActionSheet, $ionicLoading, $ionicPopup) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;

    var user = $rootScope.getCurrentUser();

    $http.get($rootScope.baseURL+'/api/app/'+noAngularVar_device+'/'+noAngularVar_deviceID).success(function(){});

    if(user || $stateParams.refresh){
        FetchPosts.following($scope.page).then(function(response){
            posts = response.data;
            for (index = 0; index < posts.length; ++index) {
                if ($rootScope.compareList.indexOf(posts[index].id) == -1)
                {
                    $rootScope.compareIndexList[posts[index].id] = false;
                }
                else
                {
                    $rootScope.compareIndexList[posts[index].id] = true;
                }

                posts[index].created_from = Math.floor(((new Date() - new Date(posts[index].created_at)) / 1000 / 60) % 1440);
                if (posts[index].created_from/60 > 16)
                {
                    posts[index].time_icon = "fa-hourglass-end";
                }
                else if (posts[index].created_from/60 > 8)
                {
                    posts[index].time_icon = "fa-hourglass-half";
                }
                else
                {
                    posts[index].time_icon = "fa-hourglass-start";
                }
                posts[index].created_from = ('0'+Math.floor(24 - posts[index].created_from/60)).slice(-2)+":"+('0'+Math.floor(60 - posts[index].created_from%60)).slice(-2);
            }
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            if(posts && posts.length == 0){
                $scope.noResult = true;
            }
            $scope.posts = posts;
            $scope.page++;
        });
    }
    $scope.loadMore = function() {
        FetchPosts.following($scope.page).then(function(response){
            posts = response.data;
            for (index = 0; index < posts.length; ++index) {
                if ($rootScope.compareList.indexOf(posts[index].id) == -1)
                {
                    $rootScope.compareIndexList[posts[index].id] = false;
                }
                else
                {
                    $rootScope.compareIndexList[posts[index].id] = true;
                }

                posts[index].created_from = Math.floor(((new Date() - new Date(posts[index].created_at)) / 1000 / 60) % 1440);
                if (posts[index].created_from/60 > 16)
                {
                    posts[index].time_icon = "fa-hourglass-end";
                }
                else if (posts[index].created_from/60 > 8)
                {
                    posts[index].time_icon = "fa-hourglass-half";
                }
                else
                {
                    posts[index].time_icon = "fa-hourglass-start";
                }
                posts[index].created_from = ('0'+Math.floor(24 - posts[index].created_from/60)).slice(-2)+":"+('0'+Math.floor(60 - posts[index].created_from%60)).slice(-2);
            }
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchPosts.following($scope.page).then(function(response){
            posts = response.data;
            for (index = 0; index < posts.length; ++index) {
                if ($rootScope.compareList.indexOf(posts[index].id) == -1)
                {
                    $rootScope.compareIndexList[posts[index].id] = false;
                }
                else
                {
                    $rootScope.compareIndexList[posts[index].id] = true;
                }

                posts[index].created_from = Math.floor(((new Date() - new Date(posts[index].created_at)) / 1000 / 60) % 1440);
                if (posts[index].created_from/60 > 16)
                {
                    posts[index].time_icon = "fa-hourglass-end";
                }
                else if (posts[index].created_from/60 > 8)
                {
                    posts[index].time_icon = "fa-hourglass-half";
                }
                else
                {
                    posts[index].time_icon = "fa-hourglass-start";
                }
                posts[index].created_from = ('0'+Math.floor(24 - posts[index].created_from/60)).slice(-2)+":"+('0'+Math.floor(60 - posts[index].created_from%60)).slice(-2);
            }
            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noResult = false;
            if(posts && posts.length == 0){
                $scope.noResult = true;
            }
        });
    };
    $scope.likeClicked = function($event,post){
        $event.preventDefault();
        if(post.user_liked){
            post.likes_count.aggregate--;
            if(post.likes_count.aggregate == 0){
                post.likes_count = null;
            }
            $http.get($rootScope.baseURL+'/api/post/'+post.id+'/unlike').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            if(post.likes_count){
                post.likes_count.aggregate++;
            }
            else{
                post.likes_count = {aggregate: 1};
            }
            $http.get($rootScope.baseURL+'/api/post/'+post.id+'/like').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        post.user_liked = !post.user_liked;
    };
    $scope.commentsPage = function(id){
        $state.go('tab.post-comments-home',{postId: id});
    };
    $scope.moreOption = function(id){
        $ionicActionSheet.show({
            destructiveText: 'Report',
            cancelText: 'Cancel',
            cancel: function() {

            },destructiveButtonClicked: function() {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Report',
                    template: 'Are you sure to report this post?'
                });

                confirmPopup.then(function(res) {
                    if(res) {
                        $ionicLoading.show();
                        $http.post($rootScope.baseURL+'/api/post/'+id+'/report').success(function(){
                            $ionicLoading.hide();
                            return true;
                        })
                        .error(function(error){
                            $rootScope.handleHttpError(error);
                        });
                    }
                });
                return true;
            }
        });
    };
    $scope.setAnalyticsHeight = function(){
        if ($rootScope.stat_height == 0 && $(".analytics-gender-avatar div").height() > $(".analytics-gender .analytics-number .ng-binding").height())
        {
            $rootScope.stat_height = $(".analytics-gender-avatar div").height();
            $rootScope.stat_label_height = $(".analytics-gender .analytics-number .ng-binding").height();
        }
    };
    $scope.getStatAgeHeight = function(stat, index, type) {
        var val = 0;
        if (stat === undefined)
        {
            return "0";
        }

        var total = 0;
        if (stat.teens !== undefined)
        {
            total += parseInt(stat.teens);
        }
        if (stat.twenties !== undefined)
        {
            total += parseInt(stat.twenties);
        }
        if (stat.thirties !== undefined)
        {
            total += parseInt(stat.thirties);
        }
        if (stat.forties !== undefined)
        {
            total += parseInt(stat.forties);
        }
        if (stat.fifties !== undefined)
        {
            total += parseInt(stat.fifties);
        }

        if (index == "10")
        {
            if (stat.teens === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.teens/total;
            }
        }
        if (index == "20")
        {
            if (stat.twenties === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.twenties/total;
            }
        }
        if (index == "30")
        {
            if (stat.thirties === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.thirties/total;
            }
        }
        if (index == "40")
        {
            if (stat.forties === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.forties/total;
            }
        }
        if (index == "50")
        {
            if (stat.fifties === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.fifties/total;
            }
        }

        if (type == "padding")
        {
            return $rootScope.stat_height - $rootScope.stat_label_height - ($rootScope.stat_height - $rootScope.stat_label_height)*val;
        }
        else if (type == "block")
        {
            return ($rootScope.stat_height - $rootScope.stat_label_height)*val;
        }
    };

    $scope.getStatAgeBlockColor = function(stat, index) {
        if (stat === undefined)
        {
            return "other";
        }

        var age = "10";
        var count = 0;
        var total = 0;
        if (stat.teens !== undefined)
        {
            total += parseInt(stat.teens);
        }
        if (stat.twenties !== undefined)
        {
            total += parseInt(stat.twenties);
        }
        if (stat.thirties !== undefined)
        {
            total += parseInt(stat.thirties);
        }
        if (stat.forties !== undefined)
        {
            total += parseInt(stat.forties);
        }
        if (stat.fifties !== undefined)
        {
            total += parseInt(stat.fifties);
        }

        if (stat.teens !== undefined && stat.teens > count)
        {
            age = "10";
            count = stat.teens;
        }
        if (stat.twenties !== undefined && stat.twenties > count)
        {
            age = "20";
            count = stat.twenties;
        }
        if (stat.thirties !== undefined && stat.thirties > count)
        {
            age = "30";
            count = stat.thirties;
        }
        if (stat.forties !== undefined && stat.forties > count)
        {
            age = "40";
            count = stat.forties;
        }
        if (stat.fifties !== undefined && stat.fifties > count)
        {
            age = "50";
            count = stat.fifties;
        }

        if (age == index)
        {
            return "top";
        }
        else
        {
            return "other";
        }
    };
})

.controller('PostLikersCtrl', function($scope, $stateParams, $http, $location, FetchUsers, $rootScope) {
    $scope.likes = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    var user = $rootScope.getCurrentUser();

    FetchUsers.liker($stateParams.postId, $scope.page).then(function(response){
        likes = response.data;
        if(!response.next_page_url){
            $scope.noMoreItemsAvailable = true;
        }
        $scope.likes = likes;
        $scope.page++;
        if(likes && likes.length == 0){
            $scope.noResult = true;
        }
    });
    $scope.loadMore = function() {
        FetchUsers.liker($stateParams.postId, $scope.page).then(function(response){
            likes = response.data;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.likes = $scope.likes.concat(likes);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchUsers.liker($stateParams.postId, $scope.page).then(function(response){
            likes = response.data;
            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.likes = likes;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noResult = false;
            if(likes && likes.length == 0){
                $scope.noResult = true;
            }
        });
    };
    $scope.followToggle = function(like) {
        if(like.user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ like.user.slug +'/unfollow').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ like.user.slug +'/follow').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        like.user.following_check = !like.user.following_check;
    };
    $scope.notMe = function(like) {
        return (like.user.id != user.id);
    };
})

.controller('PostDetailCtrl', function($scope, $stateParams, FetchPosts, $http, Focus, $rootScope, $ionicActionSheet, $ionicHistory, $ionicLoading, $state, $ionicPopup) {
    $scope.post = 0; // sloppy hack for not loaded check
    $scope.comment = {};
    $scope.liked = false;
    $scope.saved = false;
    $scope.likesCount = 0;
    $scope.commentsHiddenCount = 0;
    $scope.page = 2;
    $scope.clientVersionUpToDate = true;
    $scope.commentSubmitting = false;
    $scope.lessThanHidingTime = false;
    $scope.noResult = false;
    $scope.stat_height = 0;
    $scope.stat_label_height = 0;
    var user = $rootScope.getCurrentUser();

    $http.get($rootScope.baseURL+'/api/latest/client/version').success(function(version){
        if(version != $rootScope.clientVersion){
            $scope.clientVersionUpToDate = false;
        }
    });
    FetchPosts.get($stateParams.postId).then(function(post){
        if(post){
            if(post.is_visible){
                $scope.lessThanHidingTime = true;
            }
            post.latest_ten_comments.reverse();
            var commentsCount = 0;
            if(post.comments_count){
                commentsCount = post.comments_count.aggregate;
            }
            $scope.commentsHiddenCount = commentsCount - post.latest_ten_comments.length;
            $scope.post = post;
            if(post.user_liked){
                $scope.liked = true;
            }
            if(post.likes_count){
                $scope.likesCount = post.likes_count.aggregate;
            }

            if ($rootScope.compareList.indexOf(post.id) == -1)
            {
                $rootScope.compareIndexList[post.id] = false;
            }
            else
            {
                $rootScope.compareIndexList[post.id] = true;
            }

            post.created_from = Math.floor(((new Date() - new Date(post.created_at)) / 1000 / 60) % 1440);
            if (post.created_from/60 > 16)
            {
                post.time_icon = "fa-hourglass-end";
            }
            else if (post.created_from/60 > 8)
            {
                post.time_icon = "fa-hourglass-half";
            }
            else
            {
                post.time_icon = "fa-hourglass-start";
            }
            post.created_from = ('0'+Math.floor(24 - post.created_from/60)).slice(-2)+":"+('0'+Math.floor(60 - post.created_from%60)).slice(-2);
        }
        else{
            $scope.noResult = true;
        }
    });
    $scope.submitComment = function(){
        $scope.commentSubmitting = true;
        $http({
            method : 'POST',
            url : $rootScope.baseURL+'/api/post/'+$scope.post.id+'/comment/create',
            data : {comment:$scope.comment.content}
        })
        .success(function(response){
            response.user = user;
            $scope.post.latest_ten_comments.push(response);
            $scope.commentSubmitting = false;
            $('.dynamic-comment-count#'+$scope.post.id).html(parseInt($('.dynamic-comment-count#'+$scope.post.id).html(), 10)+1);
        })
        .error(function(error){
            $rootScope.handleHttpError(error);
        });
        $scope.comment.content = '';
    };
    $scope.remComment = function($index){
        $http.get($rootScope.baseURL+'/api/comment/'+$scope.post.latest_ten_comments[$index].id+'/delete').success(function(){
            $scope.post.latest_ten_comments.splice($index, 1);
            $('.dynamic-comment-count#'+$scope.post.id).html(parseInt($('.dynamic-comment-count#'+$scope.post.id).html(), 10)-1);
        })
        .error(function(error){
            $rootScope.handleHttpError(error);
        });
    };
    $scope.loadMoreComments = function(){
        if($scope.commentsHiddenCount > 0){
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/comment?page='+$scope.page).success(function(response){
                $scope.post.latest_ten_comments = response.data.reverse().concat($scope.post.latest_ten_comments);
                $scope.commentsHiddenCount -= response.data.length;
                if($scope.commentsHiddenCount < 0){
                    $scope.commentsHiddenCount = 0;
                }
                $scope.page++;
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
    };
    $scope.ownComment = function($index){
        return user.id == $scope.post.latest_ten_comments[$index].user.id;
    };
    $scope.ownPost = function(){
        if($scope.post){
            return user.id == $scope.post.user.id;
        }
    };
    $scope.focusComment = function(){
        Focus('comment');
    };
    $scope.likeClicked = function(){
        if($scope.liked){
            $scope.likesCount--;
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/unlike').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $scope.likesCount++;
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/like').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        $scope.liked = !$scope.liked;
    };
    $scope.moreOption = function(){
        if(user.id == $scope.post.user.id){
            $ionicActionSheet.show({
                buttons: [
                    { text: 'Edit' },
                ],
                destructiveText: 'Delete',
                cancelText: 'Cancel',
                cancel: function() {

                },
                buttonClicked: function(index) {
                    switch (index){
                        case 0:
                            $state.go('tab.post-edit',{post: $scope.post});
                            return true;
                    }
                },
                destructiveButtonClicked: function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Delete',
                        template: 'Are you sure to delete post?'
                    });

                    confirmPopup.then(function(res) {
                        if(res) {
                            $ionicLoading.show();
                            $http.post($rootScope.baseURL+'/api/post/'+$scope.post.id+'/delete').success(function(){
                                $stateParams.posts.splice($stateParams.index,1);
                                $stateParams.user.posts_count--;
                                $ionicLoading.hide();
                                $ionicHistory.goBack();
                                return true;
                            })
                            .error(function(error){
                                $rootScope.handleHttpError(error);
                            });
                        }
                    });
                }
            });
        }
        else{
            $ionicActionSheet.show({
                destructiveText: 'Report',
                cancelText: 'Cancel',
                cancel: function() {

                },destructiveButtonClicked: function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Report',
                        template: 'Are you sure to report this post?'
                    });

                    confirmPopup.then(function(res) {
                        if(res) {
                            $ionicLoading.show();
                            $http.post($rootScope.baseURL+'/api/post/'+$scope.post.id+'/report').success(function(){
                                $ionicLoading.hide();
                                return true;
                            })
                            .error(function(error){
                                $rootScope.handleHttpError(error);
                            });
                        }
                    });
                    return true;
                }
            });
        }

    };
    $scope.doRefresh = function() {
        $scope.post = 0; // sloppy hack for not loaded check
        $scope.comment = {};
        $scope.liked = false;
        $scope.saved = false;
        $scope.likesCount = 0;
        $scope.commentsHiddenCount = 0;
        $scope.page = 2;
        $scope.noResult = false;
        FetchPosts.get($stateParams.postId).then(function(post){
            if(post){
                if(post.is_visible){
                    $scope.lessThanHidingTime = true;
                }
                post.latest_ten_comments.reverse();
                var commentsCount = 0;
                if(post.comments_count){
                    commentsCount = post.comments_count.aggregate;
                }
                $scope.commentsHiddenCount = commentsCount - post.latest_ten_comments.length;
                $scope.post = post;
                if(post.user_liked){
                    $scope.liked = true;
                }
                if(post.likes_count){
                    $scope.likesCount = post.likes_count.aggregate;
                }
            }
            else{
                $scope.noResult = true;
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.setAnalyticsHeight = function(){
        if ($rootScope.stat_height == 0 && $(".analytics-gender-avatar div").height() > $(".analytics-gender .analytics-number .ng-binding").height())
        {
            $rootScope.stat_height = $(".analytics-gender-avatar div").height();
            $rootScope.stat_label_height = $(".analytics-gender .analytics-number .ng-binding").height();
        }
    };
    $scope.getStatAgeHeight = function(stat, index, type) {
        var val = 0;
        if (stat === undefined)
        {
            return "0";
        }

        var total = 0;
        if (stat.teens !== undefined)
        {
            total += parseInt(stat.teens);
        }
        if (stat.twenties !== undefined)
        {
            total += parseInt(stat.twenties);
        }
        if (stat.thirties !== undefined)
        {
            total += parseInt(stat.thirties);
        }
        if (stat.forties !== undefined)
        {
            total += parseInt(stat.forties);
        }
        if (stat.fifties !== undefined)
        {
            total += parseInt(stat.fifties);
        }

        if (index == "10")
        {
            if (stat.teens === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.teens/total;
            }
        }
        if (index == "20")
        {
            if (stat.twenties === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.twenties/total;
            }
        }
        if (index == "30")
        {
            if (stat.thirties === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.thirties/total;
            }
        }
        if (index == "40")
        {
            if (stat.forties === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.forties/total;
            }
        }
        if (index == "50")
        {
            if (stat.fifties === undefined)
            {
                val = 0;
            }
            else
            {
                val = stat.fifties/total;
            }
        }

        if (type == "padding")
        {
            return $rootScope.stat_height - $rootScope.stat_label_height - ($rootScope.stat_height - $rootScope.stat_label_height)*val;
        }
        else if (type == "block")
        {
            return ($rootScope.stat_height - $rootScope.stat_label_height)*val;
        }
    };
    $scope.getStatAgeBlockColor = function(stat, index) {
        if (stat === undefined)
        {
            return "other";
        }

        var age = "10";
        var count = 0;
        var total = 0;
        if (stat.teens !== undefined)
        {
            total += parseInt(stat.teens);
        }
        if (stat.twenties !== undefined)
        {
            total += parseInt(stat.twenties);
        }
        if (stat.thirties !== undefined)
        {
            total += parseInt(stat.thirties);
        }
        if (stat.forties !== undefined)
        {
            total += parseInt(stat.forties);
        }
        if (stat.fifties !== undefined)
        {
            total += parseInt(stat.fifties);
        }

        if (stat.teens !== undefined && stat.teens > count)
        {
            age = "10";
            count = stat.teens;
        }
        if (stat.twenties !== undefined && stat.twenties > count)
        {
            age = "20";
            count = stat.twenties;
        }
        if (stat.thirties !== undefined && stat.thirties > count)
        {
            age = "30";
            count = stat.thirties;
        }
        if (stat.forties !== undefined && stat.forties > count)
        {
            age = "40";
            count = stat.forties;
        }
        if (stat.fifties !== undefined && stat.fifties > count)
        {
            age = "50";
            count = stat.fifties;
        }

        if (age == index)
        {
            return "top";
        }
        else
        {
            return "other";
        }
    };
})

.controller('PostExploreCtrl', function($scope, FetchPosts, $stateParams, $state, Focus, $rootScope) {
    $scope.tab = $state.current['name'].split("-")[1];
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $scope.showSample = false;

    FetchPosts.new($scope.page, $stateParams.searchTerm).then(function(response){
        posts = response.data;
        if(!response.next_page_url){
            $scope.noMoreItemsAvailable = true;
        }
        $scope.posts = posts;
        $scope.page++;
        /*
        if(posts && posts.length < $rootScope.minimumCountToShowSample){
            $scope.showSample = true;
            FetchPosts.sample($rootScope.sampleCount).then(function(response){
                samples = response.data;
                $scope.samples = samples;
            });
        }
        */
        for (index = 0; index < posts.length; ++index) {
            if ($rootScope.compareList.indexOf(posts[index].id) == -1)
            {
                $rootScope.compareIndexList[posts[index].id] = false;
            }
            else
            {
                $rootScope.compareIndexList[posts[index].id] = true;
            }
            posts[index].created_from = Math.floor(((new Date() - new Date(posts[index].created_at)) / 1000 / 60) % 1440);
            if (posts[index].created_from/60 > 16)
            {
                posts[index].time_icon = "fa-hourglass-end";
            }
            else if (posts[index].created_from/60 > 8)
            {
                posts[index].time_icon = "fa-hourglass-half";
            }
            else
            {
                posts[index].time_icon = "fa-hourglass-start";
            }
            posts[index].created_from = ('0'+Math.floor(24 - posts[index].created_from/60)).slice(-2)+":"+('0'+Math.floor(60 - posts[index].created_from%60)).slice(-2);
        }

        if(posts && posts.length == 0){
            $scope.noResult = true;
        }
    });

    $scope.loadMore = function() {
        FetchPosts.new($scope.page, $stateParams.searchTerm).then(function(response){
            posts = response.data;
            for (index = 0; index < posts.length; ++index) {
                if ($rootScope.compareList.indexOf(posts[index].id) == -1)
                {
                    $rootScope.compareIndexList[posts[index].id] = false;
                }
                else
                {
                    $rootScope.compareIndexList[posts[index].id] = true;
                }
                posts[index].created_from = Math.floor(((new Date() - new Date(posts[index].created_at)) / 1000 / 60) % 1440);
                if (posts[index].created_from/60 > 16)
                {
                    posts[index].time_icon = "fa-hourglass-end";
                }
                else if (posts[index].created_from/60 > 8)
                {
                    posts[index].time_icon = "fa-hourglass-half";
                }
                else
                {
                    posts[index].time_icon = "fa-hourglass-start";
                }
                posts[index].created_from = ('0'+Math.floor(24 - posts[index].created_from/60)).slice(-2)+":"+('0'+Math.floor(60 - posts[index].created_from%60)).slice(-2);
            }

            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchPosts.new($scope.page, $stateParams.searchTerm).then(function(response){
            posts = response.data;
            for (index = 0; index < posts.length; ++index) {
                if ($rootScope.compareList.indexOf(posts[index].id) == -1)
                {
                    $rootScope.compareIndexList[posts[index].id] = false;
                }
                else
                {
                    $rootScope.compareIndexList[posts[index].id] = true;
                }
                posts[index].created_from = Math.floor(((new Date() - new Date(posts[index].created_at)) / 1000 / 60) % 1440);
                if (posts[index].created_from/60 > 16)
                {
                    posts[index].time_icon = "fa-hourglass-end";
                }
                else if (posts[index].created_from/60 > 8)
                {
                    posts[index].time_icon = "fa-hourglass-half";
                }
                else
                {
                    posts[index].time_icon = "fa-hourglass-start";
                }
                posts[index].created_from = ('0'+Math.floor(24 - posts[index].created_from/60)).slice(-2)+":"+('0'+Math.floor(60 - posts[index].created_from%60)).slice(-2);
            }

            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noResult = false;

            if(posts && posts.length < $rootScope.minimumCountToShowSample){
                if ($scope.showSample == true)
                {
                    return;
                }
                else
                {
                    $scope.showSample = true;
                    FetchPosts.sample($rootScope.sampleCount).then(function(response){
                        samples = response.data;
                        $scope.samples = samples;
                    });
                }
            }
/*
            if(posts && posts.length == 0){
                $scope.noResult = true;
            }
*/
        });
    };
    $scope.submitSearch = function(search_term) {
        $state.go('tab.explore-explore',{searchTerm: search_term});
    };
    $scope.noSearchTerm = function() {
       return !$stateParams.searchTerm;
    };
    $scope.focusSearch = function(){
        Focus('search');
    }
    $scope.tagSearchTerm = function(){
        if($stateParams.searchTerm){
            var temp = $stateParams.searchTerm.split(' ');
            return '#'+temp.join(' #');
        }
    }
})

.controller('CompareCtrl', function($scope, FetchPosts, $state, Focus, $rootScope) {
    $scope.showInstruction = true;
    $scope.genderList = [
        {value: 'male', label: 'Male'},
        {value: 'female', label: 'Female'}
    ];
    $scope.ageList = [
        {value: '10', label: '10-20'},
        {value: '20', label: '20-30'},
        {value: '30', label: '30-40'},
        {value: '40', label: '40-50'},
        {value: '50', label: 'Above 50'}
    ];
    $scope.tab = $state.current['name'].split("-")[1];
    if ($rootScope.compareList.length >= 2 )
    {
        $scope.showInstruction = false;
        FetchPosts.compare($rootScope.compareList).then(function(response){
            posts = response;
            $scope.posts = posts;
            for (index = 0; index < posts.length; ++index) {
                posts[index].created_from = Math.floor(((new Date() - new Date(posts[index].created_at)) / 1000 / 60) % 1440);
                if (posts[index].created_from/60 > 16)
                {
                    posts[index].time_icon = "fa-hourglass-end";
                }
                else if (posts[index].created_from/60 > 8)
                {
                    posts[index].time_icon = "fa-hourglass-half";
                }
                else
                {
                    posts[index].time_icon = "fa-hourglass-start";
                }
                posts[index].created_from = ('0'+Math.floor(24 - posts[index].created_from/60)).slice(-2)+":"+('0'+Math.floor(60 - posts[index].created_from%60)).slice(-2);
            }
        });        
    }

    $scope.$on('$ionicView.enter', function() {
        $scope.showInstruction = true;
        if ($rootScope.compareList.length >= 2 )
        {
            $scope.showInstruction = false;
            FetchPosts.compare($rootScope.compareList).then(function(response){
                posts = response;
                $scope.posts = posts;
                for (index = 0; index < posts.length; ++index) {
                    posts[index].created_from = Math.floor(((new Date() - new Date(posts[index].created_at)) / 1000 / 60) % 1440);
                    if (posts[index].created_from/60 > 16)
                    {
                        posts[index].time_icon = "fa-hourglass-end";
                    }
                    else if (posts[index].created_from/60 > 8)
                    {
                        posts[index].time_icon = "fa-hourglass-half";
                    }
                    else
                    {
                        posts[index].time_icon = "fa-hourglass-start";
                    }
                    posts[index].created_from = ('0'+Math.floor(24 - posts[index].created_from/60)).slice(-2)+":"+('0'+Math.floor(60 - posts[index].created_from%60)).slice(-2);
                }
            });        
        }
    });
    $scope.removeCompare = function(_post) {
        $(".post_"+_post.id).fadeOut(300, function() {
            $rootScope.addCompare(_post.id);
            $(".post_"+_post.id).remove();
            $scope.posts.splice($scope.posts.indexOf(_post), 1);
        });
    }
    $scope.sortPosts = function(sort, index) {
        var post_list = $scope.posts;
        var temp_post = [];
        var percent_array = [];
        var analytics;
        var temp_max;
        var sort_by_age = false;
        var sort_by_gender = false;
        if (sort.age !== undefined && sort.age !== "")
        {
            var sort_by_age = true;
        }
        if (sort.gender !== undefined && sort.gender !== "")
        {
            var sort_by_gender = true;
        }

        for(i = 0; i < post_list.length; i++)
        {
            percent_array[i] = 0;
            analytics = post_list[i].post_analytic;
            console.log(analytics);
            analytics = analytics[0];
            console.log(percent_array[i]);
            if (sort_by_gender == true)
            {
                percent_array[i] = parseFloat($scope.calculatePercent(analytics, sort.gender));
                console.log("Calculate Gender:"+percent_array[i]);
            }
            if (sort_by_age == true)
            {
                percent_array[i] = parseFloat($scope.calculatePercent(analytics, sort.age));
                console.log("Calculate Age:"+percent_array[i]);
            }
            console.log(percent_array[i]);
        }

        console.log("compare Complete");
        console.log(percent_array);
        while(percent_array.length != 0)
        {
            temp_max = 0;
            for(i = 0; i < percent_array.length; i++)
            {
                if (temp_max <= percent_array[i])
                {
                    temp_max = percent_array[i];
                }
            }
            console.log(percent_array.indexOf(temp_max));
            console.log(post_list[percent_array.indexOf(temp_max)]);
            temp_post.push(post_list[percent_array.indexOf(temp_max)]);
            percent_array.splice(percent_array.indexOf(temp_max), 1);
        }
        console.log(temp_post);
        $scope.posts = temp_post;
    };
    $scope.calculatePercent = function(_stat, _index) {
        _index = _index.value;
        if (_index === "male")
        {
            if (_stat.male == 0)
            {
                console.log("Male 0");
                return 0;
            }
            console.log("Male not 0");
            return Math.round(parseInt(_stat.male)/(parseInt(_stat.male)+parseInt(_stat.female))*10000)/100;
        }
        else if (_index === "female")
        {
            if (_stat.female == 0)
            {
                console.log("Female 0");
                return 0;
            }
            console.log("Female not 0");
            return Math.round(parseInt(_stat.female)/(parseInt(_stat.male)+parseInt(_stat.female))*10000)/100;
        }
        else if (_index === "10")
        {
            if (_stat.teens == 0)
            {
                console.log("Teen 0");
                return 0;
            }
            console.log("Teens not 0");
            return Math.round(parseInt(_stat.teens)/(parseInt(_stat.teens)+parseInt(_stat.twenties)+parseInt(_stat.thirties)+parseInt(_stat.forties)+parseInt(_stat.fifties))*10000)/100;
        }
        else if (_index === "20")
        {
            if (_stat.twenties == 0)
            {
                console.log("Twenty 0");
                return 0;
            }
            console.log("Twenty not 0");
            return Math.round(parseInt(_stat.twenties)/(parseInt(_stat.teens)+parseInt(_stat.twenties)+parseInt(_stat.thirties)+parseInt(_stat.forties)+parseInt(_stat.fifties))*10000)/100;
        }
        else if (_index === "30")
        {
            if (_stat.thirties == 0)
            {
                return 0;
            }
            return Math.round(parseInt(_stat.thirties)/(parseInt(_stat.teens)+parseInt(_stat.twenties)+parseInt(_stat.thirties)+parseInt(_stat.forties)+parseInt(_stat.fifties))*10000)/100;
        }
        else if (_index === "40")
        {
            if (_stat.forties == 0)
            {
                return 0;
            }
            return Math.round(parseInt(_stat.forties)/(parseInt(_stat.teens)+parseInt(_stat.twenties)+parseInt(_stat.thirties)+parseInt(_stat.forties)+parseInt(_stat.fifties))*10000)/100;
        }
        else if (_index === "50")
        {
            if (_stat.fifties == 0)
            {
                return 0;
            }
            return Math.round(parseInt(_stat.fifties)/(parseInt(_stat.teens)+parseInt(_stat.twenties)+parseInt(_stat.thirties)+parseInt(_stat.forties)+parseInt(_stat.fifties))*10000)/100;
        }
    };
})
.controller('RankingCtrl', function($scope, FetchSchools) {
    $scope.schools = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchSchools.ranking($scope.page).then(function(schools){
        $scope.schools = schools;
        $scope.page++;
        if ( schools.length == 0 ) {
            $scope.noMoreItemsAvailable = true;
        }
    });

    $scope.loadMore = function() {
        FetchSchools.ranking($scope.page).then(function(schools){
            $scope.schools = $scope.schools.concat(schools);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( schools.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchSchools.ranking($scope.page).then(function(schools){
            $scope.schools = schools;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            if ( schools.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
})

.controller('SchoolCtrl', function($scope, FetchPosts, $stateParams) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $scope.schoolName = $stateParams.schoolName;

    FetchPosts.school($scope.page, $stateParams.schoolId).then(function(response){
        posts = response.data;
        if(!response.next_page_url){
            $scope.noMoreItemsAvailable = true;
        }
        $scope.posts = posts;
        $scope.page++;
        if ( posts && posts.length == 0 ) {
            $scope.noResult = true;
        }
    });

    $scope.loadMore = function() {
        FetchPosts.school($scope.page, $stateParams.schoolId).then(function(response){
            posts = response.data;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchPosts.school($scope.page, $stateParams.schoolId).then(function(response){
            posts = response.data;
            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;$scope.noResult = false;
            if ( posts && posts.length == 0 ) {
                $scope.noResult = true;
            }
        });
    };
})
.controller('AccountCtrl', function($scope, $stateParams, FetchUsers, FetchPosts, $http, $state, $rootScope, $ionicActionSheet, $cordovaCamera, $cordovaFile, $ionicLoading) {
    var user = $rootScope.getCurrentUser();
    $scope.page = 1;
    $scope.isMyAccount = false;
    $scope.posts = [];
    $scope.noMoreItemsAvailable = false;
    $scope.data = { "ImageURI" :  "Select Image" };
    $scope.currentSlug = "";
    $scope.noResult = false;
    $scope.activatedTab = 'best';
    if ($stateParams.activateTab) {
        $scope.activatedTab = $stateParams.activateTab;
    }

    if (!$stateParams.accountSlug)
    {
        $scope.currentSlug = user.slug;
    }
    else
    {
        $scope.currentSlug = $stateParams.accountSlug;
    }

    if (user.slug != $scope.currentSlug)
    {
        $scope.activatedTab = 'new';
    }

    if (user.id || $stateParams.refresh) {
        FetchUsers.get($scope.currentSlug).then(function(account_info){
            $scope.account_info = account_info;
            $scope.accountImage = $rootScope.photoPath( account_info.profile_img_path, 's' );

            if (user.id == $scope.account_info.id)
            {
                $scope.isMyAccount = true;
            }
        });
        FetchPosts.user($scope.currentSlug, $scope.activatedTab, $scope.page).then(function(response){
            posts = response.data;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = posts;
            $scope.page++;
            if ( posts && posts.length == 0 ) {
                $scope.noResult = true;
            }
            if( !$scope.isMyAccount && ($scope.activatedTab == 'best') ){
                $scope.noMoreItemsAvailable = true;
            }
        });
    }

    $scope.changeProfilePicture = function(){
        if ($scope.notMe())
            return;
        // Show the action sheet
        var navCameraSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Take a Picture' },
                { text: 'Choose from Gallery' }
            ],
            titleText: 'Share Your Look',
            cancelText: 'Cancel',
            cancel: function() {
                // code for cancel if necessary.
            },
            buttonClicked: function(index) {
                switch (index){
                    case 0 :
                        var options = {
                            quality: 100,
                            targetWidth: 600,
                            targetHeight: 600,
                            correctOrientation: true,
                            destinationType: Camera.DestinationType.FILE_URL,
                            sourceType: Camera.PictureSourceType.CAMERA
                        };
                        $cordovaCamera.getPicture(options).then(
                            function(imageData) {
                                localStorage.setItem('photo', imageData);
                                $ionicLoading.show({template: 'Loading Photo', duration:500});
                                $scope.updateProfilePicture(imageData);
                            },
                            function(err){
                            }
                        )
                        return true;
                    case 1 :
                        var options = {
                            quality: 100,
                            targetWidth: 600,
                            targetHeight: 600,
                            correctOrientation: true,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                        };

                        $cordovaCamera.getPicture(options).then(
                            function(imageURI) {
                                window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
                                    localStorage.setItem('photo', fileEntry.nativeURL);
                                    $ionicLoading.show({template: 'Loading Photo', duration:500});
                                    $scope.updateProfilePicture(fileEntry.nativeURL);
                                });
                            },
                            function(err){
                            }
                        )
                        //Handle Move Button
                        return true;
                }
            }
        });
    }

    $scope.updateProfilePicture = function(picData) {
        $ionicLoading.show({template: 'Uploading Photo...', duration:500});
        var fileURL = picData;
        var options = new FileUploadOptions();
        options.fileKey = "image";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.chunkedMode = true;

        var params = {'user_id': user.id };

        options.params = params;

        var ft = new FileTransfer();

        ft.upload(fileURL, encodeURI($rootScope.baseURL + '/api/'+user.slug+'/editProfilePicture'), success, fail, options);

        function success(r) {
            $ionicLoading.show({template: 'Upload Success', duration:500});
            var result = JSON.parse(r.response);
            $scope.accountImage = $rootScope.photoPath( result.profile_img_path, 's' );
        }

        // Transfer failed
        function fail(error) {
            $ionicLoading.show({template: 'Upload Fail', duration:500});
        }
    }

    $scope.goAccountSocialNetwork = function(type){
        if (type == 'facebook')
        {
            window.open('https://www.facebook.com/'+$scope.account_info.social_networks.facebook, '_system');
        }
        else if (type == 'twitter')
        {
            window.open('https://www.twitter.com/'+$scope.account_info.social_networks.twitter, '_system');
        }
        else if (type == 'instagram')
        {
            window.open('https://www.instagram.com/'+$scope.account_info.social_networks.instagram, '_system');
        }
        else if (type == 'pinterest')
        {
            window.open('https://www.pinterest.com/'+$scope.account_info.social_networks.pinterest, '_system');
        }
    };
    $scope.followToggle = function(like) {
        if(like.following_check){
            $http.get($rootScope.baseURL+'/api/'+ like.slug +'/unfollow').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else {
            $http.get($rootScope.baseURL+'/api/'+ like.slug +'/follow').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        like.following_check = !like.following_check;
    };
    $scope.notMe = function(like) {
        return !$scope.isMyAccount;
    };
    $scope.loadMore = function() {
        FetchPosts.user($scope.currentSlug, $scope.activatedTab, $scope.page).then(function(response){
            posts = response.data;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        $scope.posts = [];
        $scope.activatedTab = 'best';

        FetchUsers.get($scope.currentSlug).then(function(account_info){
            $scope.account_info = account_info;
        });
        FetchPosts.user($scope.currentSlug, 'best', $scope.page).then(function(response){
            posts = response.data;
            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noResult = false;
            if ( posts && posts.length == 0 ) {
                $scope.noResult = true;
            }
            if( !$scope.isMyAccount && ($scope.activatedTab == 'best') ){
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.activateTab = function(tab){
        $scope.page = 1;
        $scope.posts = [];
        $scope.activatedTab = tab;
        $scope.noResult = false;

        FetchPosts.user($scope.currentSlug, tab, $scope.page).then(function(response){
            posts = response.data;
            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = posts;
            $scope.page++;
            if ( posts && posts.length == 0 ) {
                $scope.noResult = true;
            }
            if( !$scope.isMyAccount && (tab == 'best') ){
                $scope.noMoreItemsAvailable = true;
            }
        });
    }
})
.controller('OptionCtrl', function($scope, $stateParams, $http, $state, $ionicPopup, $ionicHistory, $rootScope) {
    $scope.user = $rootScope.getCurrentUser();
    $scope.goAccountEdit = function(id){
        $state.go('tab.edit-account');
    };
    $scope.goFindFriends = function(id){
        $state.go('tab.find-friends');
    };
    $scope.goInviteFriends = function(id){
        $state.go('tab.invite-friends');
    };
    $scope.goChangePassword = function(id){
        $state.go('tab.change-password');
    };
    $scope.logout = function(id){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Log Out',
            template: 'Are you sure to log out?'
        });        

        confirmPopup.then(function(res) {
            if(res) {
                localStorage.removeItem('user');
                localStorage.removeItem('satellizer_token');
                $ionicHistory.clearCache().then(function(){
                    $ionicHistory.clearHistory();
                    $state.go('root');
                });
            }
        });


        
    };
})
.controller('AccountEditCtrl', function($scope, FetchUsers, $http, $rootScope, $ionicHistory) {
    var user = $rootScope.getCurrentUser();
    FetchUsers.get(user.slug).then(function(user){
        $scope.user = user;
        var data = { first_name : $scope.user.first_name,
            first_name : $scope.user.first_name,
            last_name : $scope.user.last_name,
            slug : $scope.user.slug,
            facebook : $scope.user.social_networks.facebook,
            twitter : $scope.user.social_networks.twitter,
            instagram : $scope.user.social_networks.instagram,
            pinterest : $scope.user.social_networks.pinterest,
            age : $scope.user.age,
            gender : $scope.user.gender
        };
        $scope.user_info = data;
    });

    $scope.updateProfile = function(user){
        $http({
            method: "POST",
            url: $rootScope.baseURL + '/api/' + $scope.user.slug + '/edit',
            data: user
        })
        .success(function(response){
            $rootScope.popupMessage('Message', 'Profile Has been updated');
            $ionicHistory.goBack();
        })
        .error(function(error, status){
            $rootScope.handleHttpError(error, status);
        });
    };
})
.controller('ChangePasswordCtrl', function($scope, $stateParams, $http, $state, $location, $rootScope, $ionicHistory) {
    var user = $rootScope.getCurrentUser();
    $scope.changePassword = function(pwd){
        $http({
            method: "POST",
            url: $rootScope.baseURL + '/api/' + user.slug + '/password/edit',
            data: pwd
        })
        .success(function(response){
            $rootScope.popupMessage('Message', 'Password Has been updated');
            $ionicHistory.goBack();
        })
        .error(function(error, status){
            $rootScope.handleHttpError(error, status);
        });
    };
})
.controller('ChangeProfilePictureCtrl', function($scope, $stateParams, $http, $state, $location, $ionicPopup) {

})
.controller('FindFriendsCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope) {
    $scope.users = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchUsers.findFriends($scope.page).then(function(users){
        $scope.users = users;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchUsers.findFriends($scope.page).then(function(users){
            $scope.users = $scope.users.concat(users);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( users.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchUsers.findFriends($scope.page).then(function(users){
            $scope.users = users;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
    $scope.followToggle = function(user) {
        if(user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/unfollow').success(function(){

            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){

            });
        }
        user.following_check = !user.following_check;
    };
})
.controller('InviteFriendsCtrl', function($scope, $http, $rootScope, $ionicPopup, Focus) {
    $scope.sendInvitation = function(email){
        $http({
            method: "POST",
            url: $rootScope.baseURL + '/api/invite-friends',
            data: {'email' : email }
        })
        .success(function(response){
            $rootScope.popupMessage('Message', 'Invitation has been sent');
            $( ".email" ).val("");
        })
        .error(function(error, status){
            $rootScope.handleHttpError(error, status);
        });
    };

    $scope.focusEmailInput = function(){
        Focus('email');
    }

})
.controller('FollowingCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope) {
    var user = $rootScope.getCurrentUser();
    $scope.me = user;
    $scope.users = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;

    FetchUsers.following($stateParams.userSlug, $scope.page).then(function(response){
        users = response.data;
        if(!response.next_page_url){
            $scope.noMoreItemsAvailable = true;
        }
        $scope.users = users;
        $scope.page++;
        if(users && users.length == 0){
            $scope.noResult = true;
        }
    });

    $scope.loadMore = function() {
        FetchUsers.following($stateParams.userSlug, $scope.page).then(function(response){
            users = response.data;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.users = $scope.users.concat(users);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchUsers.following($stateParams.userSlug, $scope.page).then(function(response){
            users = response.data;
            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.users = users;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noResult = false;
            if(users && users.length == 0){
                $scope.noResult = true;
            }
        });
    };
    $scope.followToggle = function(user) {
        if(user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/unfollow').success(function(){
                if( $stateParams.user && ($stateParams.user.id == $scope.me.id) ){
                    $stateParams.user.following_count--;
                }
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){
                if( $stateParams.user && ($stateParams.user.id == $scope.me.id) ){
                    $stateParams.user.following_count++;
                }
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        user.following_check = !user.following_check;
    };
})
.controller('FollowerCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope) {
    var user = $rootScope.getCurrentUser();
    $scope.me = user;
    $scope.users = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $scope.userItself = false;

    FetchUsers.follower($stateParams.userSlug, $scope.page).then(function(response){
        users = response.data;
        if(!response.next_page_url){
            $scope.noMoreItemsAvailable = true;
        }
        $scope.users = users;
        $scope.page++;
        if(users && users.length == 0){
            $scope.noResult = true;
        }
    });

    $scope.loadMore = function() {
        FetchUsers.follower($stateParams.userSlug, $scope.page).then(function(response){
            users = response.data;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.users = $scope.users.concat(users);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchUsers.follower($stateParams.userSlug, $scope.page).then(function(response){
            users = response.data;
            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.users = users;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noResult = false;
            if(users && users.length == 0){
                $scope.noResult = true;
            }
        });
    };
    $scope.followToggle = function(user) {
        if(user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/unfollow').success(function(){
                if( $stateParams.user && ($stateParams.user.id == $scope.me.id) ){
                    $stateParams.user.following_count--;
                }
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){
                if( $stateParams.user && ($stateParams.user.id == $scope.me.id) ){
                    $stateParams.user.following_count++;
                }
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        user.following_check = !user.following_check;
    };
})
.controller('LikedCtrl', function($scope, $stateParams, FetchPosts) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchPosts.liked($stateParams.userSlug, $scope.page).then(function(posts){
        $scope.posts = posts;
        $scope.page++;
        if ( posts.length == 0 ) {
            $scope.noMoreItemsAvailable = true;
        }
    });

    $scope.loadMore = function() {
        FetchPosts.liked($stateParams.userSlug, $scope.page).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchPosts.liked($stateParams.userSlug, $scope.page).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
})
.controller('NotificationCtrl', function($scope, FetchNotifications, $rootScope, $state) {
    var user = $rootScope.getCurrentUser();
    $scope.notifications = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;

    FetchNotifications.new(user.slug, $scope.page).then(function(response){
        notifications = response.data;
        if(!response.next_page_url){
            $scope.noMoreItemsAvailable = true;
        }
        $scope.notifications = notifications;
        $scope.page++;
        if(notifications && notifications.length == 0){
            $scope.noResult = true;
        }
    });
    $scope.goNotificationDetail = function(src) {
        var data = src.split("/");
        if (data[1] == "post")
        {
            $state.go('tab.post-detail-notification',{postId: data[2]});
        }
        else if (data[1] == "account")
        {
            $state.go('tab.account-notification',{accountSlug: data[2]});
        }
    };
    $scope.goNotificationProfile = function(slug) {
        $state.go('tab.account-notification',{accountSlug: slug});
    };
    $scope.loadMore = function() {
        FetchNotifications.new(user.slug, $scope.page).then(function(response){
            notifications = response.data;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.notifications = $scope.notifications.concat(notifications);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
        });
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        FetchNotifications.new(user.slug, $scope.page).then(function(response){
            notifications = response.data;
            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.notifications = notifications;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noResult = false;
            if(notifications && notifications.length == 0){
                $scope.noResult = true;
            }
        });
    };
});
