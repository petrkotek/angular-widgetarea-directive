'use strict';

var directives = angular.module('myApp.directives', []);

// widget directive, which can be displayed in widget area
directives.directive('appTextWidget', [function() {
	return {
		scope: {
			options : "="
		},
		template:
			'<span ng-hide="options.editMode">{{options.data}}</span>' +
			'<textarea ng-show="options.editMode" ng-model="options.data"></textarea>'
		,
		link: function(scope) {
			scope.options.editMode = false;
		}
	};
}]);
// directive needs to define ".widgetAreasConfig" in following structure
directives.value('appTextWidget.widgetAreasConfig', {
	// actions displayed on left side (null = keep defaults, [] = none, ['action1', action2] = two actions; strings refer to object in actions. see below);
	actionsLeft: null,
	// actions displayed on right side (same structure as actionsLeft)
	actionsRight: ['deleteWidget', 'appTextWidgetSettings'],
	// definitions of actions
	// class = added css class to the button
	// ngClick = function called on click; takes options and iElement parameters
	actions: {
		appTextWidgetSettings: {
			class: 'icon-cog',
			ngClick: function(options) {
				options.editMode = !options.editMode;
			}
		}
	}
});
