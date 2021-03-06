//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
//                                                                      //
// If you are using Chrome, open the Developer Tools and click the gear //
// icon in its lower right corner. In the General Settings panel, turn  //
// on 'Enable source maps'.                                             //
//                                                                      //
// If you are using Firefox 23, go to `about:config` and set the        //
// `devtools.debugger.source-maps-enabled` preference to true.          //
// (The preference should be on by default in Firefox 24; versions      //
// older than 23 do not support source maps.)                           //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Accounts = Package['accounts-base'].Accounts;

/* Package-scope variables */
var Guests, res;

(function () {

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// packages/wenape:accounts-guest/accounts-guest-client.js                            //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
// 'use strict'; reinstate when https://github.com/meteor/meteor/issues/2437 is fixed // 1
                                                                                      // 2
var constructor = (function() {                                                       // 3
    /***                                                                              // 4
     * Creates an instance of Guests                                                  // 5
     * @constructor                                                                   // 6
     */                                                                               // 7
    function Guests() {                                                               // 8
      /*settings = settings || {};                                                    // 9
      _.defaults(settings, this.defaultSettings);                                     // 10
                                                                                      // 11
        this._notificationsCollection = new Meteor.Collection(null);                  // 12
        this._notificationTimeout = undefined;                                        // 13
      this.settings = settings;*/                                                     // 14
    }                                                                                 // 15
                                                                                      // 16
    /***                                                                              // 17
     * Adds a Guest User                                                              // 18
     */                                                                               // 19
    Guests.prototype.add = function () {                                              // 20
      if (!Meteor.userId()) {                                                         // 21
        res = Accounts.createUser({password: Meteor.uuid(), username: Meteor.uuid(), profile: {guest: "guest", name: 'Guest'}});
        console.log(res);                                                             // 23
      }                                                                               // 24
    };                                                                                // 25
                                                                                      // 26
    /* make anonymous users kinda non-users -- just ids                               // 27
    * this allows the account-base "Sign-in" to still appear */                       // 28
                                                                                      // 29
    Meteor.user = function () {                                                       // 30
      var userId = Meteor.userId();                                                   // 31
      if (!userId) {                                                                  // 32
        return null;                                                                  // 33
      }                                                                               // 34
      var user = Meteor.users.findOne(userId);                                        // 35
      if (user !== undefined &&                                                       // 36
          user.profile !== undefined &&                                               // 37
          user.profile.guest) {                                                       // 38
        return null;                                                                  // 39
      }                                                                               // 40
      return user;                                                                    // 41
    };                                                                                // 42
                                                                                      // 43
  /*Guests.prototype.defaultSettings = {                                              // 44
    hideAnimationProperties: {                                                        // 45
      height: 0,                                                                      // 46
      opacity: 0,                                                                     // 47
      paddingTop: 0,                                                                  // 48
      paddingBottom: 0,                                                               // 49
      marginTop: 0                                                                    // 50
    },                                                                                // 51
    animationSpeed: 400                                                               // 52
  };*/                                                                                // 53
                                                                                      // 54
                                                                                      // 55
    return Guests;                                                                    // 56
})();                                                                                 // 57
                                                                                      // 58
Guests = new constructor();                                                           // 59
                                                                                      // 60
                                                                                      // 61
////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['wenape:accounts-guest'] = {
  Guests: Guests
};

})();
