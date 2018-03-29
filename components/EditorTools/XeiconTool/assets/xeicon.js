window.XEeditor.tools.define({
  id: 'editortool/xeicon_tool@xeicon',
  events: {
    iconClick: function (targetEditor, cbAppendToolContent) {
      var cWindow = window.open(window.xeiconToolURL.get('popup'), 'createPopup', 'width=980,height=600,directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no')

      window.XEeditor.$once('editorTools.xeicon.popup', function (eventName, obj) {
        obj.init(targetEditor, cbAppendToolContent)
      })
    },
    elementDoubleClick: function () {
      var _$this = window.jQuery(this)

      var cWindow = window.open(window.xeiconToolURL.get('edit_popup'), 'editPopup', 'width=980,height=600,directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no')

      window.XEeditor.$once('editorTools.xeicon.popup_edit', function (eventName, obj) {
        obj.init(_$this)
      })
    },
    beforeSubmit: function (targetEditor) {
      // @FIXME CK전용으로만 동작함
      targetEditor.setMode('wysiwyg')
      window.jQuery(targetEditor.container.$).find('[xe-tool-id="editortool/xeicon_tool@xeicon"]').css('cursor', '')
    },
    editorLoaded: function (targetEditor) {
      // @FIXME CK전용으로만 동작함
      targetEditor.setMode('wysiwyg')
      window.jQuery(targetEditor.container.$).find('[xe-tool-id="editortool/xeicon_tool@xeicon"]').css('cursor', 'pointer')
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
