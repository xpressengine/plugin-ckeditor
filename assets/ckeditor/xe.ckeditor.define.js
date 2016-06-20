/**
 * @description ckeditor library 로드가 선행되어야함
 * */
XEeditor.define({
    editorSettings: {
        name: 'XEckeditor',
        configs: {
            skin : 'xe-minimalist',
            customConfig : '',
            contentsCss : CKEDITOR.basePath + 'content.css',
            on : {
                focus : function() {
                    $(this.container.$).addClass('active');
                },
                blur : function(e) {
                    $(e.editor.container.$).removeClass('active');
                }.bind(this)
            },
            toolbarGroups: [
              { name: 'clipboard',   groups: [ 'undo', 'clipboard' ] },
              { name: 'editing',     groups: [ 'find', 'selection' ] },
              { name: 'links' },
              { name: 'insert' },
              { name: 'tools' },
              { name: 'document',    groups: [ 'mode' ] },
              '/',
              { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
              { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
              '/',
              { name: 'styles' },
              { name: 'colors' },
              { name: 'others' }
            ],
            // height : 300,
            // autoGrow_minHeight : 300,
            // autoGrow_maxHeight : 300,

            // allowedContent: {
            //     p: {}, strong: {}, em: {}, i: {}, u: {}, br: {}, ul: {}, ol: {}, table: {},
            //     a: {attributes: ['!href']},
            //     span: {
            //         attributes: ['contenteditable', 'data-*'],
            //         classes: []
            //     },
            //     img: {
            //         attributes: ['*'],
            //         classes: []
            //     },
            //     div: {

            //     }
            // },
            removeButtons : 'Save,Preview,Print,Cut,Copy,Paste',
            removePlugins: 'stylescombo',
            // removeDialogTabs : 'link:advanced',
            extraPlugins: 'resize',
            resize_dir: 'vertical',
            extraAllowedContent: 'style;*[id,rel](*){*}'
        },
        plugins: [{
            name: 'extractor',
            path: CKEDITOR.basePath + '../xe_additional_plugins/extractor/plugin.js'
        },
        // {
        //     name: 'fileUpload',
        //     path: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/plugin.js'
        // },
        {
            name: 'suggestion',
            path: CKEDITOR.basePath + '../xe_additional_plugins/suggestion/plugin.js'
        },{
            name: 'sourcearea',
            path: CKEDITOR.basePath + '../xe_additional_plugins/sourcearea/plugin.js'
        }],
        addPlugins: function(plugins) {
            if(plugins.length > 0) {
                for(var i = 0, max = plugins.length; i < max; i += 1) {
                    CKEDITOR.plugins.addExternal(plugins[i].name, plugins[i].path);

                    var pluginNames = this.configs.extraPlugins.split(',');
                    pluginNames.push(plugins[i].name);
                    this.configs.extraPlugins = pluginNames.join(",");
                }
            }
        }
    },
    interfaces: {
        initialize: function (selector, options, customOptions) {

            var editor;
            var customOptions = customOptions || {}
                , height = customOptions.height
                , fontFamily = customOptions.fontFamily
                , fontSize = customOptions.fontSize
                , perms = customOptions.perms || {};

            if(!perms.html) {
                options.removeButtons = (options.removeButtons !== "")? options.removeButtons + ",Source" : options.removeButtons;
            }

            if(!perms.tool) {
                options.removePlugins = (options.removePlugins !== "")? options.removePlugins + ",toolbar" : options.removePlugins;
            }

            CKEDITOR.env.isCompatible = true;

            editor = CKEDITOR.replace(selector, options || {});
            editor.on('change', function(e) {
                e.editor.updateElement();
            });

            this.addProps({
                editor: editor
                , selector: selector
                , options: options
            });

            editor.ui.add('Code', CKEDITOR.UI_BUTTON, {
              label: 'Wrap code',
              command: 'wrapCode',
              icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/code.png'
            });
            editor.ui.add('Diagram', CKEDITOR.UI_BUTTON, {
              label: 'Wrap diagram',
              command: 'wrapDiagram',
              icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/diagram.png'
            });

            editor.ui.add('FileUpload', CKEDITOR.UI_BUTTON, {
              label: 'File upload',
              icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/fileupload.png'
            });
            editor.ui.add('ImageUpload', CKEDITOR.UI_BUTTON, {
              label: 'Image upload',
              icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/imageupload.png'
            });

            editor.addCommand( 'fileUpload', {
              exec: function() {
                editor.insertText( '```diagram\n' + editor.getSelection().getSelectedText() + '\n```' );
              }
            });

            editor.addCommand( 'wrapCode', {
              exec: function( editor ) {
                editor.insertText( '```javascript\n' + editor.getSelection().getSelectedText() + '\n```' );
              }
            });
            editor.addCommand( 'wrapDiagram', {
              exec: function( editor ) {
                editor.insertText( '```diagram\n' + editor.getSelection().getSelectedText() + '\n```' );
              }
            });

            if(height) {
                this.props.editor.config.height = customOptions.height;
            }

            if(fontFamily || fontSize) {
                var bodyStyle = "";

                if(fontFamily && fontFamily.length > 0) {
                    bodyStyle += "font-family:" + fontFamily.join(",");
                }

                if(fontSize) {
                    bodyStyle += "font-size:" + fontSize;
                }

                CKEDITOR.addCss("body{" + bodyStyle + "}");
            }

            if(customOptions.uploadActive) {
                this.renderFileUploader(customOptions);
            }

        },
        getContents: function () {
            return CKEDITOR.instances[this.props.selector].getData();
        },
        setContents: function (text) {
            CKEDITOR.instances[this.props.selector].setData(text);
        },
        addContents: function (text) {
            CKEDITOR.instances[this.props.selector].insertHtml(text);
        },
        addTools: function (toolsMap, toolInfoList) {
            var editor = this.props.editor;
            var self = this;

            for(var i = 0, max = toolInfoList.length; i < max; i += 1) {
                var component = toolsMap[toolInfoList[i].id];

                if(toolInfoList[i].enable) {
                    var editorOption = component.props;
                    editor.ui.add( editorOption.name, CKEDITOR.UI_BUTTON, editorOption.options);

                    if(editorOption.hasOwnProperty('options')
                        && editorOption.options.hasOwnProperty('command')) {

                        editor.addCommand(editorOption.options.command, {
                            exec: function() {
                                //var Tool = XEeditor.tools.get(component.id);

                                component.events.iconClick(function(content) {
                                    var dom = XEeditor.attachDomId(content, component.id);

                                    self.addContents(dom);
                                });
                            }
                        });
                    }

                    if(component.events && component.events.hasOwnProperty('elementDoubleClick')) {

                        CKEDITOR.instances[self.selector].on("instanceReady", function() {
                            var domSelector = XEeditor.getDomSelector(component.id);
                            var editorIframe = CKEDITOR.instances[self.selector].document.$;

                            component.events.elementDoubleClick(component.id, editorIframe, domSelector);
                        });

                    }


                }
            }
        },
        on: function (eventName, callback) {
            CKEDITOR.instances[this.props.selector].on(eventName, callback);
        },
        renderFileUploader: function(customOptions) {

            var editorWrapClass = "." + this.props.editor.id;
            var uploadUrl = this.props.options.fileUpload.upload_url
                , downloadUrl = this.props.options.fileUpload.download_url
                , destroyUrl = this.props.options.fileUpload.destroy_url
                , attachMaxSize = customOptions.attachMaxSize
                , fileMaxSize = customOptions.fileMaxSize
                , extensions = customOptions.extensions
                , uploadPermission = customOptions.perms.upload;

            var fileCount = 0
                , fileTotalSize = 0;

            var self = this;

            DynamicLoadManager.jsLoad("/assets/core/common/js/fileUtils.js", function() {
                self.on("instanceReady", function() {
                    var $editorWrap = $(editorWrapClass);
                    var uploadHtml = [
                        '<!--에디터 파일 첨부 영역  -->',
                        '<div class="file-attach-group">',
                        '    <!--기본 파일첨부 -->',
                        '    <div class="file-attach dropZone">',
                        '        <div class="attach-info-text">',
                        '            <p>여기에 파일을 끌어 놓거나 <a href="#" class="openSelectFile">파일 첨부</a>를 클릭하세요.<br>파일 크기 제한 : ' + fileMaxSize + 'MB (허용 확장자 : ' + extensions.join(", ") + ' )</p>',
                        '        </div>',
                        '    </div>',
                        '    <!--//기본 파일첨부 -->',

                        '    <!-- 파일 업로드 시  -->',
                        '    <div class="file-attach xe-hidden fileuploadStatus dropZone">',
                        '        <div class="attach-info-text">',
                        '            <p>파일 업로드 중(<span class="uploadProgress">0</span>%)</p>',
                        '        </div>',
                        '    </div>',

                        '    <!--[D] 파일 업로드 시 display:block; 변경 및 0~100% 값으로 progress-->',
                        '    <div class="attach-progress">',
                        '        <div class="attach-progress-bar" style="width:0%"></div>',
                        '    </div>',

                        '   <!--// 파일 업로드 시  -->',
                        '    <div class="file-view xe-hidden">',
                        '        <strong><span class="fileCount">0</span>개 파일 첨부됨. (<span class="currentFilesSize">0MB</span>/' + attachMaxSize + 'MB)</strong>',
                        '        <ul class="thumbnail-list"></ul>',
                        '        <ul class="file-attach-list"></ul>',
                        '    </div>',
                        '</div>',
                        '<!--//에디터 파일 첨부 영역  -->'
                    ].join("\n");

                    $editorWrap.after("<div class='wrap-ckeditor-fileupload xe-hidden'><input type='file' name='file' multiple /></div><div class='ckeditor-fileupload-area'></div>")
                        .nextAll(".ckeditor-fileupload-area:first").html(uploadHtml);

                    var $fileUploadArea = $editorWrap.nextAll(".ckeditor-fileupload-area:first")
                        , $dropZone = $fileUploadArea.find(".dropZone:not(.fileuploadStatus)");

                    var $thumbnaiList = $fileUploadArea.find(".thumbnail-list")
                        , $fileAttachList = $fileUploadArea.find(".file-attach-list");

                    //이미지 본문 삽입
                    $thumbnaiList.on('click', '.btnAddImage', function() {
                        var $this = $(this);
                        self.addContents("<img src='" + $this.data("src") + "' data-attach='" + $this.data("id") + "'/>");

                    });

                    //파일 본문 삽입
                    $fileAttachList.on('click', '.btnAddFile', function() {
                        //downloadUrl
                        var $this = $(this);
                        self.addContents("<a href='" + downloadUrl + "/" + $this.data("id") + "' data-attach='" + $this.data("id") + "'>" + $this.data("name") + "</a>");

                    });

                    //첨부파일 삭제
                    $fileUploadArea.on('click', '.btnDelFile', function() {
                        var $this = $(this);
                        var id = $this.data("id");

                        console.log($(self.props.editor.window.getFrame().$).contents().find('[data-attach=' + id + ']').length);

                        $(self.props.editor.window.getFrame().$).contents().find('[data-attach=' + id + ']').remove();

                        // XE.ajax({
                        //     url: destroyUrl + "/" + id
                        //     , type: 'post'
                        //     , dataType: 'json'
                        //     , success: function(res) {
                        //         if(res.deleted) {
                        //
                        //         }else {
                        //             XE.toast("xe-danger", "첨부파일이 삭제되지 않았습니다");
                        //         }
                        //     }
                        // });
                    });


                    //파일첨부 클릭되었을때
                    $dropZone.find(".openSelectFile").on('click', function(e) {
                        e.preventDefault();
                        $editorWrap.nextAll(".wrap-ckeditor-fileupload:first").find("input[type=file]").trigger("click");
                    });

                    $editorWrap.nextAll(".wrap-ckeditor-fileupload:first").find("input[name=file]").fileupload({
                        url: uploadUrl,
                        type: "post",
                        dataType: 'json',
                        sequentialUploads: true,
                        autoUpload: false,
                        dropZone: $editorWrap.nextAll(".ckeditor-fileupload-area:first").find(".dropZone"),
                        maxFileSize: fileMaxSize * 1024 * 1024,
                        progressall: function(e, data) {

                            var progress = parseInt(data.loaded / data.total * 100, 10);

                            console.log(progress);

                            $fileUploadArea.find(".attach-progress-bar").css(
                                'width',
                                progress + '%'
                            );
                            $fileUploadArea.find(".uploadProgress").text(progress);

                            //모든 파일이 업로드 되었을때
                            if(progress === 100) {
                                $fileUploadArea
                                    .find(".dropZone").removeClass("xe-hidden drag")
                                    .nextAll(".fileuploadStatus:first").addClass("xe-hidden")
                                    .find(".uploadProgress").text(0);

                                $fileUploadArea.find(".attach-progress-bar").css({
                                    width: 0 + '%'
                                }).parents(".attach-progress").hide();
                            }

                        },
                        dragover: function() {
                            $dropZone.addClass("drag");
                        },
                        dragleave: function() {
                            $dropZone.removeClass("drag");
                        },
                        add: function(e, data) {

                            var valid = true
                                , extValid = false;
                            var files = data.files;


                            var uploadFileName = files[0].name;
                            var fSize = files[0].size;

                            for (var i = 0; i < extensions.length; i++) {
                                var sCurExtension = extensions[i];

                                if (uploadFileName.substr(uploadFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() === sCurExtension.toLowerCase()) {
                                    extValid = true;
                                    break;
                                }
                            }

                            //[1]확장자
                            if(!extValid) {
                                XE.toast("xe-warning", "[" + extensions.join(", ") + "] 확장자만 업로드 가능합니다. [" + uploadFileName + "]");
                                valid = false;
                            }

                            //[2]파일 사이즈
                            if(fSize > fileMaxSize * 1024 * 1024) {
                                XE.toast("xe-warning", "파일 용량은 " + fileMaxSize + "MB를 초과할 수 없습니다. [" + uploadFileName + "]");
                                valid = false;
                            }

                            //[3]전체 파일 사이즈
                            if(attachMaxSize * 1024 * 1024 < (fileTotalSize + fSize)) {
                                XE.toast("xe-warning", "전체 업로드 용량은 " + attachMaxSize + "MB를 초과할 수 없습니다.");
                                valid = false;
                            }

                            if(!$dropZone.hasClass("xe-hidden")) {
                                $dropZone.addClass("xe-hidden");
                            }

                            if($dropZone.nextAll(".fileuploadStatus:first").hasClass("xe-hidden")) {
                                $dropZone.nextAll(".fileuploadStatus:first").removeClass("xe-hidden");
                            }

                            if($fileUploadArea.find(".attach-progress").is(":hidden")) {
                                $fileUploadArea.find(".attach-progress").show();
                            }

                            if(valid) {
                                data.submit();
                            }
                        },
                        done: function(e, data) {

                            var file = data.result.file
                                , fileName = file.clientname
                                , fileSize = file.size
                                , thumbImageUrl = (data.result.thumbnails)? data.result.thumbnails[2].url : ''
                                , mime = file.mime
                                , id = file.id;

                            fileCount++;
                            fileTotalSize = fileTotalSize + fileSize;

                            if(FileUtils.isImage(mime)) {
                                var tmplImage = [
                                    '<li>',
                                    '   <img src="' + thumbImageUrl + '" alt="' + fileName + '">',
                                    '   <button type="button" class="btn-insert btnAddImage" data-type="image" data-src="' + thumbImageUrl + '"><i class="xi-arrow-up"></i><span class="xe-sr-only">본문삽입</span></button>',
                                    '   <button type="button" class="btn-delete btnDelFile" data-id="' + file.id + '"><i class="xi-close-thin"></i><span class="xe-sr-only">첨부삭제</span></button>',
                                    '</li>'
                                ].join("\n");

                                $thumbnaiList.append(tmplImage);

                            }else {
                                var tmplFile = [
                                    '<li>',
                                    '   <p class="xe-pull-left">' + fileName + ' (' + FileUtils.humanFileSize(fileSize, true) + ')</p>',
                                    '   <div class="xe-pull-right">',
                                    '       <button type="button" class="btnAddFile" data-type="file" data-id="' + file.id + '" data-name="' + fileName + '">본문에 넣기</button>',
                                    '       <button type="button" class="btnDelFile" data-id="' + file.id + '"><i class="xi-close-thin"></i><span class="xe-sr-only">첨부삭제</span></button>',
                                    '   </div>',
                                    '</li>',
                                ].join("\n");

                                $fileAttachList.append(tmplFile);
                            }

                            $fileUploadArea.find(".file-view").removeClass("xe-hidden");

                            //첨부파일 갯수 표시
                            $fileUploadArea.find(".fileCount").text(fileCount);

                            //첨부파일 용량 표시
                            $fileUploadArea.find(".currentFilesSize").text(FileUtils.humanFileSize(fileTotalSize, true));

                        },
                        fail: function(e, data) {
                            $fileUploadArea
                                .find(".dropZone").removeClass("xe-hidden drag")
                                .nextAll(".fileuploadStatus:first").addClass("xe-hidden")
                                .find(".uploadProgress").text(0);

                            $fileUploadArea.find(".attach-progress-bar").css(
                                'width',
                                0 + '%'
                            );

                            if($fileUploadArea.find(".attach-progress").is(":visible")) {
                                $fileUploadArea.find(".attach-progress").hide();
                            }

                            console.log('fail', e, data);
                        }

                    });
                });
            });
        }
    }
});



