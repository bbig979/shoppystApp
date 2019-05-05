// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'satellizer', 'angularMoment', 'ngCordova'])

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

.config(function($stateProvider, $urlRouterProvider, $authProvider, $ionicConfigProvider) {
  /*
    if(!(ionic.Platform.isIOS() && ionic.Platform.version() < 9)){
      $ionicConfigProvider.scrolling.jsScrolling(false);
    }
  */
    if(ionic.Platform.isAndroid()){
        $ionicConfigProvider.views.transition('none');
    }
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');
    //var baseURL = 'http://app.snaplook.today';
    //var baseURL = 'http://localhost:8000';
    //var baseURL = 'http://192.168.56.1:8000';
    var baseURL = 'http://localhost:8888';
    $authProvider.loginUrl = baseURL+'/api/authenticate';
    $authProvider.facebook({
        clientId: '932117430193850',
        url: baseURL+'/auth/facebook',
        redirectUri: 'http://localhost/'
    });

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
   $stateProvider
    .state('intro', {
       url: '/intro',
       templateUrl: 'templates/intro.html',
       controller: 'IntroCtrl'
    })
    .state('root', {
        url: '/root',
        controller: 'RootCtrl'
    })
    .state('auth', {
        url: '/auth',
        templateUrl: 'templates/login.html',
        controller: 'AuthCtrl'
    })
    .state('register', {
       url: '/register',
       templateUrl: 'templates/register.html',
       controller: 'RegisterCtrl'
    })
    .state('register2', {
       url: '/register2',
       templateUrl: 'templates/register2.html',
       controller: 'Register2Ctrl',
       params: {
           email: null,
           password: null
       }
    })
    .state('forgetpassword', {
       url: '/forgetPassword',
       templateUrl: 'templates/forget-password.html',
       controller: 'ForgetPasswordCtrl'
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
        },
        params: {
           refresh: null
        }
    })
    .state('tab.vote-result-home', {
       url: '/vote/result/:postId/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/vote-result.html',
               controller: 'VoteResultCtrl'
           }
       }
    })
    .state('tab.vote-result-explore', {
       url: '/vote/result/:postId/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/vote-result.html',
               controller: 'VoteResultCtrl'
           }
       }
    })
    .state('tab.vote-result-notification', {
       url: '/vote/result/:postId/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/vote-result.html',
               controller: 'VoteResultCtrl'
           }
       }
    })
    .state('tab.vote-result-account', {
       url: '/vote/result/:postId/account',
       views: {
           'tab-account': {
               templateUrl: 'templates/vote-result.html',
               controller: 'VoteResultCtrl'
           }
       }
    })
    .state('tab.photo-detail-home', {
       url: '/photo/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/photo-detail.html',
               controller: 'PhotoDetailCtrl'
           }
       },
       params: {
          photo: null
       }
    })
    .state('tab.photo-detail-explore', {
       url: '/photo/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/photo-detail.html',
               controller: 'PhotoDetailCtrl'
           }
       },
       params: {
          photo: null
       }
    })
    .state('tab.photo-detail-notification', {
       url: '/photo/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/photo-detail.html',
               controller: 'PhotoDetailCtrl'
           }
       },
       params: {
          photo: null
       }
    })
    .state('tab.photo-detail-account', {
       url: '/photo/account',
       views: {
           'tab-account': {
               templateUrl: 'templates/photo-detail.html',
               controller: 'PhotoDetailCtrl'
           }
       },
       params: {
          photo: null
       }
    })
    .state('tab.post-comments-home', {
       url: '/post/comments/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/post-comments.html',
               controller: 'PostCommentCtrl'
           }
       },
       params: {
         post: null
       }
    })
    .state('tab.post-comments-explore', {
       url: '/post/comments/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/post-comments.html',
               controller: 'PostCommentCtrl'
           }
       },
       params: {
         post: null
       }
    })
    .state('tab.post-comments-notification', {
       url: '/post/comments/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/post-comments.html',
               controller: 'PostCommentCtrl'
           }
       },
       params: {
         post: null
       }
    })
    .state('tab.post-comments-account', {
       url: '/post/comments/account',
       views: {
           'tab-account': {
               templateUrl: 'templates/post-comments.html',
               controller: 'PostCommentCtrl'
           }
       },
       params: {
         post: null
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
    .state('tab.post-likers-notification', {
       url: '/post/:postId/likers/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/post-likers.html',
               controller: 'PostLikersCtrl'
           }
       }
    })
    .state('tab.post-likers-account', {
       url: '/post/:postId/likers/account',
       views: {
           'tab-account': {
               templateUrl: 'templates/post-likers.html',
               controller: 'PostLikersCtrl'
           }
       }
    })
    .state('tab.explore-home', {
       url: '/explore/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/tab-explore.html',
               controller: 'PostExploreCtrl'
           }
       }
    })
    .state('tab.explore-explore', {
       url: '/explore/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/tab-explore.html',
               controller: 'PostExploreCtrl'
           }
       }
    })
    .state('tab.explore-notification', {
       url: '/explore/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/tab-explore.html',
               controller: 'PostExploreCtrl'
           }
       }
    })
    .state('tab.explore-account', {
       url: '/explore/account',
       views: {
           'tab-account': {
               templateUrl: 'templates/tab-explore.html',
               controller: 'PostExploreCtrl'
           }
       }
    })
    .state('tab.search-explore', {
       url: '/search/',
       views: {
           'tab-explore': {
               templateUrl: 'templates/post-search.html',
               controller: 'PostSearchCtrl'
           }
       }
    })
    .state('tab.search-result-home', {
       url: '/search/:searchTerm/:type/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/post-search-result.html',
               controller: 'PostSearchResultCtrl'
           }
       }
    })
    .state('tab.search-result-explore', {
       url: '/search/:searchTerm/:type/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/post-search-result.html',
               controller: 'PostSearchResultCtrl'
           }
       }
    })
    .state('tab.search-result-notification', {
       url: '/search/:searchTerm/:type/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/post-search-result.html',
               controller: 'PostSearchResultCtrl'
           }
       }
    })
    .state('tab.search-result-account', {
       url: '/search/:searchTerm/:type/account',
       views: {
           'tab-account': {
               templateUrl: 'templates/post-search-result.html',
               controller: 'PostSearchResultCtrl'
           }
       }
    })
    .state('tab.post-create', {
      url: '/post/create',
      views: {
        'tab-camera': {
          templateUrl: 'templates/post-create.html',
          controller: 'PostCreateCtrl'
        }
      }
    })
    .state('tab.post-create-step-1', {
      url: '/post/create/step/1',
      views: {
        'tab-camera': {
          templateUrl: 'templates/post-create-step-1.html',
          controller: 'PostCreateStep1Ctrl'
        }
      },
      params: {
        refresh: null
      }
    })
    .state('tab.post-create-step-2', {
      url: '/post/create/step/2',
      views: {
        'tab-camera': {
          templateUrl: 'templates/post-create-step-2.html',
          controller: 'PostCreateStep2Ctrl'
        }
      },
      params: {
        refresh: null
      }
    })
    .state('tab.post-edit', {
      url: '/post/edit',
      views: {
        'tab-account': {
          templateUrl: 'templates/post-edit.html',
          controller: 'PostEditCtrl'
        }
      },
      params: {
        post: null
      }
    })
    .state('tab.account-home', {
        url: '/account/:accountSlug/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    })
	.state('tab.account-explore', {
	   url: '/account/:accountSlug/explore',
	   views: {
	       'tab-explore': {
	           templateUrl: 'templates/tab-account.html',
	           controller: 'AccountCtrl'
	       }
	   }
	})
	.state('tab.account-notification', {
	   url: '/account/:accountSlug/notification',
	   views: {
	       'tab-notification': {
	           templateUrl: 'templates/tab-account.html',
	           controller: 'AccountCtrl'
	       }
	   }
	})
	.state('tab.account-account', {
	   url: '/account/:accountSlug/account',
	   views: {
	       'tab-account': {
	           templateUrl: 'templates/tab-account.html',
	           controller: 'AccountCtrl'
	       }
	   },
	   params: {
	       refresh: null,
	       activateTab: null,
	       isThisAfterShare: false
	   }
	})

	.state('tab.option-account', {
	 url: '/option',
	 views: {
	     'tab-account': {
	         templateUrl: 'templates/account-option.html',
	         controller: 'OptionCtrl'
	     }
	 }
	})
	.state('tab.edit-account', {
	 url: '/option/edit',
	 views: {
	     'tab-account': {
	         templateUrl: 'templates/account-edit.html',
	         controller: 'AccountEditCtrl'
	     }
	 }
	})
    .state('tab.loyalty-points-account', {
	 url: '/option/loyalty_points',
	 views: {
	     'tab-account': {
	         templateUrl: 'templates/account-loyalty-points.html',
	         controller: 'LoyaltyPointsCtrl'
	     }
	 }
	})
	.state('tab.find-friends', {
	 url: '/find-friends',
	 views: {
	     'tab-account': {
	         templateUrl: 'templates/find-friends.html',
	         controller: 'FindFriendsCtrl'
	     }
	 }
	})
	.state('tab.invite-friends', {
	 url: '/invite-friends',
	 views: {
	     'tab-account': {
	         templateUrl: 'templates/invite-friends.html',
	         controller: 'InviteFriendsCtrl'
	     }
	 }
	})
	.state('tab.change-password', {
	 url: '/change-password',
	 views: {
	     'tab-account': {
	         templateUrl: 'templates/change-password.html',
	         controller: 'ChangePasswordCtrl'
	     }
	 }
	})

    .state('tab.account-following-home', {
        url: '/account/:userSlug/following/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/account-following.html',
                controller: 'FollowingCtrl'
            }
        }
    })
    .state('tab.account-following-explore', {
       url: '/account/:userSlug/following/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/account-following.html',
               controller: 'FollowingCtrl'
           }
       }
    })
    .state('tab.account-following-notification', {
       url: '/account/:userSlug/following/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/account-following.html',
               controller: 'FollowingCtrl'
           }
       }
    })
    .state('tab.account-following-account', {
       url: '/account/:userSlug/following/account',
       views: {
           'tab-account': {
               templateUrl: 'templates/account-following.html',
               controller: 'FollowingCtrl'
           }
       },
       params: {
           user: null
       }
    })
    .state('tab.account-follower-home', {
        url: '/account/:userSlug/follower/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/account-follower.html',
                controller: 'FollowerCtrl'
            }
        }
    })
    .state('tab.account-follower-explore', {
       url: '/account/:userSlug/follower/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/account-follower.html',
               controller: 'FollowerCtrl'
           }
       }
    })
    .state('tab.account-follower-notification', {
       url: '/account/:userSlug/follower/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/account-follower.html',
               controller: 'FollowerCtrl'
           }
       }
    })
    .state('tab.account-follower-account', {
       url: '/account/:userSlug/follower/account',
       views: {
           'tab-account': {
               templateUrl: 'templates/account-follower.html',
               controller: 'FollowerCtrl'
           }
       },
       params: {
           user: null
       }
    })

    .state('tab.account-liked-home', {
       url: '/account/:userSlug/liked/home',
       views: {
           'tab-home': {
               templateUrl: 'templates/account-liked.html',
               controller: 'LikedCtrl'
           }
       }
    })
    .state('tab.account-liked-explore', {
       url: '/account/:userSlug/liked/explore',
       views: {
           'tab-explore': {
               templateUrl: 'templates/account-liked.html',
               controller: 'LikedCtrl'
           }
       }
    })
   .state('tab.account-liked-notification', {
       url: '/account/:userSlug/liked/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/account-liked.html',
               controller: 'LikedCtrl'
           }
       }
   })
   .state('tab.account-liked-account', {
       url: '/account/:userSlug/liked/account',
       views: {
           'tab-account': {
               templateUrl: 'templates/account-liked.html',
               controller: 'LikedCtrl'
           }
       }
   })
   .state('tab.notification', {
       url: '/notification',
       views: {
           'tab-notification': {
               templateUrl: 'templates/tab-notification.html',
               controller: 'NotificationCtrl'
           }
       }
   })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/root');

});
moment.updateLocale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s",
        s:  "1m",
        m:  "1m",
        mm: "%dm",
        h:  "1h",
        hh: "%dh",
        d:  "1d",
        dd: "%dd",
        M:  "1m",
        MM: "%dm",
        y:  "1y",
        yy: "%dy"
    }
});
