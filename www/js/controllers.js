angular.module('starter.controllers', [])
.run(function($rootScope, $ionicTabsDelegate, $state, $ionicPlatform, $ionicPopup, $ionicActionSheet, $timeout, $cordovaCamera, $ionicLoading, $ionicHistory, $location, $ionicBackdrop, $stateParams, $http, $ionicScrollDelegate, CameraPictues, $cordovaSocialSharing, Wait, RestartApp, FetchNotifications, BlockerMessage, UxAnalytics, Config, SlideHeader, FCMHandler, SearchFilter) {
    $rootScope.clientVersion = '1.0';
    $rootScope.minimumForceUpdateVersion = "";
    $rootScope.baseURL = 'https://app.snaplook.today';
    //$rootScope.baseURL = 'http://localhost:8000';
    //$rootScope.baseURL = 'http://192.168.56.1:8000';
    //$rootScope.baseURL = 'http://localhost:8888';
    $rootScope.sampleCount = 4;
    $rootScope.minimumCountToShowSample = 4;
    $rootScope.nameLengthOnCard = 12;
    $rootScope.stat_height = 0;
    $rootScope.stat_label_height = 0;
    $rootScope.postTrackArray = [];
    $rootScope.userTrackArray = [];
    $rootScope.currentUser = null;
    $rootScope.notificationCount = "0";
    $rootScope.blockerMessage = BlockerMessage;
    $rootScope.slideHeader = SlideHeader;
    $rootScope.searchFilter = SearchFilter;
    $rootScope.notificationPullInterval = 60000;
    Config.init().then(function(){
        $rootScope.config = Config;
        /*
        Tutorial.init(Config.get('tutorials'));
        $rootScope.tutorial = Tutorial;
        */
        BlockerMessage.init();

        var result = Config.get('minimum_force_update_version');
        if (result)
        {
            $rootScope.minimumForceUpdateVersion = result;
        }
        result = Config.get('notification_pull_interval');
        if (result)
        {
            $rootScope.notificationPullInterval = result;
        }
    });

    $rootScope.scroll = function() {
        $ionicScrollDelegate.scrollBy(0, 100);
    }
    $rootScope.picture = function() {
        CameraPictues.set('http://localhost:8100/img/_test_1.jpg');
        CameraPictues.set('http://localhost:8100/img/_test_2.jpg');
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
            case 5:
                tab = 'hidden';
                break;
            default:
                tab = 'newTab';
        }
        return tab;
    };
    $rootScope.linkHashTag = function(str){
        if(str){
            var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
            str = str.replace(/(#[a-z\d-_]+)/ig, "<a href='#/tab/explore/$1/tag/"+tab+"'>$1</a>");
            str = str.replace(/(\/#)/g, "/");
            return str;
        }
    };
    $rootScope.linkHashTagAndGoal = function(post){
        var content = post.content;
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());

        if(content){
            content = content.replace(/(#[a-z\d-_]+)/ig, "<a href='#/tab/search/$1/tag/"+tab+"'>$1</a>");
            content = content.replace(/(\/#)/g, "/");
        }
        if(post.goal != null){
            content = '<div class="goal-tag"><a href="#/tab/search/' + post.goal.name + '/goal/' + tab + '"><i class="fa fa-bolt" aria-hidden="true"></i> ' +
                post.goal.name + '</a></div><br/>' + content;
        }

        return content;
    };
    $rootScope.goPhotoDetail = function(photo){
        if (!$rootScope.canClickInList()) {
            return;
        }
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.photo-detail-'+tab,{photo: photo});
    };
    $rootScope.goPostComment = function(post){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-comments-'+tab,{post: post});
    };
    $rootScope.goVoteResult = function(post_id){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.vote-result-'+tab,{postId: post_id});
    };
    $rootScope.goPostLikers = function(id){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-likers-'+tab,{postId: id});
    };
    $rootScope.goAccount = function(slug){
        if (!$rootScope.canClickInList() || $rootScope.currentUser.slug == slug) {
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
        if(slug){
            var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
            $state.go('tab.account-following-'+tab,{userSlug: slug});
        }
    };
    $rootScope.goAccountFollower = function(slug){
        if(slug){
            var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
            $state.go('tab.account-follower-'+tab,{userSlug: slug});
        }
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
        UxAnalytics.startScreen('tab-camera');
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
                            quality: 50,
                            targetWidth: 2400,
                            targetHeight: 2400,
                            correctOrientation: true,
                            allowEdit: true,
                            destinationType: Camera.DestinationType.FILE_URI,
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
                            quality: 50,
                            targetWidth: 2400,
                            targetHeight: 2400,
                            correctOrientation: true,
                            allowEdit: true,
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
        if(
            $rootScope.currentUser &&
            $stateParams.accountSlug &&
            $rootScope.currentUser.slug != $stateParams.accountSlug
        ){
            return true;
        }
        return false;
    };
    $rootScope.ifShowSend = function(){
        return $stateParams.shouldShowSend == 'true';
    };
    $rootScope.ifSearchResult = function(){
        return $stateParams.searchTerm !== undefined;
    };
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
    $rootScope.getTimeAgo = function(time){
        return moment.utc(time).fromNow();
    }
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
                            template: 'Are you sure you want to block this user?'
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
                            template: 'Are you sure you want to report this user?'
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
    $rootScope.toggleLike = function($event,comment){
        $event.preventDefault();
        if(comment.user_liked){
            $http.get($rootScope.baseURL+'/api/comment/'+comment.id+'/unlike').success(function(){
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
            comment.like_count--;
        }
        else{
            $http.get($rootScope.baseURL+'/api/comment/'+comment.id+'/like').success(function(){
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
            comment.like_count++;
        }
        //$rootScope.trackAndUpdateLike(comment);
        comment.user_liked = !comment.user_liked;
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

    $rootScope.getNotification = function(_notificationPullInterval = null) {
        var user = $rootScope.getCurrentUser();
        if (typeof user !== 'undefined'){
            notificationPullInterval = _notificationPullInterval;
            if (notificationPullInterval == null)
            {
                notificationPullInterval = $rootScope.notificationPullInterval;
            }
            FetchNotifications.stateChanged(user.slug, notificationPullInterval).then(function(response){
                if (response != "fail")
                {
                    $rootScope.notificationCount = (response >= 10 ? "9+" : (response ? response : 0));
                }
            });
        }
    }

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
    $rootScope.openInAppBrowser = function(url) {
        cordova.InAppBrowser.open(url, '_blank');
    }

    $timeout(
        function(){
            $rootScope.getNotification(0);
        }, 500
    )

    setInterval(function() {
        if($rootScope.currentUser){
            $rootScope.getNotification($rootScope.notificationPullInterval);
        }
    }, $rootScope.notificationPullInterval + 500);

    setInterval(function() {
        if($rootScope.currentUser){
            FCMHandler.registerNewToken();
        }
    }, 1000);
})
.controller('PostCreateCtrl', function($scope, FetchGoals, $state, $stateParams, $rootScope, $cordovaFile, $ionicLoading, $ionicHistory, $location, CameraPictues, $timeout, UxAnalytics, $http, $ionicScrollDelegate, ImageUpload, SlideHeader) {
    $scope.visibility = 'public';
    $scope.submitted = false;
    $location.replace('tab.camera');
    $scope.data = { "ImageURI" :  "Select Image" };
    $scope.goalList = new Array();
    $scope.shopOptionalGoal = false;
    $scope.cameraPictues = CameraPictues;
    $rootScope.getNotification(0); // pull the notification count immediately.

    var user = $rootScope.getCurrentUser();
    if(user.username == user.email){
        $state.go('register2').then(function(){
            $timeout(function(){
                window.location.reload();
            },100);
        });
    }
    else{
        //Tutorial.triggerIfNotCompleted('tutorial_welcome');
    }

    // problem : Appsee starts with 'Main' screen, even though I hardcode to start 'explore'.
    // cause : Appsee auto-stats 'Main' screen asynchronously.
    // solution : Wait 2 second to start 'explore' screen after Appsee auto starts 'Main' screen.
    setTimeout(function(){
        UxAnalytics.setUserId(user.username);
        UxAnalytics.startScreen('post-create');
    }, 2000);

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-create');
        SlideHeader.viewEntered($scope);
    });

    FetchGoals.get().then(function(response){
        goals = response;
        for (index = 0; index < goals.length; ++index) {
            $scope.goalList.push({value: goals[index].id, label: goals[index].name});
        }
        $scope.goalList.push({value: 'other', label: 'Other'});
    });

    $scope.sharePost = function(captions, goal, other) {
        var fileURLs = CameraPictues.get();
        var share_post_scope = this;
        var postIdArray = [];
        var photoIdArray = [];
        var uploadTryCount = 0;
        var uploadSuccessCount = 0;
        var param_caption = '';
        if (typeof captions != 'undefined')
        {
            param_caption = captions;
        }

        $scope.submitted = true;
        $ionicLoading.show({template: 'Uploading Photo...<br/><br/><ion-spinner></ion-spinner>'});

        if(fileURLs.length < 2){
            $ionicLoading.hide();
            $rootScope.popupMessage('', 'Show off Your Outfit Ideas with 2 or More Outfits!');
            $scope.submitted = false;
            return;
        }

        var post_data = {
            captions: param_caption,
            user_id: user.id,
            goal: goal,
            other: other,
            visibility: $scope.visibility,
        };
        for(var i=0; i<fileURLs.length; i++){
            ImageUpload.send(fileURLs[i], encodeURI($rootScope.baseURL + '/api/photo/create/' + i), success, fail);
        }

        // Transfer succeeded
        function success(r) {
            // problem: r from test call and real call is different format
            // cause: test is getting data from $http and real is getting data from ft.upload
            // solution: parse differently by checking attribute
            var result;
            if (typeof r.response != 'undefined'){
                result = JSON.parse(r.response);
            }
            else{
                result = r;
            }
            uploadTryCount++;
            uploadSuccessCount++;
            if(typeof result.id !== 'undefined'){
                photoIdArray.push(result.id);
            }
            if(uploadTryCount == fileURLs.length && uploadSuccessCount > 0){
                $ionicScrollDelegate.scrollTop();
                $ionicLoading.show({
                    template: 'Upload Success ( ' + uploadSuccessCount + ' / ' + uploadTryCount + ' )',
                    duration:500
                });
                var photoIds = photoIdArray.join(',');
                $http.post($rootScope.baseURL+'/api/post/create/with_photos/'+photoIds, post_data);
                $scope.submitted = false;
                $scope.visibility = 'public';
                share_post_scope.goal = undefined;
                share_post_scope.captions = undefined;
                uploadTryCount = 0;
                uploadSuccessCount = 0;
                photoIdArray = [];
                $timeout(function(){
                    CameraPictues.reset();
                    $state.go('tab.account-account', {refresh : new Date().getTime()});
                }, 500);
            }
        }

        // Transfer failed
        function fail(error) {
            uploadTryCount++;
            if(uploadTryCount == fileURLs.length && uploadSuccessCount == 0){
                $ionicLoading.show({template: 'Upload Failed', duration:500});
                $scope.submitted = false;
                uploadTryCount = 0;
                uploadSuccessCount = 0;
            }
        }
    }
    $scope.checkGoal = function(_goal) {
        if (_goal != null && _goal.value == "other")
        {
            $scope.shopOptionalGoal = true;
        }
        else
        {
            $scope.shopOptionalGoal = false;
        }
    }
    $scope.reset = function() {
        CameraPictues.reset();
        this.captions = '';
        this.goal = null;
        $ionicScrollDelegate.scrollTop();
    }
    $scope.hasContent = function(){
        return CameraPictues.get().length > 0 ||
            (typeof(this.captions) !== 'undefined' && this.captions !== '') ||
            (typeof(this.goal) !== 'undefined' && this.goal !== null)
    }
    $scope.setActive = function(visibility){
      $scope.visibility = visibility;
    }
    $scope.isActive = function(visibility){
      return visibility === $scope.visibility;
    }
})
.controller('PostCreateStep1Ctrl', function($scope, $state, $stateParams, $rootScope, $cordovaFile, $ionicLoading, $ionicHistory, $location, CameraPictues, $timeout, UxAnalytics, $http, $ionicScrollDelegate, ImageUpload, SlideHeader, BusinessObjectList, GoalBO) {
    $scope.search_term = '';
    $scope.business_object_list_config = {
        type : 'goal',
        method : 'trending',
    };
    var deterred_function = null;

    BusinessObjectList.reset($scope);
    BusinessObjectList.load($scope);

    $scope.load = function() {
        BusinessObjectList.load($scope);
    };

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-create-step-1');
        SlideHeader.viewEntered($scope);
    });

    $scope.goStep2 = function(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('tab.post-create-step-2', {refresh : new Date().getTime()});
    }

    $scope.setGoal = function(goal){
        localStorage.setItem('post_create_goal', JSON.stringify(goal));
        $scope.goStep2();
    }

    $scope.storeGoal = function(){
        GoalBO.create(this.search_term).then(function(new_goal){
            $scope.setGoal(new_goal);
        });
    }

    $scope.searchTermSuggestion = function(defer = true){
        var this_scope = this;
        BusinessObjectList.reset($scope);

        $timeout.cancel(deterred_function);
        deterred_function = $timeout(function() {
            $scope.search_term = this_scope.search_term;
            BusinessObjectList.reset($scope);
            BusinessObjectList.load($scope);
        }, $rootScope.config.get('need_to_stay_idle_milisec'));
    }

    $scope.getProspectSearchTerm = function(){
        return $scope.search_term.replace(/\s+/g, "_");
    }

    $scope.setMethod = function(method){
        $scope.business_object_list_config.method = method;
        $scope.searchTermSuggestion();
    }

    $scope.isMethod = function(method){
        return method == $scope.business_object_list_config.method;
    }
})
.controller('PostCreateStep2Ctrl', function($scope, $state, $stateParams, $rootScope, $cordovaFile, $ionicLoading, $ionicHistory, $location, CameraPictues, $timeout, UxAnalytics, $http, $ionicScrollDelegate, ImageUpload, SlideHeader) {
    $scope.goal = JSON.parse(localStorage.getItem('post_create_goal'));

    $scope.goStep1 = function(call_back_func = null){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('tab.post-create-step-1', {refresh : new Date().getTime()}).then(function(){
            if(call_back_func){
                call_back_func();
            }
        });
    }

    $scope.resetPreviousStep = function(){
        $scope.goal = null;
        localStorage.removeItem('post_create_goal');
    }

    $scope.resetThisStep = function(){
        CameraPictues.reset();
        localStorage.removeItem('post_create_visibility');
        localStorage.removeItem('post_create_captions');
        this.captions = '';
        $scope.visibility = 'permanent';
    }

    $scope.resetAllSteps = function(){
        localStorage.removeItem('post_create_goal');
        $scope.resetThisStep();
        $scope.goStep1(function(){
            $state.go('tab.account-account', {refresh : new Date().getTime()});
        });
    }

    $scope.setCaption = function(){
        localStorage.setItem('post_create_captions', this.captions);
    }

    $scope.getCaption = function(){
        if(localStorage.getItem('post_create_captions')){
            this.captions = localStorage.getItem('post_create_captions');
        }
    }



    $scope.getCaption();
    $scope.visibility = 'permanent';
    if(localStorage.getItem('post_create_visibility')){
        $scope.visibility = localStorage.getItem('post_create_visibility');
    }
    $scope.submitted = false;
    $scope.cameraPictues = CameraPictues;

    var user = $rootScope.getCurrentUser();

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-create-step-2');
        SlideHeader.viewEntered($scope);
    });

    $scope.sharePost = function(captions, goal_id, other) {
        var fileURLs = CameraPictues.get();
        var share_post_scope = this;
        var photoIdArray = [];
        var uploadTryCount = 0;
        var uploadSuccessCount = 0;
        var param_caption = '';
        if (typeof captions != 'undefined')
        {
            param_caption = captions;
        }

        $scope.submitted = true;
        $ionicLoading.show({template: 'Uploading Photo...<br/><br/><ion-spinner></ion-spinner>'});

        if(fileURLs.length < 2){
            $ionicLoading.hide();
            $rootScope.popupMessage('', 'Show off Your Outfit Ideas with 2 or More Outfits!');
            $scope.submitted = false;
            return;
        }

        var post_data = {
            captions: param_caption,
            user_id: user.id,
            goal: goal_id,
            other: other,
            visibility: $scope.visibility,
        };
        for(var i=0; i<fileURLs.length; i++){
            ImageUpload.send(fileURLs[i], encodeURI($rootScope.baseURL + '/api/photo/create/' + i), success, fail);
        }

        // Transfer succeeded
        function success(r) {
            // problem: r from test call and real call is different format
            // cause: test is getting data from $http and real is getting data from ft.upload
            // solution: parse differently by checking attribute
            var result;
            if (typeof r.response != 'undefined'){
                result = JSON.parse(r.response);
            }
            else{
                result = r;
            }
            uploadTryCount++;
            uploadSuccessCount++;
            if(typeof result.id !== 'undefined'){
                photoIdArray.push(result.id);
            }
            if(uploadTryCount == fileURLs.length && uploadSuccessCount > 0){
                $ionicScrollDelegate.scrollTop();
                $ionicLoading.show({
                    template: 'Upload Success ( ' + uploadSuccessCount + ' / ' + uploadTryCount + ' )',
                    duration:500
                });
                var photoIds = photoIdArray.join(',');
                $http.post($rootScope.baseURL+'/api/post/create/with_photos/'+photoIds, post_data).success(function(){
                    $scope.resetAllSteps();
                })
                .error(function(data, status){
                    $rootScope.handleHttpError(data, status);
                });
            }
        }

        // Transfer failed
        function fail(error) {
            uploadTryCount++;
            if(uploadTryCount == fileURLs.length && uploadSuccessCount == 0){
                $ionicLoading.show({template: 'Upload Failed', duration:500});
                $scope.submitted = false;
                uploadTryCount = 0;
                uploadSuccessCount = 0;
            }
        }
    }
    $scope.hasContent = function(){
        return CameraPictues.get().length > 0 ||
            (typeof(this.captions) !== 'undefined' && this.captions !== '')
    }
    $scope.setActive = function(visibility){
        $scope.visibility = visibility;
        localStorage.setItem('post_create_visibility', visibility);
    }
    $scope.isActive = function(visibility){
        return visibility === $scope.visibility;
    }
})
.controller('PostEditCtrl', function($scope, $http, $stateParams, $rootScope, FetchPosts, $ionicHistory, $ionicLoading, UxAnalytics, SlideHeader) {
    $scope.post = $stateParams.post;

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-edit');
        SlideHeader.viewEntered($scope);
    });

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

.controller('TutorialCtrl_deprecated_20190222',function($scope, Tutorial, Config, BlockerMessage){
    Config.init().then(function(){
        Tutorial.init(Config.get('tutorials'));
        $scope.tutorial = Tutorial;
        BlockerMessage.init();
    });
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
    if(localStorage.getItem('user') && localStorage.getItem('satellizer_token')){
        $state.go('tab.explore-explore');
    }
    else{
        $state.go('auth');
    }
})

.controller('RegisterCtrl', function($scope, $ionicHistory, $state, $rootScope, $http, $auth, $ionicLoading, $q, UxAnalytics) {
    $scope.registerData = {email:'',password:''};

    UxAnalytics.startScreen('register');

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
.controller('Register2Ctrl', function($scope, $stateParams, $auth, $rootScope, $http, $ionicLoading, $ionicHistory, $state, $timeout, UsernameAvailability, UxAnalytics, BlockerMessage) {
    $scope.registerData = {
        age: '10',
        gender: 'female',
    };
    $scope.usernameClass = '';
    var credentials = {
        email: $stateParams.email,
        password: $stateParams.password
    }

    UxAnalytics.startScreen('register2');

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
                BlockerMessage.init();
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
.controller('ForgetPasswordCtrl', function($scope, $ionicHistory, $state, $rootScope, $http, $auth, $ionicLoading, UxAnalytics) {
    $scope.datas = {email:''};

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('forget-password');
    });

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

.controller('AuthCtrl', function($scope, $location, $stateParams, $ionicHistory, $http, $state, $auth, $rootScope, $ionicLoading, $q, UxAnalytics, BlockerMessage) {

    $scope.loginData = {};
    $scope.loginError = false;
    $scope.loginErrorText;

    // problem : Appsee starts with 'Main' screen, even though I hardcode to start 'login'.
    // cause : Appsee auto-stats 'Main' screen asynchronously.
    // solution : Wait 2 second to start 'login' screen after Appsee auto starts 'Main' screen.
    setTimeout(function(){
        UxAnalytics.startScreen('login');
    }, 2000);

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
                BlockerMessage.init();
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
.controller('HomeCtrl', function($scope, SlideHeader, PostCard, BusinessObjectList, $ionicScrollDelegate, UxAnalytics, DirtyHack) {
    $scope.postCard = PostCard;
    $scope.business_object_list_config = {
        type : 'post',
        method : 'following',
        preload : true
    };

    BusinessObjectList.reset($scope);
    BusinessObjectList.load($scope).then(function(){
        DirtyHack.preventZeroTop();
    });

    $scope.refresh = function(){
        BusinessObjectList.reset($scope);
        $scope.is_list_loading = false;
        BusinessObjectList.load($scope).then(function(){
            DirtyHack.preventZeroTop(900);
        });
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.load = function(){
        $ionicScrollDelegate.scrollTop();
        $scope.list = [];
        $scope.is_list_loading = true;

        BusinessObjectList.render($scope, $scope.preloaded_response);
        BusinessObjectList.preload($scope);
        DirtyHack.preventZeroTop();
    }

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('tab-home');
        SlideHeader.viewEntered($scope);
    });
})

.controller('PostDetailCtrl', function($scope, SlideHeader, PostCard, BusinessObjectList, $ionicScrollDelegate, UxAnalytics, DirtyHack, $stateParams) {
    $scope.hash = $stateParams.hash;
    $scope.postCard = PostCard;
    $scope.business_object_list_config = {
        type : 'post',
        method : 'deep_link',
    };

    BusinessObjectList.reset($scope);
    BusinessObjectList.load($scope).then(function(){
        DirtyHack.preventZeroTop();
    });

    $scope.refresh = function(){
        BusinessObjectList.reset($scope);
        $scope.is_list_loading = false;
        BusinessObjectList.load($scope).then(function(){
            DirtyHack.preventZeroTop(900);
        });
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('tab-post-detail');
        SlideHeader.viewEntered($scope);
    });
})

.controller('PostLikersCtrl', function($scope, $stateParams, $http, $location, FetchUsers, $rootScope, $timeout, UxAnalytics) {
    $scope.likes = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    var user = $rootScope.getCurrentUser();

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-likers');
    });

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

.controller('PhotoDetailCtrl', function($scope, $stateParams, UxAnalytics, SlideHeader){
    $scope.photo = $stateParams.photo;

    $scope.imageLoaded = function(object) {
        object.loaded = true;
    }

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('photo-detail');
        SlideHeader.viewEntered($scope);
    });
})

.controller('PostCommentCtrl', function($scope, $rootScope, $stateParams, PostComment, SlideHeader, $ionicActionSheet, $ionicPopup, $http, $ionicLoading, $ionicScrollDelegate, Focus, $timeout, BusinessObjectList, UxAnalytics) {
    $scope.post_id = $stateParams.post.id;
    var user = $rootScope.getCurrentUser();
    var resetCommentFormVariables = function(){
        $scope.new_comment = {content:''};
        $scope.new_comment_parent_id = 0;
        $scope.is_comment_submitting = false;
    }
    $scope.business_object_list_config = {
        type : 'comment',
        method : 'fetch',
        callback : resetCommentFormVariables
    };

    BusinessObjectList.reset($scope);
    BusinessObjectList.load($scope);

    $scope.refresh = function(){
        BusinessObjectList.reset($scope);
        $scope.is_list_loading = false;
        BusinessObjectList.load($scope);
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.load = function() {
        BusinessObjectList.load($scope);
    };

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-comment');
        SlideHeader.viewEntered($scope);
    });

    $scope.replyClicked = function(username, parent_id){
        $scope.new_comment_parent_id = parent_id;
        $scope.new_comment.content = '@' + username + ' ';
        Focus('new_comment');
    };

    $scope.submitComment = function(){
        if($scope.new_comment.content.trim() == ''){
            return;
        }
        if(! $scope.is_comment_submitting){
            $scope.is_comment_submitting = true;
            PostComment.submit(
                $scope.new_comment.content,
                $scope.post_id,
                $scope.new_comment_parent_id
            ).then(function(response){
                PostComment.insert(
                    response,
                    $scope.list,
                    $scope.new_comment_parent_id
                );
                if($stateParams.post.comment_info){
                    $stateParams.post.comment_info.count++;
                }
                else{
                    $stateParams.post.comment_info = {count:1};
                }
                submitCommentDone($scope.new_comment_parent_id);
            }, function(){
                submitCommentDone();
            });
        }
    };

    var submitCommentDone = function(new_comment_parent_id){
        if(new_comment_parent_id == 0){
            $ionicScrollDelegate.scrollTop();
        }
        $scope.is_result_empty = false;
        $ionicLoading.hide();
        resetCommentFormVariables();
    }

    $scope.moreOption = function(comment, comments, index){
        if(user.id == comment.user.id){
            var hideSheet = $ionicActionSheet.show({
                destructiveText: 'Delete',
                cancelText: 'Cancel',
                cancel: function() {

                },
                destructiveButtonClicked: function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Delete',
                        template: 'Are you sure you want to delete this comment?'
                    });

                    confirmPopup.then(function(res) {
                        if(res) {
                            comments.splice(index,1);
                            PostComment.delete(comment);
                            if($stateParams.post.comment_info){
                                $stateParams.post.comment_info.count--;
                            }
                            else{
                                $stateParams.post.comment_info = null;
                            }
                            if(comments.length == 0){
                                $scope.is_result_empty = true;
                            }
                            hideSheet();
                        }
                    });
                }
            });
        }
        else{
            var hideSheet = $ionicActionSheet.show({
                destructiveText: 'Report',
                cancelText: 'Cancel',
                cancel: function() {

                },
                destructiveButtonClicked: function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Report',
                        template: 'Are you sure you want to report this comment?'
                    });

                    confirmPopup.then(function(res) {
                        if(res) {
                            PostComment.report(comment);
                            hideSheet();
                        }
                    });
                }
            });
        }
    };
})

.controller('PostExploreCtrl', function($scope, $rootScope, SlideHeader, PostCard, BusinessObjectList, $ionicScrollDelegate, UxAnalytics, $state, $timeout, DirtyHack) {
    var user = $rootScope.getCurrentUser();
    if(user.username == user.email || user.username == ''){
        $state.go('register2').then(function(){
            $timeout(function(){
                window.location.reload();
            },100);
        });
        return;
    }

    $scope.postCard = PostCard;
    $scope.business_object_list_config = {
        type : 'post',
        method : 'explore',
        preload : true
    };

    BusinessObjectList.reset($scope);
    BusinessObjectList.load($scope).then(function(){
        DirtyHack.preventZeroTop();
    });

    $scope.refresh = function(){
        BusinessObjectList.reset($scope);
        $scope.is_list_loading = false;
        BusinessObjectList.load($scope).then(function(){
            DirtyHack.preventZeroTop(900);
        });
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.load = function(){
        $ionicScrollDelegate.scrollTop();
        $scope.list = [];
        $scope.is_list_loading = true;

        BusinessObjectList.render($scope, $scope.preloaded_response);
        BusinessObjectList.preload($scope);
        DirtyHack.preventZeroTop();
    }

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('tab-explore');
        SlideHeader.viewEntered($scope);
    });

    $scope.goPostSearch = function(){
        $state.go('tab.search-explore');
    }
})

