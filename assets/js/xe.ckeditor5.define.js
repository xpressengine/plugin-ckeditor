(function ($, XE, CKEDITOR) {
  var editors = {};

  Promise.all([XE.app("Editor"), XE.app("Lang")]).then(function (apps) {
    var Editor = apps[0];
    var Lang = apps[1];

    Editor.define({
      editorSettings: {
        name: "XEckeditor5",
        configs: {
          language: Lang.getCurrentLocale(),
          toolbar: {
            shouldNotGroupWhenFull: !CKEDITOR.utils.isMobile(
              window.navigator.userAgent
            ),
          },
        },
        on: {
          focus: function () {
            window.jQuery(this.container.$).addClass("active");
          },
          blur: function (e) {
            window.jQuery(e.editor.container.$).removeClass("active");
          },
        },
      },
      interfaces: {
        initialize: function (selector, options, customOptions) {
          var that = this;
          var stylesheet = options.stylesheet;
          var fontFamily = options.fontFamily;
          var fontSize = options.fontSize;
          var perms = options.perms || {};

          XE.DynamicLoadManager.jsLoad(
            "/assets/core/xe-ui-component/js/xe-tooltip.js"
          );

          $.extend(customOptions || {}, options);

          customOptions.contentsCss = [];

          if (!perms.html) {
            customOptions.removePlugins = ["SourceEditing"];
            customOptions.toolbar.items =
              CKEDITOR.defaultConfig.toolbar.items.filter(function () {
                return true;
              });
            var sourceToolIdx = customOptions.toolbar.items.findIndex(function (
              t
            ) {
              return t === "SourceEditing";
            });
            if (sourceToolIdx > -1) {
              customOptions.toolbar.items.splice(sourceToolIdx, 1);
            }
          }

          if (!perms.tool) {
            customOptions.toolbar.items = [];
          }

          if (stylesheet) {
            if (typeof stylesheet === "string") {
              customOptions.contentsCss.push(stylesheet);
            }

            if (stylesheet instanceof Array && stylesheet.length > 0) {
              if (!customOptions.hasOwnProperty("contentsCss")) {
                customOptions.contentsCss = [];
              }

              for (var i = 0, max = stylesheet.length; i < max; i += 1) {
                customOptions.contentsCss.push(stylesheet[i]);
              }
            }
          }

          return new Promise(function (resolve, rejext) {
            console.log("S")
            CKEDITOR.create(
              document.querySelector("#" + selector),
              customOptions
            ).then(function (editor) {
              editors[selector] = editor;

              that.addProps({
                editor: editor,
                selector: selector,
                options: options,
              });

              editor.ui.view.editable.element.parentElement.classList.add(
                "xe-content"
              );
              editor.ui.view.editable.element.parentElement.classList.add(
                "xe-content-editable"
              );

              var wordCountPlugin = editor.plugins.get("WordCount");
              var wordContainer = $(wordCountPlugin.wordCountContainer);
              var unfold = $(
                '<button class="xf-ckeditor5__height_resize" type="button"></button>'
              );
              unfold.text(XE.Lang.trans('ckeditor::unfold'))
              var heightAutoStyle = $(
                "<style> #"+selector+" + .ck-editor .ck-editor__editable_inline { height: auto; } #"+selector+" + .ck-editor .ck-source-editing-area { height: auto; } </style>"
              );
              unfold.on("click", function () {
                if (window.document.body.contains(heightAutoStyle[0])) {
                  unfold.removeClass('active')
                  heightAutoStyle.remove();
                } else {
                  unfold.addClass('active')
                  $(editor.ui.view.element.parentElement).append(heightAutoStyle);
                }
              });

              wordContainer.prepend(unfold);

              $(editor.ui.view.editable.element).after(wordContainer);

              if (options.height) {
                $(editor.ui.view.element).after(
                  "<style> #"+selector+" + .ck-editor .ck-editor__editable_inline { min-height: " +
                    customOptions.height +
                    "px; height: " +
                    customOptions.height +
                    "px; } #"+selector+" + .ck-editor .ck-source-editing-area { min-height: " +
                    customOptions.height +
                    "px; height: " +
                    customOptions.height +
                    "px;  }</style>"
                );
              }

              customOptions.contentsCss.forEach(function (css) {
                XE.DynamicLoadManager.cssLoad(css);
              });

              if (fontFamily || fontSize) {
                var contentStyle = "<style> #"+selector+" + .ck-editor .ck-editor__editable_inline {";
                if (fontFamily && fontFamily.length > 0) {
                  contentStyle += "font-family:" + fontFamily.join(",");
                }

                if (fontSize) {
                  contentStyle += "font-size:" + fontSize;
                }
                contentStyle += "} </style>";

                if (contentStyle !== "<style></style>") {
                  $(editor.ui.view.element).after(contentStyle);
                }
              }

              if (options.uploadActive) {
                that.renderFileUploader(options);
              }

              window
                .jQuery(editor.ui.view.element)
                .parents("form")
                .on("submit", function () {
                  var $this = window.jQuery(this);
                  var $contents = window.jQuery(that.getContents());
                  var idSet = {};
                  var valueSet = {};

                  $this
                    .find(
                      "input[type=hidden].paramMentions, input[type=hidden].paramHashTags"
                    )
                    .remove();

                  $contents
                    .find("." + options.names.mention.class)
                    .each(function () {
                      var id = window
                        .jQuery(this)
                        .attr(options.names.mention.identifier);

                      if (!idSet.hasOwnProperty(id)) {
                        idSet[id] = {};
                        $this.append(
                          "<input type='hidden' class='paramMentions' name='" +
                            options.names.mention.input +
                            "[]' value='" +
                            id +
                            "'>"
                        );
                      }
                    });

                  $contents
                    .find("." + options.names.tag.class)
                    .text(function (i, v) {
                      var value = v.replace(/#(.+)/g, "$1");

                      if (!valueSet.hasOwnProperty(value)) {
                        $this.append(
                          "<input type='hidden' class='paramHashTags' name='" +
                            options.names.tag.input +
                            "[]' value='" +
                            value +
                            "'>"
                        );
                      }
                    });

                  editor.updateSourceElement();
                });

              resolve();
            });
          });
        },

        getContents: function () {
          return editors[this.props.selector].getData();
        },

        setContents: function (content) {
          return editors[this.props.selector].setData(content);
        },

        addContents: function (content) {
          var editor = editors[this.props.selector];
          var viewFragment = editor.data.processor.toView(content);
          var modelFragment = editor.data.toModel(viewFragment);
          editor.model.insertContent(modelFragment);
        },

        addTools: function (toolsMap, toolInfoList) {},

        on: function (eventName, callback) {
          editors[this.props.selector].on(eventName, callback);
        },
        renderFileUploader: function (customOptions) {
          var that = this;
          $(function () {
            var $editorWrap;

            $editorWrap = window.jQuery(that.props.editor.ui.view.element);
            $editorWrap.after(
              '<div class="wrap-ckeditor-fileupload ckeditor-fileupload-area file-attach-group"></div>'
            );
            var options = {
              editorWrapClass: that.props.editor.ui.view.element,
              fileMaximum: customOptions.fileMaxSize,
              allowedExtensions: customOptions.extensions,
              uploadPermission: customOptions.perms.upload,
              downloadUrl: that.props.options.fileUpload.download_url,
              files: customOptions.files || [],
              names: customOptions.names,
              useSetCover: false,
              coverId: null,
              instanceId: that.props.options.instanceId,
              fileCount: 0,
              fileTotalSize: 0,
            };

            if (that.props.options.cover) {
              options.useSetCover =
                that.props.options.cover.use ||
                !!that.props.options.cover.coverId;
              options.coverId = that.props.options.cover.coverId || null;
            }

            options.editorInstance = that;
            $(".ckeditor-fileupload-area").medialibraryUploader(options);
          });
        },
        getContentDom: function () {
          return this.props.editor.ui.view.editable.element;
        },
        reset: function () {
          this.setContents("");
        },
      },
    });
  });

})(window.jQuery, window.XE, window.CKEditor);
