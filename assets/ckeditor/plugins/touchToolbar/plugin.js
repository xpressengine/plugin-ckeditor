// @FIXME 이동
CKEDITOR.plugins.add('touchToolbar', {
  init: function (editor) {
    var $ = window.jQuery
    var onlongtouch
    var timer, lockTimer
    var touchduration = 800
    var touches = ''

    function touchstart (e) {
      if (lockTimer) {
        return
      }
      touches = e.originalEvent.touches[0]
      timer = setTimeout(onlongtouch, touchduration)
      lockTimer = true
      editor.focus()
    }

    function touchend () {
      if (timer) {
        clearTimeout(timer)
        touches = ''
        lockTimer = false
      }
    }

    onlongtouch = function () {
      if (touches) {
        var content = document.getElementsByClassName('cke_contents').item(0)
        var toolbar = document.getElementsByClassName('cke_top').item(0)
        var cke_editor = document.getElementsByClassName('cke').item(0)

        $(toolbar).fadeOut('fast', function () {
          cke_editor.style.position = 'relative'
          toolbar.style.borderTop = '1px solid #ddd'
          toolbar.style.width = content.offsetWidth + 'px'
          toolbar.style.top = (touches.clientY - 20) + 'px'
          toolbar.style.left = '0px'
          toolbar.style.right = '0px'
          toolbar.style.margin = '0 auto'
          toolbar.style.boxSizing = 'border-box'
          toolbar.style.zIndex = '1000'
          toolbar.style.position = 'absolute'

          $(this).fadeIn('fast')
        })
      }
    }

    resize = function () {
      var content = document.getElementsByClassName('cke_contents').item(0)
      var toolbar = document.getElementsByClassName('cke_top').item(0)

      toolbar.style.width = content.offsetWidth + 'px'
    }

    editor.on('instanceReady', function (event) {
      $(event.editor.document.$).on('touchstart', touchstart)
      $(event.editor.document.$).on('touchend', touchend)
      $(window).on('resize', resize)
    })
  }
})