.controller('PostSearchCtrl', function($scope, $stateParams, $state, Focus, $rootScope, $timeout, $http, $ionicScrollDelegate, ScrollingDetector, UxAnalytics, FetchSearchResult, Config, SlideHeader) {
    $scope.search_type_active = "tag";
    $scope.searchHolder = "Search hashtags";
    $scope.searchNoResultText = "No hashtags found";
    $scope.searchResult = [];
    $scope.page = 1;
    $scope.mostRecentPostID = 0;
    $scope.noMoreItemsAvailable = false;
    $scope.isSearchRunning = false;
    $scope.noResult = false;
    $scope.search_term = "";
    $scope.need_to_stay_idle_milisec = $rootScope.config.get('need_to_stay_idle_milisec');

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-search');
        SlideHeader.viewEntered($scope);
    });


    $timeout(function(){
        $scope.fetchSearchResult("new", 0, $scope.search_type_active);
    }, 0);

    $timeout(function(){
        Focus("search");
    }, 1000);

    $scope.searchTermTyped = function(_search_term, keyEvent, _need_to_stay_idle_milisec = null){
        var need_to_stay_idle_milisec = _need_to_stay_idle_milisec;
        $scope.search_term = _search_term;

        if (_search_term == undefined)
        {
            $scope.search_term = "_top_posts";
        }
        else
        {
            if (_search_term.length == 1 && _search_term == "#")
            {
                $scope.setType(_search_term, "tag");
                $scope.searchResult = [];
            }
            else if (_search_term.length == 1 && _search_term == "@")
            {
                $scope.setType(_search_term, "people");
                $scope.searchResult = [];
            }
        }

        if (need_to_stay_idle_milisec == null)
        {
            need_to_stay_idle_milisec = $scope.need_to_stay_idle_milisec;
        }

        $scope.page = 1;
        $scope.fetchSearchResult("new", need_to_stay_idle_milisec, $scope.search_type_active);
    }

    $scope.fetchSearchResult = function(type, _need_to_stay_idle_milisec, search_type_active) {
        $scope.noResult = false;
        $scope.isSearchRunning = true;
        if (type == "new" || type == "refresh")
        {
            $scope.searchResult = [];
        }
        FetchSearchResult.typed($scope.mostRecentPostID, $scope.search_term, $scope.search_type_active, $scope.page, _need_to_stay_idle_milisec).then(function(response){
            $scope.isSearchRunning = false;
            if(response.data.length > 0){
                $scope.mostRecentPostID = response.data[response.data.length-1].id;
            }

            if (type == "new" || type == "refresh")
            {
                if (response == "fail" || response === undefined || response.length == 0 || response.data.length == 0)
                {
                    $scope.noResult = true;
                    $scope.noMoreItemsAvailable = true;
                }
                // problem : some times search result sets are duplicated
                // cause : this happens when user click one tab to the other tab fast
                // solution : only show result set when current active type was what requested
                else if($scope.search_type_active == search_type_active)
                {
                    $scope.searchResult = response.data;
                    $scope.noResult = false;
                }
                $scope.noMoreItemsAvailable = false;
            }
            else if (type == "more")
            {
                if (response == "fail" || response === undefined || response.length == 0 || response.data.length == 0)
                {
                    $scope.noMoreItemsAvailable = true;
                }
                // problem : some times search result sets are duplicated
                // cause : this happens when user click one tab to the other tab fast
                // solution : only show result set when current active type was what requested
                else if($scope.search_type_active == search_type_active)
                {
                    $scope.searchResult = $scope.searchResult.concat(response.data);
                }
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
    $scope.loadMore = function() {
    	if ($scope.searchResult.length > 0)
    	{
	        $scope.fetchSearchResult("more", 0, $scope.search_type_active);
    	}
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        $scope.fetchSearchResult("refresh", 0, $scope.search_type_active);
    };
    $scope.showNoSearchResultText = function() {
        return $scope.searchNoResultText;
    };
    $scope.showPlaceHolder = function() {
        return $scope.searchHolder;
    };
    $scope.setType = function(_searchTerm, type, isRefresh) {
    	if ($scope.search_type_active == type)
    	{
    		return;
    	}
        $scope.search_type_active = type;
        $scope.page = 1;
        $scope.mostRecentPostID = 0;
        if (type == "people")
        {
            $scope.searchHolder = "Search users";
            $scope.searchNoResultText = "No users found.";
        }
        else if (type == "tag")
        {
            $scope.searchHolder = "Search hashtags";
            $scope.searchNoResultText = "No hashtags found.";
        }
        else if (type == "goal")
        {
            $scope.searchHolder = "Search looks";
            $scope.searchNoResultText = "No looks found.";
        }
        else
        {
            $scope.searchHolder = "Search";
            $scope.searchNoResultText = "No Results Found";
        }
        $scope.searchTermTyped(_searchTerm, null, 0);
    };
    $scope.submitSearch = function(search_term, type) {
        $state.go('tab.search-result-explore',{searchTerm: search_term, type: type});
    };
    $scope.goSearchPost = function(search_term, type) {
        $scope.submitSearch(search_term, type);
    };
})

.controller('PostSearchResultCtrl', function($scope, SlideHeader, PostCard, BusinessObjectList, $ionicScrollDelegate, UxAnalytics, $stateParams, DirtyHack, SearchFilter) {
    $scope.search_type = "tag";
    $scope.search_term = $stateParams.searchTerm;
    if (typeof $stateParams.type !== 'undefined' && $stateParams.type == 'goal')
    {
        $scope.search_type = "goal";
    }
    $scope.postCard = PostCard;
    $scope.business_object_list_config = {
        type : 'post',
        method : 'search',
        preload : true
    };

    SearchFilter.init();
    BusinessObjectList.reset($scope);
    BusinessObjectList.load($scope).then(function(){
        DirtyHack.preventZeroTop();
    });

    $scope.filter = function(key, val){
        SearchFilter.set(key, val);
        $scope.search_filter = SearchFilter.getAllInfo();
        $scope.refresh(false);
    }

    $scope.refresh = function(is_pull_to_refresh = true){
        BusinessObjectList.reset($scope);
        if(is_pull_to_refresh){
            $scope.is_list_loading = false;
        }
        BusinessObjectList.load($scope).then(function(){
            if(is_pull_to_refresh){
                DirtyHack.preventZeroTop(900);
            }
        });
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.load = function(){
        SearchFilter.set('visible', false);
        $ionicScrollDelegate.scrollTop();
        $scope.list = [];
        $scope.is_list_loading = true;

        BusinessObjectList.render($scope, $scope.preloaded_response);
        BusinessObjectList.preload($scope);
        DirtyHack.preventZeroTop();
    }

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-search-result');
        SlideHeader.viewEntered($scope);
    });

    $scope.showSearchTerm = function(){
        var termSign = "#";
        if ($scope.search_type == "goal")
        {
            termSign = '<i class="fa fa-bolt" aria-hidden="true"></i> ';
        }
        if($stateParams.searchTerm){
            return termSign+$stateParams.searchTerm.trim();
        }
    }
})

.controller('TabCtrl', function($scope, $rootScope, $state, $ionicTabsDelegate, $ionicScrollDelegate, $ionicHistory) {
    $scope.tabClicked = function(clicked_tab_id){
        var current_tab_id = $ionicTabsDelegate.selectedIndex();
        if(current_tab_id == clicked_tab_id){
            var history_info = $ionicHistory.viewHistory();
            if(history_info.currentView.index == 0){
                // problem : in android, "horizontal scroll" of first content rarely works
                // cause : ionic recognize "horizontal scroll" as "pull to refresh"
                // solution : set vertical position to 1
                $ionicScrollDelegate.scrollTo(0, 1, true);
                return;
            }
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true,
                historyRoot: true
            });
        }

        var clicked_tab_key = $rootScope.routeTab(clicked_tab_id);
        switch(clicked_tab_key){
            case 'explore':
                $state.go('tab.explore-explore');
                break;
            case 'home':
                $state.go('tab.home');
                break;
            case 'camera':
                $state.go('tab.post-create-step-1');
                break;
            case 'notification':
                $state.go('tab.notification');
                break;
            case 'account':
                $state.go('tab.account-account');
                break;
            default:
                console.log('Error in tab key');
        }
    }
})

