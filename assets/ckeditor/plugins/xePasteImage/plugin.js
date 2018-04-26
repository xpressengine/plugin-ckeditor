// @FIXME 이동
CKEDITOR.plugins.add('xePasteImage', {
  init: function (editor) {
    editor.on('paste', function (e) {
      var $ = window.jQuery
      var XE = window.XE

      var data = e.data
      var dataValue = data.dataValue

      var agent = navigator.userAgent.toLowerCase()
      var imageSrc = ''
      var file = ''
      var currentExt = ''
      var bName = ''

      var isValid = function (ext, fileSize) {
        var extensions = editor.config.extensions
        var fileSize = file.size
        var extValid = false

        var attachFileSize = window.XE.Utils.sizeFormatToBytes($('#' + editor.name).parent().find('.file-view .currentFilesSize').text()) + fileSize
        var attachMaxSize = editor.config.attachMaxSize * 1024 * 1024
        var fileMaxSize = editor.config.fileMaxSize * 1024 * 1024

        for (var i = 0; i < extensions.length; i++) {
          var sCurExtension = extensions[i]

          if (sCurExtension === '*') {
            extValid = true
            break
          } else if (currentExt.toLowerCase() === sCurExtension.toLowerCase()) {
            extValid = true
            break
          }
        }

        if (!extValid) {
          XE.toast('warning', '업로드 가능한 확장자가 아닙니다.') // @FIXME 다국어
          return false
        } else if (fileSize > fileMaxSize) {
          XE.toast('warning', '업로드 가능한 파일 사이즈가 초과되었습니다.') // @FIXME 다국어
          return false
        } else if (attachFileSize > attachMaxSize) {
          XE.toast('warning', '최대 업로드 가능한 크기를 초과하였습니다.') // @FIXME 다국어
          return false
        }

        return true
      }

      var upload = function (dataUrl) {
        var byteString = atob(dataUrl.split(',')[1])
        var mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]

        var ab = new ArrayBuffer(byteString.length)
        var ia = new Uint8Array(ab)
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }

        var blob = new Blob([ab], { 'type': mimeString })
        var formData = new FormData()
        var fileName = 'image_' + new Date().getTime() + '.' + currentExt
        blob.name = fileName
        formData.append('file', blob, fileName)

        if (isValid(currentExt, blob.size)) {
          XE.ajax({
            url: editor.config.fileUpload.upload_url,
            type: 'POST',
            processData: false,
            contentType: false,
            data: formData,
            success: function (data) {
              var file = data.file
              var fileName = file.clientname
              var fileSize = file.size
              var id = file.id

              if ($('.file-view').hasClass('xe-hidden')) {
                $('.file-view').removeClass('xe-hidden')
              }

              var fileCount = parseInt($('.fileCount').text(), 10) + 1

              // file size
              var fileTotalSize = window.XE.Utils.sizeFormatToBytes($('.currentFilesSize').text()) + fileSize
              var thumbImageUrl = (data.thumbnails) ? data.thumbnails[2].url : ''
              var tmplImage = [
                '<li>',
                '   <img src="' + thumbImageUrl + '" alt="' + fileName + '">',
                '   <button type="button" class="btn-insert btnAddImage" data-type="image" data-src="' + thumbImageUrl + '" data-id="' + file.id + '"><i class="xi-arrow-up"></i><span class="xe-sr-only">' + XE.Lang.trans('ckeditor::addContentToBody') + '</span></button>', // 본문에 넣기
                '   <button type="button" class="btn-delete btnDelFile" data-id="' + file.id + '" data-size="' + file.size + '"><i class="xi-close-thin"></i><span class="xe-sr-only">' + XE.Lang.trans('ckeditor::deleteAttachment') + '</span></button>', // 첨부삭제
                '   <input type="hidden" name="' + editor.config.names.file.input + '[]" value="' + id + '" />',
                '</li>'
              ].join('\n')

              $('.thumbnail-list').append(tmplImage)

              $('.file-view').removeClass('xe-hidden')

              // 첨부파일 갯수 표시
              $('.fileCount').text(fileCount)

              // 첨부파일 용량 표시
              $('.currentFilesSize').text(window.XE.Utils.formatSizeUnits(fileTotalSize))

              $('[data-src="' + thumbImageUrl + '"]').trigger('click')
            }
          })
        }
      }

      if (agent.indexOf('chrome') != -1) {
        imageSrc = data.dataTransfer._.data.Text
        bName = 'chrome'
      }

      if (agent.indexOf('firefox') != -1) {
        imageSrc = $(dataValue).wrapAll('<div />').parent().find('img').attr('src')
        bName = 'firefox'
      }

      if ((navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf('msie') != -1)) {
        imageSrc = $(dataValue).wrapAll('<div />').parent().find('img').attr('src')
        bName = 'ie'
      }

      // 사파리는 지원 불가
      if (navigator.userAgent.toLowerCase().indexOf('chrome') == -1 &&
        navigator.userAgent.toLowerCase().indexOf('safari') != -1) {
        return
      }

      var bUpload = false

      if (editor.config.perms.upload) {
        if (bName == 'chrome') {
          if (window.XE.Utils.isURL(imageSrc)) {
            currentExt = imageSrc.split('.').pop().split('?').shift().split('#').shift()

            if (['jpg', 'jpeg', 'png', 'gif'].indexOf(currentExt) == -1) {
              currentExt = 'png'
            }
          } else if (imageSrc && /data:image\/(png|gif|jpg|jpeg);base64,.*?/.test(imageSrc)) {
            currentExt = imageSrc.match(/data:image\/(png|gif|jpg|jpeg);base64,.*?/)[1]
          }

          file = e.data.dataTransfer.getFile(0)

          if (file) {
            bUpload = true
          }
        } else if (imageSrc && /data:image\/(png|gif|jpg|jpeg);base64,.*?/.test(imageSrc)) {
          currentExt = imageSrc.match(/data:image\/(png|gif|jpg|jpeg);base64,.*?/)[1]
          file = new Blob([window.atob(imageSrc.split(',')[1])], {type: 'image/' + currentExt, encoding: 'utf-8'})
          bUpload = true
        }

        if (bUpload) {
          e.cancel()

          var reader = new FileReader()

          reader.onload = function (e) {
            var result = (/data:image\/(png|gif|jpg|jpeg);base64,.*?/.test(imageSrc)) ? imageSrc : e.target.result
            upload(result)
          }

          reader.readAsDataURL(file)
        }
      }
    })
  }
})
