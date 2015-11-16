//1. the basic config is in both/router/config.js
//2. routes are in both/router/routes.js
//3. the controllers are defined in both/controllers/...
//4. the access security is handled by useraccounts package and configured in both/accounts/...

//routes for the app
Router.route('/', {
  name: 'home'
});

Router.route('/dashboard', {
  name: 'dashboard',
  controller: 'DashboardController'
});

Router.plugin('ensureSignedIn', {
  only: ['dashboard']
});

