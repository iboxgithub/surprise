//1. the basic config is in both/router/config.js
//2. routes are in both/router/routes.js
//3. the controllers are defined in both/controllers/...
//4. the access security is handled by useraccounts package and configured in both/accounts/...


Router.configure({
    layoutTemplate: 'appLayout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'/*,
     waitOn: function() {
     return [Meteor.subscribe('notifications')]
     }*/
});




/*
 AccountsTemplates.configure({
 defaultLayout: 'home'
 });

 AccountsTemplates.configureRoute('home', {
 name: 'home',
 path: '/',
 template: 'home',
 //layoutTemplate: 'myLayout',
 redirect: function(){
 var user = Meteor.user();
 if (user)
 Router.go('/account'); //Router.go('/account/' + user._id);
 }
 });*/

/*AccountsTemplates.configureRoute('account', {
 name: 'account',
 path: '/account',
 template: 'account'
 });*/