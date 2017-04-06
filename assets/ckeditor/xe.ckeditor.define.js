/**
 * @description ckeditor library 로드가 선행되어야함
 * */
XEeditor.define({
    editorSettings: {
        name: 'XEckeditor',
        configs: {
            skin: 'xe-minimalist',
            customConfig: '',
            language: CKEDITOR.lang.languages.hasOwnProperty(XE.Lang.getCurrentLocale())? XE.Lang.getCurrentLocale() : 'en',
            contentsCss: CKEDITOR.basePath + 'content.css',
            on: {
                focus: function () {
                    $(this.container.$).addClass('active');
                },
                blur: function (e) {
                    $(e.editor.container.$).removeClass('active');
                }
            },
            toolbarGroups: [
                {name: 'clipboard', groups: ['undo', 'clipboard']},
                {name: 'editing', groups: ['find', 'selection']},
                {name: 'links'},
                {name: 'insert'},
                {name: 'tools'},
                {name: 'document', groups: ['mode']},
                '/',
                {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
                {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi']},
                '/',
                {name: 'styles'},
                {name: 'colors'},
                {name: 'others'}
            ],
            allowedContent: true,
            removeFormatAttributes: '',
            removeButtons: 'Save,Preview,Print,Cut,Copy,Paste',
            removePlugins: 'stylescombo',
            extraPlugins: 'resize,justify',
            resize_dir: 'vertical',
            format_tags: 'p;h1;h2;h3;h4;h5;h6;pre;address;div',
            entities: false,
            htmlEncodeOutput: false
        },
        plugins: [
            {
                name: 'suggestion',
                path: CKEDITOR.basePath + '../xe_additional_plugins/suggestion/plugin.js'
            }, {
                name: 'sourcearea',
                path: CKEDITOR.basePath + '../xe_additional_plugins/sourcearea/plugin.js'
            }
        ],
        addPlugins: function (plugins) {
            if (plugins.length > 0) {
                for (var i = 0, max = plugins.length; i < max; i += 1) {
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

            var editor, self = this;
            var customOptions = customOptions || {}
                , height = options.height
                , fontFamily = options.fontFamily
                , fontSize = options.fontSize
                , perms = options.perms || {};

            $.extend(customOptions, options);

            if (!perms.html) {
                customOptions.removeButtons = (!customOptions.removeButtons) ? customOptions.removeButtons + ",Source" : "Source";
            }

            if (!perms.tool) {
                customOptions.removePlugins = (!customOptions.removePlugins) ? customOptions.removePlugins + ",toolbar" : "toolbar";
            }

            CKEDITOR.env.isCompatible = true;

            editor = CKEDITOR.replace(selector, customOptions || {});
            editor.on('change', function (e) {
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

            // editor.ui.add('FileUpload', CKEDITOR.UI_BUTTON, {
            //     label: 'File upload',
            //     icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/fileupload.png'
            // });
						//
            // editor.ui.add('ImageUpload', CKEDITOR.UI_BUTTON, {
            //     label: 'Image upload',
            //     icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/imageupload.png'
            // });

            editor.addCommand('wrapCode', {
                exec: function (editor) {
                    editor.insertText('```javascript\n' + editor.getSelection().getSelectedText() + '\n```');
                }
            });

            editor.addCommand('wrapDiagram', {
                exec: function (editor) {
                    editor.insertText('```diagram\n' + editor.getSelection().getSelectedText() + '\n```');
                }
            });

            this.on("instanceReady", function () {
                $("." + editor.id).parents("form").on('submit', function () {
                    var $this = $(this);
                    var $contents = $(self.getContents());

                    $this.find("input[type=hidden].paramMentions, input[type=hidden].paramHashTags").remove();

                    var idSet = {}, valueSet = {};
                    $contents.find("." + options.names.mention.class).each(function () {
                        var id = $(this).attr(options.names.mention.identifier);

                        if (!idSet.hasOwnProperty(id)) {
                            idSet[id] = {};
                            $this.append("<input type='hidden' class='paramMentions' name='" + options.names.mention.input + "[]' value='" + id + "'>");
                        }
                    });

                    $contents.find("." + options.names.tag.class).text(function (i, v) {
                        var value = v.replace(/#(.+)/g, "$1");

                        if (!valueSet.hasOwnProperty(value)) {
                            $this.append("<input type='hidden' class='paramHashTags' name='" + options.names.tag.input + "[]' value='" + value + "'>");
                        }
                    });

                });
            });

            if (height) {
                this.props.editor.config.height = customOptions.height;
            }

            if (fontFamily || fontSize) {
                var bodyStyle = "";

                if (fontFamily && fontFamily.length > 0) {
                    bodyStyle += "font-family:" + fontFamily.join(",");
                }

                if (fontSize) {
                    bodyStyle += "font-size:" + fontSize;
                }

                CKEDITOR.addCss("body{" + bodyStyle + "}");
            }

            if (customOptions.uploadActive) {
                this.renderFileUploader(options);
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

            for (var i = 0, max = toolInfoList.length; i < max; i += 1) {
                var component = toolsMap[toolInfoList[i].id];

                if (toolInfoList[i].enable) {
                    var editorOption = component.props || {};

                    //icon추가
                    editorOption.options.icon = toolInfoList[i].icon;

                    editor.ui.add(editorOption.name, CKEDITOR.UI_BUTTON, editorOption.options);

                    if (editorOption.hasOwnProperty('options')
                        && editorOption.options.hasOwnProperty('command')) {

                        editor.addCommand(editorOption.options.command, function(component) {
                            return {
                                exec: function (editor) {
                                    component.events.iconClick(editor, function (content, cb) {
                                        var dom = XEeditor.attachDomId(content, component.id);

                                        self.addContents(dom);

                                        if(cb) {
                                            cb();
                                        }

                                    });
                                }
                            }
                        }(component));
                    }

                    CKEDITOR.instances[self.selector].on("instanceReady", function (e) {
                        var component = e.listenerData.component;
                        var domSelector = XEeditor.getDomSelector(component.id);
                        var editorIframe = CKEDITOR.instances[self.selector].document.$;

                        //double click시 호출
                        if (component.events && component.events.hasOwnProperty('elementDoubleClick')) {
                            $(editorIframe).on('dblclick', domSelector, component.events.elementDoubleClick || function() {});
                        }

                        //submit시 호출
                        if(component.events.beforeSubmit) {
                            $("." + editor.id).parents("form").on('submit', function () {
                                component.events.beforeSubmit(editor);
                            });
                        }

                        //load되면 호출
                        if(component.events.editorLoaded) {
                            component.events.editorLoaded(editor);
                        }

                    }, null, {component: component});

                }
            }
        },
        on: function (eventName, callback) {
            CKEDITOR.instances[this.props.selector].on(eventName, callback);
        },
        renderFileUploader: function (customOptions) {

            var editorWrapClass = "." + this.props.editor.id;
            var uploadUrl = this.props.options.fileUpload.upload_url
                , downloadUrl = this.props.options.fileUpload.download_url
                , destroyUrl = this.props.options.fileUpload.destroy_url
                , sourceUrl = this.props.options.fileUpload.source_url
                , attachMaxSize = customOptions.attachMaxSize
                , fileMaxSize = customOptions.fileMaxSize
                , extensions = customOptions.extensions
                , uploadPermission = customOptions.perms.upload
                , files = customOptions.files || [];

            var fileCount = 0
                , fileTotalSize = 0;

            var self = this;

            DynamicLoadManager.jsLoad("/assets/core/common/js/utils.js", function () {
                self.on("instanceReady", function () {
                    var $editorWrap = $(editorWrapClass);
                    var uploadHtml = [
                        '<!--에디터 파일 첨부 영역  -->',
                        '<div class="file-attach-group">',
                        '    <!--기본 파일첨부 -->',
                        '    <div class="file-attach dropZone">',
                        '        <div class="attach-info-text">',
                        '            <p>' + XE.Lang.trans("ckeditor::dropzoneLimit", {
                            fileMaxSize: Utils.formatSizeUnits(fileMaxSize * 1024 * 1024),
                            extensions: extensions.join(", "),
                            sAtag: '<a href="#" class="openSelectFile">',
                            eAtag: '</a>'
                        }) + '</p>', //여기에 파일을 끌어 놓거나 파일 첨부를 클릭하세요. 파일 크기 제한 : 2.00MB (허용 확장자 : *.*)
                        '        </div>',
                        '    </div>',
                        '    <!--//기본 파일첨부 -->',

                        '    <!-- 파일 업로드 시  -->',
                        '    <div class="file-attach xe-hidden fileuploadStatus dropZone">',
                        '        <div class="attach-info-text">',
                        '            <p>' + XE.Lang.trans("ckeditor::uploadingFile", {progressTag: '<span class="uploadProgress">0</span>%'}) + '</p>', //파일 업로드중 <span class="uploadProgress">0</span>%
                        '        </div>',
                        '    </div>',

                        '    <!--[D] 파일 업로드 시 display:block; 변경 및 0~100% 값으로 progress-->',
                        '    <div class="attach-progress">',
                        '        <div class="attach-progress-bar" style="width:0%"></div>',
                        '    </div>',
                        //<span class="fileCount">0</span>개 파일 첨부됨. (<span class="currentFilesSize">0MB</span>/' + Utils.formatSizeUnits(attachMaxSize * 1024 * 1024) + ')
                        '   <!--// 파일 업로드 시  -->',
                        '    <div class="file-view xe-hidden">',
                        '        <strong>' + XE.Lang.trans("ckeditor::attachementDescription", {
                            fileCount: '<span class="fileCount">0</span>',
                            currentFilesSize: '<span class="currentFilesSize">0MB</span>',
                            attachMaxSize: Utils.formatSizeUnits(attachMaxSize * 1024 * 1024)
                        }) + '</strong>',
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
                    $thumbnaiList.on('click', '.btnAddImage', function () {
                        var $this = $(this);
                        var imageHtml = [
                            "<img ",
                            "src='" + $this.data("src") + "' ",
                            "class='" + customOptions.names.file.image.class + "' ",
                            "data-cke-attach='" + $this.attr(customOptions.names.file.image.identifier) + "' ",
                            customOptions.names.file.image.identifier + "='" + $this.attr(customOptions.names.file.image.identifier),
                            "' />"
                        ].join("");

                        self.addContents(imageHtml);
                    });

                    //파일 본문 삽입
                    $fileAttachList.on('click', '.btnAddFile', function () {
                        //downloadUrl
                        var $this = $(this);
                        var fileHtml = [
                            "<a href='" + downloadUrl + "/" + $this.attr(customOptions.names.file.identifier) + "' ",
                            "class='" + customOptions.names.file.class + "' ",
                            "data-cke-attach='" + $this.attr(customOptions.names.file.identifier) + "' ",
                            customOptions.names.file.identifier + "='" + $this.attr(customOptions.names.file.identifier),
                            "' >" + $this.data("name") + "</a>"
                        ].join("");

                        self.addContents(fileHtml);
                    });

                    //첨부파일 삭제
                    $fileUploadArea.on('click', '.btnDelFile', function () {
                        var $this = $(this);
                        var fileSize = $this.data("size");
                        if (confirm(XE.Lang.trans("ckeditor::msgDeleteFile"))) {
                            var id = $this.attr(customOptions.names.file.identifier);

                            XE.ajax({
                                url: destroyUrl + "/" + id
                                , type: 'post'
                                , dataType: 'json'
                                , success: function (res) {
                                    if (res.deleted) {
                                        fileTotalSize = fileTotalSize - fileSize;

                                        $(self.props.editor.window.getFrame().$).contents().find('[data-cke-attach=' + id + ']').remove();

                                        //첨부파일 갯수 표시
                                        $fileUploadArea.find(".fileCount").text(--fileCount);

                                        //첨부파일 용량 표시
                                        $fileUploadArea.find(".currentFilesSize").text(Utils.formatSizeUnits(fileTotalSize));

                                        $this.closest("li").remove();

                                        if (fileCount === 0) {
                                            $fileUploadArea.find(".file-view").addClass("xe-hidden");
                                        }
                                    } else {
                                        XE.toast("danger", XE.Lang.trans("ckeditor::msgFailDeleteFile"));    //첨부파일이 삭제되지 않았습니다.
                                    }
                                }
                            });
                        }
                    });

                    //파일첨부 클릭되었을때
                    $dropZone.find(".openSelectFile").on('click', function (e) {
                        e.preventDefault();

                        if (!uploadPermission) {
                            XE.toast('warning', XE.Lang.trans("ckeditor::msgUploadingPermission")); //"파일 업로드 권한이 없습니다"
                            //XE.toast('xe-warning', "파일 업로드 권한이 없습니다");
                            $dropZone.removeClass("drag");
                            return false;
                        }

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
                        progressall: function (e, data) {

                            var progress = parseInt(data.loaded / data.total * 100, 10);

                            $fileUploadArea.find(".attach-progress-bar").css(
                                'width',
                                progress + '%'
                            );
                            $fileUploadArea.find(".uploadProgress").text(progress);

                            //모든 파일이 업로드 되었을때
                            if (progress === 100) {
                                $fileUploadArea
                                    .find(".dropZone").removeClass("xe-hidden drag")
                                    .nextAll(".fileuploadStatus:first").addClass("xe-hidden")
                                    .find(".uploadProgress").text(0);

                                $fileUploadArea.find(".attach-progress-bar").css({
                                    width: 0 + '%'
                                }).parents(".attach-progress").hide();
                            }

                        },
                        dragover: function () {
                            $dropZone.addClass("drag");
                        },
                        dragleave: function () {
                            $dropZone.removeClass("drag");
                        },
                        drop: function () {
                            if (!uploadPermission) {
                                XE.toast('warning', XE.Lang.trans("ckeditor::msgUploadingPermission")); //"파일 업로드 권한이 없습니다"
                                // XE.toast('xe-warning', "파일 업로드 권한이 없습니다");
                                $dropZone.removeClass("drag");
                                return false;
                            }
                        },
                        add: function (e, data) {

                            var valid = true
                                , extValid = false;
                            var files = data.files;


                            var uploadFileName = files[0].name;
                            var fSize = files[0].size;

                            for (var i = 0; i < extensions.length; i++) {
                                var sCurExtension = extensions[i];

                                if (sCurExtension === '*') {
                                    extValid = true;
                                    break;
                                } else if (uploadFileName.substr(uploadFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() === sCurExtension.toLowerCase()) {
                                    extValid = true;
                                    break;
                                }
                            }

                            //[1]확장자
                            if (!extValid) {
                                //XE.toast("xe-warning", "[" + 'extensions.join(", ") + "] 확장자만 업로드 가능합니다. [" + uploadFileName + "]");
                                XE.toast(
                                    "xe-warning",
                                    XE.Lang.trans("ckeditor::msgAvailableUploadingFiles", {
                                            extensions: extensions.join(", "),
                                            uploadFileName: uploadFileName
                                        }
                                    )
                                );

                                valid = false;
                            }

                            //[2]파일 사이즈
                            if (fSize > fileMaxSize * 1024 * 1024) {
                                // XE.toast("xe-warning", "파일 용량은 " + fileMaxSize + "MB를 초과할 수 없습니다. [" + uploadFileName + "]");
                                XE.toast(
                                    'xe-warning',
                                    XE.Lang.trans('ckeditor::msgMaxFileSize', {
                                        fileMaxSize: fileMaxSize,
                                        uploadFileName: uploadFileName
                                    })
                                );
                                valid = false;
                            }

                            //[3]전체 파일 사이즈
                            if (attachMaxSize * 1024 * 1024 < (fileTotalSize + fSize)) {
                                //XE.toast("xe-warning", "전체 업로드 용량은 " + attachMaxSize + "MB를 초과할 수 없습니다.");
                                XE.toast("warning", XE.Lang.trans("ckeditor::msgAttachMaxSize", {attachMaxSize: attachMaxSize}));
                                valid = false;
                            }

                            if (valid) {
                                if (!$dropZone.hasClass("xe-hidden")) {
                                    $dropZone.addClass("xe-hidden");
                                }

                                if ($dropZone.nextAll(".fileuploadStatus:first").hasClass("xe-hidden")) {
                                    $dropZone.nextAll(".fileuploadStatus:first").removeClass("xe-hidden");
                                }

                                if ($fileUploadArea.find(".attach-progress").is(":hidden")) {
                                    $fileUploadArea.find(".attach-progress").show();
                                }

                                data.submit();
                            } else {
                                $dropZone.removeClass("drag");
                            }

                        },
                        submit: function(e, data) {
                            //파일 업로드시 상위 form요소의 input value들이 모두 submit되어 추가
                            data.formData = {};
                        },
                        done: function (e, data) {

                            var file = data.result.file
                                , fileName = file.clientname
                                , fileSize = file.size
                                , mime = file.mime
                                , id = file.id;

                            fileCount++;
                            fileTotalSize = fileTotalSize + fileSize;

                            if (Utils.isImage(mime)) {
                                var thumbImageUrl = (data.result.thumbnails) ? data.result.thumbnails[2].url : ''
                                var tmplImage = [
                                    '<li>',
                                    '   <img src="' + thumbImageUrl + '" alt="' + fileName + '">',
                                    '   <button type="button" class="btn-insert btnAddImage" data-type="image" data-src="' + thumbImageUrl + '" data-id="' + file.id + '"><i class="xi-arrow-up"></i><span class="xe-sr-only">' + XE.Lang.trans("ckeditor::addContentToBody") + '</span></button>',     //본문에 넣기
                                    '   <button type="button" class="btn-delete btnDelFile" data-id="' + file.id + '" data-size="' + file.size + '"><i class="xi-close-thin"></i><span class="xe-sr-only">' + XE.Lang.trans("ckeditor::deleteAttachment") + '</span></button>',    //첨부삭제
                                    '   <input type="hidden" name="' + customOptions.names.file.input + '[]" value="' + id + '" />',
                                    '</li>'
                                ].join("\n");

                                $thumbnaiList.append(tmplImage);

                            } else {
                                var tmplFile = [
                                    '<li>',
                                    '   <p class="xe-pull-left">' + fileName + ' (' + Utils.formatSizeUnits(fileSize) + ')</p>',
                                    '   <div class="xe-pull-right">',
                                    '       <button type="button" class="btnAddFile" data-type="file" data-id="' + file.id + '" data-name="' + fileName + '">' + XE.Lang.trans("ckeditor::addContentToBody") + '</button>',     //본문에 넣기
                                    '       <button type="button" class="btnDelFile" data-id="' + file.id + '" data-size="' + file.size + '"><i class="xi-close-thin"></i><span class="xe-sr-only">' + XE.Lang.trans("ckeditor::deleteAttachment") + '</span></button>',    //첨부삭제
                                    '       <input type="hidden" name="' + customOptions.names.file.input + '[]" value="' + id + '" />',
                                    '   </div>',
                                    '</li>',
                                ].join("\n");

                                $fileAttachList.append(tmplFile);
                            }

                            $fileUploadArea.find(".file-view").removeClass("xe-hidden");

                            //첨부파일 갯수 표시
                            $fileUploadArea.find(".fileCount").text(fileCount);

                            //첨부파일 용량 표시
                            $fileUploadArea.find(".currentFilesSize").text(Utils.formatSizeUnits(fileTotalSize));

                        },
                        fail: function (e, data) {
                            $fileUploadArea
                                .find(".dropZone").removeClass("xe-hidden drag")
                                .nextAll(".fileuploadStatus:first").addClass("xe-hidden")
                                .find(".uploadProgress").text(0);

                            $fileUploadArea.find(".attach-progress-bar").css(
                                'width',
                                0 + '%'
                            );

                            if ($fileUploadArea.find(".attach-progress").is(":visible")) {
                                $fileUploadArea.find(".attach-progress").hide();
                            }
                        }
                    });

                    //업로드된 파일이 있다면 화면에 그리기
                    if (files.length > 0) {
                        for (var i = 0, max = files.length; i < max; i += 1) {
                            var file = files[i]
                                , fileName = file.clientname
                                , fileSize = file.size
                                , thumbImageUrl = (file.thumbnails) ? file.thumbnails[2].url : ''
                                , mime = file.mime
                                , id = file.id;

                            fileCount++;
                            fileTotalSize = fileTotalSize + fileSize;

                            if (Utils.isImage(mime)) {
                                var tmplImage = [
                                    '<li>',
                                    '   <img src="' + thumbImageUrl + '" alt="' + fileName + '">',
                                    '   <button type="button" class="btn-insert btnAddImage" data-type="image" data-src="' + thumbImageUrl + '" data-id="' + file.id + '"><i class="xi-arrow-up"></i><span class="xe-sr-only">' + XE.Lang.trans("ckeditor::addContentToBody") + '</span></button>',     //본문에 넣기
                                    '   <button type="button" class="btn-delete btnDelFile" data-id="' + file.id + '" data-size="' + file.size + '"><i class="xi-close-thin"></i><span class="xe-sr-only">' + XE.Lang.trans("ckeditor::deleteAttachment") + '</span></button>',    //첨부삭제
                                    '   <input type="hidden" name="' + customOptions.names.file.input + '[]" value="' + id + '" />',
                                    '</li>'
                                ].join("\n");

                                $thumbnaiList.append(tmplImage);

                            } else {
                                var tmplFile = [
                                    '<li>',
                                    '   <p class="xe-pull-left">' + fileName + ' (' + Utils.formatSizeUnits(fileSize) + ')</p>',
                                    '   <div class="xe-pull-right">',
                                    '       <button type="button" class="btnAddFile" data-type="file" data-id="' + file.id + '" data-name="' + fileName + '">' + XE.Lang.trans("ckeditor::addContentToBody") + '</button>',     //본문에 넣기
                                    '       <button type="button" class="btnDelFile" data-id="' + file.id + '" data-size="' + file.size + '"><i class="xi-close-thin"></i><span class="xe-sr-only">' + XE.Lang.trans("ckeditor::deleteAttachment") + '</span></button>',    //첨부삭제
                                    '       <input type="hidden" name="' + customOptions.names.file.input + '[]" value="' + id + '" />',
                                    '   </div>',
                                    '</li>',
                                ].join("\n");

                                $fileAttachList.append(tmplFile);
                            }

                            //첨부파일 갯수 표시
                            $fileUploadArea.find(".fileCount").text(fileCount);

                            //첨부파일 용량 표시
                            $fileUploadArea.find(".currentFilesSize").text(Utils.formatSizeUnits(fileTotalSize));
                        }

                        $fileUploadArea.find(".file-view").removeClass("xe-hidden");
                    }
                });
            });
        },
        reset: function () {
            var editorWrapClass = "." + this.props.editor.id
                , $editorWrap = $(editorWrapClass);

            //upload된 파일 삭제
            if (this.props.options.uploadActive) {
                var $fileUploadArea = $editorWrap.nextAll(".ckeditor-fileupload-area:first");
                $fileUploadArea.find(".thumbnail-list li").remove();
                $fileUploadArea.find(".file-attach-list li").remove();
                $fileUploadArea.find(".file-view").addClass("xe-hidden");
            }

            //contents 초기화
            this.setContents("");
        }
    }
});



