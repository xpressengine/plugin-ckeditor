(function ($, XE) {
  XE.app('Editor', function defineToolCode (Editor) {
    Editor.defineTool({
      id: 'editortool/code_tool@code',
      props: {
        name: 'CodeHighlight',
        options: {
          label: 'code',
          command: 'opencode'
        },
        addEvent: {
          doubleClick: false
        }
      },
      css: function () {},
      events: {
        iconClick: function (editor, cbAppendToolContent) {},
        elementDoubleClick: function () {},
        beforeSubmit: function (editor) {},
        editorLoaded: function (editor) {}
      }
    })
  })
})(window.jQuery, window.XE)
