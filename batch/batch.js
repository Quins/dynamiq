$(document).ready(function() {
	
	$("[data-batch]").batches({
		"example": {
			currentListClass: 		"b-some-current-article", 
			traversedListClass: 	"b-some-traversed-article", 
			currentProgressClass: 	"b-progress-collection-current-clause", 
			traversedProgressClass: "b-progress-collection-traversed-clause", 
			minimumScreenWidth: 	1000 
		}
	});
});

/* Batches */

(function( $ ) {
	$.fn.batches = function(parameters) { return this.each( function() {

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
	})}
})(jQuery);

batches = {};
batchesProperties = {

	"main": {

		forwardDirection: "bottom",
		currentListClass: "b-projects-collection-current-section",
		progressTraversedClass: "b-progress-traversed-clause",
		minimumScreenWidth: 1280
	},
	"prices": {

		forwardDirection: "bottom",
		currentListClass: "b-current-pricing-article",
		progressTraversedClass: "b-progress-traversed-clause",
		progressCurrentClass: "b-progress-current-clause", 
		minimumScreenWidth: 1280
	},
	"about": {

		forwardDirection: "bottom",
		currentListClass: "b-current-about-article",
		progressTraversedClass: "b-progress-traversed-clause",
		progressCurrentClass: "b-progress-current-clause", 
		minimumScreenWidth: 1280
	}
};

batchesActions = {

	"main": {

		first: {

			onShow: function() { 
				$(".b-general-language-button").fadeIn(300);
			},
			onHide: function() { 
				$(".b-general-language-button").fadeOut(300);
				$(".b-projects-collection-quicktip").fadeOut(300);
			}
		}
	},
	"prices": {

		first: {

			onShow: function() { 
				$(".b-pricing-collection").removeClass("b-pricing-kiss");
			},
			onHide: function() { 
				$(".b-pricing-collection").addClass("b-pricing-kiss");
			}
		}
	}
};

function initializeBatches() {

	$("[data-batch]").each(function() {
		
		var batchID = generateIdentificator();
		var batchDescriptor = ($(this).attr("data-batch-descriptor") ? $(this).attr("data-batch-descriptor") : "");
		
		batches[batchID] = {
			
			batch: $(this),
			descriptor: batchDescriptor,
			lists: $(this).children("[data-batch-list]:not([data-batch-delimiter])"),
			currentList: 0,
			progress: $("[data-batch-progress][data-batch-progress-descriptor='" + batchDescriptor + "']"),
			length: $(this).children("[data-batch-list]:not([data-batch-delimiter])").length,
			allItems: $(this).children("[data-batch-list]"),
			totalLength: $(this).children("[data-batch-list]").length,
			locked: false,
			properties: (batchesProperties[batchDescriptor] ? batchesProperties[batchDescriptor] : {})
		};
		
		batches[batchID].batch.attr("data-batch-identificator", batchID);

		setupBatchFlow(batchID);

		batches[batchID].batch.on("mousewheel wheel DOMMouseScroll", function( event ) {

			scrollOnce(batchID, event);
		});

		$(window).on("keyup", function( event ) {

			if (event.keyCode == 39 || event.keyCode == 40) {
				event.preventDefault();
				event.originalEvent.wheelDeltaY = -1;
				flipBatchList(batchID, event);
			} else if (event.keyCode == 37 || event.keyCode == 38) {
				event.preventDefault();
				event.originalEvent.wheelDeltaY = 1;
				flipBatchList(batchID, event);
			}
		});

		batches[batchID].batch.on("turned", function() {

			batches[batchID].locked = false;
		});

		batches[batchID].progress.each( function() {

			$(this).find("[data-batch-progress-step-link]").each( function(index) {

				$(this).click( function(evt) {

					evt.preventDefault();
					if ($(this).data("batch-progress-step-link-list") !== undefined) gotoBatchList(batchID, parseInt($(this).data("batch-progress-step-link-list")), true);
					else gotoBatchList(batchID, index, true);
				});
			});
		});

		var batchTimeout;
		var batchCover = false;
		$(window).resize( function( event ) {

			if (batchTimeout) clearTimeout(batchTimeout);
			if (!batchCover) {

				batchCover = $('<div />', {
					class: "b-general-batch-cover"
				});
				batches[batchID].batch.prepend(batchCover);
			}

			batchTimeout = setTimeout( function() {

				setupBatchFlow(batchID);
				batchCover.detach();
				batchCover = false;
			}, 1000);
		});

	});

}

