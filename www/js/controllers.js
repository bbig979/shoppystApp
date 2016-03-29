angular.module('starter.controllers', [])

.run(function($rootScope, $ionicTabsDelegate, $state, $ionicPlatform, $ionicPopup, $ionicActionSheet, $timeout, $cordovaCamera,$ionicLoading) {
    $rootScope.clientVersion = '1.0';
    $rootScope.baseURL = 'http://appbeta.shoppyst.com';
    // $rootScope.baseURL = 'http://localhost:8000';
    // $rootScope.baseURL = 'http://192.168.56.1:8000';
    // $rootScope.baseURL = 'http://localhost:8888';
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
    $rootScope.goPostDetail = function(id){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-detail-'+tab,{postId: id});
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
    $rootScope.goAccountFollowing = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-following-'+tab,{userSlug: slug});
    };
    $rootScope.goAccountFollower = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-follower-'+tab,{userSlug: slug});
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
                $rootScope.popupMessage('Error', error[key]);
                break;
            }
        }
        if(status == 500){
            $state.go('tab.home');
        }
        else if(typeof (error.status) != 'undefined' && error.status == 401){
            // when validation error
            for(var key in error.data){
                $rootScope.popupMessage('Error', error.data[key]);
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
    }
    $rootScope.goAccountOption = function(id){
        $state.go('tab.option-account',{userId: id});
    };
    $rootScope.openCameraMenu = function(){
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
                            destinationType: Camera.DestinationType.FILE_URL,
                            sourceType: Camera.PictureSourceType.CAMERA
                        };
                        $cordovaCamera.getPicture(options).then(
                            function(imageData) {
                                localStorage.setItem('photo', imageData);
                                $ionicLoading.show({template: 'Loading Photo', duration:500});
                                $state.go('tab.camera',{photoUrl: imageData});
                            },
                            function(err){
                                $ionicLoading.show({template: 'Error to Load Photo', duration:500});
                            }
                        )
                        return true;
                    case 1 :
                        var options = {
                            quality: 100,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                        };

                        $cordovaCamera.getPicture(options).then(
                            function(imageURI) {
                                window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
                                    localStorage.setItem('photo', fileEntry.nativeURL);
                                    $ionicLoading.show({template: 'Loading Photo', duration:500});
                                    $state.go('tab.camera',{photoUrl: fileEntry.nativeURL});
                                });
                            },
                            function(err){
                                $ionicLoading.show({template: 'Error to Load Photo', duration:500});
                            }
                        )
                        //Handle Move Button
                        return true;
                }
            }
        });
    }
    $rootScope.popupMessage = function(title, message){
        var alertPopup = $ionicPopup.alert({
            title: title,
            template: message
        });
    };

    $rootScope.showNotification = function(){
        var exception = 'auth, register, register2';
        if(exception.indexOf($state.current.name) > -1){
            return false;
        }
        return true;
    };
})
.controller('PostCreateCtrl', function($scope, $state, $http, $stateParams, $rootScope, $cordovaCamera, $cordovaFile, $ionicLoading) {
    var user = JSON.parse(localStorage.getItem('user'));
    $scope.data = { "ImageURI" :  "Select Image" };
    $scope.picData = $stateParams.photoUrl;

    $scope.sharePost = function(captions) {
        $ionicLoading.show({template: 'Uploading Photo...', duration:500});
        var fileURL = $scope.picData;
        var options = new FileUploadOptions();
        options.fileKey = "image";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.chunkedMode = true;

        var params = { 'captions': captions, 'user_id': user.id };

        options.params = params;

        var ft = new FileTransfer();
        console.dir(options);
        ft.upload(fileURL, encodeURI($rootScope.baseURL + '/api/post/create'), success, fail, options);

        // Transfer succeeded
        function success(r) {
            $ionicLoading.show({template: 'Upload Success', duration:500});
            $state.go('tab.post-detail-home',{postId: r.response.id});
        }

        // Transfer failed
        function fail(error) {
            $ionicLoading.show({template: 'Upload Fail', duration:500});
        }
    }
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
    window.location.reload(true);
    $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });
    if(localStorage.getItem('have_seen_intro')){
        if(localStorage.getItem('user') && localStorage.getItem('satellizer_token')){

            var user = $rootScope.getCurrentUser();
            if(user.age){
                $state.go('tab.home');
            }
            else{
                $state.go('register2');
            }
        }
        else{
            $state.go('auth');
        }
    }
    else{
        $state.go('intro');
    }
})

