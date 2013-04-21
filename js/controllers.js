'use strict';

/* Controllers */

var controllers = angular.module('myApp.controllers', []);

// simple controller which exposes board variable from boardService to pk-widget-area directive, see index.html
controllers.controller("WidgetAreaController", ['$scope', 'boardService',
function($scope, boardService) {
	$scope.widgetArea = boardService.widgetArea;
}]);