function setupBatchFlow(batchID) {

	batches[batchID].currentList = 0;

	var population = 0;
	for (var i = 0; i < batches[batchID].totalLength; i++) {

		batches[batchID].allItems.eq(i).css("top", population + "%");
		population += Math.round(100 * batches[batchID].allItems.eq(i).height() / batches[batchID].batch.height());
	}

	recordBatchProgress(batchID);
}

function recordBatchProgress(batchID) {

	if(!batches[batchID])
		return false;

	if(batches[batchID].progress.length) {

		var sp = batches[batchID].batch.height();
		var delimiter = batches[batchID].length - 1;
		while (delimiter > 0 && sp - batches[batchID].lists.eq(delimiter - 1).height() > 0) {

			sp = sp - batches[batchID].lists.eq(delimiter - 1).height();
			delimiter--;
		}

		batches[batchID].progress.each( function() {
			$(this).find("[data-batch-progress-step]").each( function(index) {

				if (batches[batchID].currentList <= delimiter) {
					if (index <= batches[batchID].currentList)
						$(this).addClass(batches[batchID].properties.progressTraversedClass);
					else
						$(this).removeClass(batches[batchID].properties.progressTraversedClass);

					if (index == batches[batchID].currentList)
						$(this).addClass(batches[batchID].properties.progressCurrentClass);
					else
						$(this).removeClass(batches[batchID].properties.progressCurrentClass);
				} else {

					if (index <= delimiter)
						$(this).addClass(batches[batchID].properties.progressTraversedClass).removeClass(batches[batchID].properties.progressCurrentClass);
					else
						$(this).addClass(batches[batchID].properties.progressTraversedClass).addClass(batches[batchID].properties.progressCurrentClass);
				}
			});
		});
	}

}

function flipBatchList(batchID, event) {

	if(!batches[batchID])
		return false;

	if(batches[batchID].locked)
		return false;

	var current = batches[batchID].currentList;
	var $current = batches[batchID].lists.eq( current );

	var next = (current + 1 < batches[batchID].length ? current + 1 : (batches[batchID].properties.loop ? 0 : null) );
	var $next = (next !== null ? batches[batchID].lists.eq( next ) : null);
	var prev = (current - 1 >= 0 ? current - 1 : (batches[batchID].properties.loop ? batches[batchID].length - 1 : null) );
	var $prev = (prev !== null ? batches[batchID].lists.eq( prev ) : null);
	var direction = "none";

	var descriptor = batches[batchID].descriptor;

	if (event.originalEvent.wheelDeltaY < 0) {

		direction = "forward";
	} else if (event.originalEvent.wheelDeltaY > 0) {

		direction = "backward";
	}

	if (direction == "forward" && $next !== null) {
		gotoBatchList(batchID, next);
	} else if (direction == "backward" && $prev !== null) {
		gotoBatchList(batchID, prev);
	} else {
		batches[batchID].batch.trigger("turned");
	}
}

