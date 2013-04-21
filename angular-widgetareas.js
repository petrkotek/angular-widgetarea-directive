'use strict';

/* Directives */
var directives = angular.module('pk.widgetAreas', ['ui', 'pk.widgetAreas.config']);

/**
 * UI - default settings for sortable
 */
angular.module('ui.config', [])
.value('ui.config', {
	sortable: {
		placeholder: "placeholder"
	}
});

/**
 * Default config for pkWidgetAreas directive
 */
directives.value('pk.widgetAreas.defaultConfig', {
	widgets: {
		actionsLeft: ['minimize'],
		actionsRight: []
	},
	widgetAreas: {
		actionsLeft: ['minimize'],
		actionsRight: []
	},
	actions: {
		minimize: {
			ngClass: function(options) {
				return {
					'icon-minus' : !options.minimized,
					'icon-plus' : options.minimized
				}
			},
			ngClick: function (options) {
				options.minimized = !options.minimized;
			}
		}
	}
});

/**
 * Config factory
 */
directives.factory('pkWidgetAreaConfig', ['pk.widgetAreas.defaultConfig', 'pk.widgetAreas.config',
function(pkDefaultConfig, pkConfig) {
	return {
		widgetAreas: angular.extend({}, pkDefaultConfig.widgetAreas, pkConfig.widgetAreas),
		widgets: angular.extend({}, pkDefaultConfig.widgets, pkConfig.widgets),
		actions: angular.extend({}, pkDefaultConfig.actions, pkConfig.actions)
	};
}]);

/**
 * Widget areas
 */
directives.directive('pkWidgetAreas', [function() {
	return {
		template:
				'<div class="widget-areas" ng-model="$parent.board" ui-multi-sortable model-subset="widgetAreas" ui-options="uiOptions">' +
					'<div pk-widget-area options="widgetArea.options" ng-repeat="widgetArea in board.widgetAreas" class="widget-area row-fluid">' +
						'<div pk-column options="column.options" ng-repeat="column in widgetArea.columns" ng-model="$parent.board" ui-multi-sortable model-subset="widgetAreas[{{$parent.$parent.$index}}].columns[{{$parent.$index}}].widgets" ui-options="$parent.$parent.columnUiOptions">' +
							'<div pk-widget options="widget.options" ng-repeat="widget in column.widgets"></div>' +
						'</div>' +
					'</div>' +
				'</div>',
		replace: true,
		transclude: true,
		restrict: 'EA',
		scope: {
			board: '='
		},
		link: function(scope) {
			scope.uiOptions = {
				connectWith: '.widget-areas',
				handle: '.widget-area-head',
				placeholder: "widget placeholder"
			};
			scope.columnUiOptions = {
				connectWith: '.column',
				handle: '.widget-head',
				placeholder: "widget placeholder"
			};
		}
	};
}]);

/**
 * Widget area
 */
directives.directive('pkWidgetArea', ['pkWidgetAreaConfig',
function(config) {
	return {
		template:
			'<div class="widget-area" ng-class="{minimized: isMinimized()}">' +
				'<div class="widget-area-head">' +
					'<a ng-repeat="actionLeft in actionsLeft" ng-click="actions[actionLeft].ngClick(options, iElement)"><i class="{{actionLeft}} {{actions[actionLeft].class}}" ng-class="actions[actionLeft].ngClass(options)"></i></a>' +
					'<span class="title">{{options.title}}</span>' +
					'<a ng-repeat="actionRight in actionsRight | reverse" ng-click="actions[actionRight].ngClick(options, iElement)"><i class="pull-right {{actionRight}} {{actions[actionRight].class}}" ng-class="actions[actionRight].ngClass(options)"></i></a>' +
				'</div>' +
			    '<div class="widget-area-content" ng-transclude></div>' +
			'</div>',
		replace: true,
		transclude: true,
		restrict: 'EA',
		scope: {
			options : "="
		},
		link: function(scope, iElement) {
			scope.isMinimized = function() {
				return scope.options.minimized;
			};
			scope.iElement = iElement;

			scope.actionsLeft = config.widgetAreas.actionsLeft;
			scope.actionsRight = config.widgetAreas.actionsRight;
			scope.actions = config.actions;
		}
	};
}]);