.controller('VoteResultCtrl', function($scope, $rootScope, VoteResult, $ionicLoading, $stateParams, UxAnalytics, SlideHeader) {
    $scope.voteResult = VoteResult;
    $scope.gender_active = 'all';
    $scope.age_active = 'all';
    $scope.photo_array;
    $scope.top_photo_id;

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('vote-result');
        SlideHeader.viewEntered($scope);
    });

    $ionicLoading.show();
    VoteResult.fetch($stateParams.postId).then(function(photo_array) {
        $scope.photo_array = photo_array;
        $ionicLoading.hide();
        $scope.markPhoto($scope.gender_active, $scope.age_active);
    });

    $scope.markPhoto = function(gender, age) {
        $scope.top_photo_id = VoteResult.getTopPhotoId(gender, age, $scope.photo_array);
    }

    $scope.doRefresh = function(){
        VoteResult.fetch($stateParams.postId).then(function(photo_array) {
            $scope.photo_array = photo_array;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.markPhoto($scope.gender_active, $scope.age_active);
        });
    }

    $scope.setGender = function(gender) {
        $scope.gender_active = gender;
        $scope.markPhoto($scope.gender_active, $scope.age_active);
    }

    $scope.setAge = function(age) {
        $scope.age_active = age;
        $scope.markPhoto($scope.gender_active , $scope.age_active);
    }
})