function gotoBatchList(batchID, list, forceGoTo) {

	var duration = 600;

	if(!batches[batchID])
		return false;

	if(batches[batchID].locked)
		return false;
	else
		batches[batchID].locked = true;

	var descriptor = batches[batchID].descriptor;

	var current = batches[batchID].currentList;
	var $current = batches[batchID].lists.eq( current );

	var target = (list < batches[batchID].length ? list : (batches[batchID].properties.loop ? 0 : null) );
	var $target = (target !== null ? batches[batchID].lists.eq( target ) : null);

	var sp = batches[batchID].batch.height();
	var delimiter = batches[batchID].length - 1;
	while (delimiter > 0 && sp - batches[batchID].lists.eq(delimiter - 1).height() > 0) {

		sp = sp - batches[batchID].lists.eq(delimiter - 1).height();
		delimiter--;
	}

	if (target > delimiter) {

		if (!forceGoTo && current > delimiter && current > target)
			target = delimiter;
		else
			target = batches[batchID].length - 1;

		$target = batches[batchID].lists.eq( target );
	}

	if ($target != null && target == batches[batchID].length - 1 && current < batches[batchID].length - 1) {

		var finalstep = Math.round(100 * (parseInt($target.css("top")) - batches[batchID].batch.height() + $target.height() - parseInt($current.css("top"))) / batches[batchID].batch.height());
	}

	if ($current != null && current == batches[batchID].length - 1 && target <= delimiter) {

		var stepcorrection = Math.round(100 * (batches[batchID].batch.height() - $current.height()) / batches[batchID].batch.height());
	}

	if ($target != null && $target.data("batch-list-duration"))
		duration = $target.data("batch-list-duration");

	var step = Math.round(100 * (parseInt($target.css("top")) - parseInt($current.css("top"))) / batches[batchID].batch.height());

	if (finalstep) step = finalstep;
	if (stepcorrection) step += stepcorrection;

	batches[batchID].currentList = target;
	recordBatchProgress(batchID);

	if (batchesActions[descriptor]) {

		if (list == batches[batchID].length - 1 && batchesActions[descriptor].last && batchesActions[descriptor].last.onShow) {
			batchesActions[descriptor].last.onShow();
		} else if (list == 0 && batchesActions[descriptor].first && batchesActions[descriptor].first.onShow) {
			batchesActions[descriptor].first.onShow();
		} else if (batchesActions[descriptor][list] && batchesActions[descriptor][list].onShow) {
			batchesActions[descriptor][list].onShow();
		}

		for (var j = current; (current < list ? j < list : j > list); (current < list ? j++ : j--)) {

			if (j == 0 && batchesActions[descriptor].first && batchesActions[descriptor].first.onHide) {
				batchesActions[descriptor].first.onHide();
			} else if (j == batches[batchID].length - 1 && batchesActions[descriptor].last && batchesActions[descriptor].last.onHide) {
				batchesActions[descriptor].first.onHide();
			} else if (batchesActions[descriptor][j] && batchesActions[descriptor][j].onHide) {
				batchesActions[descriptor][j].onHide();
			}
		}
	}

	var realCurrent = batches[batchID].allItems.index($current);
	var realTarget = batches[batchID].allItems.index($target);

	for (var i = 0; i < batches[batchID].totalLength; i++) {

		if (realCurrent <= realTarget ? i <= realTarget+1 : i >= realTarget) {

			var position = Math.round(100 * parseInt(batches[batchID].allItems.eq(i).css("top")) / batches[batchID].batch.height());

			batches[batchID].allItems.eq(i).animate({
				top: (position - step) + "%"
			}, duration);
		} else {

			var position = Math.round(100 * parseInt(batches[batchID].allItems.eq(i).css("top")) / batches[batchID].batch.height());
			batches[batchID].allItems.eq(i).css("top", (position - step) + "%");
		}
	}

	if (current != target) setTimeout( function() {batches[batchID].batch.trigger("turned");}, duration);
	else batches[batchID].batch.trigger("turned");
}

function scrollOnce(batchID, event) {

	var scrollDelay = 200;

	if(!batches[batchID])
		return false;

	if($(window).width() < batches[batchID].properties.minimumScreenWidth)
		return false;

	event.preventDefault();

	if(!event.originalEvent.wheelDeltaY)
		if(event.originalEvent.deltaY) event.originalEvent.wheelDeltaY = -event.originalEvent.deltaY;

	if(!batches[batchID].longScroll)
		batches[batchID].longScroll = {};
	
	if(!batches[batchID].longScroll.value)
		batches[batchID].longScroll.value = 0;

	if(!batches[batchID].longScroll.locked) {

		batches[batchID].longScroll.locked = true;
		batches[batchID].longScroll.fadeOut = false;
		batches[batchID].longScroll.value = event.originalEvent.wheelDeltaY;
		batches[batchID].longScroll.timeout = setTimeout( resumeScroll, scrollDelay );

		flipBatchList(batchID, event);
	} else {

		if (!scrollContinues( event )) {

			flipBatchList(batchID, event);
		}
		clearTimeout(batches[batchID].longScroll.timeout)
		batches[batchID].longScroll.timeout = setTimeout( resumeScroll, scrollDelay );
	}

	function resumeScroll() {

		batches[batchID].longScroll.locked = false;
		batches[batchID].longScroll.fadeOut = false;
		batches[batchID].longScroll.value = 0;
	}

	function scrollContinues( event ) {

		var sensitivity = 30;
		var continues = true;

		if (batches[batchID].longScroll.value * event.originalEvent.wheelDeltaY < 0) {

			batches[batchID].longScroll.fadeOut = false;
			continues = false;
		} else {

			if (batches[batchID].longScroll.fadeOut) {

				if ( Math.abs(event.originalEvent.wheelDeltaY) > Math.abs(batches[batchID].longScroll.value) ) {

					if ( Math.abs(event.originalEvent.wheelDeltaY) > sensitivity && Math.abs(batches[batchID].longScroll.value) < sensitivity ) {

						batches[batchID].longScroll.fadeOut = false;
						continues = false;
					} else {
						continues = true;
					}
				} else 
					continues = true;
			} else {

				if ( Math.abs(event.originalEvent.wheelDeltaY) < Math.abs(batches[batchID].longScroll.value) ) {
					batches[batchID].longScroll.fadeOut = true;
				}

				continues = true;
			}
		}

		batches[batchID].longScroll.value = event.originalEvent.wheelDeltaY;
		return continues;
	}

}

