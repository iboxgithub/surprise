/**
 * Created by ibox on 20/09/15.
 */
AccountsTemplates.configureRoute('signIn', {layoutTemplate: 'appLayout'});
//AccountsTemplates.configureRoute('signUp', {layoutTemplate: 'appLayout'});
AccountsTemplates.configureRoute('ensureSignedIn', {layoutTemplate: 'appLayout'});

AccountsTemplates.configure({
    // Behavior
    forbidClientAccountCreation: true
});