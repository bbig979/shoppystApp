angular.module('starter.controllers', [])
.run(function($rootScope, $ionicTabsDelegate, $state, $ionicPlatform, $ionicPopup, $ionicActionSheet, $timeout, $cordovaCamera, $ionicLoading, $ionicHistory, $location, $ionicBackdrop, $stateParams, $http, $ionicScrollDelegate, ComparePostSet, CameraPictues, $cordovaSocialSharing, FetchShareLink, Wait, RestartApp, FetchNotifications) {
    $rootScope.clientVersion = '1.0';
    //$rootScope.baseURL = 'http://app.snaplook.today';
    //$rootScope.baseURL = 'http://localhost:8000';
    //$rootScope.baseURL = 'http://192.168.56.1:8000';
    $rootScope.baseURL = 'http://localhost:8888';
    $rootScope.sampleCount = 4;
    $rootScope.minimumCountToShowSample = 4;
    $rootScope.nameLengthOnCard = 12;
    $rootScope.stat_height = 0;
    $rootScope.stat_label_height = 0;
    $rootScope.postTrackArray = [];
    $rootScope.userTrackArray = [];
    $rootScope.currentUser = null;
    $rootScope.notificationCount = "0";

    $rootScope.getNotification = function() {
        if ($rootScope.currentUser)
        {
            var user = $rootScope.getCurrentUser();
            FetchNotifications.count(user.slug).then(function(response){
                $rootScope.notificationCount = (response >= 10 ? "9+" : (response ? response : 0));
            });
        }
    }
    setInterval(function() {$rootScope.getNotification();}, 5000);

    $rootScope.goNotification = function() {
        var user = $rootScope.getCurrentUser();
        $http.get($rootScope.baseURL+'/api/user/'+user.slug+'/notification/open').success(function(){
            $rootScope.notificationCount = "0";
        })
        .error(function(data, status){
            $rootScope.handleHttpError(data, status);
        });
        $state.go('tab.notification');
    }
    $rootScope.ifInNotification = function() {
        var detect = 'auth, forgetpassword, register, register2, root, intro';
        if( detect.indexOf($state.current.name) > -1 || $state.current.name.indexOf('notification') > -1){
            return true;
        }
        return false;
    }
    $rootScope.ifInCompare = function() {
        if($state.current.name.indexOf('post-compare') > -1){
            return true;
        }
        return false;
    }
    $rootScope.shareCompare = function() {
        $ionicLoading.show();
        ComparePostSet.share($stateParams.postIds).then(function(hash){
            if(hash){
                var options = {
                    message: 'which looks better?',
                    subject: 'Which Looks Better?',
                    url: $rootScope.baseURL + '/s/' + hash
                }
                var onSuccess = function(result) {
                    console.log($rootScope.baseURL + '/s/' + hash);
                    console.log("Shared to app: " + result.app);
                    FetchShareLink.update(hash, result.app);
                }
                var onError = function(msg) {
                    console.log("Sharing failed with message: " + msg);
                }
                window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
            }
            else{
                $rootScope.popupMessage('Oops', 'You cannot share other\'s look');
            }
            $ionicLoading.hide();
        });
    }
    $rootScope.scroll = function() {
        $ionicScrollDelegate.scrollBy(0, 100);
    }
    $rootScope.ifTestAccount = function() {
        if($rootScope.currentUser){
            return $rootScope.currentUser.email == "info@snaplook.today";
        }
        return false;
    }
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
                tab = 'explore';
                break;
            case 1:
                tab = 'home';
                break;
            case 2:
                tab = 'camera';
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
        if (!$rootScope.canClickInList()) {
            return;
        }
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-detail-'+tab,{postId: id, user: user, posts: posts, index: index});
    };
    $rootScope.goPostCompare = function(ids, is_my_post_compare = false){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-compare-'+tab,{postIds: ids, isMyPostCompare: is_my_post_compare});
    };
    $rootScope.goPostLikers = function(id){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-likers-'+tab,{postId: id});
    };
    $rootScope.goAccount = function(slug){
        if (!$rootScope.canClickInList()) {
            return;
        }
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
    $rootScope.handleHttpError = function(data, status){
        console.log('data:');
        console.log(data);
        console.log('status:');
        console.log(status);
        if(status == 422 || status == 401){
            // when login or validation error
            for(var key in data){
                $rootScope.popupMessage('', data[key]);
                // problem : multiple errors lead to opening multiple popups in the beginning
                // solution : found out that long computation blocks opening graphical element.
                //            therefore I placed wait service, which runs computation for specific time long.
                Wait.miliSec(100);
            }
        }
        else if(data != null && typeof (data.error) != 'undefined' && data.error == "token_not_provided"){
            RestartApp.go('root');
        }
        else if(data != null && typeof (data.error) != 'undefined' && data.error == "user_not_found"){
            localStorage.removeItem('user');
            localStorage.removeItem('post_id_array');
            RestartApp.go('root');
        }
        else{
            $rootScope.popupMessage('Error', 'An unknown network error has occurred.');
        }
    };
    $rootScope.getCurrentUser = function(){
        if($state.current.name){
            if($rootScope.currentUser){
                return $rootScope.currentUser;
            }
            else{
                var user = JSON.parse(localStorage.getItem('user'));
                if(user){
                    $rootScope.currentUser = user;
                    return $rootScope.currentUser;
                }
            }
            $state.go('auth');
        }
    };
    $rootScope.setCurrentUser = function(user){
        $rootScope.currentUser = user;
        var user_str = JSON.stringify(user);
        localStorage.setItem('user', user_str);
    };
    $rootScope.goAccountOption = function(id){
        $state.go('tab.option-account',{userId: id});
    };
    $rootScope.getNameOnCard = function(_username){
        if (_username.length >= $rootScope.nameLengthOnCard - 1)
        {
            return _username.substring(0, $rootScope.nameLengthOnCard) + "...";
        }
        else
        {
            return _username;
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
                                CameraPictues.set(imageData);
                                $state.go('tab.post-create');
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
                                    CameraPictues.set(fileEntry.nativeURL);
                                    $state.go('tab.post-create');
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
    $rootScope.ifMyPostCompare = function(){
        return $stateParams.isMyPostCompare == 'true';
    }
    $rootScope.getMaxStat = function(stat, index) {
        if (stat === undefined || stat.length == 0)
        {
            return "0";
        }
        stat = stat[0];
        if (index == "gender")
        {
            if (stat === undefined || stat.female === undefined && stat.male === undefined)
            {
                return "0";
            }
            else if (stat.female === undefined || stat.male === undefined || stat.female == 0 || stat.male == 0)
            {
                return "100";
            }
            else if (parseInt(stat.female) > parseInt(stat.male))
            {
                return Math.round(stat.female/(parseInt(stat.female) + parseInt(stat.male))*100);
            }
            else
            {
                return Math.round(stat.male/(parseInt(stat.female) + parseInt(stat.male))*100);
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

            if (stat.teens !== undefined && parseInt(stat.teens) > count)
            {
                age = "10-20";
                count = parseInt(stat.teens);
            }
            if (stat.twenties !== undefined && parseInt(stat.twenties) > count)
            {
                age = "20-30";
                count = parseInt(stat.twenties);
            }
            if (stat.thirties !== undefined && parseInt(stat.thirties) > count)
            {
                age = "30-40";
                count = parseInt(stat.thirties);
            }
            if (stat.forties !== undefined && parseInt(stat.forties) > count)
            {
                age = "40-50";
                count = parseInt(stat.forties);
            }
            if (stat.fifties !== undefined && parseInt(stat.fifties) > count)
            {
                age = "50-60";
                count = parseInt(stat.fifties);
            }

            if(total == 0)
            {
                return age + " 0";
            }
            else
            {
                return age + " " + Math.round(count/total*100);
            }
        }
    };
    $rootScope.getCardGenderStatIcon = function(stat) {
        if (stat == undefined || stat.length == 0)
        {
            return;
        }
        if (stat[0].female === undefined && stat[0].male === undefined)
        {
            return "fa-female";
        }
        else if (stat[0].female === undefined)
        {
            return "fa-male";
        }
        else if (stat[0].male === undefined)
        {
            return "fa-female";
        }
        else if (parseInt(stat[0].female) > parseInt(stat[0].male))
        {
            return "fa-female";
        }
        else
        {
            return "fa-male";
        }
    };
    $rootScope.getStatGenderPercent = function(stat, index) {
        if (stat === undefined || stat.length == 0)
        {
            return "0";
        }
        stat = stat[0];

        if (stat.female === undefined && stat.male === undefined)
        {
            return "0";
        }

        if (stat.male === undefined)
        {
            var male_stat = 0;
        }
        else
        {
            var male_stat = parseInt(stat.male);
        }
        if (stat.female === undefined)
        {
            var female_stat = 0;
        }
        else
        {
            var female_stat = parseInt(stat.female);
        }

        if (index == "m")
        {
            if (male_stat === 0)
            {
                return "0";
            }
            else if (female_stat === undefined || female_stat === null || female_stat === 0)
            {
                return "100";
            }
            else
            {
                return Math.round(male_stat/(female_stat + male_stat)*100);
            }
        }
        else if (index == "f")
        {
            if (female_stat === 0)
            {
                return "0";
            }
            else if (male_stat === undefined || male_stat === null || male_stat === 0)
            {
                return "100";
            }
            else
            {
                return Math.round(female_stat/(female_stat + male_stat)*100);
            }
        }
    };

    $rootScope.getStatGenderPercentForAvatar = function(stat, index) {
        if (stat === undefined || stat.length == 0)
        {
            return 0;
        }
        stat = stat[0];

        if (stat.female === undefined && stat.male === undefined)
        {
            return 0;
        }

        if (stat.male === undefined)
        {
            var male_stat = 0;
        }
        else
        {
            var male_stat = parseInt(stat.male);
        }
        if (stat.female === undefined)
        {
            var female_stat = 0;
        }
        else
        {
            var female_stat = parseInt(stat.female);
        }
        if (index == "m")
        {
            if (male_stat === 0)
            {
                return 0;
            }
            else if (female_stat === undefined || female_stat === null || female_stat === 0)
            {
                return 100;
            }
            else
            {
                return Math.round(male_stat/(female_stat + male_stat)*100);
            }
        }
        else if (index == "f")
        {
            if (female_stat === 0)
            {
                return 0;
            }
            else if (male_stat === undefined || male_stat === null || male_stat === 0)
            {
                return 100;
            }
            else
            {
                return Math.round(female_stat/(female_stat + male_stat)*100);
            }
        }
    };
    $rootScope.getStatAgePercent = function(stat, index) {
        if (stat === undefined || stat.length == 0)
        {
            return "0";
        }
        stat = stat[0];

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

        if (total == 0)
        {
            return "0";
        }
        else if (index == "10")
        {
            if (stat.teens === undefined)
            {
                return "0";
            }
            else
            {
                return Math.round(stat.teens/total*100);
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
                return Math.round(stat.twenties/total*100);
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
                return Math.round(stat.thirties/total*100);
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
                return Math.round(stat.forties/total*100);
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
                return Math.round(stat.fifties/total*100);
            }
        }
    };
    $rootScope.setAnalyticsHeight = function(){
        if ($rootScope.stat_height == 0 && $(".analytics-gender-avatar div").height() > $(".analytics-gender .analytics-number .ng-binding").height())
        {
            $rootScope.stat_height = $(".analytics-gender-avatar div").height();
            $rootScope.stat_label_height = $(".analytics-gender .analytics-number .ng-binding").height();
        }
    };
    $rootScope.getStatAgeHeight = function(stat, index, type) {
        if (stat === undefined || stat.length == 0)
        {
            return "0";
        }
        stat = stat[0];

        var val = 0;
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

        if (total == 0)
        {
            val = 0;
        }
        else
        {
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
    $rootScope.getStatAgeBlockColor = function(stat, index) {
        if (stat === undefined || stat.length == 0)
        {
            return "other";
        }
        stat = stat[0];

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

        if (stat.teens !== undefined && parseInt(stat.teens) > count)
        {
            age = "10";
            count = parseInt(stat.teens);
        }
        if (stat.twenties !== undefined && parseInt(stat.twenties) > count)
        {
            age = "20";
            count = parseInt(stat.twenties);
        }
        if (stat.thirties !== undefined && parseInt(stat.thirties) > count)
        {
            age = "30";
            count = parseInt(stat.thirties);
        }
        if (stat.forties !== undefined && parseInt(stat.forties) > count)
        {
            age = "40";
            count = parseInt(stat.forties);
        }
        if (stat.fifties !== undefined && parseInt(stat.fifties) > count)
        {
            age = "50";
            count = parseInt(stat.fifties);
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
    $rootScope.ifNGCompare = function(){
        var detect = 'tab.compare-home, tab.compare-explore, tab.compare-notification, tab.compare-account, auth, forgetpassword, register, register2, root, intro';
        if( detect.indexOf($state.current.name) > -1){
            return true;
        }
        return false;
    };
    $rootScope.openCompare = function(){
        $state.go('tab.compare');
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
                                $http.post($rootScope.baseURL+'/api/user/'+$stateParams.accountSlug+'/block').success(function(){
                                    $ionicLoading.hide();
                                    return true;
                                })
                                .error(function(data, status){
                                    $rootScope.handleHttpError(data, status);
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
                                $http.post($rootScope.baseURL+'/api/user/'+$stateParams.accountSlug+'/report').success(function(){
                                    $ionicLoading.hide();
                                    return true;
                                })
                                .error(function(data, status){
                                    $rootScope.handleHttpError(data, status);
                                });
                            }
                        });
                        return true;
                }
            }
        });
    };
    $rootScope.lastScrolling = new Date().getTime();
    $rootScope.scrollList = function() {
        $rootScope.lastScrolling = new Date().getTime();
    };
    $rootScope.canClickInList = function() {
        return true;
        var diff =  new Date().getTime() - $rootScope.lastScrolling;
        if (diff > 200) {
            return true;
        } else {
            return false;
        }
    };
    $rootScope.toggleLike = function($event,post){
        $event.preventDefault();
        if(post.user_liked){
            $http.get($rootScope.baseURL+'/api/post/'+post.id+'/unlike').success(function(){
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/post/'+post.id+'/like').success(function(){
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
        }
        $rootScope.trackAndUpdateLike(post);
    };
    $rootScope.trackAndUpdateLike = function(post){
        for(i = 0; i < $rootScope.postTrackArray.length; i++){
            thisPost = $rootScope.postTrackArray[i];
            if(post.id == thisPost.id){
                if(thisPost.user_liked){
                    thisPost.likes_count.aggregate--;
                    if(thisPost.likes_count.aggregate == 0){
                        thisPost.likes_count = null;
                    }
                }
                else{
                    if(thisPost.likes_count){
                        thisPost.likes_count.aggregate++;
                    }
                    else{
                        thisPost.likes_count = {aggregate: 1};
                    }
                }
                thisPost.user_liked = !thisPost.user_liked;
            }
        }
    }
    $rootScope.likesCount = function(post){
        if(post.likes_count){
            return post.likes_count.aggregate;
        }
        else{
            return 0;
        }
    }
    $rootScope.cloneObj = function(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
    $rootScope.indexOfObj = function(arr, obj) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].id == obj.id) {
                return i;
            }
        }
        return -1;
    }
    $rootScope.isStatNotAvailable = function(post) {
        return post.post_analytic == undefined ||
            post.post_analytic.length == 0 ||
            (
                post.post_analytic[0].male == 0 &&
                post.post_analytic[0].female == 0
            )
    }
    $rootScope.toggleFollow = function(user) {
        var current_user = $rootScope.getCurrentUser();
        if(user.following_check){
            $http.get($rootScope.baseURL+'/api/user/'+ user.slug +'/unfollow').success(function(){
                current_user.following_count--;
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/user/'+ user.slug +'/follow').success(function(){
                current_user.following_count++;
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
        }
        $rootScope.trackAndUpdateFollow(user);
    };
    $rootScope.trackAndUpdateFollow = function(user) {
        for(i = 0; i < $rootScope.userTrackArray.length; i++){
            thisUser = $rootScope.userTrackArray[i];
            if(thisUser.id == user.id){
                if(thisUser.following_check){
                    if(thisUser.follower_count){
                        thisUser.follower_count--;
                    }
                }
                else{
                    if(thisUser.follower_count){
                        thisUser.follower_count++;
                    }
                    else{
                        thisUser.follower_count = 1;
                    }
                }
                thisUser.following_check = !thisUser.following_check;
            }
        }
    };
})
.controller('PostCreateCtrl', function($scope, FetchOccasions, $state, $stateParams, $rootScope, $cordovaFile, $ionicLoading, $ionicHistory, $location, CameraPictues, $timeout) {
    $scope.submitted = false;
    $location.replace('tab.camera');
    var user = JSON.parse(localStorage.getItem('user'));
    $scope.data = { "ImageURI" :  "Select Image" };
    $scope.occasionList = new Array();
    $scope.shopOptionalOccasion = false;
    $scope.cameraPictues = CameraPictues;

    FetchOccasions.get().then(function(response){
        occasions = response;
        for (index = 0; index < occasions.length; ++index) {
            $scope.occasionList.push({value: occasions[index].id, label: occasions[index].name});
        }
        $scope.occasionList.push({value: 'other', label: 'Other'});
    });

    $scope.sharePost = function(captions, occasion, other) {
        var share_post_scope = this;
        $scope.submitted = true;
        $ionicLoading.show({template: 'Uploading Photo...'});
        var options = new FileUploadOptions();
        var param_caption = '';
        if (typeof captions != 'undefined')
        {
            param_caption = captions;
        }
        if (typeof occasion != 'undefined')
        {
            occasion = null;
        }
        options.fileKey = "image";
        options.mimeType = "image/jpeg";
        options.chunkedMode = true;

        var ft = new FileTransfer();
        var params = { 'captions': param_caption, 'user_id': user.id, 'occasion': occasion, 'other': other };
        options.params = params;
        var fileURLs = CameraPictues.get();
        var uploadTryCount = 0;
        var uploadSuccessCount = 0;
        var postIdArray = [];

        if(fileURLs.length < 2){
            $ionicLoading.hide();
            $rootScope.popupMessage('', 'You Need at Least 2 Looks to Compare');
            $scope.submitted = false;
            return;
        }
        for(var i=0; i<fileURLs.length; i++){
            options.fileName = fileURLs[i].substr(fileURLs[i].lastIndexOf('/') + 1);
            ft.upload(fileURLs[i], encodeURI($rootScope.baseURL + '/api/post/create'), success, fail, options);
        }

        // Transfer succeeded
        function success(r) {
            var result = JSON.parse(r.response);
            uploadTryCount++;
            uploadSuccessCount++;
            if(typeof result.id !== 'undefined'){
                postIdArray.push(result.id);
            }
            if(uploadTryCount == fileURLs.length && uploadSuccessCount > 0){
                $ionicLoading.show({
                    template: 'Upload Success ( ' + uploadSuccessCount + ' / ' + uploadTryCount + ' )',
                    duration:500
                });
                $http.post($rootScope.baseURL+'/api/compare/'+postIdArray.join(',')+'/create');
                $scope.submitted = false;
                share_post_scope.occasion = undefined;
                share_post_scope.captions = undefined;
                uploadTryCount = 0;
                uploadSuccessCount = 0;
                postIdArray = [];
                $timeout(function(){
                    CameraPictues.reset();
                    $state.go('tab.account-account', {refresh: true, isThisAfterShare: true});
                }, 500);
            }
        }

        // Transfer failed
        function fail(error) {
            uploadTryCount++;
            if(uploadTryCount == fileURLs.length && uploadSuccessCount == 0){
                $ionicLoading.show({template: 'Upload Fail', duration:500});
                $scope.submitted = false;
                share_post_scope.occasion = undefined;
                share_post_scope.captions = undefined;
                uploadTryCount = 0;
                uploadSuccessCount = 0;
            }
        }
    }
    $scope.checkOccasion = function(_occasion) {
        if (_occasion != null && _occasion.value == "other")
        {
            $scope.shopOptionalOccasion = true;
        }
        else
        {
            $scope.shopOptionalOccasion = false;
        }
    }
    $scope.back = function() {
        CameraPictues.reset();
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
        .success(function(){
            $ionicLoading.hide();
            $ionicHistory.goBack();
        })
        .error(function(data, status){
            $rootScope.handleHttpError(data, status);
        });
    };
})

.controller('TutorialCtrl',function($scope, Tutorial){
    $scope.tutorial = Tutorial;
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
            $state.go('tab.explore-explore');
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
        .success(function(){
            $ionicLoading.hide();
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('register2',registerData);
        })
        .error(function(data, status){
            $ionicLoading.hide();
            $rootScope.handleHttpError(data, status);
        });
    }
    var fbLoginSuccess = function(response) {
        if (!response.authResponse){
            fbLoginError("Cannot find the authResponse");
            return;
        }
        if(localStorage.getItem('user')){
            console.log('user already logged in');
            return;
        }

        var authResponse = response.authResponse;

        getFacebookProfileInfo(authResponse).then(function(profileInfo) {
            $http({
                method : 'POST',
                url : $rootScope.baseURL+'/api/facebook',
                data : {profile:profileInfo}
            })
            .success(function(data){
                localStorage.setItem('satellizer_token', data.token);
                $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(data){
                    var user = data.user;
                    $rootScope.setCurrentUser(user);
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $state.go('tab.explore-explore');
                })
                .error(function(data, status){
                    $rootScope.handleHttpError(data, status);
                });
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
        }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
        });
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error){
        console.log('fbLoginError', error);
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
                    .success(function(data){
                        localStorage.setItem('satellizer_token', data.token);
                        $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(data){
                            var user = data.user;
                            $rootScope.setCurrentUser(user);
                            $ionicHistory.nextViewOptions({
                                disableBack: true
                            });
                            $ionicLoading.hide();
                            $state.go('tab.explore-explore');
                        })
                        .error(function(data, status){
                            $ionicLoading.hide();
                            $rootScope.handleHttpError(data, status);
                        });
                    })
                    .error(function(data, status){
                        $ionicLoading.hide();
                        $rootScope.handleHttpError(data, status);
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

                // Ask the permissions you need. You can learn more about
                // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
            }
        });
    };
})
.controller('Register2Ctrl', function($scope, $stateParams, $auth, $rootScope, $http, $ionicLoading, $ionicHistory, $state, $timeout, UsernameAvailability) {
    $scope.registerData = {};
    $scope.usernameClass = '';
    var credentials = {
        email: $stateParams.email,
        password: $stateParams.password
    }

    if(!localStorage.getItem('user')){
        console.log(credentials);
        $auth.login(credentials).then(function() {
        },
        function(response) {
            $rootScope.handleHttpError(response.data, response.status);
        });
        $scope.registerData.username = $stateParams.email.split('@')[0];
    }
    else{
        var user = $rootScope.getCurrentUser();
        $scope.registerData.gender = user.gender;
        $scope.registerData.username = user.email.split('@')[0];
    }

    $timeout(function(){
        UsernameAvailability.check($scope.registerData.username).then(function(response){
            $scope.usernameClass = response;
        });
    }, 1000);
    $scope.usernameTyped = function(keyEvent){
        UsernameAvailability.typed($scope.registerData.username).then(function(response){
            $scope.usernameClass = response;
        });
    }

    $scope.register2 = function(registerData){
        $ionicLoading.show();
        $http({
            method : 'POST',
            url : $rootScope.baseURL+'/api/register2',
            data : registerData
        })
        .success(function(){
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(data){
                var user = data.user;
                $rootScope.setCurrentUser(user);
                $ionicLoading.hide();
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('tab.explore-explore');
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
        })
        .error(function(data, status){
            $ionicLoading.hide();
            $rootScope.handleHttpError(data, status);
            if(UsernameAvailability.isFailed(data)){
                $scope.usernameClass = 'fail';
            }
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
        .success(function(){
            $ionicLoading.hide();
            $rootScope.popupMessage("", "Email has been sent");
            $ionicHistory.goBack();
        })
        .error(function(data, status){
            $ionicLoading.hide();
            $rootScope.handleHttpError(data, status);
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
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(data){
                var user = data.user;
                $rootScope.setCurrentUser(user);
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $ionicLoading.hide();
                $state.go('tab.explore-explore');
            })
            .error(function(data, status){
                $ionicLoading.hide();
                $rootScope.handleHttpError(data, status);
            })
        },
        function(response) {
            $ionicLoading.hide();
            $rootScope.handleHttpError(response.data, response.status);
        });
    };

    var fbLoginSuccess = function(response) {
        if (!response.authResponse){
            fbLoginError("Cannot find the authResponse");
            return;
        }
        if(localStorage.getItem('user')){
            console.log('user already logged in');
            return;
        }

        var authResponse = response.authResponse;

        getFacebookProfileInfo(authResponse).then(function(profileInfo) {
            $http({
                method : 'POST',
                url : $rootScope.baseURL+'/api/facebook',
                data : {profile:profileInfo}
            })
            .success(function(data){
                localStorage.setItem('satellizer_token', data.token);
                $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(data){
                    var user = data.user;
                    $rootScope.setCurrentUser(user);
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $state.go('tab.explore-explore');
                })
                .error(function(data, status){
                    $rootScope.handleHttpError(data, status);
                });
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
        }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
        });
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error){
        console.log('fbLoginError', error);
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
                    .success(function(data){
                        localStorage.setItem('satellizer_token', data.token);
                        $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(data){
                            var user = data.user;
                            $rootScope.setCurrentUser(user);
                            $ionicHistory.nextViewOptions({
                                disableBack: true
                            });
                            $ionicLoading.hide();
                            $state.go('tab.explore-explore');
                        })
                        .error(function(data, status){
                            $ionicLoading.hide();
                            $rootScope.handleHttpError(data, status);
                        });
                    })
                    .error(function(data, status){
                        $ionicLoading.hide();
                        $rootScope.handleHttpError(data, status);
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

                // Ask the permissions you need. You can learn more about
                // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
            }
        });
    };

})
.controller('HomeCtrl', function($scope, FetchPosts, $http, $state, $rootScope, $stateParams, $ionicActionSheet, $ionicLoading, $ionicPopup, $timeout, ComparePosts, PostTimer, NewPost, $ionicScrollDelegate, ScrollingDetector) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $scope.comparePosts = ComparePosts;
    $scope.postTimer = PostTimer;
    $scope.mostRecentPostID = 0;
    $scope.newPostAvailable = false;
    $scope.loadingNewPost = false;

    var user = $rootScope.getCurrentUser();

    $http.get($rootScope.baseURL+'/api/app/'+noAngularVar_device+'/'+noAngularVar_deviceID).success(function(){});

    $scope.$on('$ionicView.enter', function() {
        if($scope.noResult){
            $scope.loadingNewPost = true;
            $scope.doRefresh();
        }
        if($scope.posts.length > 0){
            NewPost.isAvailable('following', $scope.mostRecentPostID).then(function(response){
                $scope.newPostAvailable = response;
            });
        }
    });

    if(user || $stateParams.refresh){
        NewPost.resetFlags('following');
        FetchPosts.following($scope.mostRecentPostID, $scope.page).then(function(response){
            posts = response.data;
            for (index = 0; index < posts.length; ++index) {
                if ($rootScope.isStatNotAvailable(posts[index]))
                {
                    posts[index].show_stat = false;
                }
                else
                {
                    posts[index].show_stat = true;
                }
            }
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            if(posts.length == 0){
                $scope.noResult = true;
            }
            else{
                $scope.noResult = false;
                $scope.mostRecentPostID = posts[0].id;
            }
            $scope.posts = posts;
            $scope.page++;
        });
    }
    $scope.loadMore = function() {
        FetchPosts.following($scope.mostRecentPostID, $scope.page).then(function(response){
            posts = response.data;
            for (index = 0; index < posts.length; ++index) {
                if ($rootScope.isStatNotAvailable(posts[index]))
                {
                    posts[index].show_stat = false;
                }
                else
                {
                    posts[index].show_stat = true;
                }
            }
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = $scope.posts.concat(posts);
            $timeout(function() {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $scope.page++;
        });
    };
    $scope.loadNewPost = function() {
        $ionicScrollDelegate.scrollTop();
        $scope.loadingNewPost = true;
        $scope.newPostAvailable = false;
        $scope.doRefresh();
    };
    $scope.scrollDetectWhenNewPostAvailable = function() {
        if($scope.newPostAvailable){
            ScrollingDetector.record();
            if(ScrollingDetector.isGoingDown()){
                $('#new-post-button.following').hide();
            }
            else{
                $('#new-post-button.following').show();
            }
        }
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        $scope.mostRecentPostID = 0;
        NewPost.resetFlags('following');
        FetchPosts.following($scope.mostRecentPostID, $scope.page).then(function(response){
            posts = response.data;
            for (index = 0; index < posts.length; ++index) {
                if ($rootScope.isStatNotAvailable(posts[index]))
                {
                    posts[index].show_stat = false;
                }
                else
                {
                    posts[index].show_stat = true;
                }
            }
            $scope.noMoreItemsAvailable = false;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.loadingNewPost = false;
            $scope.page++;
            if(posts.length == 0){
                $scope.noResult = true;
            }
            else{
                $scope.noResult = false;
                $scope.mostRecentPostID = posts[0].id;
            }
        });
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
                        .error(function(data, status){
                            $rootScope.handleHttpError(data, status);
                        });
                    }
                });
                return true;
            }
        });
    };
})

