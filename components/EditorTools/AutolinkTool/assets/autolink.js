(function ($, XE) {
  XE.app('Editor', function autolinkToolCode (Editor) {
    Editor.defineTool({
      id: 'editortool/autolink_tool@autolink',
      props: {
        name: 'autolinkHighlight',
        options: {
          label: 'autolink',
          command: 'openautolink'
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

  var textNodes = []
  var protocolRe = '(https?)://'
  var domainRe = '(?:[\\w\\-]+\\.)+(?:[a-z]+)'
  var max255Re = '(?:1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9]?[0-9])'
  var ipRe = '(?:' + max255Re + '\\.){3}' + max255Re
  var portRe = '(?::([0-9]+))?'
  var userRe = '(?:/~[\\w-]+)?'
  var pathRe = '((?:/[\\w!"$-/:-@]+)*)'
  var hashRe = '(?:#([\\w!-@]+))?'
  var urlRegex = new RegExp('(' + protocolRe + '(' + domainRe + '|' + ipRe + '|localhost' + ')' + portRe + userRe + pathRe + hashRe + ')', 'ig')
  var ignoreNode = [
    'a',
    'button',
    'code',
    'embed',
    'iframe',
    'img',
    'input',
    'ins',
    'object',
    'option',
    'pre',
    'script',
    'select',
    'style',
    'textarea',
    'xml'
  ]

  function extractTargets (obj) {
    $(obj)
      .contents()
      .each(function () {
        if (this.nodeType === 1) {
          extractTargets(this)
          return
        }

        if (this.nodeType !== 3) return
        if ($.inArray(this.nodeName.toLowerCase(), ignoreNode) !== -1) return

        var content = this.nodeValue
        if (content.length < 5) return
        if (!/(https?):\/\//i.test(content)) return

        autolink(this)
      })
  }

  function autolink (textNode) {
    var $textNode = $(textNode)
    if (!$textNode.parent().length || $textNode.parent().get(0).nodeName.toLowerCase() === 'a') return
    var content = textNode.nodeValue
    var dummy = $('<span>')

    content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    content = content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>')

    $textNode.before(dummy).replaceWith(content)
    textNode = dummy.next('a')
    dummy.remove()
  }

  window.XE.$$on('content.render', function (eventName, { element }) {
    if (!/(https?):\/\//i.test($(element).text())) return
    extractTargets(element)
    window.XE.$$emit('content.updated.autoLink', element)
  })
})(window.jQuery, window.XE)