.controller('AccountCtrl', function($scope, $stateParams, FetchUsers, FetchPosts, $http, $state, $rootScope, $ionicActionSheet, $cordovaCamera, $cordovaFile, $ionicLoading, $timeout, UxAnalytics, ImageUpload, PostCard, BusinessObjectList, SlideHeader, $ionicScrollDelegate, DirtyHack) {
    var user = $rootScope.getCurrentUser();

    var method = 'my_profile';
    $scope.profile_user_slug = user.slug;
    if($stateParams.accountSlug != ''){
        method = 'others_profile';
        $scope.profile_user_slug = $stateParams.accountSlug;
    }

    $scope.postCard = PostCard;
    $scope.business_object_list_config = {
        type : 'post',
        method : method,
        preload : true
    };
    var fetchAccount = function(){
        FetchUsers.get($scope.profile_user_slug).then(function(account_info){
            $scope.account_info = account_info;
            $scope.accountImage = $rootScope.photoPath( account_info.profile_img_path, 'l' );

            if (user.id == $scope.account_info.id)
            {
                $scope.isMyAccount = true;
                $rootScope.currentUser = $scope.account_info;
            }
        });
    }

    fetchAccount();
    BusinessObjectList.reset($scope);
    BusinessObjectList.load($scope).then(function(){
        DirtyHack.preventZeroTop();
    });

    if($stateParams.refresh){
        var repeatUntillScrolled = setInterval(function(){
            $ionicScrollDelegate.scrollTo(0, 270, true);
            if($ionicScrollDelegate.getScrollPosition().top == 270){
                clearInterval(repeatUntillScrolled);
            }
        }, 500);
    }

    $scope.refresh = function(){
        fetchAccount();
        BusinessObjectList.reset($scope);
        $scope.is_list_loading = false;
        BusinessObjectList.load($scope).then(function(){
            DirtyHack.preventZeroTop(900);
        });
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.load = function(){
        $ionicScrollDelegate.scrollTop();
        $scope.list = [];
        $scope.is_list_loading = true;

        BusinessObjectList.render($scope, $scope.preloaded_response);
        BusinessObjectList.preload($scope);
        DirtyHack.preventZeroTop();
    }

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('tab-account');
        SlideHeader.viewEntered($scope);
    });

    $scope.changeProfilePicture = function(){
        if ($scope.notMe())
            return;
        // Show the action sheet
        var navCameraSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Take a Picture' },
                { text: 'Choose from Gallery' }
            ],
            titleText: 'Change Profile Picture',
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
                            allowEdit: true,
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
                            allowEdit: true,
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
        var params = {'user_id': user.id };

        ImageUpload.send(fileURL, encodeURI($rootScope.baseURL + '/api/user/'+user.slug+'/editProfilePicture'), success, fail, params);

        function success(result) {
            $ionicLoading.show({template: 'Upload Successful', duration:500});
            $scope.accountImage = $rootScope.photoPath( result.profile_img_path, 'l' );
        }

        // Transfer failed
        function fail(error) {
            $ionicLoading.show({template: 'Upload Failed', duration:500});
        }
    }

    $scope.notMe = function(like) {
        return !$scope.isMyAccount;
    };

})