.controller('PostLikersCtrl', function($scope, $stateParams, $http, $location, FetchUsers, $rootScope, $timeout) {
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
            $timeout(function() {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
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
    $scope.notMe = function(like) {
        return (like.user.id != user.id);
    };
})

.controller('PostDetailCtrl', function($scope, $stateParams, FetchPosts, $http, Focus, $rootScope, $ionicActionSheet, $ionicHistory, $ionicLoading, $state, $ionicPopup, ComparePosts, PostTimer) {
    $scope.post = 0; // sloppy hack for not loaded check
    $scope.comment = {};
    $scope.liked = false;
    $scope.saved = false;
    $scope.commentsHiddenCount = 0;
    $scope.page = 2;
    $scope.clientVersionUpToDate = true;
    $scope.commentSubmitting = false;
    $scope.lessThanHidingTime = false;
    $scope.noResult = false;
    $scope.stat_height = 0;
    $scope.stat_label_height = 0;
    $scope.comparePosts = ComparePosts;
    $scope.postTimer = PostTimer;
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
            if ($rootScope.isStatNotAvailable(post))
            {
                post.show_stat = false;
            }
            else
            {
                post.show_stat = true;
            }
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
        .success(function(data){
            data.user = user;
            $scope.post.latest_ten_comments.push(data);
            $scope.commentSubmitting = false;
            $('.dynamic-comment-count#'+$scope.post.id).html(parseInt($('.dynamic-comment-count#'+$scope.post.id).html(), 10)+1);
        })
        .error(function(data, status){
            $rootScope.handleHttpError(data, status);
        });
        $scope.comment.content = '';
    };
    $scope.remComment = function($index){
        $http.get($rootScope.baseURL+'/api/comment/'+$scope.post.latest_ten_comments[$index].id+'/delete').success(function(){
            $scope.post.latest_ten_comments.splice($index, 1);
            $('.dynamic-comment-count#'+$scope.post.id).html(parseInt($('.dynamic-comment-count#'+$scope.post.id).html(), 10)-1);
        })
        .error(function(data, status){
            $rootScope.handleHttpError(data, status);
        });
    };
    $scope.loadMoreComments = function(){
        if($scope.commentsHiddenCount > 0){
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/comment?page='+$scope.page).success(function(data){
                $scope.post.latest_ten_comments = data.data.reverse().concat($scope.post.latest_ten_comments);
                $scope.commentsHiddenCount -= data.data.length;
                if($scope.commentsHiddenCount < 0){
                    $scope.commentsHiddenCount = 0;
                }
                $scope.page++;
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
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
                                if($stateParams.posts){
                                    $stateParams.posts.splice($stateParams.index,1);
                                    $stateParams.user.posts_count--;
                                }
                                if(ComparePosts.has($scope.post.id)){
                                    ComparePosts.toggle($scope.post.id);
                                }
                                $ionicLoading.hide();
                                $ionicHistory.goBack();
                                return true;
                            })
                            .error(function(data, status){
                                $rootScope.handleHttpError(data, status);
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
                            .error(function(data, status){
                                $rootScope.handleHttpError(data, status);
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
                if ($rootScope.isStatNotAvailable(post))
                {
                    post.show_stat = false;
                }
                else
                {
                    post.show_stat = true;
                }
            }
            else{
                $scope.noResult = true;
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
})

.controller('PostExploreCtrl', function($scope, FetchPosts, FetchSearchResults, $stateParams, $state, Focus, $rootScope, $timeout, $http, ComparePosts, PostTimer, Tutorial, NewPost, $ionicScrollDelegate, ScrollingDetector) {
    $scope.search_type_active = "all";
    $scope.searchType = "tag";
    $scope.searchHolder = "Search";
    $scope.searchNoResultText = "No Results Found";
    if (typeof $stateParams.type !== 'undefined' && $stateParams.type == 'occasion')
    {
        $scope.searchType = "occasion";
    }
    $scope.tab = $state.current['name'].split("-")[1];
    $scope.posts = [];
    $scope.searchResult = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.isSearchRunning = false;
    $scope.showSearch = false;
    $scope.noResult = false;
    $scope.noSearchResult = false;
    $scope.showSample = false;
    $scope.comparePosts = ComparePosts;
    $scope.postTimer = PostTimer;
    $scope.mostRecentPostID = 0;
    $scope.newPostAvailable = false;
    $scope.loadingNewPost = false;

    var user = $rootScope.getCurrentUser();
    if(user.username == user.email){
        $state.go('register2').then(function(){
            $timeout(function(){
                window.location.reload();
            },100);
        });
    }

    Tutorial.triggerIfNotCompleted('tutorial_welcome');

    $scope.$on('$ionicView.enter', function() {
        if($scope.noResult){
            $scope.loadingNewPost = true;
            $scope.doRefresh();
        }
        if($scope.posts.length > 0 && ! $stateParams.searchTerm && ! $scope.showSearch){
            NewPost.isAvailable('explore', $scope.mostRecentPostID).then(function(response){
                $scope.newPostAvailable = response;
            });
        }
    });

    $scope.showNoSearchResultText = function() {
        return $scope.searchNoResultText;
    };
    $scope.showPlaceHolder = function() {
        return $scope.searchHolder;
    };
    $scope.fetchPost = function(type) {
        FetchPosts.new($scope.mostRecentPostID, $scope.page, $stateParams.searchTerm, $scope.searchType).then(function(response){
            posts = response.data;
            if (type == "new" || type == "refresh")
            {
                $scope.posts = posts;
                if(posts && posts.length == 0)
                {
                    $scope.noResult = true;
                }
                else
                {
                    $scope.noResult = false;
                    $scope.mostRecentPostID = posts[0].id;
                }
                $scope.noMoreItemsAvailable = false;
                /*
                if(posts && posts.length < $rootScope.minimumCountToShowSample){
                    if ($scope.showSample != true)
                    {
                        $scope.showSample = true;
                        FetchPosts.sample($rootScope.sampleCount).then(function(response){
                            samples = response.data;
                            $scope.samples = samples;
                        });
                    }
                }
                */
            }
            else if (type == "more")
            {
                $scope.posts = $scope.posts.concat(posts);
                $timeout(function() {
                  $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            }

            if (type == "refresh")
            {
                $scope.$broadcast('scroll.refreshComplete');
            }

            if(!response.next_page_url)
            {
                $scope.noMoreItemsAvailable = true;
            }
            $scope.page++;
        });
    };
    $scope.fetchPost("new");
    $scope.loadMore = function() {
        $scope.fetchPost("more");
    };
    $scope.loadNewPost = function() {
        $scope.newPostAvailable = false;
        $timeout(function() {
            $ionicScrollDelegate.scrollTop();
            $scope.loadingNewPost = true;
            $scope.doRefresh();
        }, 300);
    };
    $scope.scrollDetectWhenNewPostAvailable = function() {
        if($scope.newPostAvailable){
            ScrollingDetector.record();
            if(ScrollingDetector.isGoingDown()){
                $('#new-post-button.explore').hide();
            }
            else{
                $('#new-post-button.explore').show();
            }
        }
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        $scope.mostRecentPostID = 0;
        NewPost.resetFlags('explore');
        $scope.fetchPost("refresh");
    };
    $scope.submitSearch = function(search_term, type) {
        $state.go('tab.explore-explore',{searchTerm: search_term, type: type});
    };
    $scope.goSearchPost = function(search_term, type) {
        $scope.submitSearch(search_term, type);
    };
    $scope.noSearchTerm = function() {
       return !$stateParams.searchTerm;
    };
    $scope.showSearchSection = function(){
        $scope.showSearch = true;
    }
    $scope.focusSearch = function(){
        $scope.showSearch = false;
    }
    $scope.focusSearch = function(){
        Focus('search');
    }
    $scope.showSearchTerm = function(){
        var termSign = "#";
        if ($scope.searchType == "occasion")
        {
            termSign = "@";
        }
        if($stateParams.searchTerm){
            var temp = $stateParams.searchTerm.split(' ');
            return termSign+temp.join(' '+termSign);
        }
    }
    $scope.setType = function(searchTerm, type, isRefresh) {
        if (type == "people")
        {
            $scope.searchHolder = "Search people";
            $scope.searchNoResultText = "No users found.";
        }
        else if (type == "tag")
        {
            $scope.searchHolder = "Search hashtags";
            $scope.searchNoResultText = "No hashtags found.";
        }
        else if (type == "occasion")
        {
            $scope.searchHolder = "Search occasions";
            $scope.searchNoResultText = "No occasions found.";
        }
        else
        {
            $scope.searchHolder = "Search";
            $scope.searchNoResultText = "No Results Found";
        }
        $scope.search_type_active = type;
    };
    $scope.fetchSearchResult = function(searchTerm, type = null) {
        $scope.noSearchResult = false;
        if (searchTerm.length == 0)
        {
            $scope.searchResult = [];
            return;
        }
        else if (searchTerm.length == 1 && searchTerm == "#")
        {
            if ($scope.search_type_active != "all")
            {
                $scope.setType(searchTerm, "tag");
            }
            $scope.searchResult = [];
            return;
        }
        else if (searchTerm.length == 1 && searchTerm == "@")
        {
            if ($scope.search_type_active != "all")
            {
                $scope.setType(searchTerm, "people");
            }
            $scope.searchResult = [];
            return;
        }
        else
        {
            var term = searchTerm.trim();
            $scope.showSearch = true;
            if (type === null)
            {
                type = $scope.search_type_active;
            }
            if (term[0] == "@" || term[0] == "#")
            {
                term = term.substr(1);
            }

            $scope.isSearchRunning = true;
            FetchSearchResults.get(term, type).then(function(response){
                $scope.searchResult = response;
                $scope.isSearchRunning = false;
                if ($scope.searchResult === undefined || $scope.searchResult.length == 0)
                {
                    $scope.noSearchResult = true;
                }
            });
        }
    }
})

.controller('TabCtrl', function($scope, ComparePosts) {
    $scope.comparePosts = ComparePosts;
})
/*
.controller('CompareCtrl', function($scope, FetchPosts, $state, Focus, $rootScope, $http, ComparePosts, $ionicLoading, PostTimer, $stateParams, Tutorial) {
    var user = $rootScope.getCurrentUser();
    $scope.showInstruction = true;
    $scope.last_filters = ComparePosts.getLastFilters();
    $scope.comparePosts = ComparePosts;
    $scope.postTimer = PostTimer;
    $scope.gender_active = $scope.last_filters.gender;
    $scope.age_active = $scope.last_filters.age;

    if($stateParams.isThisAfterShare){
        Tutorial.triggerIfNotCompleted('tutorial_first_compare');
    }

    $scope.$on('$ionicView.enter', function() {
        $scope.sortPosts($scope.gender_active , $scope.age_active );
    });

    $scope.sortPosts = function(gender, age) {
        $ionicLoading.show();
        ComparePosts.sort(gender, age).then(function() {
            $ionicLoading.hide();
        });
    }
    $scope.notMe = function(post) {
        return (post.user.id != user.id);
    }
    $scope.doRefresh = function(){
        ComparePosts.sort($scope.gender_active, $scope.age_active).then(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
    $scope.setGender = function(gender) {
        $scope.gender_active = gender;
        $scope.sortPosts($scope.gender_active , $scope.age_active );
    }
    $scope.setAge = function(age) {
        $scope.age_active = age;
        $scope.sortPosts($scope.gender_active , $scope.age_active );
    }
})
*/
.controller('PostCompareCtrl', function($scope, FetchPosts, $state, Focus, $rootScope, $http, ComparePostSet, $ionicLoading, PostTimer, $stateParams, Tutorial) {
    var user = $rootScope.getCurrentUser();
    $scope.showInstruction = true;
    $scope.comparePostSet = ComparePostSet;
    $scope.postTimer = PostTimer;
    $scope.gender_active = 'all';
    $scope.age_active = 'all';
    $scope.post_id_array = $stateParams.postIds.split(',');
    $scope.post_array = null;
    $scope.top_post_id;
/*
 * option 1
 * refresh as sort + refresh as enter view
 *
    $scope.$on('$ionicView.enter', function() {
        $scope.sortPosts($scope.gender_active, $scope.age_active);
    });
    $scope.sortPosts = function(gender, age) {
        $ionicLoading.show();
        ComparePostSet.fetch($scope.post_id_array).then(function(post_array) {
            $scope.post_array = post_array;
            $ionicLoading.hide();
            ComparePostSet.sort(gender, age, $scope.post_array);
        });
    }
*/
/*
 * option 2
 * refresh as enter view
 *
    $scope.$on('$ionicView.enter', function() {
        $ionicLoading.show();
        ComparePostSet.fetch($scope.post_id_array).then(function(post_array) {
            $scope.post_array = post_array;
            $ionicLoading.hide();
            ComparePostSet.sort($scope.gender_active, $scope.age_active, $scope.post_array);
        });
    });
    $scope.sortPosts = function(gender, age) {
        ComparePostSet.sort(gender, age, $scope.post_array);
    }
*/
/*
 * option 3
 * refresh as enter once
 */

    if($stateParams.isMyPostCompare == 'true'){
        Tutorial.triggerIfNotCompleted('tutorial_first_compare');
    }

    $ionicLoading.show();
    ComparePostSet.fetch($scope.post_id_array).then(function(post_array) {
        $scope.post_array = post_array;
        $ionicLoading.hide();
        //ComparePostSet.sort($scope.gender_active, $scope.age_active, $scope.post_array);
        $scope.top_post_id = ComparePostSet.getTopPostId($scope.gender_active, $scope.age_active, $scope.post_array);
    });
    $scope.sortPosts = function(gender, age) {
        //ComparePostSet.sort(gender, age, $scope.post_array);
        $scope.top_post_id = ComparePostSet.getTopPostId(gender, age, $scope.post_array);
    }

    $scope.notMe = function(post) {
        return (post.user.id != user.id);
    }
    $scope.doRefresh = function(){
        ComparePostSet.fetch($scope.post_id_array).then(function(post_array) {
            $scope.post_array = post_array;
            $scope.$broadcast('scroll.refreshComplete');
            //ComparePostSet.sort($scope.gender_active, $scope.age_active, $scope.post_array);
            $scope.top_post_id = ComparePostSet.getTopPostId($scope.gender_active, $scope.age_active, $scope.post_array);
        });
    }
    $scope.setGender = function(gender) {
        $scope.gender_active = gender;
        $scope.sortPosts($scope.gender_active, $scope.age_active);
    }
    $scope.setAge = function(age) {
        $scope.age_active = age;
        $scope.sortPosts($scope.gender_active , $scope.age_active);
    }
})
.controller('RankingCtrl', function($scope, FetchSchools, $timeout) {
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
            $timeout(function() {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
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

.controller('SchoolCtrl', function($scope, FetchPosts, $stateParams, $timeout) {
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
            $timeout(function() {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
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
.controller('AccountCtrl', function($scope, $stateParams, FetchUsers, FetchPosts, $http, $state, $rootScope, $ionicActionSheet, $cordovaCamera, $cordovaFile, $ionicLoading, $timeout, ComparePosts, PostTimer, Tutorial) {
    var user = $rootScope.getCurrentUser();
    $scope.page = 1;
    $scope.isMyAccount = false;
    $scope.posts = [];
    $scope.noMoreItemsAvailable = false;
    $scope.data = { "ImageURI" :  "Select Image" };
    $scope.currentSlug = "";
    $scope.noResult = false;
    $scope.activatedTab = 'new';
    $scope.comparePosts = ComparePosts;
    $scope.postTimer = PostTimer;

    if($stateParams.isThisAfterShare){
        Tutorial.triggerIfNotCompleted('tutorial_first_share');
    }

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

    if (user.id || $stateParams.refresh) {
        FetchUsers.get($scope.currentSlug).then(function(account_info){
            $scope.account_info = account_info;
            $scope.accountImage = $rootScope.photoPath( account_info.profile_img_path, 's' );

            if (user.id == $scope.account_info.id)
            {
                $scope.isMyAccount = true;
                $rootScope.currentUser = $scope.account_info;
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

        ft.upload(fileURL, encodeURI($rootScope.baseURL + '/api/user/'+user.slug+'/editProfilePicture'), success, fail, options);

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
    $scope.notMe = function(like) {
        return !$scope.isMyAccount;
    };
    $scope.loadMore = function() {
        if(!$scope.activatingTab){
            FetchPosts.user($scope.currentSlug, $scope.activatedTab, $scope.page).then(function(response){
                posts = response.data;
                if(!response.next_page_url){
                    $scope.noMoreItemsAvailable = true;
                }
                $scope.posts = $scope.posts.concat(posts);
                $timeout(function() {
                  $scope.$broadcast('scroll.infiniteScrollComplete');
                });
                $scope.page++;
            });
        }
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        $scope.posts = [];
        $scope.activatedTab = 'new';

        FetchUsers.get($scope.currentSlug).then(function(account_info){
            $scope.account_info = account_info;
            if (user.id == account_info.id)
            {
                $rootScope.currentUser = account_info;
            }
        });
        FetchPosts.user($scope.currentSlug, $scope.activatedTab, $scope.page).then(function(response){
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
        $scope.activatingTab = true;
        $scope.page = 1;
        $scope.posts = [];
        $scope.activatedTab = tab;
        $scope.noResult = false;

        FetchPosts.user($scope.currentSlug, tab, $scope.page).then(function(response){
            $scope.$broadcast('scroll.infiniteScrollComplete');
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
            $scope.activatingTab = false;
        });
    }
})
.controller('OptionCtrl', function($scope, $stateParams, $http, $state, $ionicPopup, $ionicHistory, $rootScope, $timeout, RestartApp) {
    $scope.user = $rootScope.getCurrentUser();
    $scope.goAccountEdit = function(id){
        $state.go('tab.edit-account');
    };
    $scope.goFindFriends = function(id){
        $state.go('tab.find-friends');
    };
    $scope.goInviteFriends = function(id){
        var options = {
            message: 'which looks better?',
            subject: 'Which Looks Better?',
            url: $rootScope.baseURL + '/s/demo'
        }
        var onSuccess = function(result) {
            console.log("invite succeed");
        }
        var onError = function(msg) {
            console.log("invite failed with message: " + msg);
        }
        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
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
                localStorage.removeItem('post_id_array');
                // if we remove token, regular register after fb account log out does not work
                // however if we leave token, it replace itself according to new login.
                // therefore decided not to remove
                //
                //localStorage.removeItem('satellizer_token');
                RestartApp.go('root');
            }
        });
    };
})
.controller('AccountEditCtrl', function($scope, FetchUsers, $http, $rootScope, $ionicHistory, UsernameAvailability) {
    var user = $rootScope.getCurrentUser();
    $scope.usernameClass = '';

    FetchUsers.get(user.slug).then(function(user){
        $scope.user = user;
        var data = {
            username : $scope.user.username,
            age : $scope.user.age,
            gender : $scope.user.gender
        };
        $scope.user_info = data;
    });

    $scope.usernameTyped = function(keyEvent){
        if($scope.user.username == $scope.user_info.username){
            $scope.usernameClass = 'success';
        }
        else{
            UsernameAvailability.typed($scope.user_info.username).then(function(response){
                $scope.usernameClass = response;
            });
        }
    }

    $scope.updateProfile = function(user){
        $http({
            method: "POST",
            url: $rootScope.baseURL + '/api/user/' + $scope.user.slug + '/edit',
            data: user
        })
        .success(function(){
            $rootScope.popupMessage('Message', 'Profile Has been updated');
            for(i = 0; i < $rootScope.userTrackArray.length; i++){
                thisUser = $rootScope.userTrackArray[i];
                if(thisUser.id == $scope.user.id){
                    thisUser.username = user.username;
                }
            }
            $ionicHistory.goBack();
        })
        .error(function(data, status){
            $rootScope.handleHttpError(data, status);
            if(UsernameAvailability.isFailed(data)){
                $scope.usernameClass = 'fail';
            }
        });
    };
})
.controller('ChangePasswordCtrl', function($scope, $stateParams, $http, $state, $location, $rootScope, $ionicHistory) {
    var user = $rootScope.getCurrentUser();
    $scope.changePassword = function(pwd){
        $http({
            method: "POST",
            url: $rootScope.baseURL + '/api/user/' + user.slug + '/password/edit',
            data: pwd
        })
        .success(function(){
            $rootScope.popupMessage('Message', 'Password Has been updated');
            $ionicHistory.goBack();
        })
        .error(function(data, status){
            $rootScope.handleHttpError(data, status);
        });
    };
})
.controller('ChangeProfilePictureCtrl', function($scope, $stateParams, $http, $state, $location, $ionicPopup) {

})
.controller('FindFriendsCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope, $timeout) {
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
            $timeout(function() {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
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
})
.controller('InviteFriendsCtrl', function($scope, $http, $rootScope, $ionicPopup, Focus) {
    $scope.sendInvitation = function(email){
        $http({
            method: "POST",
            url: $rootScope.baseURL + '/api/invite-friends',
            data: {'email' : email }
        })
        .success(function(){
            $rootScope.popupMessage('Message', 'Invitation has been sent');
            $( ".email" ).val("");
        })
        .error(function(data, status){
            $rootScope.handleHttpError(data, status);
        });
    };

    $scope.focusEmailInput = function(){
        Focus('email');
    }

})
.controller('FollowingCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope, $timeout) {
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
            $timeout(function() {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
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
})
.controller('FollowerCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope, $timeout) {
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
            $timeout(function() {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
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
})
.controller('LikedCtrl', function($scope, $stateParams, FetchPosts, $timeout) {
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
            $timeout(function() {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
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
.controller('NotificationCtrl', function($scope, FetchNotifications, $rootScope, $state, $timeout) {
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
    $scope.loadMore = function() {
        FetchNotifications.new(user.slug, $scope.page).then(function(response){
            notifications = response.data;
            if(!response.next_page_url){
                $scope.noMoreItemsAvailable = true;
            }
            $scope.notifications = $scope.notifications.concat(notifications);
            $timeout(function() {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
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
