"use strict";

$(function() {

	var resizeImage = function(imageObject, maxWidth, maxHeight) {
		var $image = $(imageObject);
        var $tempImage = $('<img>');

        $tempImage.on('load', function() {
			// 처음 resize 할 때 이미지 크기 기록
			if ($image.data('width') === undefined) {
				$image.data('width', $image.width());
				$image.data('height', $image.height());
			}
            var width = $image.data('width');
            var height = $image.data('height');

            var size = makeResizeDimension(width, height, maxWidth, maxHeight);

            $image.width(size[0]);
            $image.height(size[1]);
			$image.show();
        });

        $tempImage.attr('src', $image.attr('src'));
	};

    var makeResizeDimension = function(width, height, maxWidth, maxHeight) {
        var ratio = getResizeRatio(width, height, maxWidth, maxHeight);

        var dimension = [width, height];
        if (ratio > 0) {
            dimension = [width * ratio, height * ratio];
        }
        return dimension;
    };

    var getResizeRatio = function(width, height, maxWidth, maxHeight) {
        var ratio = 0;

        if (width > maxWidth && height > maxHeight && maxWidth !=0 && maxHeight != 0 ) {
            var widthRatio = maxWidth / width,
                heightRatio = maxHeight / height;

            ratio = widthRatio < heightRatio ? widthRatio : heightRatio;
        } else if (width > maxWidth) {
            ratio = maxWidth / width;
        }  else if (height > maxHeight) {
            ratio = maxHeight / height;
        }

        return ratio;
    };

    // image resize
    $('.__xe_contents_compiler .__xe_image').each(function() {
        var $canvas = $(this).parents('.__xe_contents_compiler'),
            maxWidth = $canvas.width(),
            maxHeight = 0;

		resizeImage(this, maxWidth, maxHeight);
    });

    $(window).resize(function() {
		var timeout = window.resizeImageTimeout;
		if (timeout) {
			clearTimeout(timeout);
		}
		window.resizeImageTimeout = setTimeout(function() {
			window.resizeImageTimeout = null;
			$('.__xe_contents_compiler .__xe_image').each(function() {
				var $canvas = $(this).parents('.__xe_contents_compiler'),
					maxWidth = $canvas.width(),
					maxHeight = 0;
				resizeImage(this, maxWidth, maxHeight);
			});
		}, 200);
	});
});
