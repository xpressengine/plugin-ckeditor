// @ES5
// @FIXME window.imageResizeURL
(function ($, XE, XEeditor) {
  var windowName = 'editortoolImageresize'
  var windowFeatures = {
    width: 850,
    height: 970
  }

  XEeditor.tools.define({
    id: 'editortool/image_resize_tool@image_resize_crop',
    events: {
      iconClick: function (editor, cbAppendToolContent) {
        var targetEditor = editor.props.editor
        var config = editor.getOptions().editorOptions
        // @FIXME
        if (config.perms.upload) {
          var $uploadArea = $(targetEditor.container.$).parent().find('.ckeditor-fileupload-area')
          var uploadUrl = targetEditor.config.fileUpload.upload_url
          var attachMaxSize = targetEditor.config.attachMaxSize
          var fileMaxSize = targetEditor.config.fileMaxSize
          var extensions = targetEditor.config.extensions

          XE.Utils.openWindow(window.imageResizeURL.get('popup'), windowName, windowFeatures)

          XEeditor.$once('editorTools.imageResizeTool.popup', function (eventName, obj) {
            obj.init({
              targetEditor: targetEditor,
              appendToolContent: cbAppendToolContent,
              uploadInfo: {
                uploadUrl: uploadUrl,
                attachMaxSize: attachMaxSize,
                fileMaxSize: fileMaxSize,
                extensions: extensions,
                $uploadArea: $uploadArea
              }
            })
          })
        }
      },
      elementDoubleClick: function () {},
      beforeSubmit: function (editor) {},
      editorLoaded: function (editor) {
        // @FIXME
        if (!editor.getOptions().editorOptions.perms.upload) {
          $('.cke_button__imageresizer').addClass('cke_button_disabled')
        }
      }
    },
    props: {
      name: 'ImageResizeTool',
      options: {
        label: '이미지 편집',
        command: 'openImageResizeTool'
      },
      addEvent: {
        doubleClick: false
      }
    }
  })
})(window.jQuery, window.XE, window.XEeditor)
