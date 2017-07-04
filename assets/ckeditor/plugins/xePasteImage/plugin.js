CKEDITOR.plugins.add('xePasteImage', {
	init: function( editor ) {
		editor.on('paste', function(e) {
			var data = e.data;
			var imageText = data.dataTransfer._.data.Text;

			if (editor.config.perms.upload
				&& data.dataTransfer._.files.length > 0
			) {

				var extensions = editor.config.extensions;
				var fileSize = data.dataTransfer._.files[0].size;
				var extValid = false;
				var currentExt = '';

				var attachFileSize = Utils.sizeFormatToBytes($('#' + editor.name).parent().find('.file-view .currentFilesSize').text()) + fileSize;
				var attachMaxSize = editor.config.attachMaxSize * 1024 * 1024;
				var fileMaxSize = editor.config.fileMaxSize * 1024 * 1024;

				if(Utils.isURL(imageText) && ['jpg', 'jpeg', 'png', 'gif'].indexOf(currentExt) != -1) {
					currentExt = imageText.split('.').pop().split('?').shift().split('#').shift();

				} else if(/data:image\/(png|gif|jpg|jpeg);base64,.*?/.test(imageText)) {
					currentExt = imageText.match(/data:image\/(png|gif|jpg|jpeg);base64,.*?/)[1];
				}

				for (var i = 0; i < extensions.length; i++) {
					var sCurExtension = extensions[i];

					if (sCurExtension === '*') {
						extValid = true;
						break;
					} else if (currentExt.toLowerCase() === sCurExtension.toLowerCase()) {
						extValid = true;
						break;
					}
				}

				if(!extValid) {
					XE.toast('warning', '업로드 가능한 확장자가 아닙니다.');
				} else if(fileSize > fileMaxSize) {
					XE.toast('warning', '업로드 가능한 파일 사이즈가 초과되었습니다.');
				} else if(attachFileSize > attachMaxSize) {
					XE.toast('warning', '최대 업로드 가능한 크기를 초과하였습니다.');
				} else {
					e.cancel();

					var file = e.data.dataTransfer.getFile(0);
					var reader = new FileReader();
					var img = new Image();

					reader.onload = function (e) {
						imageText = e.target.result;

						img.src = imageText;
						img.onload = function () {
							var imgWidth = this.width;
							var imgHeight = this.height;

							var $image = $('<img id="targetImage" src="' + imageText + '" />')
								.css({
									width: imgWidth,
									height: imgHeight
								});

							var canvas = $('<canvas id="targetCanvas" />')[0];
							var ctx = canvas.getContext('2d');
							canvas.width = imgWidth;
							canvas.height = imgHeight;

							ctx.drawImage($image[0], 0, 0, imgWidth, imgHeight);

							var dataUrl = canvas.toDataURL('image/' + currentExt);
							var byteString = atob(dataUrl.split(',')[1]);
							var mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];

							var ab = new ArrayBuffer(byteString.length);
							var ia = new Uint8Array(ab);
							for (var i = 0; i < byteString.length; i++) {
								ia[i] = byteString.charCodeAt(i);
							}

							var blob = new Blob([ab], { "type": mimeString });

							var formData = new FormData();
							var fileName = 'image_' + new Date().getTime() + '.' + currentExt;
							blob.name = fileName;
							formData.append("file", blob, fileName);

							XE.ajax({
								url: editor.config.fileUpload.upload_url,
								type: 'POST',
								processData: false,
								contentType: false,
								data: formData,
								success: function (data) {
									var file = data.file
										, fileName = file.clientname
										, fileSize = file.size
										, id = file.id;

									if($('.file-view').hasClass('xe-hidden')) {
										$('.file-view').removeClass('xe-hidden');
									}

									var fileCount = parseInt($('.fileCount').text(), 10) + 1;

									//file size
									var fileTotalSize = Utils.sizeFormatToBytes($(".currentFilesSize").text()) + fileSize;
									var thumbImageUrl = (data.thumbnails) ? data.thumbnails[2].url : ''
									var tmplImage = [
										'<li>',
										'   <img src="' + thumbImageUrl + '" alt="' + fileName + '">',
										'   <button type="button" class="btn-insert btnAddImage" data-type="image" data-src="' + thumbImageUrl + '" data-id="' + file.id + '"><i class="xi-arrow-up"></i><span class="xe-sr-only">' + XE.Lang.trans("ckeditor::addContentToBody") + '</span></button>',     //본문에 넣기
										'   <button type="button" class="btn-delete btnDelFile" data-id="' + file.id + '" data-size="' + file.size + '"><i class="xi-close-thin"></i><span class="xe-sr-only">' + XE.Lang.trans("ckeditor::deleteAttachment") + '</span></button>',    //첨부삭제
										'   <input type="hidden" name="' + editor.config.names.file.input + '[]" value="' + id + '" />',
										'</li>'
									].join("\n");

									$('.thumbnail-list').append(tmplImage);

									$(".file-view").removeClass("xe-hidden");

									//첨부파일 갯수 표시
									$(".fileCount").text(fileCount);

									//첨부파일 용량 표시
									$(".currentFilesSize").text(Utils.formatSizeUnits(fileTotalSize));

									$('[data-src="' + thumbImageUrl + '"]').trigger('click');
								}
							});
						}
					}

					reader.readAsDataURL(file);
				}
			}
		});
	}
});