var ImageResize = (function () {
  var _this
  var _result
  var _size = {
    width: 0,
    height: 0
  }
  var _mimeType = ''

  var _$cropper = null

  var _resizeMode = false
  var _cropMode = false

  var _thumbImageUrl = ''
  var _id = ''
  var _file

  return {
    init: function () {
      _this = this

      this.cache()
      this.bindEvents()

      return this
    },
    cache: function () {
      this.$imageFile = $('#imageFile')
      this.$btnSelectImage = $('#btnSelectImage')
      this.$btnResetImage = $('#btnResetImage')
      this.$btnCropImage = $('#btnCropImage')
      this.$btnClose = $('#btnClose')
      this.$btnUpload = $('#btnUpload')
      this.$btnAppendToEditor = $('#btnAppendToEditor')
      this.$btnToggleResize = $('#btnToggleResize')
      this.$btnToggleCrop = $('#btnToggleCrop')
    },
    bindEvents: function () {
      $(window).on('load', this.preventReloading)

      this.$imageFile.on('change', this.changeFile)
      this.$btnSelectImage.on('click', function () {
        _this.$imageFile.trigger('click')
      })
      this.$btnToggleResize.on('click', this.setResizeMode)
      this.$btnToggleCrop.on('click', this.setCropMode)
      this.$btnCropImage.on('click', this.cropImage)
      this.$btnResetImage.on('click', this.reset)
      this.$btnClose.on('click', function () {
        self.close()
      })

      this.$btnUpload.on('click', this.upload)
      this.$btnAppendToEditor.on('click', this.appendToEditor)
    },
    appendToEditor: function () {
      var imageHtml = [
        '<img ',
        "src='" + _thumbImageUrl + "' ",
        "class='" + self.targetEditor.config.names.file.image.class + "' ",
        "xe-file-id='" + _id + "' ",
        self.targetEditor.config.names.file.image.identifier + "='" + _id,
        "' />"
      ].join('')

      self.appendToolContent(imageHtml)
    },
    preventReloading: function () {
      if (!self.appendToolContent) {
        alert('팝업을 재실행 하세요.')
        self.close()
      }
    },
    isValidUpload: function (blob) {
      /**
       uploadInfo
       -uploadUrl: uploadUrl,
       -attachMaxSize: attachMaxSize,
       -fileMaxSize: fileMaxSize,
       -extensions: extensions,
       -$uploadArea: $uploadArea
       * */
      var uploadInfo = self.uploadInfo
      var extensions = uploadInfo.extensions
      var currentFileSize = blob.size
      var attachFileSize = parseFloat(uploadInfo.$uploadArea.find('.currentFilesSize').text()) * 1024 * 1024 + currentFileSize
      var attachMaxSize = uploadInfo.attachMaxSize * 1024 * 1024
      // var uploadFileName = _this.$imageFile[0].files[0].name;
      var uploadFileName = _file.name
      var extValid = false

      for (var i = 0; i < extensions.length; i++) {
        var sCurExtension = extensions[i]

        if (sCurExtension === '*') {
          extValid = true
          break
        } else if (uploadFileName.substr(uploadFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() === sCurExtension.toLowerCase()) {
          extValid = true
          break
        }
      }

      if (!extValid) {
        alert('확장자 ' + uploadFileName.split('.').pop() + '는 업로드가 불가합니다.')
      } else if (currentFileSize > uploadInfo.fileMaxSize * 1024 * 1024) {
        alert('파일 업로드 파일 크기 제한 [' + Utils.formatSizeUnits(uploadInfo.fileMaxSize * 1024 * 1024) + ']')

        return false
      } else if (attachFileSize > attachMaxSize * 1024 * 1024) {
        alert('파일 업로드는 최대 ' + Utils.formatSizeUnits(uploadInfo.attachMaxSize * 1024 * 1024) + '까지만 가능합니다.')

        return false
      }

      return true
    },
    upload: function () {
      var dataUrl = $('#targetCanvas')[0].toDataURL(_mimeType)
      var blob = _this.dataURItoBlob(dataUrl)

      if (_this.isValidUpload(blob)) {
        var formData = new FormData()

        blob.name = _fileName
        formData.append('file', blob, _fileName)

        _this.setButtonDisabledStatus({
          select: 'hide',
          toggleResize: 'hide',
          toggleCrop: 'hide',
          crop: 'hide',
          close: 'hide',
          reset: 'hide',
          upload: 'hide',
          append: 'hide'
        })

        XE.ajax({
          url: self.uploadInfo.uploadUrl,
          type: 'POST',
          processData: false,
          contentType: false,
          data: formData,
          success: function (data) {
            var file = data.file,
              fileName = file.clientname,
              fileSize = file.size,
              id = file.id

            if (opener.$('.file-view').hasClass('xe-hidden')) {
              opener.$('.file-view').removeClass('xe-hidden')
            }

            var fileCount = parseInt(opener.$('.fileCount').text(), 10) + 1

            // file size
            var fileTotalSize = Utils.sizeFormatToBytes(opener.$('.currentFilesSize').text()) + fileSize
            var thumbImageUrl = (data.thumbnails) ? data.thumbnails[2].url : ''
            var tmplImage = [
              '<li>',
              '   <img src="' + thumbImageUrl + '" alt="' + fileName + '">',
              '   <button type="button" class="btn-insert btnAddImage" data-type="image" data-src="' + thumbImageUrl + '" data-id="' + file.id + '"><i class="xi-arrow-up"></i><span class="xe-sr-only">' + XE.Lang.trans('ckeditor::addContentToBody') + '</span></button>', // 본문에 넣기
              '   <button type="button" class="btn-delete btnDelFile" data-id="' + file.id + '" data-size="' + file.size + '"><i class="xi-close-thin"></i><span class="xe-sr-only">' + XE.Lang.trans('ckeditor::deleteAttachment') + '</span></button>', // 첨부삭제
              '   <input type="hidden" name="' + self.targetEditor.config.names.file.input + '[]" value="' + id + '" />',
              '</li>'
            ].join('\n')

            opener.$('.thumbnail-list').append(tmplImage)

            opener.$('.file-view').removeClass('xe-hidden')

            // 첨부파일 갯수 표시
            opener.$('.fileCount').text(fileCount)

            // 첨부파일 용량 표시
            opener.$('.currentFilesSize').text(Utils.formatSizeUnits(fileTotalSize))

            _thumbImageUrl = thumbImageUrl
            _id = id

            // 에디터에 넣기 활성화
            _this.setButtonDisabledStatus({
              select: 'show',
              toggleResize: 'hide',
              toggleCrop: 'hide',
              crop: 'hide',
              close: 'show',
              reset: 'show',
              upload: 'hide',
              append: 'show'
            })
          },
          error: function () {
            _this.setButtonDisabledStatus({
              select: 'show',
              toggleResize: 'hide',
              toggleCrop: 'hide',
              crop: 'hide',
              close: 'hide',
              reset: 'hide',
              upload: 'show',
              append: 'hide'
            })
          }
        })
      }
    },
    dataURItoBlob: function (dataURI) {
      var byteString = atob(dataURI.split(',')[1])
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      var ab = new ArrayBuffer(byteString.length)
      var ia = new Uint8Array(ab)
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }

      var bb = new Blob([ab], { 'type': mimeString })
      return bb
    },
    cropImage: function () {
      var dataURL = _$cropper.cropper('getCroppedCanvas').toDataURL()
      var img = new Image()

      img.src = dataURL
      img.onload = function () {
        var imgWidth = this.width
        var imgHeight = this.height

        _$cropper.cropper('destroy')
        _cropMode = false

        $('.image_size').text(imgWidth + ' x ' + imgHeight)

        var $image = $('<img id="targetImage" src="' + dataURL + '" />').css({
          width: imgWidth,
          height: imgHeight
        })

        $('#imageWrapper').html($image)

        var canvas = $('<canvas id="targetCanvas" />')[0]
        var ctx = canvas.getContext('2d')
        canvas.width = imgWidth
        canvas.height = imgHeight

        ctx.drawImage($('#targetImage')[0], 0, 0, imgWidth, imgHeight)

        $('#imageWrapper').html(canvas)

        _this.setButtonDisabledStatus({
          select: 'show',
          toggleResize: 'show',
          toggleCrop: 'show',
          crop: 'hide',
          close: 'show',
          reset: 'show',
          upload: 'show',
          append: 'hide'
        })
      }
    },
    setCropMode: function () {
      if (_cropMode) {
        _cropMode = false
        //                    $('img').cropper('destroy');
        _$cropper.cropper('destroy')

        var canvas = $('<canvas id="targetCanvas" />')[0]
        var ctx = canvas.getContext('2d')
        var imgWidth = $('#targetImage').width()
        var imgHeight = $('#targetImage').height()
        canvas.width = imgWidth
        canvas.height = imgHeight

        ctx.drawImage($('#targetImage')[0], 0, 0, imgWidth, imgHeight)

        $('#imageWrapper').html(canvas)

        _this.setButtonDisabledStatus({
          select: 'show',
          toggleResize: 'show',
          toggleCrop: 'show',
          crop: 'hide',
          close: 'show',
          reset: 'show',
          upload: 'show',
          append: 'hide'
        })
      } else {
        _cropMode = true

        var src = $('#targetCanvas')[0].toDataURL()
        var width = $('#targetCanvas').width()
        var height = $('#targetCanvas').height()
        var $img = $('<img id="targetImage" src="' + src + '" />').css({
          width: width, height: height
        })

        $('#imageWrapper').html($img)

        _$cropper = $('#targetImage').cropper({
          strict: true
        })

        _this.setButtonDisabledStatus({
          select: 'hide',
          toggleResize: 'hide',
          toggleCrop: 'hide',
          crop: 'show',
          close: 'hide',
          reset: 'show',
          upload: 'hide',
          append: 'hide'
        })
      }
    },
    reset: function () {
      if (_result) {
        _resizeMode = false
        _cropMode = false

        var img = new Image()

        img.src = _result
        img.onload = function () {
          var imgWidth = _size.width
          var imgHeight = _size.height

          $('.image_size').text(imgWidth + ' x ' + imgHeight)

          var $image = $('<img id="targetImage" src="' + _result + '" />').css({
            width: imgWidth,
            height: imgHeight
          })

          $('#imageWrapper').html($image)

          var canvas = $('<canvas id="targetCanvas" />')[0]
          var ctx = canvas.getContext('2d')
          canvas.width = imgWidth
          canvas.height = imgHeight

          ctx.drawImage($('#targetImage')[0], 0, 0, imgWidth, imgHeight)

          $('#imageWrapper').html(canvas)

          _this.setButtonDisabledStatus({
            select: 'show',
            toggleResize: 'show',
            toggleCrop: 'show',
            crop: 'hide',
            close: 'show',
            reset: 'hide',
            upload: 'show',
            append: 'hide'
          })
        }
      }
    },
    setResizeMode: function () {
      var $this = $(this)

      if (_resizeMode) {
        _resizeMode = false

        $('#targetImage').resizable('destroy')

        var canvas = $('<canvas id="targetCanvas" />')[0]
        var ctx = canvas.getContext('2d')
        var imgWidth = $('#targetImage').width()
        var imgHeight = $('#targetImage').height()
        canvas.width = imgWidth
        canvas.height = imgHeight

        ctx.drawImage($('#targetImage')[0], 0, 0, imgWidth, imgHeight)

        $('#imageWrapper').html(canvas)

        _this.setButtonDisabledStatus({
          select: 'show',
          toggleResize: 'show',
          toggleCrop: 'show',
          crop: 'hide',
          close: 'show',
          reset: 'show',
          upload: 'show',
          append: 'hide'
        })
      } else {
        _resizeMode = true

        var src = $('#targetCanvas')[0].toDataURL()
        var width = $('#targetCanvas').width()
        var height = $('#targetCanvas').height()
        var $img = $('<img id="targetImage" src="' + src + '" />').css({
          width: width, height: height
        })

        $('#imageWrapper').html($img)

        var options = {
          containment: '#imageWrapper',
          resize: function (e, ui) {
            var width = ui.size.width
            var height = ui.size.height

            $('.image_size').text(width + ' x ' + height)
          }
        }

        $('#targetImage').resizable(options)

        _this.setButtonDisabledStatus({
          select: 'hide',
          toggleResize: 'show',
          toggleCrop: 'hide',
          crop: 'hide',
          close: 'hide',
          reset: 'hide',
          upload: 'hide',
          append: 'hide'
        })
      }
    },
    changeFile: function (e) {
      e.preventDefault()
      var target = e.target
      var file = target && target.files && target.files[0]

      if (file) {
        var reader = new FileReader()

        _file = target.files[0]
        reader.onload = function (e) {
          var result = e.target.result
          var img = new Image()

          img.src = _result = result
          img.onload = function () {
            var imgWidth = this.width
            var imgHeight = this.height

            _size.width = imgWidth
            _size.height = imgHeight

            $('.image_size').text(imgWidth + ' x ' + imgHeight)

            var $image = $('<img id="targetImage" src="' + result + '" />').css({
              width: imgWidth,
              height: imgHeight
            })

            $('#imageWrapper').html($image)

            var canvas = $('<canvas id="targetCanvas" />')[0]
            var ctx = canvas.getContext('2d')
            canvas.width = imgWidth
            canvas.height = imgHeight

            ctx.drawImage($('#targetImage')[0], 0, 0, imgWidth, imgHeight)

            $('#imageWrapper').html(canvas)

            _this.setButtonDisabledStatus({
              select: 'show',
              toggleResize: 'show',
              toggleCrop: 'show',
              crop: 'hide',
              close: 'show',
              reset: 'hide',
              upload: 'show',
              append: 'hide'
            })
          }
        }

        _mimeType = target.files[0].type
        _fileName = target.files[0].name

        reader.readAsDataURL(target.files[0])
      }
    },
    /**
     * @param {object} obj
     * <pre>
     *     select
     *     reset
     *     crop
     *     close
     *     upload
     *     append
     *
     *     true, false
     * </pre>
     * @description 버튼 상태 변경
     * */
    setButtonDisabledStatus: function (obj) {
      for (var command in obj) {
        // var command = obj[prop].command;
        var status = obj[command]
        var $target = $()

        switch (command) {
          case 'toggleResize':
            $target = _this.$btnToggleResize
            break
          case 'toggleCrop':
            $target = _this.$btnToggleCrop
            break
          case 'select':
            $target = _this.$btnSelectImage
            break
          case 'reset':
            $target = _this.$btnResetImage
            break
          case 'crop':
            $target = _this.$btnCropImage
            break
          case 'close':
            $target = _this.$btnClose
            break
          case 'upload':
            $target = _this.$btnUpload
            break
          case 'append':
            $target = _this.$btnAppendToEditor
            break
        }

        (status === 'show') ? $target.show() : $target.hide()
      }
    },
    getEmptyTemplate: function () {
      return [
        ''
      ]
    }
  }
})().init()
