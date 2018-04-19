// @ES5
// @FIXME window.xeiconToolURL
(function($, XEeditor, XE) {
  var windowName = 'editortoolXeicon'
  var windowFeatures = {
    width: 980,
    height: 600
  }

  XEeditor.tools.define({
    id: 'editortool/xeicon_tool@xeicon',
    events: {
      iconClick: function (editor, cbAppendToolContent) {
        var targetEditor = editor.props.editor
        XE.Utils.openWindow(window.xeiconToolURL.get('popup'), windowName, windowFeatures)

        XEeditor.$once('editorTools.xeicon.popup', function (eventName, obj) {
          obj.init(targetEditor, cbAppendToolContent)
        })
      },
      elementDoubleClick: function () {
        var _$this = $(this)

        XE.Utils.openWindow(window.xeiconToolURL.get('edit_popup'), windowName, windowFeatures)

        XEeditor.$once('editorTools.xeicon.popup_edit', function (eventName, obj) {
          obj.init(_$this)
        })
      },
      beforeSubmit: function (editor) {
        // @FIXME 위지윅 모드가 아닐 때 동작하지 않음
        var contentDom = editor.getContentDom()
        if(!contentDom) return

        $(contentDom).find('[xe-tool-id="editortool/xeicon_tool@xeicon"]').css('cursor', '')
      },
      editorLoaded: function (editor) {
        // @FIXME 위지윅 모드가 아닐 때 동작하지 않음
        var contentDom = editor.getContentDom()
        if(!contentDom) return

        $(contentDom).find('[xe-tool-id="editortool/xeicon_tool@xeicon"]').css('cursor', 'pointer')
      }
    },
    css: function () {
      return window.xeiconToolURL.get('css')
    },
    props: {
      name: 'XEIcon',
      options: {
        label: 'XEIcon',
        command: 'openXEIcon'
      },
      addEvent: {
        doubleClick: true
      }
    }
  })
})(window.jQuery, window.XEeditor, window.XE);
