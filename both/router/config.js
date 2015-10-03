/**
 * Created by ibox on 19/09/15.
 */
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