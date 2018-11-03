angular.module('starter.controllers', [])
.run(function($rootScope, $ionicTabsDelegate, $state, $ionicPlatform, $ionicPopup, $ionicActionSheet, $timeout, $cordovaCamera, $ionicLoading, $ionicHistory, $location, $ionicBackdrop, $stateParams, $http, $ionicScrollDelegate, ComparePostSet, CameraPictues, $cordovaSocialSharing, FetchShareLink, Wait, RestartApp, FetchNotifications, BlockerMessage, UxAnalytics, Config, ShareWatcher, Tutorial) {
    $rootScope.clientVersion = '1.0';
    $rootScope.minimumForceUpdateVersion = "";
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
    $rootScope.blockerMessage = BlockerMessage;
    $rootScope.notificationPullInterval = 60000;
    Config.init().then(function(){
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

    $rootScope.shareCompare = function() {
        UxAnalytics.startScreen('share-compare');
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
                    ShareWatcher.setShared($stateParams.postIds);
                    Tutorial.triggerIfNotCompleted('tutorial_after_share');
                }
                var onError = function(msg) {
                    console.log("Sharing failed with message: " + msg);
                }
                window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
            }
            else{
                $rootScope.popupMessage('Oops', 'You cannot send other\'s look');
            }
            $ionicLoading.hide();
        });
    }
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
    $rootScope.linkHashTagAndOccasion = function(post){
        var content = post.content;
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());

        if(content){
            content = content.replace(/(#[a-z\d-_]+)/ig, "<a href='#/tab/search/$1/tag/"+tab+"'>$1</a>");
            content = content.replace(/(\/#)/g, "/");
        }
        if(post.occasion != null){
            content += ' <a href="#/tab/search/' + post.occasion.name + '/occasion/' + tab + '">' +
                '<i class="fa fa-map-marker" aria-hidden="true"></i> ' +
                post.occasion.name + '</a>';
        }

        return content;
    };
    $rootScope.goPostDetail = function(id, user, posts, index){
        if (!$rootScope.canClickInList()) {
            return;
        }
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-detail-'+tab,{postId: id, user: user, posts: posts, index: index});
    };
    $rootScope.goPostCompare = function(ids, should_show_send = false){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-compare-'+tab,{postIds: ids, shouldShowSend: should_show_send});
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

    $timeout(
        function(){
            $rootScope.getNotification(0);
        }, 500
    )

    setInterval(function() {$rootScope.getNotification($rootScope.notificationPullInterval);}, $rootScope.notificationPullInterval + 500);
})
.controller('PostCreateCtrl', function(LoyaltyPoints, $scope, FetchOccasions, $state, $stateParams, $rootScope, $cordovaFile, $ionicLoading, $ionicHistory, $location, CameraPictues, $timeout, UxAnalytics, $http, Tutorial, $ionicScrollDelegate, ImageUpload) {
    $scope.visibility = 'friend';
    $scope.submitted = false;
    $location.replace('tab.camera');
    $scope.data = { "ImageURI" :  "Select Image" };
    $scope.occasionList = new Array();
    $scope.shopOptionalOccasion = false;
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
        Tutorial.triggerIfNotCompleted('tutorial_welcome');
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
    });

    FetchOccasions.get().then(function(response){
        occasions = response;
        for (index = 0; index < occasions.length; ++index) {
            $scope.occasionList.push({value: occasions[index].id, label: occasions[index].name});
        }
        $scope.occasionList.push({value: 'other', label: 'Other'});
    });

    LoyaltyPoints.visit();

    $scope.sharePost = function(captions, occasion, other) {
        var fileURLs = CameraPictues.get();
        var share_post_scope = this;
        var postIdArray = [];
        var uploadTryCount = 0;
        var uploadSuccessCount = 0;
        var param_caption = '';
        if (typeof captions != 'undefined')
        {
            param_caption = captions;
        }

        $scope.submitted = true;
        $ionicLoading.show({template: 'Uploading Photo...'});

        if(fileURLs.length < 2){
            $ionicLoading.hide();
            $rootScope.popupMessage('', 'You Need at Least 2 Looks to Compare');
            $scope.submitted = false;
            return;
        }

        for(var i=0; i<fileURLs.length; i++){
            data = {
                captions: param_caption,
                user_id: user.id,
                occasion: occasion,
                other: other,
                visibility: $scope.visibility,
            };
            ImageUpload.send(fileURLs[i], encodeURI($rootScope.baseURL + '/api/post/create'), success, fail, data);
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
                postIdArray.push(result.id);
            }
            if(uploadTryCount == fileURLs.length && uploadSuccessCount > 0){
                $ionicScrollDelegate.scrollTop();
                $ionicLoading.show({
                    template: 'Upload Success ( ' + uploadSuccessCount + ' / ' + uploadTryCount + ' )',
                    duration:500
                });
                var postIds = postIdArray.join(',');
                $http.post($rootScope.baseURL+'/api/compare/'+postIds+'/create');
                $scope.submitted = false;
                $scope.visibility = 'friend';
                share_post_scope.occasion = undefined;
                share_post_scope.captions = undefined;
                uploadTryCount = 0;
                uploadSuccessCount = 0;
                postIdArray = [];
                $timeout(function(){
                    CameraPictues.reset();
                    localStorage.setItem('timestamp_post_shared', new Date().getTime());
                    $state.go('tab.post-compare-temp', {postIds: postIds, isThisAfterShare: true, shouldShowSend: true});
                }, 500);
            }
        }

        // Transfer failed
        function fail(error) {
            uploadTryCount++;
            if(uploadTryCount == fileURLs.length && uploadSuccessCount == 0){
                $ionicLoading.show({template: 'Upload Fail', duration:500});
                $scope.submitted = false;
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
    $scope.reset = function() {
        CameraPictues.reset();
        this.captions = '';
        this.occasion = null;
        $ionicScrollDelegate.scrollTop();
    }
    $scope.hasContent = function(){
        return CameraPictues.get().length > 0 ||
            (typeof(this.captions) !== 'undefined' && this.captions !== '') ||
            (typeof(this.occasion) !== 'undefined' && this.occasion !== null)
    }
    $scope.setActive = function(visibility){
      $scope.visibility = visibility;
    }
    $scope.isActive = function(visibility){
      return visibility === $scope.visibility;
    }
    $scope.isVisibleFriend = function(){
        return $scope.visibility == 'friend';
    }
    $scope.isVisiblePublic = function(){
        return $scope.visibility == 'public';
    }
    $scope.isVisiblePermanent = function(){
        return $scope.visibility == 'permanent';
    }
})
.controller('PostEditCtrl', function($scope, $http, $stateParams, $rootScope, FetchPosts, $ionicHistory, $ionicLoading, UxAnalytics) {
    $scope.post = $stateParams.post;

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-edit');
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

.controller('TutorialCtrl',function($scope, Tutorial, Config, BlockerMessage){
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
        $state.go('tab.post-create');
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
                    $state.go('tab.post-create');
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
                            $state.go('tab.post-create');
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
    $scope.registerData = {};
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
                $state.go('tab.post-create');
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

.controller('AuthCtrl', function($scope, $location, $stateParams, $ionicHistory, $http, $state, $auth, $rootScope, $ionicLoading, $q, UxAnalytics) {

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
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $ionicLoading.hide();
                $state.go('tab.post-create');
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
                    $state.go('tab.post-create');
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
                            $state.go('tab.post-create');
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
.controller('HomeCtrl', function($scope, FetchPosts, $http, $state, $rootScope, $stateParams, $ionicActionSheet, $ionicLoading, $ionicPopup, $timeout, ComparePosts, NewPost, $ionicScrollDelegate, ScrollingDetector, UxAnalytics) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $scope.comparePosts = ComparePosts;
    $scope.mostRecentPostID = 0;
    $scope.newPostAvailable = false;
    $scope.loadingNewPost = false;
    $rootScope.getNotification(0); // pull the notification count immediately.

    var user = $rootScope.getCurrentUser();

    $http.get($rootScope.baseURL+'/api/app/'+noAngularVar_device+'/'+noAngularVar_deviceID).success(function(){});

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('tab-home');
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

.controller('PostDetailCtrl', function($scope, $stateParams, FetchPosts, $http, Focus, $rootScope, $ionicActionSheet, $ionicHistory, $ionicLoading, $state, $ionicPopup, ComparePosts, UxAnalytics) {
    //$scope.post = 0; // sloppy hack for not loaded check
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
    var user = $rootScope.getCurrentUser();

    $scope.$on('$ionicView.enter', function() {
        if($state.current.name == 'tab.post-comments-home'){
            UxAnalytics.startScreen('post-comments');
        }
        else{
            UxAnalytics.startScreen('post-detail');
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
            $scope.posts = [post];
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
    $scope.remComment = function(index){
        $http.get($rootScope.baseURL+'/api/comment/'+$scope.post.latest_ten_comments[index].id+'/delete').success(function(){
            $scope.post.latest_ten_comments.splice(index, 1);
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
        if($scope.post.latest_ten_comments && $scope.post.latest_ten_comments[$index]){
            return user.id == $scope.post.latest_ten_comments[$index].user.id;
        }
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
                $scope.posts = [post];
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

.controller('PostExploreCtrl', function($scope, FetchPosts, $stateParams, $state, Focus, $rootScope, $timeout, $http, ComparePosts, NewPost, $ionicScrollDelegate, ScrollingDetector, UxAnalytics) {
    $scope.tab = $state.current['name'].split("-")[1];
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $scope.showSample = false;
    $scope.comparePosts = ComparePosts;
    $scope.mostRecentPostID = 0;
    $scope.newPostAvailable = false;
    $scope.loadingNewPost = false;
    $scope.last_align_class = 'right-align';
    $scope.last_set_ids = 0;

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('tab-explore');

        if($scope.noResult){
            $scope.loadingNewPost = true;
            $scope.doRefresh();
        }
        if($scope.posts.length > 0){
            NewPost.isAvailable('explore', $scope.mostRecentPostID).then(function(response){
                $scope.newPostAvailable = response;
            });
        }
    });
    $scope.fetchPost = function(type) {
        FetchPosts.new($scope.mostRecentPostID, $scope.page, "", "tag", $scope.last_align_class, $scope.last_set_ids).then(function(response){
            posts = response.data;
            $scope.last_align_class = posts[posts.length-1].align_class;
            $scope.last_set_ids = posts[posts.length-1].set_ids;
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
        $scope.last_align_class = 'right-align';
        $scope.last_set_ids = 0;
        NewPost.resetFlags('explore');
        $scope.fetchPost("refresh");
    };
    $scope.goPostSearch = function(){
        $state.go('tab.search-explore');
    }
})

.controller('PostSearchCtrl', function($scope, $stateParams, $state, Focus, $rootScope, $timeout, $http, ComparePosts, Tutorial, $ionicScrollDelegate, ScrollingDetector, UxAnalytics, FetchSearchResult, Config) {
    $scope.search_type_active = "tag";
    $scope.searchHolder = "Search hashtags";
    $scope.searchNoResultText = "No Results Found";
    $scope.searchResult = [];
    $scope.page = 1;
    $scope.mostRecentPostID = 0;
    $scope.noMoreItemsAvailable = false;
    $scope.isSearchRunning = false;
    $scope.noResult = false;
    $scope.comparePosts = ComparePosts;
    $scope.search_term = "";
    $scope.need_to_stay_idle_milisec = 500;
    Config.init().then(function(){
        var result = Config.get('need_to_stay_idle_milisec');
        if (result)
        {
            $scope.need_to_stay_idle_milisec = result;
        }
    });

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-search');
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
                if (response == "fail" || response === undefined || response.length == 0)
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
                if (response == "fail" || response === undefined || response.length == 0)
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
        $scope.fetchSearchResult("more", 0, $scope.search_type_active);
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
        $scope.page = 1;
        $scope.mostRecentPostID = 0;
        $scope.search_type_active = type;
    };
    $scope.submitSearch = function(search_term, type) {
        $state.go('tab.search-result-explore',{searchTerm: search_term, type: type});
    };
    $scope.goSearchPost = function(search_term, type) {
        $scope.submitSearch(search_term, type);
    };
})

.controller('PostSearchResultCtrl', function($scope, FetchPosts, $stateParams, $state, Focus, $rootScope, $timeout, $http, ComparePosts, Tutorial, NewPost, $ionicScrollDelegate, ScrollingDetector, UxAnalytics) {
    $scope.searchNoResultText = "No Results Found";
    $scope.searchType = "tag";
    if (typeof $stateParams.type !== 'undefined' && $stateParams.type == 'occasion')
    {
        $scope.searchType = "occasion";
    }
    $scope.tab = $state.current['name'].split("-")[1];
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $scope.comparePosts = ComparePosts;
    $scope.mostRecentPostID = 0;
    $scope.last_align_class = 'right-align';
    $scope.last_set_ids = 0;

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-search-result');
    });
    $scope.fetchPost = function(type) {
        FetchPosts.new($scope.mostRecentPostID, $scope.page, $stateParams.searchTerm, $scope.searchType, $scope.last_align_class, $scope.last_set_ids).then(function(response){
            posts = response.data;
            $scope.last_align_class = posts[posts.length-1].align_class;
            $scope.last_set_ids = posts[posts.length-1].set_ids;
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
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        $scope.mostRecentPostID = 0;
        $scope.last_align_class = 'right-align';
        $scope.last_set_ids = 0;
        NewPost.resetFlags('explore');
        $scope.fetchPost("refresh");
    };
    $scope.showSearchTerm = function(){
        var termSign = "";
        if ($scope.searchType == "tag")
        {
            termSign = "#";
        }
        if($stateParams.searchTerm){
            return termSign+$stateParams.searchTerm.trim();
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
.controller('PostCompareCtrl', function($scope, FetchPosts, $state, Focus, $rootScope, $http, ComparePostSet, $ionicLoading, $stateParams, Tutorial, UxAnalytics, FetchShareLink, ShareWatcher) {
    var user = $rootScope.getCurrentUser();
    $scope.showInstruction = true;
    $scope.comparePostSet = ComparePostSet;
    $scope.gender_active = 'all';
    $scope.age_active = 'all';
    $scope.post_id_array = $stateParams.postIds.split(',');
    $scope.post_array;
    $scope.top_post_id;
    $scope.is_this_shared = true;
    $scope.visibility = 'permanent';

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('post-compare');
    });
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

    if($stateParams.shouldShowSend == 'true'){
        Tutorial.triggerIfNotCompleted('tutorial_first_compare');
        FetchShareLink.exist($stateParams.postIds).then(function(is_this_shared){
            if(is_this_shared == 'false'){
                $scope.is_this_shared = false;
            }
        });
    }

    $ionicLoading.show();
    ComparePostSet.fetch($scope.post_id_array).then(function(post_array) {
        $scope.post_array = post_array;
        $scope.visibility = post_array[0].visibility;
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
    $scope.isThisNotSharedYet = function(){
        // if we get the 'not shared' flag from ajax call
        if(! $scope.is_this_shared && $scope.visibility == 'friend'){
            // start share watcher client side
            return ! ShareWatcher.isShared($stateParams.postIds);
        }
        return false;
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
.controller('AccountCtrl', function($scope, $stateParams, FetchUsers, FetchPosts, $http, $state, $rootScope, $ionicActionSheet, $cordovaCamera, $cordovaFile, $ionicLoading, $timeout, ComparePosts, Tutorial, UxAnalytics, ImageUpload) {
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
    $rootScope.getNotification(0); // pull the notification count immediately.
    $scope.last_align_class = 'right-align';
    $scope.last_set_ids = 0;

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('tab-account');
        if(localStorage.getItem('timestamp_post_shared') > localStorage.getItem('timestamp_account_tab_clicked')){
            $scope.doRefresh();
        }
        localStorage.setItem('timestamp_account_tab_clicked', new Date().getTime());
    });

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

    if($stateParams.refresh){
        $scope.doRefresh();
    }
    else if (user.id) {
        FetchUsers.get($scope.currentSlug).then(function(account_info){
            $scope.account_info = account_info;
            $scope.accountImage = $rootScope.photoPath( account_info.profile_img_path, 's' );

            if (user.id == $scope.account_info.id)
            {
                $scope.isMyAccount = true;
                $rootScope.currentUser = $scope.account_info;
            }
        });
        FetchPosts.user($scope.currentSlug, $scope.activatedTab, $scope.page, $scope.last_align_class, $scope.last_set_ids).then(function(response){
            posts = response.data;
            $scope.last_align_class = posts[posts.length-1].align_class;
            $scope.last_set_ids = posts[posts.length-1].set_ids;
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
        var params = {'user_id': user.id };

        ImageUpload.send(fileURL, encodeURI($rootScope.baseURL + '/api/user/'+user.slug+'/editProfilePicture'), success, fail, params);

        function success(result) {
            $ionicLoading.show({template: 'Upload Success', duration:500});
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
        if($scope.page > 1){
            FetchPosts.user($scope.currentSlug, $scope.activatedTab, $scope.page, $scope.last_align_class, $scope.last_set_ids).then(function(response){
                posts = response.data;
                $scope.last_align_class = posts[posts.length-1].align_class;
                $scope.last_set_ids = posts[posts.length-1].set_ids;
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
        else{
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
    };
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.page = 1;
        $scope.posts = [];
        $scope.activatedTab = 'new';
        $scope.last_align_class = 'right-align';
        $scope.last_set_ids = 0;

        FetchUsers.get($scope.currentSlug).then(function(account_info){
            $scope.account_info = account_info;
            if (user.id == account_info.id)
            {
                $rootScope.currentUser = account_info;
            }
        });
        FetchPosts.user($scope.currentSlug, $scope.activatedTab, $scope.page, $scope.last_align_class, $scope.last_set_ids).then(function(response){
            posts = response.data;
            $scope.last_align_class = posts[posts.length-1].align_class;
            $scope.last_set_ids = posts[posts.length-1].set_ids;
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
        $scope.last_align_class = 'right-align';
        $scope.last_set_ids = 0;

        FetchPosts.user($scope.currentSlug, tab, $scope.page, $scope.last_align_class, $scope.last_set_ids).then(function(response){
            $scope.$broadcast('scroll.infiniteScrollComplete');
            posts = response.data;
            $scope.last_align_class = posts[posts.length-1].align_class;
            $scope.last_set_ids = posts[posts.length-1].set_ids;
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
.controller('OptionCtrl', function($scope, $stateParams, $http, $state, $ionicPopup, $ionicHistory, $rootScope, $timeout, RestartApp, UxAnalytics) {
    $scope.user = $rootScope.getCurrentUser();

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('account-option');
    });

    $scope.goAccountEdit = function(id){
        $state.go('tab.edit-account');
    };
    $scope.goLoyaltyPoints = function(id){
        $state.go('tab.loyalty-points-account');
    };
    $scope.goFindFriends = function(id){
        $state.go('tab.find-friends');
    };
    $scope.goInviteFriends = function(id){
        var options = {
            message: 'which looks better?',
            subject: 'Which Looks Better?',
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
            $rootScope.popupMessage('Message', 'Profile Has been updated');
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
.controller('NotificationCtrl', function($scope, FetchNotifications, $rootScope, $state, $timeout, UxAnalytics) {
    var user = $rootScope.getCurrentUser();
    $scope.notifications = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
    $rootScope.getNotification(0); // pull the notification count immediately.

    $scope.$on('$ionicView.enter', function() {
        UxAnalytics.startScreen('tab-notification');
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
.controller('LoyaltyPointsCtrl', function($scope, $rootScope, $state, $timeout, $ionicPopup, UxAnalytics, LoyaltyPoints) {

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
