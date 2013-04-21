'use strict';

/* Controllers */

var controllers = angular.module('myApp.controllers', []);

// simple controller which exposes board variable from boardService to pk-widget-area directive, see index.html
controllers.controller("WidgetAreasController", ['$scope', 'boardService',
function($scope, boardService) {
	$scope.board = boardService.board;
}]);