.controller('RegisterCtrl', function($scope, $ionicHistory, $state, $rootScope, $http, $auth, $ionicLoading) {
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

                if(response.user.age){
                    $state.go('tab.home');
                }
                else{
                    $state.go('register2');
                }

            })
            .error(function(){
                $ionicLoading.hide();
                $rootScope.handleHttpError(error, status);
            })
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

.controller('AuthCtrl', function($scope, $location, $stateParams, $ionicHistory, $http, $state, $auth, $rootScope, $ionicLoading) {

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

                if(response.user.age){
                    $state.go('tab.home');
                }
                else{
                    $state.go('register2');
                }
            })
            .error(function(){
                $ionicLoading.hide();
                $rootScope.handleHttpError(error, status);
            })
        });
    };

})
.controller('HomeCtrl', function($scope, FetchPosts, $http, $state, $rootScope, $stateParams) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    var user = $rootScope.getCurrentUser();

    // $http.get($rootScope.baseURL+'/api/app/'+noAngularVar_device+'/'+noAngularVar_deviceID).success(function(){});

    if(user.age || $stateParams.refresh){
        FetchPosts.following($scope.page).then(function(posts){
            if(posts && posts.length == 0){
                $scope.noResult = true;
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = posts;
            $scope.page++;
        });
    }
    else{
        $state.go('register2');
    }

    $scope.loadMore = function() {
        FetchPosts.following($scope.page).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchPosts.following($scope.page).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            $scope.noResult = false;
            if(posts && posts.length == 0){
                $scope.noResult = true;
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.likeClicked = function($event,post){
        $event.preventDefault();
        if(post.user_liked){
            post.likes_count.aggregate--;
            $http.get($rootScope.baseURL+'/api/post/'+post.id+'/unlike').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            post.likes_count.aggregate++;
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
})

.controller('PostLikersCtrl', function($scope, $stateParams, $http, $location, FetchUsers, $rootScope) {
    $scope.likes = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    var user = $rootScope.getCurrentUser();

    FetchUsers.liker($stateParams.postId, $scope.page).then(function(likes){
        $scope.likes = likes;
        $scope.page++;
        if(likes && likes.length == 0){
            $scope.noResult = true;
            $scope.noMoreItemsAvailable = true;
        }
    });
    $scope.loadMore = function() {
        FetchUsers.liker($stateParams.postId, $scope.page).then(function(likes){
            $scope.likes = $scope.likes.concat(likes);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( likes.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
                $scope.noMoreItemsAvailable = true;
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

.controller('PostDetailCtrl', function($scope, $stateParams, FetchPosts, $http, Focus, $rootScope, $ionicActionSheet, $ionicHistory, $ionicLoading) {
    $scope.post = 0; // sloppy hack for not loaded check
    $scope.comment = {};
    $scope.liked = false;
    $scope.saved = false;
    $scope.likesCount = 0;
    $scope.commentsHiddenCount = 0;
    $scope.page = 2;
    $scope.clientVersionUpToDate = true;
    $scope.commentSubmitting = false;
    var user = $rootScope.getCurrentUser();

    $http.get($rootScope.baseURL+'/api/latest/client/version').success(function(version){
        if(version != $rootScope.clientVersion){
            $scope.clientVersionUpToDate = false;
        }
    });
    FetchPosts.get($stateParams.postId).then(function(post){
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
        $ionicActionSheet.show({
            titleText: 'More Options',
            buttons: [
                { text: 'Edit' },
            ],
            destructiveText: 'Delete',
            cancelText: 'Cancel',
            cancel: function() {
                console.log('CANCELLED');
            },
            buttonClicked: function(index) {
                console.log('BUTTON CLICKED', index);
                return true;
            },
            destructiveButtonClicked: function() {
                $ionicLoading.show();
                $http.post($rootScope.baseURL+'/api/post/'+$scope.post.id+'/delete').success(function(){
                    $('.item[data-id='+$scope.post.id+']').remove();
                    $ionicLoading.hide();
                    $ionicHistory.goBack();
                    return true;
                })
                .error(function(error){
                    $rootScope.handleHttpError(error);
                });
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.post = 0; // sloppy hack for not loaded check
        $scope.comment = {};
        $scope.liked = false;
        $scope.saved = false;
        $scope.likesCount = 0;
        $scope.commentsHiddenCount = 0;
        $scope.page = 2;
        FetchPosts.get($stateParams.postId).then(function(post){
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
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
})

.controller('PostExploreCtrl', function($scope, FetchPosts, $stateParams, $state, Focus) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;

    FetchPosts.new($scope.page, $stateParams.searchTerm).then(function(posts){
        $scope.posts = posts;
        $scope.page++;
        if(posts && posts.length == 0){
            $scope.noResult = true;
            $scope.noMoreItemsAvailable = true;
        }
    });

    $scope.loadMore = function() {
        FetchPosts.new($scope.page, $stateParams.searchTerm).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchPosts.new($scope.page, $stateParams.searchTerm).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            $scope.noResult = false;
            if(posts && posts.length == 0){
                $scope.noResult = true;
                $scope.noMoreItemsAvailable = true;
            }
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

    FetchPosts.school($scope.page, $stateParams.schoolId).then(function(posts){
        $scope.posts = posts;
        $scope.page++;
        if ( posts && posts.length == 0 ) {
            $scope.noResult = true;
            $scope.noMoreItemsAvailable = true;
        }
    });

    $scope.loadMore = function() {
        FetchPosts.school($scope.page, $stateParams.schoolId).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchPosts.school($scope.page, $stateParams.schoolId).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            $scope.noResult = false;
            if ( posts && posts.length == 0 ) {
                $scope.noResult = true;
                $scope.noMoreItemsAvailable = true;
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
    $scope.picData = "";
    $scope.currentSlug = "";
    $scope.activatedTab = 'best';

    console.log($stateParams.accountSlug);
    if (!$stateParams.accountSlug)
    {
        $scope.currentSlug = user.slug;
    }
    else
    {
        $scope.currentSlug = $stateParams.accountSlug;
    }


    FetchUsers.get($scope.currentSlug).then(function(account_info){
        $scope.account_info = account_info;

        if (user.id == $scope.account_info.id)
        {
            $scope.isMyAccount = true;
        }
    });
    FetchPosts.user(slug, $scope.activatedTab, $scope.page).then(function(posts){
        $scope.posts = posts;
        $scope.page++;
        if ( posts.length == 0 ) {
            $scope.noMoreItemsAvailable = true;
        }
    });

    $scope.changeProfilePicture = function(){
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
                            destinationType: Camera.DestinationType.FILE_URL,
                            sourceType: Camera.PictureSourceType.CAMERA
                        };
                        $cordovaCamera.getPicture(options).then(
                            function(imageData) {
                                localStorage.setItem('photo', imageData);
                                console.log(imageData);
                                $ionicLoading.show({template: 'Loading Photo', duration:500});
                                $scope.updateProfilePicture(imageData);
                            },
                            function(err){
                                $ionicLoading.show({template: 'Error to Load Photo', duration:500});
                            }
                        )
                        return true;
                    case 1 :
                        var options = {
                            quality: 100,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                        };

                        $cordovaCamera.getPicture(options).then(
                            function(imageURI) {
                                window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
                                    localStorage.setItem('photo', fileEntry.nativeURL);
                                    console.log(fileEntry.nativeURL);
                                    $ionicLoading.show({template: 'Loading Photo', duration:500});
                                    $scope.updateProfilePicture(fileEntry.nativeURL);
                                });
                            },
                            function(err){
                                $ionicLoading.show({template: 'Error to Load Photo', duration:500});
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
        console.dir(options);
        ft.upload(fileURL, encodeURI($rootScope.baseURL + '/api/'+user.slug+'/editProfilePicture'), success, fail, options);

        function success(r) {
            console.dir(r);
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
            $ionicLoading.show({template: 'Upload Success', duration:500});
        }

        // Transfer failed
        function fail(error) {
            console.dir(error);
            $ionicLoading.show({template: 'Upload Fail', duration:500});
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
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
        FetchPosts.user(slug, $scope.activatedTab, $scope.page).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        $scope.posts = [];
        $scope.activatedTab = 'best';
        FetchPosts.user(slug, 'best', $scope.page).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.activateTab = function(tab){
        $scope.page = 1;
        $scope.posts = [];
        $scope.activatedTab = tab;
        FetchPosts.user(slug, tab, $scope.page).then(function(posts){
            $scope.posts = posts;
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    }
})
.controller('OptionCtrl', function($scope, $stateParams, $http, $state, $ionicPopup, $ionicHistory, $rootScope) {
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

    FetchUsers.following($stateParams.userSlug, $scope.page).then(function(users){
        $scope.users = users;
        $scope.page++;
        if(users && users.length == 0){
            $scope.noResult = true;
            $scope.noMoreItemsAvailable = true;
        }
    });

    $scope.loadMore = function() {
        FetchUsers.following($stateParams.userSlug, $scope.page).then(function(users){
            $scope.users = $scope.users.concat(users);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( users.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchUsers.following($stateParams.userSlug, $scope.page).then(function(users){
            $scope.users = users;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            $scope.noResult = false;
            if(users && users.length == 0){
                $scope.noResult = true;
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.followToggle = function(user) {
        if(user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/unfollow').success(function(){
                $('.dynamic-following-count').html(parseInt($('.dynamic-following-count').html(), 10)-1);
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){
                $('.dynamic-following-count').html(parseInt($('.dynamic-following-count').html(), 10)+1);
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

    FetchUsers.follower($stateParams.userSlug, $scope.page).then(function(users){
        $scope.users = users;
        $scope.page++;
        if(users && users.length == 0){
            $scope.noResult = true;
            $scope.noMoreItemsAvailable = true;
        }
    });

    $scope.loadMore = function() {
        FetchUsers.follower($stateParams.userSlug, $scope.page).then(function(users){
            $scope.users = $scope.users.concat(users);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( users.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchUsers.follower($stateParams.userSlug, $scope.page).then(function(users){
            $scope.users = users;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            $scope.noResult = false;
            if(users && users.length == 0){
                $scope.noResult = true;
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.followToggle = function(user) {
        if(user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/unfollow').success(function(){
                $('.dynamic-following-count').html(parseInt($('.dynamic-following-count').html(), 10)-1);
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){
                $('.dynamic-following-count').html(parseInt($('.dynamic-following-count').html(), 10)+1);
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
.controller('NotificationCtrl', function($scope, FetchNotifications, $rootScope) {
    var user = $rootScope.getCurrentUser();
    $scope.notifications = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;

    FetchNotifications.new(user.slug, $scope.page).then(function(notifications){
        $scope.notifications = notifications;
        $scope.page++;
        if(notifications && notifications.length == 0){
            $scope.noResult = true;
            $scope.noMoreItemsAvailable = true;
        }
    });

    $scope.loadMore = function() {
        FetchNotifications.new(user.slug, $scope.page).then(function(notifications){
            $scope.notifications = $scope.notifications.concat(notifications);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( notifications.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchNotifications.new(user.slug, $scope.page).then(function(notifications){
            $scope.notifications = notifications;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            $scope.noResult = false;
            if(notifications && notifications.length == 0){
                $scope.noResult = true;
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
});
