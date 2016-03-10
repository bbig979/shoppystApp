angular.module('starter.controllers', [])

.run(function($rootScope) {
    $rootScope.photoPath = function(file_name, size) {
        return helper_generatePhotoPath( file_name, size );
    };
})

.controller('AuthCtrl', function($scope, $location, $stateParams, $ionicHistory, $http, $state, $auth, $rootScope) {

    $scope.loginData = {}
    $scope.loginError = false;
    $scope.loginErrorText;

    $scope.login = function() {

        var credentials = {
            email: $scope.loginData.email,
            password: $scope.loginData.password
        }

        console.log(credentials);

        $auth.login(credentials).then(function() {
            // Return an $http request for the authenticated user
            $http.get('http://localhost:8888/api/authenticate/user').success(function(response){
                // Stringify the retured data
                var user = JSON.stringify(response.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);

                // Getting current user data from local storage
                $rootScope.currentUser = response.user;
                // $rootScope.currentUser = localStorage.setItem('user');;

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $state.go('tab.dash');
            })
                .error(function(){
                    $scope.loginError = true;
                    $scope.loginErrorText = error.data.error;
                    console.log($scope.loginErrorText);
                })
        });
    }

    $scope.authenticate = function(provider) {
        $auth.authenticate(provider);
    };

})

.controller('DashCtrl', function($scope, ExplorePosts) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    ExplorePosts.all($scope.page).then(function(posts){
        $scope.posts = posts;
        $scope.page++;
    });

    $scope.loadMore = function() {
        ExplorePosts.all($scope.page).then(function(posts){
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
        ExplorePosts.all($scope.page).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
})

.controller('PostDetailCtrl', function($scope, $stateParams, ExplorePosts, $http) {
    $scope.comment = {};
    var user = JSON.parse(localStorage.getItem('user'));
    ExplorePosts.get($stateParams.postId).then(function(post){
        $scope.post = post;
    });
    $scope.submitComment = function(){
        $http({
            method : 'POST',
            url : 'http://localhost:8888/api/post/'+$scope.post.id+'/comment/create',
            data : {comment:$scope.comment.content}
        })
        .success(function(response){
            response.user = user;
            $scope.post.comments.push(response);
        });
        $scope.comment.content = '';
    };
    $scope.remItem = function($index){
        $http.get('http://localhost:8888/api/comment/'+$scope.post.comments[$index].id+'/delete').success(function(){
            $scope.post.comments.splice($index, 1);
        });
    };
    $scope.ownComment = function($index){
        return user.id == $scope.post.comments[$index].user.id;
    };
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