.controller('OptionCtrl', function($scope, $stateParams, $http, $state, $ionicPopup, $ionicHistory, $rootScope, $timeout, RestartApp, UxAnalytics) {
    $scope.user = $rootScope.getCurrentUser();

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('account-option');
    });

    $scope.goAccountEdit = function(id){
        $state.go('tab.edit-account');
    };
    $scope.goFindFriends = function(id){
        $state.go('tab.find-friends');
    };
    $scope.goInviteFriends = function(id){
        var options = {
            //message: 'Browse outfits to inspire your next look!',
            //subject: 'Browse Outfits to Inspire Your Next Look!',
            url: $rootScope.baseURL + '/s/intro'
        }
        var onSuccess = function(result) {
            console.log("invite succeed");
        }
        var onError = function(msg) {
            console.log("invite failed with message: " + msg);
        }

        UxAnalytics.startScreen('invite-friends');
        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    };
    $scope.goChangePassword = function(id){
        $state.go('tab.change-password');
    };
    $scope.logout = function(id){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Log Out',
            template: 'Are you sure you want to log out?'
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
.controller('AccountEditCtrl', function($scope, FetchUsers, $http, $rootScope, $ionicHistory, UsernameAvailability, BlockerMessage, UxAnalytics) {
    var user = $rootScope.getCurrentUser();
    $scope.usernameClass = '';

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('account-edit');
    });

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
        .success(function(updated_user){
            $rootScope.popupMessage('', 'Changes successfully updated');
            for(i = 0; i < $rootScope.userTrackArray.length; i++){
                thisUser = $rootScope.userTrackArray[i];
                if(thisUser.id == $scope.user.id){
                    thisUser.username = user.username;
                }
            }
            var user_str = JSON.stringify(updated_user);
            localStorage.removeItem('user');
            localStorage.setItem('user', user_str);
            BlockerMessage.init();
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
.controller('ChangePasswordCtrl', function($scope, $stateParams, $http, $state, $location, $rootScope, $ionicHistory, UxAnalytics) {
    var user = $rootScope.getCurrentUser();

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('change-password');
    });

    $scope.changePassword = function(pwd){
        $http({
            method: "POST",
            url: $rootScope.baseURL + '/api/user/' + user.slug + '/password/edit',
            data: pwd
        })
        .success(function(){
            $rootScope.popupMessage('', 'Updates successful');
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
            $rootScope.popupMessage('', 'Invitation has been sent');
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
.controller('FollowingCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope, $timeout, UxAnalytics) {
    var user = $rootScope.getCurrentUser();
    $scope.me = user;
    $scope.users = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('account-following');
    });

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
.controller('FollowerCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope, $timeout, UxAnalytics) {
    var user = $rootScope.getCurrentUser();
    $scope.me = user;
    $scope.users = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $scope.userItself = false;

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('account-follower');
    });

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
.controller('LikedCtrl', function($scope, $stateParams, FetchPosts, $timeout, UxAnalytics) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('account-liked');
    });

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
.controller('NotificationCtrl', function($scope, FetchNotifications, $rootScope, $state, $timeout, UxAnalytics, SlideHeader) {
    var user = $rootScope.getCurrentUser();
    $scope.notifications = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $rootScope.getNotification(0); // pull the notification count immediately.

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('tab-notification');
        SlideHeader.viewEntered($scope);
    });

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
})
.controller('LoyaltyPointsCtrl_deprecated_20190224', function($scope, $rootScope, $state, $timeout, $ionicPopup, UxAnalytics, LoyaltyPoints) {

    $scope.doRefresh = function() {
        $scope.noResult = false;
        LoyaltyPoints.summary().then(function(response){
            $scope.points_history = response.points_history;
            if(response.point_count){
                $scope.point_count = response.point_count;
            }
            else{
                $scope.point_count = 0;
            }
            if(response.ticket_count){
                $scope.ticket_count = response.ticket_count;
            }
            else{
                $scope.ticket_count = 0;
            }
            if(response && response.points_history.length == 0){
                $scope.noResult = true;
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.convert = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Raffle',
            template: 'All points will become raffle tickets for next raffle'
        });

        confirmPopup.then(function(res) {
            if(res) {
                LoyaltyPoints.convert().then(function(){
                    $scope.doRefresh();
                });
            }
        });
    }

    $scope.explainPoint = function(keyword) {
        var alertPopup = $ionicPopup.alert({
            title: 'Point',
            template: 'this is point'
        });
    }

    $scope.explainTicket = function(keyword) {
        var alertPopup = $ionicPopup.alert({
            title: 'Ticket',
            template: 'this is ticket'
        });
    }

    $scope.doRefresh();
});
