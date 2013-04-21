'use strict';

/* Directives */
var directives = angular.module('pk.widgetArea', ['ui', 'pk.widgetArea.config']);

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
 * Default config for pkWidgetArea directive
 */
directives.value('pk.widgetArea.defaultConfig', {
	widgets: {
		actionsLeft: ['minimize'],
		actionsRight: []
	},
	blocks: {
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
directives.factory('pkWidgetAreaConfig', ['pk.widgetArea.defaultConfig', 'pk.widgetArea.config',
function(pkDefaultConfig, pkConfig) {
	return {
		blocks: angular.extend({}, pkDefaultConfig.blocks, pkConfig.blocks),
		widgets: angular.extend({}, pkDefaultConfig.widgets, pkConfig.widgets),
		actions: angular.extend({}, pkDefaultConfig.actions, pkConfig.actions)
	};
}]);

/**
 * Widget area
 */
directives.directive('pkWidgetArea', [function() {
	return {
		template:
				'<div class="widget-area" ng-model="$parent.widgetArea" ui-multi-sortable model-subset="blocks" ui-options="uiOptions">' +
					'<div pk-block options="block.options" ng-repeat="block in widgetArea.blocks" class="block row-fluid">' +
						'<div pk-column options="column.options" ng-repeat="column in block.columns" ng-model="$parent.widgetArea" ui-multi-sortable model-subset="blocks[{{$parent.$parent.$index}}].columns[{{$parent.$index}}].widgets" ui-options="$parent.$parent.columnUiOptions">' +
							'<div pk-widget options="widget.options" ng-repeat="widget in column.widgets"></div>' +
						'</div>' +
					'</div>' +
				'</div>',
		replace: true,
		transclude: true,
		restrict: 'EA',
		scope: {
			widgetArea: '='
		},
		link: function(scope) {
			scope.uiOptions = {
				connectWith: '.widget-area',
				handle: '.block-head',
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
 * Block
 */
directives.directive('pkBlock', ['pkWidgetAreaConfig',
function(config) {
	return {
		template:
			'<div class="block" ng-class="{minimized: isMinimized()}">' +
				'<div class="block-head">' +
					'<a ng-repeat="actionLeft in actionsLeft" ng-click="actions[actionLeft].ngClick(options, iElement)"><i class="{{actionLeft}} {{actions[actionLeft].class}}" ng-class="actions[actionLeft].ngClass(options)"></i></a>' +
					'<span class="title">{{options.title}}</span>' +
					'<a ng-repeat="actionRight in actionsRight | reverse" ng-click="actions[actionRight].ngClick(options, iElement)"><i class="pull-right {{actionRight}} {{actions[actionRight].class}}" ng-class="actions[actionRight].ngClass(options)"></i></a>' +
				'</div>' +
			    '<div class="block-content" ng-transclude></div>' +
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

			scope.actionsLeft = config.blocks.actionsLeft;
			scope.actionsRight = config.blocks.actionsRight;
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
				$injector.invoke([directiveName + '.widgetAreaConfig', function(value) { directiveWAConfig = value; }]);
			} else {
				template = scope.options.template;
			}
			if (!template)
				throw 'no options.template neither options.directive specified';

			// construct effective actionsLeft, actionsRight
			// 1. priority: settings from widget's options, 2. priority: settings from directive config, 3. priority: pkWidgetArea defaults
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
