// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'satellizer', 'angularMoment', 'wu.masonry'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $authProvider) {

    $authProvider.loginUrl = 'http://localhost:8000/api/authenticate';
    $authProvider.facebook({
        clientId: '932117430193850'
    });

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
   $stateProvider

    .state('auth', {
        url: '/auth',
        templateUrl: 'templates/login.html',
        controller: 'AuthCtrl'
    })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })

   .state('tab.post-detail-home', {
       url: '/post/:postId/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/post-detail.html',
               controller: 'PostDetailCtrl'
           }
       }
   })

   .state('tab.post-detail-explore', {
       url: '/post/:postId/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/post-detail.html',
               controller: 'PostDetailCtrl'
           }
       }
   })

   .state('tab.post-comments-home', {
       url: '/post/:postId/comments/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/post-comments.html',
               controller: 'PostDetailCtrl'
           }
       }
   })

   .state('tab.post-likers-home', {
       url: '/post/:postId/likers/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/post-likers.html',
               controller: 'PostLikersCtrl'
           }
       }
   })

   .state('tab.post-likers-explore', {
       url: '/post/:postId/likers/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/post-likers.html',
               controller: 'PostLikersCtrl'
           }
       }
   })

   .state('tab.explore-home', {
       url: '/explore/:searchTerm/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/tab-explore.html',
               controller: 'PostExploreCtrl'
           }
       }
   })

   .state('tab.explore-explore', {
       url: '/explore/:searchTerm/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/tab-explore.html',
               controller: 'PostExploreCtrl'
           }
       }
   })

  .state('tab.camera', {
      url: '/camera',
      views: {
        'tab-camera': {

        }
      }
    })
    .state('tab.ranking', {
      url: '/ranking',
      views: {
        'tab-ranking': {

        }
      }
    })

  .state('tab.account', {
     url: '/account',
     views: {
         'tab-account': {
             templateUrl: 'templates/tab-account.html',
             controller: 'AccountCtrl'
         }
     }
  })
  .state('tab.option-account', {
     url: '/option',
     views: {
         'tab-account': {
             templateUrl: 'templates/tab-option.html',
             controller: 'OptionCtrl'
         }
     }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});
