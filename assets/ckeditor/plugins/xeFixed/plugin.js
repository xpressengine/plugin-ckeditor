// @FIXME 이동
CKEDITOR.plugins.add('xeFixed', {
  init: function (editor) {
    function handleToolbar () {
      var $ = window.jQuery
      var content = document.getElementsByClassName('cke_contents').item(0)
      var toolbar = document.getElementsByClassName('cke_top').item(0)
      var editor = document.getElementsByClassName('cke').item(0)
      var scrollvalue = document.documentElement.scrollTop > document.body.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop

      if ($(editor).offset().top < scrollvalue &&
              ($(editor).offset().top + $(editor).height() - $(toolbar).height()) > scrollvalue) {
        toolbar.style.width = content.offsetWidth + 'px'
        toolbar.style.top = '0px'
        toolbar.style.left = '0px'
        toolbar.style.right = '0px'
        toolbar.style.margin = '0 auto'
        toolbar.style.boxSizing = 'border-box'
        toolbar.style.zIndex = '1000'
        toolbar.style.position = 'fixed'
      } else {
        toolbar.style.removeProperty('position')
        toolbar.style.removeProperty('zIndex')
        toolbar.style.removeProperty('top')
        toolbar.style.removeProperty('left')
        toolbar.style.removeProperty('right')
        toolbar.style.removeProperty('margin')
        toolbar.style.removeProperty('boxSizing')
        toolbar.style.removeProperty('width')
      }
    }

    window.jQuery(window).on('scroll resize', handleToolbar)
  }
})