/**
 * Widgets Column
 */
directives.directive('pkColumn', [function() {
	return {
		template: '<div class="column span{{width}}" ng-transclude></div>',
		replace: true,
		transclude: true,
		restrict: 'EA',
		scope: {
			options: "="
		},
		link: function(scope) {
			scope.width = scope.options.width;
		}
	};
}]);

/**
 * Widget
 */
directives.directive('pkWidget', ['$compile', '$injector', 'pkWidgetAreaConfig',
function($compile, $injector, config) {
	var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
	var MOZ_HACK_REGEXP = /^moz([A-Z])/;

	/**
	 * Converts snake_case to camelCase.
	 * Also there is special case for Moz prefix starting with upper case letter.
	 * @param name Name to normalize
	 */
	function camelCase(name) {
		return name.
			replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
				return offset ? letter.toUpperCase() : letter;
			}).
			replace(MOZ_HACK_REGEXP, 'Moz$1');
	}

	return {
		replace: true,
		transclude: true,
		restrict: 'EA',
		scope: {
			title: "@",
			options: "="
		},
		link: function(scope, iElement) {
			scope.isMinimized = function() {
				return scope.options.minimized;
			};

			// check options
			if (!scope.options)
				throw 'no options specified';

			// process title
			var title = scope.options.title;
			if (!title)
				throw 'no title specified';

			// process template
			var template;
			var directiveWAConfig = {};
			if (scope.options.directive) {
				// directive for widget specified
				var directiveName = camelCase(scope.options.directive);
				// generate simple template
				template = '<div ' + scope.options.directive + ' options="options"></div>';
				// fetch actionsLeft, actionsRight and actions
				$injector.invoke([directiveName + '.widgetAreasConfig', function(value) { directiveWAConfig = value; }]);
			} else {
				template = scope.options.template;
			}
			if (!template)
				throw 'no options.template neither options.directive specified';

			// construct effective actionsLeft, actionsRight
			// 1. priority: settings from widget's options, 2. priority: settings from directive config, 3. priority: pkWidgetAreas defaults
			scope.actionsLeft = scope.options.actionsLeft || directiveWAConfig.actionsLeft || config.widgets.actionsLeft;
			scope.actionsRight = scope.options.actionsRight || directiveWAConfig.actionsRight || config.widgets.actionsRight;
			// combine available actions
			scope.actions = angular.extend({}, config.actions, directiveWAConfig.actions, scope.options.actions);
			scope.iElement = iElement;

			iElement.html(
				'<div class="widget' + (directiveName ? ' ' + directiveName : '') + '" ng-class="{minimized: isMinimized()}">' +
					'<div class="widget-head">' +
						'<a ng-repeat="actionLeft in actionsLeft" ng-click="actions[actionLeft].ngClick(options, iElement)"><i class="{{actionLeft}} {{actions[actionLeft].class}}" ng-class="actions[actionLeft].ngClass(options)"></i></a>' +
						'<span class="title">' + title + '</span>' +
						'<a ng-repeat="actionRight in actionsRight | reverse" ng-click="actions[actionRight].ngClick(options, iElement)"><i class="pull-right {{actionRight}} {{actions[actionRight].class}}" ng-class="actions[actionRight].ngClass(options)"></i></a>' +
					'</div>' +
					'<div class=widget-content>' + template + '</div>' +
				'</div>'
			);
			var link = $compile(iElement.contents());
			link(scope);
		}
	};
}]);

/* Filters */
directives.filter('reverse', function() {
	return function(items) {
		return items.slice().reverse();
	};
});
