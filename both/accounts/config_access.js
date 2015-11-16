/**
 * to configure the useraccounts module
 * we force everyone wanting to use the app to be logged in
 */

//1. the basic config is in both/router/config.js
//2. routes are in both/router/routes.js
//3. the controllers are defined in both/controllers/...
//4. the access security is handled by useraccounts package and configured in both/accounts/...


AccountsTemplates.configureRoute('signIn', {layoutTemplate: 'appLayout'});
//AccountsTemplates.configureRoute('signUp', {layoutTemplate: 'appLayout'});
AccountsTemplates.configureRoute('ensureSignedIn', {layoutTemplate: 'appLayout'});

AccountsTemplates.configure({
    // Behavior
    forbidClientAccountCreation: true
});