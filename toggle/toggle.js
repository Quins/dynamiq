/* Toggles */

(function( $ ) {
	$.fn.toggles = function(parameters) { return this.each( function() {

		"use strict"; // To be sure this code has no surprises

		var init; // Declaring variables
		var batch = {
			entity: $(this), 
			descriptor: ($(this).data("batch-descriptor") ? $(this).data("batch-descriptor") : "") // If no descriptor specified, initialized with empty string descriptor
		}

		// Defining initialization function for future uses and calling it once
		(init = function() {
			// If no parameters specified for this descriptor, initializing with empty properties. Else, copying specified 
			if (!parameters || !parameters[batch.descriptor]) batch.properties = {};
			else batch.properties = parameters[batch.descriptor];

			// Extending defaults with descriptor properties
			batch.properties = $.extend({
				      currentListClass: "g-current", 
				    traversedListClass: "g-traversed", 
				  currentProgressClass: "g-current", 
				traversedProgressClass: "g-traversed"
			}, batch.properties);

			batch.listsRepository = (batch.properties.listsRepository ? $(batch.properties.listsRepository) : batch.entity);
		})();

			var toggle = {
				descriptor: ($(this).data("toggle-descriptor") ? $(this).data("toggle-descriptor") : ""), 
				entity: $(this), 
				on: false, 
				targets: []
			};

			toggle.properties = $.extend({
				toggleOnOutsideClick: false
			}, parameters[toggle.descriptor]);

			$("[data-toggle-target][data-toggle-target-descriptor='" + toggle.descriptor + "']").each( function(i) {

				toggle.targets[i] = {

					entity: $(this),
					toggleClass: $(this).data('toggle-target-class')
				}

				$(this).on("toggle", function(event) {

					toggle.on = event.state;
				});
			});

			toggle.entity.click( function(event) {

				event.preventDefault();
				$(document).unbind("mouseup").unbind("touchend");

				$.each(toggle.targets, function(i, e) {

					e.entity.toggleClass(e.toggleClass);
				});

				if (toggle.on) {

					emittoggle(false);
				} else {

					emittoggle(true);

					if (toggle.properties.toggleOnOutsideClick) {

						$(document).on("mouseup touchend", function (event) {

							var outside = 0;

							$.each(toggle.targets, function(i,e) {

								var container = e.entity;

								if (!container.is(event.target) && container.has(event.target).length === 0) {

									outside += 1;
								}
							});

							if (outside == toggle.targets.length && !toggle.entity.is(event.target) && toggle.entity.has(event.target).length === 0) {

								$.each(toggle.targets, function(i, e) {

									e.entity.toggleClass(e.toggleClass);
								});
								emittoggle(false);
								$(document).unbind("mouseup").unbind("touchend");
							}
						});
					}
				}
			});

			function emittoggle(state) {

				var e = $.Event( "toggle" );
				e.state = state;

				$("[data-toggle-target][data-toggle-target-descriptor='" + toggle.descriptor + "']").each(function() {

					$(this).trigger(e);
				});
			}
	})};
})(jQuery);