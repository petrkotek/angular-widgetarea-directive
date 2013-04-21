var services = angular.module('myApp.services', []);

services.service('boardService', ['$parse', function($parse) {
	// definition of a board (widget areas)
	var board = {
		widgetAreas:[
			{
				options: {
					title: 'Widget Area 0'
				},
				columns: [
					{
						options: {
							width: 2
						},
						widgets: [
							{options: {title : 'Widget 0.0', template: '<h3 ng-show="1">Visible header</h3><h3 ng-hide="1">Hidden header</h3><p>There is hidden header between this text an the visible header to show that ng-show, ng-hide and other ng tags work fine.</p>'}},
							{
								options: {
									title: 'Widget 0.0',
									template: '<div app-text-widget options="options"></div>',
									actionsRight: ['settings'],
									actions: {
										settings: {
											class: 'icon-cog',
											ngClick: function(options) {
												options.editMode = !options.editMode;
											}
										}
									},
									data : "Donec pulvinar congue leo at aliquam. Proin enim tellus, sodales lobortis condimentum sit amet, tempor nec tortor."
								}
							}
						]
					}, {
						options: {
							width: 2
						},
						widgets: [
							{
								options: {
									title: 'Widget 0.1',
									directive: 'app-text-widget',
									data: "G'day morbi, rutrum porttitor sagittis going? Suspendisse eget eros ligula, sollicitudin iaculis arcu. Proin fringilla tristique orci a vehicula."
								}
							}
						]
					}, {
						options: {
							width: 7
						},
						widgets: [
							{options: {title : 'Widget 0.2', template: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}}
						]
					}, {
						options: {
							width: 1
						},
						widgets: [
							{options: {title : 'Widget 0.3', template: 'Integer vehicula dui nec libero feugiat sit amet mollis leo bibendum.'}}
						]
					}
				]
			}, {
				options: {
					title: 'Widget Area 1'
				},
				columns: [
					{
						options: {
							width: 4
						},
						widgets: [
							{options: {title : 'Widget 1.0', template: 'Vivamus vel nibh ac mi sollicitudin dignissim.'}},
							{options: {title : 'Widget 1.0', template: 'Proin magna dolor, adipiscing vitae eleifend eget, suscipit ut nulla.'}}
						]
					}, {
						options: {
							width: 4
						},
						widgets: [
							{options: {title : 'Widget 1.1', template: 'Nam accumsan, nunc nec molestie sagittis, tellus purus rhoncus leo, sit amet dictum ipsum quam gravida nisi.'}}
						]
					}, {
						options: {
							width: 4
						},
						widgets: [
							{options: {title : 'Widget 1.2', template: 'Aenean ut imperdiet tortor. Fusce scelerisque porta iaculis. Integer mi mi, dignissim quis ultricies sed, dictum a ipsum.'}}
						]
					}
				]
			}
		]
	};

	// service exposes delete function and board structure
	return {
		delete : function(iElement) {
			var subset = iElement.parent().attr('model-subset');
			var index = iElement.index();
			($parse(subset)(board)).splice(index, 1);
		},
		board : board
	}
}]);
