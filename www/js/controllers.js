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

.controller('DashCtrl', function($scope, ExplorePosts, $http, Modified, $state) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
/*
$scope.test = Modified.get();
if($scope.test.index > -1){
    $scope.posts[$scope.test.index].likes_count.aggregate++;
}
console.log($scope.test);
*/
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
    $scope.likeClicked = function($event,post){
        $event.preventDefault();
        if(post.user_liked){
            post.likes_count.aggregate--;
            $http.get('http://localhost:8888/api/post/'+post.id+'/unlike').success(function(){

            });
        }
        else{
            post.likes_count.aggregate++;
            $http.get('http://localhost:8888/api/post/'+post.id+'/like').success(function(){

            });
        }
        post.user_liked = !post.user_liked;
    };
    $scope.commentsPage = function(id){
        $state.go('tab.post-comments',{postId: id});
    };
})

.controller('PostLikersCtrl', function($scope, $stateParams, $http, $location, FetchLikers) {
    $scope.likes = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    var user = JSON.parse(localStorage.getItem('user'));

    FetchLikers.all($stateParams.postId, $scope.page).then(function(likes){
        console.log(likes);
        $scope.likes = likes;
        $scope.page++;
    });
    $scope.loadMore = function() {
        FetchLikers.all($stateParams.postId, $scope.page).then(function(likes){
            $scope.likes = $scope.likes.concat(likes);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( likes.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.followToggle = function(like) {
        if(like.user.following_check){
            $http.get('http://localhost:8888/api/'+ like.user.slug +'/unfollow').success(function(){

            });
        }
        else{
            $http.get('http://localhost:8888/api/'+ like.user.slug +'/follow').success(function(){

            });
        }
        like.user.following_check = !like.user.following_check;
    };
    $scope.notMe = function(like) {
        return (like.user.id != user.id);
    };
})

.controller('PostDetailCtrl', function($scope, $stateParams, ExplorePosts, $http, Focus, $location, Modified) {
    $scope.comment = {};
    $scope.liked = false;
    $scope.saved = false;
    $scope.likesCount = 0;
    $scope.commentsHiddenCount = 0;
    $scope.page = 2;
    var user = JSON.parse(localStorage.getItem('user'));
/*
var test = Modified.get();
test.index = 0;
test.like = 1;
console.log(test);
*/

    ExplorePosts.get($stateParams.postId).then(function(post){
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
        $http({
            method : 'POST',
            url : 'http://localhost:8888/api/post/'+$scope.post.id+'/comment/create',
            data : {comment:$scope.comment.content}
        })
        .success(function(response){
            response.user = user;
            $scope.post.latest_ten_comments.push(response);
        });
        $scope.comment.content = '';
    };
    $scope.remComment = function($index){
        $http.get('http://localhost:8888/api/comment/'+$scope.post.latest_ten_comments[$index].id+'/delete').success(function(){
            $scope.post.latest_ten_comments.splice($index, 1);
        });
    };
    $scope.loadMoreComments = function(){
        if($scope.commentsHiddenCount > 0){
            $http.get('http://localhost:8888/api/post/'+$scope.post.id+'/comment?page='+$scope.page).success(function(response){
                $scope.post.latest_ten_comments = response.data.reverse().concat($scope.post.latest_ten_comments);
                $scope.commentsHiddenCount -= response.data.length;
                if($scope.commentsHiddenCount < 0){
                    $scope.commentsHiddenCount = 0;
                }
                $scope.page++;
            });
        }
    };
    $scope.ownComment = function($index){
        return user.id == $scope.post.latest_ten_comments[$index].user.id;
    };
    $scope.focusComment = function(){
        Focus('comment');
    };
    $scope.likeClicked = function(){
        if($scope.liked){
            $scope.likesCount--;
            $http.get('http://localhost:8888/api/post/'+$scope.post.id+'/unlike').success(function(){

            });
        }
        else{
            $scope.likesCount++;
            $http.get('http://localhost:8888/api/post/'+$scope.post.id+'/like').success(function(){

            });
        }
        $scope.liked = !$scope.liked;
    };
    $scope.loadProfile = function(slug){
        console.log(slug);
        //$location.path('#/tab/dash');
    };
    /*
    $scope.saveClicked = function(){
        if($scope.liked){
            $http.get('http://localhost:8888/api/post/'+$scope.post.id+'/unsave').success(function(){

            });
        }
        else{
            $http.post('http://localhost:8888/api/post/'+$scope.post.id+'/save').success(function(){

            });
        }
        $scope.saved = !$scope.saved;
    };
    */
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
