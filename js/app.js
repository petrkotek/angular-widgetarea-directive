'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', ['pk.widgetAreas', 'myApp.directives', 'myApp.controllers', 'myApp.services']);

// config factory, which can define default actions on left & right side
angular.module('pk.widgetAreas.config', [])
.factory('pk.widgetAreas.config', ['boardService',
function(boardService) {
	return {
		// default actions for widgetAres
		widgetAreas: {
			actionsRight: ['deleteWidgetArea']
		},
		// default actions for widgets
		widgets: {
			actionsRight: ['deleteWidget']
		},
		// definition of actions behavior
		// class = class added to the <i> element under <a>
		// ngClick = function called on click; takes two parameters: options, iElement
		actions: {
			deleteWidget: {
				class: 'icon-remove',
				ngClick: function(options, iElement) {
					if (confirm("Do you want to delete widget '" + options.title + "'?")) {
						boardService.delete(iElement);
					}
				}
			},
			deleteWidgetArea: {
				class: 'icon-remove',
				ngClick: function(options, iElement) {
					if (confirm("Do you want to delete widget area '" + options.title + "'?")) {
						boardService.delete(iElement);
					}
				}
			}
		}
	}
}]);
