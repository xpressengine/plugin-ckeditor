/**
 * CKEDITOR DRAG AND DROP FILE UPLOADER
 *
 * @version 0.1.0 (alpha)
 * @author UPGLE (upgle@xpressengine.com)
 */

CKEDITOR.plugins.add( 'dragdrop', {

    /**
     * CKeditor에 스타일을 추가합니다.
     */
    onLoad: function()
    {
        // default color
        CKEDITOR.addCss(
            '.cke_dragdrop_file' +
            '{' +
            'background: #eaedee;' +
            'padding: 2px 6px;' +
            'border-radius:4px;' +
            '}' +
            '.cke_dragdrop_file + .cke_dragdrop_file' +
            '{' +
            'margin-left: 5px;' +
            '}'
        );

        // loading style
        CKEDITOR.addCss(
            '.cke_dragdrop_file.loading img' +
            '{' +
            'width: 10px;' +
            'height: 10px;' +
            'margin-right: 5px;' +
            '}'
        );

        // error color
        CKEDITOR.addCss(
            '.cke_dragdrop_file.error' +
            '{' +
            'background: #EF5350;' +
            'color: #fff' +
            '}'
        );
    },

    /**
     * CKEDITOR PLUGIN
     * Initialize
     * @param editor
     */
    init: function( editor )
    {
        var ChakBox = JSON.parse($('#chak-box').html());

        /**
         * Human Readable 파일 사이즈를 반환합니다.
         * @param bytes
         * @param si
         * @returns {string}
         */
        function humanFileSize(bytes, si) {
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
        }

        /**
         * 확장자를 기준으로 이미지 파일인지 체크합니다.
         * @param {string} extension
         * @returns {bool}
         */
        function isImage(extension) {
            return _.contains(["jpg", "jpeg", "png", "gif"], extension);
        }

        /**
         * 서버로 파일을 업로드합니다.
         * @param formData 실제 데이터 전송에 사용되는 값입니다.
         * @param {File} file dummy object를 생성하기 위해서만 사용하는 값입니다.
         */
        function sendFileToServer(formData, file) {

            var filename = file.name,
                loadingElem = insertLoding(filename),
                $tempUidInput = $(editor.container.$).closest("form").find('input[name=tempArticleUid]'),
                tempArticleUid = $tempUidInput.val();

            if(tempArticleUid) {
                tempArticleUid = '/' + tempArticleUid;
            }

            var uploadURL ="/resource/files/" + ChakBox.uid + tempArticleUid; //Upload URL

            $.ajax({
                headers: {
                    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                },
                xhr: function() {
                    var xhrobj = $.ajaxSettings.xhr();
                    if (xhrobj.upload) {
                        xhrobj.upload.addEventListener('progress', function(event) {
                            var percent = 0;
                            var position = event.loaded || event.position;
                            var total = event.total;
                            if (event.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }
                            console.log(percent);

                            //Set progress
                            //status.setProgress(percent);
                        }, false);
                    }
                    return xhrobj;
                },
                url: uploadURL,
                type: "POST",
                contentType: false,
                processData: false,
                cache: false,
                data: formData

            })
                .done(function(data){
                    // 이미지인 경우 이미지 element를 삽입합니다.
                    if(isImage(data.extension)) {
                        insertImage(loadingElem, data.link);
                    }
                    // 파일인 경우 <span>으로 감싸진 element를 삽입합니다.
                    else {
                        insertFile(loadingElem, data.name, data.link, humanFileSize(data.size, true));
                    }
                    // 임시 articleUid를 삽입합니다.
                    if(!tempArticleUid) {
                        $tempUidInput.val(data.article_uid);
                    }
                })

                .fail(function(){
                    insertError(loadingElem, filename);
                });
        }

        /**
         * 파일 업로드를 핸들링합니다.
         * @param files
         */
        function handleFileUpload(files) {
            for (var i = 0; i < files.length; i++) {
                var formData = new FormData();
                formData.append('file', files[i]);
                sendFileToServer(formData, files[i]);
            }
        }

        /**
         * Loading Label을 삽입합니다.
         * @param filename
         * @returns {CKEDITOR.dom.element}
         */
        function insertLoding(filename) {
            var elem = new CKEDITOR.dom.element( 'span' );
            elem.appendHtml('<img src="/img/small_loading.gif" alt="loading" />' + filename);
            elem.addClass('cke_dragdrop_file');
            elem.addClass('loading');
            elem.setAttributes({
                contenteditable : 'false'
            });
            editor.insertElement(elem);

            return elem;
        }

        /**
         * dummy element를 이미지로 치환합니다.
         * @param labelElem
         * @param href
         */
        function insertImage(labelElem, href) {
            var elem = editor.document.createElement('img', {
                attributes: {
                    src: href
                }
            });
            $(labelElem.$).replaceWith(elem.$);
        }

        /**
         * dummy element를 파일 형태로 치환합니다.
         * @param labelElem
         * @param filename
         * @param fileurl
         * @param filesize
         */
        function insertFile(labelElem, filename, fileurl, filesize) {
            labelElem.removeClass('loading');
            labelElem.setHtml(filename + ' (' + filesize + ')');
            labelElem.data('link', fileurl);
        }

        /**
         * dummy element를 에러 형태로 치환합니다.
         * @param labelElem
         * @param filename
         */
        function insertError(labelElem, filename) {
            labelElem.removeClass('loading');
            labelElem.addClass('error');
            labelElem.setHtml('업로드 실패 ' + filename);
        }

        /**
         * Drag Enter Event
         * @param {function} callbackFunc
         * @param {event} e
         */
        function onDragEnter(callbackFunc, e)
        {
            e.preventDefault();
            if($.isFunction(callbackFunc)) {
                callbackFunc();
            }
        }

        /**
         * Drag Over Event
         * @param {function} callbackFunc
         * @param {event} e
         */
        function onDragOver(callbackFunc, e)
        {
            e.preventDefault();
            if($.isFunction(callbackFunc)) {
                callbackFunc();
            }
        }

        /**
         * Drag Leave Event
         * @param {function} callbackFunc
         * @param {event} e
         */
        function onDragLeave(callbackFunc, e)
        {
            e.preventDefault();
            if($.isFunction(callbackFunc)) {
                callbackFunc();
            }
        }

        /**
         * Drop Event
         * @param {function} callbackFunc
         * @param {event} e
         */
        function onDrop(callbackFunc, e)
        {
            e.preventDefault();
            handleFileUpload(e.originalEvent.dataTransfer.files);

            if($.isFunction(callbackFunc)) {
                callbackFunc();
            }
        }

        /**
         * editor Content에서 img를 사용가능하도록 추가합니다.
         */
        if (editor.addFeature) {
            editor.addFeature({
                allowedContent: 'img[alt,id,!src]{width,height};'
            });
        }

        editor.on('instanceReady', function() {

            var $container = $(editor.container.$),
                $innerIframe = $($container.find('iframe')[0].contentDocument);

            var dragInEffect = function() {
                $container.addClass('drag-over');
                $container.find(".cke_resizer, .cke_toolbox, .cke_submit").hide();
            };

            var dragOutEffect = function() {
                $container.removeClass('drag-over');
                $container.find(".cke_resizer, .cke_toolbox, .cke_submit").show();
            };

            $container.add($innerIframe)
                .on("dragenter", onDragEnter.bind(this, dragInEffect))
                .on("dragover", onDragOver.bind(this, dragInEffect))
                .on("dragleave", onDragLeave.bind(this, dragOutEffect))
                .on("drop", onDrop.bind(this, dragOutEffect));
        });
    }
});
