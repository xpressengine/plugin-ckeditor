"use strict";

(function(XE) {

    var DOCUMENT_DRAGDROP_INSTANCE;
    var editors = [];

    /**
     * global drag drop event
     *
     * @param editor
     */
    var setDocumentDragDrop = function() {
        $(document).bind('drop dragover', function (e) {
            e.preventDefault();
        });

        $(document).bind('dragover', function (e) {
            for (var i in editors) {
                var editor = editors[i];

                var dropZone = $(editor.container.$),
                    timeout = window.dropZoneTimeout,
                    $drag_here = dropZone.find(".drag-here");

                if (timeout) {
                    clearTimeout(timeout);
                }

                dropZone.addClass('drag-over');
                $drag_here.css({
                  height: $(editor.container.$).height(),
                  paddingTop: $(editor.container.$).find('.cke_top').height() + 50 + 'px'
                });
                $drag_here.show();
            }

            window.dropZoneTimeout = setTimeout(function () {
                window.dropZoneTimeout = null;
                for (var i in editors) {
                    var editor = editors[i];

                    var dropZone = $(editor.container.$),
                        $drag_here = dropZone.find(".drag-here");

                    dropZone.removeClass('drag-over');
                    $drag_here.hide();
                }
            }, 100);
        });
    };

    var fileUploadPlugin = function () {
        this.init = function(editor) {
            this.editor = editor;

            editors.push(editor);
            if(DOCUMENT_DRAGDROP_INSTANCE === undefined) {
                DOCUMENT_DRAGDROP_INSTANCE = new setDocumentDragDrop();
            }

            var $container = $(editor.container.$),
                $innerIframe = $($container.find(".cke_wysiwyg_frame")[0].contentDocument),
                dropzone = $container.add($innerIframe),
                $fileuploadInput = $container.parent().find('.fileupload');

            $container.append('<div class="drag-here">이곳에 파일을 드래그하여 업로드합니다.</div>');

            this.setFrameDragDrop();

            this.setFileInput();
        };

        this.setFrameDragDrop = function() {
            var editor = this.editor,
                $container = $(editor.container.$),
                $innerIframe = $($container.find(".cke_wysiwyg_frame")[0].contentDocument);
            /**
             * disable document drag drop event
             */
            $($innerIframe).bind('drop dragover', function (e) {
                e.preventDefault();
            });
            $($innerIframe).bind('dragover', function (e) {
                var dropZone = $(editor.container.$),
                    timeout = window.dropZoneTimeout;

                var  $drag_here = dropZone.find(".drag-here");

                if(timeout) {
                    clearTimeout(timeout);
                }

                dropZone.addClass('drag-over');
                $drag_here.height($(editor.container.$).height());
                $drag_here.show();

                window.dropZoneTimeout = setTimeout(function () {
                    window.dropZoneTimeout = null;
                    dropZone.removeClass('drag-over');
                    $drag_here.hide();
                }, 100);
            });
        };

        this.setFileInput = function() {
            var editor = this.editor,
                $container = $(editor.container.$),
                $innerIframe = $($container.find(".cke_wysiwyg_frame")[0].contentDocument),
                dropzone = $container.add($innerIframe),
                $fileuploadInput = $container.parent().find('.fileupload');

            var _fileuploadPlugin = this;

            $fileuploadInput.each(function(index){

                var self = this;
                var name = $(this).attr('name');

                var config = {
                    url: editor.config.fileUpload.upload_url,
                    dataType: 'json',
                    add: function(e, data) {

                        var is_dropped = $(self).data('dropped');

                        function sendFile() {
                            var filename = data.files[0].name;
                            var loadingElem = _fileuploadPlugin.insertLoadingElement(filename);

                            editor.insertElement(loadingElem);
                            data.formData = {};
                            data.submit()
                                .success(function (result) {
                                    if((is_dropped && _fileuploadPlugin.isImage(result.file.mime)) || name == 'image') {
                                        _fileuploadPlugin.insertImage(loadingElem, result.file, result.thumbnails);
                                    }
                                    else {
                                        _fileuploadPlugin.insertFile(loadingElem, result.file);
                                    }
                                    // content Dom event (에디터 자동 리사이즈)
                                    editor.fire( 'contentDom' );
                                })
                                .error(function (jqXHR) {
                                    _fileuploadPlugin.insertError(loadingElem, filename, jqXHR);
                                });
                        }

                        sendFile();
                    },
                    dropZone: false
                };
                if(index === 0) {
                    config.dropZone = dropzone;
                }

                $(this).fileupload(config)
                    .bind('fileuploaddrop', function (){
                        $(self).data('dropped', true);
                    })
                    .bind('fileuploadstop', function(){
                        $(self).data('dropped', false);
                    });
            });
        };

        /**
         * Human Readable 파일 사이즈를 반환합니다.
         * @param bytes
         * @param si
         * @returns {string}
         */
        this.humanFileSize = function(bytes, si) {
            var thresh = si ? 1000 : 1024;
            if(Math.abs(bytes) < thresh) {
                return bytes + ' B';
            }
            var units = si
                ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
                : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
            var u = -1;
            do {
                bytes /= thresh;
                ++u;
            } while(Math.abs(bytes) >= thresh && u < units.length - 1);
            return bytes.toFixed(1)+' '+units[u];
        };

        /**
         * 확장자를 기준으로 이미지 파일인지 체크합니다.
         * @param {string} mime
         * @returns {bool}
         */
        this.isImage = function(mime) {
            return $.inArray(mime, ["image/jpg", "image/jpeg", "image/png", "image/gif"]) === -1 ? false : true;
        };

        /**
         * Loading dummy element를 삽입합니다.
         * @param filename
         * @returns {CKEDITOR.dom.element}
         */
        this.insertLoadingElement = function(filename) {
            var elem = new CKEDITOR.dom.element( 'span' );
            elem.appendHtml('<img src="/assets/vendor/jQuery-File-Upload/img/small_loading.gif" alt="loading" />' + filename);
            elem.setAttributes({
                contenteditable : 'false'
            });
            elem.data('contenteditable', false);
            elem.addClass('__xe_file');
            elem.addClass('loading');
            this.editor.insertElement(elem);

            return elem;
        };

        /**
         * dummy element를 파일 형태로 치환합니다.
         * @param labelElem
         * @param file
         */
        this.insertFile = function(labelElem, file) {
            labelElem.removeClass('loading');
            labelElem.setHtml(file.clientname + ' (' + this.humanFileSize(file.size, true) + ')');
            labelElem.data('download-link', this.editor.config.fileUpload.download_url + '/' + file.id);
            labelElem.data('id', file.id);
            labelElem.addClass('__xe_file');
        };

        /**
         * dummy element를 이미지로 치환합니다.
         * @param labelElem
         * @param file
         */
        this.insertImage = function(labelElem, file, thumbnails) {
            var elem = this.editor.document.createElement('img', {
                attributes: {
                    src: this.editor.config.fileUpload.source_url + '/' + file.id
                }
            });

            $(elem.$).attr('title', file.clientname);
            elem.data('id', file.id);
            elem.addClass('__xe_image');
            elem.on('load', function(e) {
                $(labelElem.$).replaceWith(this.$);
            });
        };

        /**
         * dummy element를 에러 형태로 치환합니다.
         * @param labelElem
         * @param filename
         * @param jqXHR
         */
        this.insertError = function(labelElem, filename, jqXHR) {
            labelElem.removeClass('loading');
            labelElem.addClass('__xe_error');
            labelElem.setHtml('실패 ' + filename);

            // 메시지 출력은 core
            // 메시지 출력은 core 에서 해줌
            //var responseText = $.parseJSON(jqXHR.responseText);
            //var errorMessage = responseText.message;
            //XE.toast('danger', errorMessage);
        };
    };

    CKEDITOR.plugins.add('fileUpload', {
      icons: 'fileupload',

        init: function(editor) {
            // config 체크
            if (editor.config.fileUpload.upload_url == undefined) {
                Error('editor.config.fileUpload.upload_url 를 설정해야 합니다.');
            }
            if (editor.config.fileUpload.source_url == undefined) {
                Error('editor.config.fileUpload.source_url 를 설정해야 합니다.');
            }
            if (editor.config.fileUpload.download_url == undefined) {
                Error('editor.config.fileUpload.download_url 를 설정해야 합니다.');
            }

            editor.on( 'instanceReady', function(e) {
                var editor = e.editor,
                    $container = $(editor.container.$),
                    $btn_fileupload = $container.find(".cke_button__fileupload"),
                    $btn_imageupload = $container.find(".cke_button__imageupload");

                $btn_fileupload.add($btn_imageupload).prop('onclick',null).off('click');
                $('<input>').attr({
                    class: 'fileupload',
                    type: 'file',
                    name: 'file'
                }).appendTo($btn_fileupload);

                $('<input>').attr({
                    class: 'fileupload',
                    type: 'file',
                    name: 'image',
                    accept: 'image/*'
                }).appendTo($btn_imageupload);

                var plugin = new fileUploadPlugin;
                plugin.init(editor);
            } );
        }
    });
}(XE));
