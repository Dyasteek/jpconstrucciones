/* Requare jQueryHotkeys */

$(window).on("load", function() {
	$(window).lightbox();
});

(function($) {
	$.fn.lightbox = function(options) {
		var settings = $.extend(
			{
				line: "p",
				groupBy: "article",
				containerId: "lightbox",
				bodyClass: "modalOpen"
			},
			options
		);

		var wrapping = function() {
			var group = 0;
			$(settings.groupBy).each(function() {
				$(this)
					.children(settings.line)
					.each(function() {
						var p = $(this),
							images = p.children("img"),
							count = images.length;
						if (p.index() == 0) group++;
						if (images.length > 0) {
							p.addClass("images");
							images.wrap("<span class='image'>");
							$(images).each(function() {
								var image = $(this),
									naturalWidth = image.prop("naturalWidth"),
									naturalHeight = image.prop("naturalWidth");
								image.attr("data-group", group);
								if (Math.max(naturalWidth, naturalHeight) > 500) {
									var link = $("<a href='#'>").on("click", function(e) {
										openLightbox(this);
									});
									image.wrap(link);
								}
							});
							$("img[data-group=" + group + "]").each(function(index) {
								$(this).attr("data-index", index);
							});
						} else {
							group++;
						}
					});
				group++;
			});
		};

		var showImages = function() {
			$(settings.line + " img").addClass("load");
		};

		var resizePlates = function() {
			$(settings.line + ".images").each(function() {
				var p = $(this),
					images = p.find("img"),
					minHeight = images.first().height();
				images.each(function() {
					var currentHeight = $(this).height();
					minHeight = minHeight > currentHeight ? currentHeight : minHeight;
				});
				p.css("height", minHeight);
			});
		};

		function scrollHorizontally(e) {
			e = window.event || e;
			var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
			document.getElementById(settings.containerId).scrollLeft -= delta * 40;
			e.preventDefault();
		}

		function scrollVerticaly(e) {
			e = window.event || e;
			var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
			document.getElementById("lightbox").scrollTop -= delta * 40;
		}

		function scrollKey(e) {
			var lb = document.getElementById("lightbox"),
				amp = 40;
			var key = e.data.keys;
			switch (key) {
				case "left":
					lb.scrollLeft -= amp;
					break;
				case "right":
					lb.scrollLeft += amp;
					break;
				case "up":
					lb.scrollTop -= amp;
					break;
				case "down":
					lb.scrollTop += amp;
					break;
				default:
					break;
			}
		}

		var resizeLightbox = function() {
			var images = $("#" + settings.containerId + " img"),
				alone = images.length,
				direction = 0;
			images.each(setsize);

			function setsize() {
				var img = $(this),
					img_dom = img.get(0),
					container = img.parents("#" + settings.containerId);
				if (img_dom.complete) {
					resize();
				} else img.one("load", resize);

				function resize() {
					var direction = 0;
					if (
						container.width() / container.height() <
						img_dom.width / img_dom.height
					) {
						if (alone == 1) {
							//pano horizontal
							img.width("auto");
							img.height("95%");
							img.css("margin", "0 5%");
							img
								.css("max-width", img_dom.naturalWidth)
								.css("max-height", img_dom.naturalHeight);
							container.css("overflow-x", "scroll").css("overflow-y", "hidden");

							addMouseWell("lightbox", scrollHorizontally);
							$(document).unbind("keydown");
							$(document).bind("keydown", "left", scrollKey);
							$(document).bind("keydown", "right", scrollKey);
						} else {
							//galery horizontal
							img.width("95%");
							img.height("auto");
							img
								.css("max-width", img_dom.naturalWidth * 0.95)
								.css("max-height", img_dom.naturalHeight * 0.95);
							container.css("overflow-x", "hidden").css("overflow-y", "hidden");
						}
					} else {
						if (alone == 1) {
							//pano vertical
							img.width("95%");
							img.height("auto");
							img.css("margin", "5% 0");
							img
								.css("max-width", img_dom.naturalWidth)
								.css("max-height", img_dom.naturalHeight);
							container.css("overflow-x", "hidden").css("overflow-y", "scroll");

							addMouseWell("lightbox", scrollVerticaly);
							$(document).unbind("keydown");
							$(document).bind("keydown", "down", scrollKey);
							$(document).bind("keydown", "up", scrollKey);
						} else {
							//galery vertical
							img.width("auto");
							img.height("95%");
							img
								.css("max-width", img_dom.naturalWidth * 0.95)
								.css("max-height", img_dom.naturalHeight * 0.95);
							container.css("overflow-x", "hidden").css("overflow-y", "hidden");
						}
					}
				}
			}

			return direction;
		};

		var changeImage = function(event) {
			event.stopPropagation();
			var index = $(this).data("index");
			$("#" + settings.containerId + " img")
				.removeClass()
				.off();
			if (index != 0)
				$("#" + settings.containerId + " img")
					.eq(index - 1)
					.addClass("previous")
					.on("click", changeImage);
			$("#" + settings.containerId + " img")
				.eq(index)
				.addClass("current");
			$("#" + settings.containerId + " img")
				.eq(index + 1)
				.addClass("next")
				.on("click", changeImage);
		};

		var closeLightbox = function(event) {
			var lb = $("#" + settings.containerId);
			$(lb).remove();
			$("body").css("overflow", "auto");
			$("body").removeClass(settings.bodyClass);
			$(lb).removeClass("open");
			window.removeEventListener("resize", resizeLightbox);
			window.addEventListener("resize", resizePlates);
			keyUnbind();
		};

		var openLightbox = function(link) {
			event.preventDefault();

			$("body").css("overflow", "hidden");
			$("body").addClass(settings.bodyClass);

			var currentImage = $(link).children("img")[0];
			$("<div id='lightbox'>").appendTo("body");
			var lb = $("#" + settings.containerId);
			function onWheel(e) {
				e = e || window.event;
				var delta = e.deltaY || e.detail || e.wheelDelta;
				if (delta > 0) {
					$("#" + settings.containerId + " .next").click();
				} else {
					$("#" + settings.containerId + " .previous").click();
				}
				e.preventDefault ? e.preventDefault() : (e.returnValue = false);
			}

			groupId = $(currentImage).data("group");
			currentIndex = $(currentImage).data("index");
			group = $("img[data-group=" + groupId + "]");

			group.each(function(index) {
				var image = $(this)
					.clone()
					.appendTo(lb);

				if (index == currentIndex - 1) {
					image.addClass("previous").on("click", changeImage);
					return true;
				}

				if (index == currentIndex) {
					image.addClass("current");
					return true;
				}

				if (index == currentIndex + 1) {
					image.addClass("next").on("click", changeImage);
					return true;
				}
			});

			keyUnbind();

			window.removeEventListener("resize", resizePlates);
			window.addEventListener("resize", resizeLightbox);

			resizeLightbox();

			if (group.length > 1) {
				$(document).unbind("keydown");
				$(document).bind("keydown", "left", function() {
					$("#" + settings.containerId + " .previous").click();
				});
				$(document).bind("keydown", "right", function() {
					$("#" + settings.containerId + " .next").click();
				});
				$(document).bind("keydown", "return", function() {
					event.preventDefault();
					$("#" + settings.containerId + " .next").click();
				});
				addMouseWell("lightbox", onWheel);
			}

			$("body").addClass("modal-open");
			$(lb).addClass("open");

			$(lb).on("click", closeLightbox);
			$(document).bind("keydown", "esc", closeLightbox);
		};

		function addMouseWell(id, callback) {
			var lb = document.getElementById(id);
			if (lb.addEventListener) {
				if ("onwheel" in document) {
					lb.removeEventListener("wheel", callback);
					lb.addEventListener("wheel", callback);
				} else if ("onmousewheel" in document) {
					lb.removeEventListener("mousewheel", callback);
					lb.addEventListener("mousewheel", callback);
				} else {
					lb.removeEventListener("MozMousePixelScroll", callback);
					lb.addEventListener("MozMousePixelScroll", callback);
				}
			} else {
				lb.attachEvent("onmousewheel", callback);
			}
		}
		function keyUnbind() {
			$(document).unbind("keydown");
			$(document).unbind("keyup");
		}
		wrapping();
		showImages();
		window.addEventListener("resize", resizePlates);
		resizePlates();
		return this;
	};
})(jQuery);