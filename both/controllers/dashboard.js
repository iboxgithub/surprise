//1. the basic config is in both/router/config.js
//2. routes are in both/router/routes.js
//3. the controllers are defined in both/controllers/...
//4. the access security is handled by useraccounts package and configured in both/accounts/...

//here we define if we need some specific data

DashboardController = AppController.extend({
  waitOn: function() {
    return [
        this.subscribe('operations_dashboard'),
        this.subscribe('cloud'),
        this.subscribe('files')
        ]
  },
  data: {
    //items: Items.find({})
  },
  onAfterAction: function () {
    //Meta.setTitle('Dashboard');,
  }
});

DashboardController.events({
  'click [data-action=doSomething]': function (event, template) {
    event.preventDefault();
  }
});
