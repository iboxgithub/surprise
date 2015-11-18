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

    /*
     // Behavior

     confirmPassword: true,
     enablePasswordChange: true,
     forbidClientAccountCreation: false,
     overrideLoginErrors: true,
     sendVerificationEmail: false,
     lowercaseUsername: false,
     focusFirstInput: true


     // Appearance
     showAddRemoveServices: false,
     showForgotPasswordLink: false,
     showLabels: true,
     showPlaceholders: true,
     showResendVerificationEmailLink: false

     // Client-side Validation
     continuousValidation: false,
     negativeFeedback: false,
     negativeValidation: true,
     positiveValidation: true,
     positiveFeedback: true,
     showValidating: true

     // Privacy Policy and Terms of Use
     privacyUrl: 'privacy',
     termsUrl: 'terms-of-use'

     // Redirects
     homeRoutePath: '/dashboard',
     redirectTimeout: 4000

     // Hooks
     onLogoutHook: myLogoutFunc,
     onSubmitHook: mySubmitFunc,
     preSignUpHook: myPreSubmitFunc

     // Texts
     texts: {
     button: {
     signUp: "Register Now!"
     },
     socialSignUp: "Register",
     socialIcons: {
     "meteor-developer": "fa fa-rocket"
     },
     title: {
     forgotPwd: "Recover Your Password"
     }
     }*/
});