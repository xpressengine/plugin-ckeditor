/**
* @description ckeditor library 로드가 선행되어야함
**/
(function ($, XE, CKEDITOR) {
  Promise.all([XE.app('Editor'), XE.app('Lang')]).then(function (apps) {
    var Editor = apps[0]
    var Lang = apps[1]
    Editor.define({
      /* 에디터 설정 */
      editorSettings: {
        name: 'XEckeditor',
        configs: {
          skin: 'xe-minimalist',
          customConfig: '',
          language: CKEDITOR.lang.languages.hasOwnProperty(Lang.getCurrentLocale()) ? Lang.getCurrentLocale() : 'en',
          contentsCss: [CKEDITOR.basePath + 'content.css'],
          on: {
            focus: function () {
              window.jQuery(this.container.$).addClass('active')
            },
            blur: function (e) {
              window.jQuery(e.editor.container.$).removeClass('active')
            }
          },
          toolbarGroups: [
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
            { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
            { name: 'links', groups: [ 'links' ] },
            { name: 'insert', groups: [ 'insert' ] },
            { name: 'forms', groups: [ 'forms' ] },
            { name: 'tools', groups: [ 'tools' ] },
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
            '/',
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
            '/',
            { name: 'styles', groups: [ 'styles' ] },
            { name: 'colors', groups: [ 'colors' ] },
            { name: 'others', groups: [ 'others' ] }
          ],
          allowedContent: true,
          removeFormatAttributes: '',
          removeButtons: 'Cut,Copy,Paste,PasteText,PasteFromWord,Anchor',
          removePlugins: 'stylescombo',
          extraPlugins: 'xePasteImage,html5video,wordcount',
          resize_dir: 'vertical',
          entities: false,
          htmlEncodeOutput: false,
          codeSnippet_theme: 'monokai_sublime'
        },
        plugins: [
          {
            name: 'suggestion',
            path: CKEDITOR.basePath + '../xe_additional_plugins/suggestion/plugin.js'
          },
          {
            name: 'sourcearea',
            path: CKEDITOR.basePath + '../xe_additional_plugins/sourcearea/plugin.js'
          }
        ],
        addPlugins: function (plugins) {
          if (plugins.length > 0) {
            for (var i = 0, max = plugins.length; i < max; i += 1) {
              CKEDITOR.plugins.addExternal(plugins[i].name, plugins[i].path)

              var pluginNames = this.configs.extraPlugins.split(',')
              pluginNames.push(plugins[i].name)
              this.configs.extraPlugins = pluginNames.join(',')
            }
          }
        }
      },
      interfaces: {
        initialize: function (selector, options, customOptions) {
          var that = this
          var editor
          var height = options.height
          var fontFamily = options.fontFamily
          var fontSize = options.fontSize
          var perms = options.perms || {}
          var stylesheet = options.stylesheet

          $.extend(customOptions || {}, options)

          if (!perms.html) {
            customOptions.removeButtons = (!customOptions.removeButtons) ? customOptions.removeButtons + ',Source' : 'Source'
          }

          if (!perms.tool) {
            customOptions.removePlugins = (!customOptions.removePlugins) ? customOptions.removePlugins + ',toolbar' : 'toolbar'
          }

          // 모바일 모드이면 옵션 변경
          if (CKEDITOR.env.mobile) {
            customOptions.toolbar = [
              { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline' ] },
              { name: 'paragraph', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight' ] },
              { name: 'color', items: [ 'TextColor' ] },
              { name: 'list', items: [ 'NumberedList', 'BulletedList' ] },
              { name: 'links', items: [ 'Link' ] }
            ]

            customOptions.extraPlugins = (customOptions.extraPlugins) ? customOptions.extraPlugins + ',xeFixed' : 'xeFixed'
          }

          if (stylesheet) {
            if (typeof stylesheet === 'string') {
              customOptions.contentsCss.push(stylesheet)
            }

            if (stylesheet instanceof Array && stylesheet.length > 0) {
              if (!customOptions.hasOwnProperty('contentsCss')) {
                customOptions.contentsCss = []
              }

              for (var i = 0, max = stylesheet.length; i < max; i += 1) {
                customOptions.contentsCss.push(stylesheet[i])
              }
            }
          }

          CKEDITOR.env.isCompatible = true

          // CKEditor 생성
          editor = CKEDITOR.replace(selector, customOptions)

          editor.on('change', function (e) {
            e.editor.updateElement()
          })

          if (CKEDITOR.env.iOS) {
            editor.on('afterCommandExec', function (e) {
              if (e.data.name === 'enter') {
                $('.cke_editable', editor.container.$).blur().focus()
              }
            })
          }

          // @FIXME ?
          this.addProps({
            editor: editor,
            selector: selector,
            options: options
          })

          this.on('instanceReady', function () {
            editor.ui.space('contents').addClass('xe-content').addClass('xe-content-editable')

            window.jQuery('.' + editor.id).parents('form').on('submit', function () {
              var $this = window.jQuery(this)
              var $contents = window.jQuery(that.getContents())
              var idSet = {}
              var valueSet = {}

              $this.find('input[type=hidden].paramMentions, input[type=hidden].paramHashTags').remove()

              $contents.find('.' + options.names.mention.class).each(function () {
                var id = window.jQuery(this).attr(options.names.mention.identifier)

                if (!idSet.hasOwnProperty(id)) {
                  idSet[id] = {}
                  $this.append("<input type='hidden' class='paramMentions' name='" + options.names.mention.input + "[]' value='" + id + "'>")
                }
              })

              $contents.find('.' + options.names.tag.class).text(function (i, v) {
                var value = v.replace(/#(.+)/g, '$1')

                if (!valueSet.hasOwnProperty(value)) {
                  $this.append("<input type='hidden' class='paramHashTags' name='" + options.names.tag.input + "[]' value='" + value + "'>")
                }
              })
            })
          })

          if (height) {
            this.props.editor.config.height = customOptions.height
          }

          if (fontFamily || fontSize) {
            var contentStyle = ''

            if (fontFamily && fontFamily.length > 0) {
              contentStyle += 'font-family:' + fontFamily.join(',')
            }

            if (fontSize) {
              contentStyle += 'font-size:' + fontSize
            }

            if (contentStyle) CKEDITOR.addCss('.cke_editable{' + contentStyle + '}')
          }

          if (customOptions.uploadActive) {
            this.renderFileUploader(options)
          }
        },
        getContents: function () {
          return CKEDITOR.instances[this.props.selector].getData()
        },
        setContents: function (text) {
          CKEDITOR.instances[this.props.selector].setData(text)
        },
        addContents: function (text) {
          CKEDITOR.instances[this.props.selector].insertHtml(text)
        },
        addTools: function (toolsMap, toolInfoList) {
          var editor = this.props.editor
          var that = this

          for (var i = 0, max = toolInfoList.length; i < max; i += 1) {
            var component = toolsMap[toolInfoList[i].id]

            if (toolInfoList[i].enable) {
              var editorOption = component.props || {}

              // icon추가
              editorOption.options.icon = toolInfoList[i].icon

              if (editorOption.options.icon) {
                editor.ui.add(editorOption.name, CKEDITOR.UI_BUTTON, editorOption.options)
              }

              if (editorOption.options.icon && editorOption.hasOwnProperty('options') && editorOption.options.hasOwnProperty('command')) {
                editor.addCommand(editorOption.options.command, (function (component) {
                  return {
                    exec: function (editor) {
                      component.events.iconClick(that, function (content, cb) {
                        var dom = Editor.attachDomId(content, component.id)

                        that.addContents(dom)

                        if (cb) {
                          cb(window.jQuery(editor.document.window.jQuery.querySelectorAll('[xe-tool-id="' + component.id + '"]')))
                        }
                      })
                    }
                  }
                }(component)))
              }

              CKEDITOR.instances[that.selector].on('instanceReady', function (e) {
                var component = e.listenerData.component
                var domSelector = Editor.getDomSelector(component.id)
                var editorIframe = CKEDITOR.instances[that.selector].document.$

                // double click시 호출
                if (component.events && component.events.hasOwnProperty('elementDoubleClick')) {
                  window.jQuery(editorIframe).on('dblclick', domSelector, component.events.elementDoubleClick || function () {})
                }

                // submit시 호출
                if (component.events.beforeSubmit) {
                  window.jQuery('.' + editor.id).parents('form').on('submit', function () {
                    component.events.beforeSubmit(that)
                  })
                }

                // load되면 호출
                if (component.events.editorLoaded) {
                  component.events.editorLoaded(that)
                }

                // @FIXME 이게 왜 여기서 나와
                if (component.css && typeof component.css === 'function') {
                  var css = component.css()
                  if (typeof css === 'string') {
                    this.document.appendStyleSheet(css)
                    editor.config.contentsCss.push(css)
                  } else if (css instanceof Array) {
                    for (var i = 0, max = css.length; i < max; i += 1) {
                      this.document.appendStyleSheet(css[i])
                      editor.config.contentsCss.push(css[i])
                    }
                  }
                }
              }, null, {component: component})
            }
          }
        },
        getContentDom: function () {
          this.props.editor.setMode('wysiwyg')
          return CKEDITOR.instances[this.selector].editable()
        },
        on: function (eventName, callback) {
          CKEDITOR.instances[this.props.selector].on(eventName, callback)
        },
        renderFileUploader: function (customOptions) {
          var that = this
          var editorWrapClass = '.' + this.props.editor.id
          var $editorWrap

          this.on('instanceReady', function () {
            $editorWrap = window.jQuery(editorWrapClass)
            console.debug('$editorWrap', that.props, customOptions)

            $editorWrap.after('<div class="wrap-ckeditor-fileupload ckeditor-fileupload-area file-attach-group"></div>')
            var options = {
              editorWrapClass: '.' + that.props.editor.id,
              fileMaximum: customOptions.fileMaxSize,
              allowedExtensions: customOptions.extensions,
              uploadPermission: customOptions.perms.upload,
              files: customOptions.files || [],
              names: customOptions.names,
              useSetCover: false,
              coverId: null,
              fileCount: 0,
              fileTotalSize: 0
            }

            if (that.props.options.cover) {
              options.useSetCover = that.props.options.cover.use || !!that.props.options.cover.coverId
              options.coverId = that.props.options.cover.coverId || null
            }

            options.editorInstance = that

            $('.ckeditor-fileupload-area').medialibraryUploader(options)
          })
        },
        renderFileItem: function (item) {
          console.debug('wid.renderFileItem', item)
          $('.thumbnail-list').append()
        },
        reset: function () {
          var editorWrapClass = '.' + this.props.editor.id
          var $editorWrap = window.jQuery(editorWrapClass)

          // upload된 파일 삭제
          if (this.props.options.uploadActive) {
            var $fileUploadArea = $editorWrap.nextAll('.ckeditor-fileupload-area:first')
            $fileUploadArea.find('.thumbnail-list li').remove()
            $fileUploadArea.find('.file-attach-list li').remove()
            $fileUploadArea.find('.file-view').addClass('xe-hidden')
          }

          // contents 초기화
          this.setContents('')
        }
      }
    })

    $(function () {
      CKEDITOR.dtd.$removeEmpty['i'] = false
    })
  })
})(window.jQuery, window.XE, window.CKEDITOR)
