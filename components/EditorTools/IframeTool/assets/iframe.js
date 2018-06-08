// @ES5
// @FIXME window.iframeToolURL
(function ($, XE, XEeditor) {
  var windowName = 'editortoolIframe'
  var windowFeatures = {
    width: 450,
    height: 500
  }

  XEeditor.tools.define({
    id: 'editortool/iframe_tool@iframe',
    events: {
      iconClick: function (editor, cbAppendToolContent) {
        var targetEditor = editor.props.editor
        XE.Utils.openWindow(window.iframeToolURL.get('popup'), windowName, windowFeatures)

        XEeditor.$$once('editorTools.IframeTool.popup', function (eventName, obj) {
          obj.init(targetEditor, cbAppendToolContent)
        })
      },
      elementDoubleClick: function () {},
      beforeSubmit: function (editor) {
        // @FIXME 위지윅 모드가 아닐 때 동작하지 않음
        var contentDom = editor.getContentDom()
        if(!contentDom) return

        // HTMLPurifier에서 제거되지 않도록 임의의 element로 대체
        $(contentDom).find('iframe[xe-tool-id="editortool/iframe_tool@iframe"]').each(function () {
          var $this = $(this)
          var $temp = $('<div />')
          var toolData = {
            src: $this.attr('src'),
            width: $this.attr('width'),
            height: $this.attr('height'),
            scrolling: $this.attr('scrolling')
          }

          $temp.attr({
            'xe-tool-data': JSON.stringify(toolData).replace(/"/g, "'"),
            'xe-tool-id': 'editortool/iframe_tool@iframe'
          })

          $this.wrap($temp).remove()
        })
      },
      editorLoaded: function (editor) {
        // @FIXME 위지윅 모드가 아닐 때 동작하지 않음
        var contentDom = editor.getContentDom()
        if(!contentDom) return

        // iframe 미리보기
        $(contentDom).find('div[xe-tool-id="editortool/iframe_tool@iframe"]').each(function () {
          var $this = $(this)
          var toolData = JSON.parse($this.attr('xe-tool-data').replace(/'/g, '"'))
          var $iframe = $('<iframe />')

          $iframe.attr({
            src: toolData.src,
            width: toolData.width || null,
            height: toolData.height || null,
            scrolling: toolData.scrolling || null
          })

          $this.html($iframe)
        })
      }
    },
    css: function () {
      return []
    },
    props: {
      name: 'XEIframe',
      options: {
        label: 'XEIframe',
        command: 'openXEIframeEditor'
      },
      addEvent: {
        doubleClick: false
      }
    }
  })
})(window.jQuery, window.XE, window.XEeditor)
