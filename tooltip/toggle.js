/* Tooltips */

(function( $ ) {
	$.fn.tooltips = function(options) {

		if (!options) var options = {}; // If no options specified, generate empty options variable

		return this.each( function() {

			var tooltip = {
				descriptor: $(this).data("tooltip-descriptor") || "", 
				reason: $(this), 
				visible: false, 
				entity: false
			}; // Tooltip private helper object

			if (!options[tooltip.descriptor]) options[tooltip.descriptor] = {}; // Empty options for current descriptor

			/*
			Tooltip will be spawned inside sibling 
			with data-tooltip-target attribute and 
			proper descriptor, or else inside this.
			*/
			tooltip.target = (tooltip.descriptor !== "" ? ($(this).siblings("[data-tooltip-target][data-tooltip-target-descriptor='" + tooltip.descriptor + "']") || $(this)) : $(this));

			tooltip.properties = $.extend({
				hideOnOutsideClick: true, 
				stickOn: false, 
				showOn: "hover", 
				template: '<div class="g-tooltip">%contents%</div>'
			}, options[tooltip.descriptor]); // Extending default properties with given options

			/*
			Parsing template for variable names inside 
			percentages (like this – %var%)
			*/
			var varlist = tooltip.properties.template.match(/%(\w+)%/g);
			// For each variable name trying to find proper data-attribute and
			// spawn its contents inside template
			for (var i = 0; i < varlist.length; i++) {
				varlist[i] = varlist[i].replace(/^%|%$/g, '');
				if ($(this).data("tooltip-" + varlist[i])) {

					var re = new RegExp("%" + varlist[i] + "%", "g");
					tooltip.properties.template = tooltip.properties.template.replace(re, $(this).data("tooltip-" + varlist[i]));
				}
			}

			// Creating and storing new jQuery object from template
			tooltip.entity = $(tooltip.properties.template);

			/*
			If this gets clicked, we check if we should display tooltip or not
			and change properties for helper object
			*/
			$(this).unbind("click").click( function(e) {

				e.preventDefault();

				if (tooltip.entity && tooltip.properties.showOn === "click") {
					if (!tooltip.visible) {
						if (tooltip.properties.stickOn === "click") tooltip.sticky = true;
						tooltip.visible = true;
						tooltip.target.append(tooltip.entity);
						if (tooltip.properties.hideOnOutsideClick) $(document).unbind("mouseup", attachOutsideClick).unbind("touchend", attachOutsideClick).on("mouseup touchend", attachOutsideClick);
					} else {
						tooltip.entity.detach();
						tooltip.visible = false;
						tooltip.sticky = false;
						$(document).unbind("mouseup", attachOutsideClick).unbind("touchend", attachOutsideClick);
					}
				}
			});

			/*
			If this gets hovered, we check if we should display tooltip or not
			and change properties for helper object
			*/
			$(this).unbind("hover").hover( function(e) {

				if (tooltip.entity && tooltip.properties.showOn === "hover") {

					if (tooltip.properties.stickOn === "hover") tooltip.sticky = true;
					tooltip.visible = true;
					tooltip.target.append(tooltip.entity);
				}

			}, function(e) {

				if (!tooltip.sticky && tooltip.visible) {
					tooltip.visible = false;
					tooltip.entity.detach();
				}
			});

			/*
			Function closes tooltip if click was outside 
			the tooltip and tooltip opener
			*/
			function attachOutsideClick(event) {

				if (tooltip.entity.has(event.target).length === 0 && !tooltip.reason.is(event.target)) {

					tooltip.entity.detach();
					tooltip.visible = false;
					tooltip.sticky = false;
					$(document).unbind("mouseup", attachOutsideClick).unbind("touchend", attachOutsideClick);
				}
			}

		});
	};
})(jQuery);

