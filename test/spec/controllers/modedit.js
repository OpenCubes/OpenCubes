'use strict';

describe('Controller: ModeditCtrl', function () {

  // load the controller's module
  beforeEach(module('dashboardApp'));

  var ModeditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ModeditCtrl = $controller('ModeditCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
