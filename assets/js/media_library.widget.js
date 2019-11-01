window.$(function ($) {
  var XE = window.XE

  $.widget('xe.medialibraryUploader', {
    // default options
    options: {
      classess: {
        dropZone: 'dropZone',
        fileListContainer: 'file-view'
      },
      allowedExtensions: ['*'],
      coverId: null,
      useSetCover: false
    },

    _$el: {
      dropZone: null,
      fileListContainer: null
    },

    // The constructor
    _create: function () {
      console.debug('wid._create', this.element, this.options, this._getCreateOptions())
      this._refresh()
    },

    _refresh: function () {
      this._initDropZone()
      this._initFileList()
      this._initMediaLibrary()
      this._renderFiles()

      if (this.options.useSetCover) {
        var $coverId = this.element.find('input[name=' + this.options.names.cover.input + ']')
        if (!$('[name=' + this.options.names.cover.input + ']').length) {
          $coverId = $('<input type="hidden" name="' + this.options.names.cover.input + '" />')
        }

        if (this.options.coverId) {
          $coverId.val(this.options.coverId)
        }

        $coverId.appendTo(this.element)
      }
    },

    _initMediaLibrary: function () {
      var that = this
      XE.app('MediaLibrary').then(function (appMediaLibrary) {
        console.debug('appMediaLibrary', appMediaLibrary)
        appMediaLibrary._componentBoot({
          renderMode: 'widget',
          fileuploaderOptions: {}
        }).then(function () {
          appMediaLibrary.setupDropzone($('.wrap-ckeditor-fileupload input[name=file]'), {
            dropZone: that.element,
            dragover: function () {
              that.element.addClass('drag')
            },
            dragleave: function () {
              that.element.removeClass('drag')
            },
            drop: function () {
              that.element.removeClass('drag')
            }
          })

          XE.MediaLibrary.$$on('media.uploaded', function (eventName, media) {
            that._renderMedia(media)
            console.debug('@', eventName, media)
          })
        })
      })
    },

    _initDropZone: function () {
      if (!this._$el.dropZone) {
        this.element.addClass(this.options.classess.dropZone)
        // .append('<div class="ckeditor-fileupload-area"><div class="wrap-ckeditor-fileupload"></div></div>')
        this._$el.dropZone = $('<div class="file-attach"><label class="xe-btn xe-btn-sm"><i class="xi-icon xi-file-add"></i> 파일 첨부<input type="file" class="' + this.options.names.file.class + '" name="file" multiple /></label> 클릭하던지 끌어다놔라</div>')
        this.element.append(this._$el.dropZone)
      }
    },

    _initFileList: function () {
      if (!this._$el.fileListContainer) {
        this._$el.fileListContainer = $('<div class="' + this.options.classess.fileListContainer + ' xe-hidden"><ul class="thumbnail-list"></ul></div>')
        this.element.append(this._$el.fileListContainer)
      }
    },

    _renderFiles: function () {
      var that = this
      var filesList = this.options.files

      if (filesList.length) {
        this._$el.fileListContainer.removeClass('xe-hidden')
        XE._.forEach(filesList, function (file, idx) {
          that._renderMedia(file)
        })
      }
    },

    _normalizeFileData: function (payload) {
      var raw = payload
      console.debug('raw', raw)

      return {
        raw: function () {
          return raw
        },
        title: payload.title || payload.clientname,
        imageUrl: XE._.get(payload, 'file.url', payload.url),
        mediaId: (payload.fileId) ? XE._.get(payload, 'id', '') : '',
        fileId: XE._.get(payload, 'fileId', payload.id || ''),
        size: payload.size
      }
    },

    _renderMedia: function (payload) {
      var that = this
      var $container = this._$el.fileListContainer.find('.thumbnail-list')
      this._$el.fileListContainer.removeClass('xe-hidden')

      var media = this._normalizeFileData(payload)
      console.debug('media', media)

      var html = []
      html.push('<li data-media-id="' + media.mediaId + '" data-file-id="' + media.fileId + '">')
      html.push('<img src="' + media.imageUrl + '" alt="' + media.title + '" data-media-id="' + media.mediaId + '" data-file-id="' + media.fileId + '">')
      // 본문 삽입
      html.push('<button type="button" class="btn-insert btnAddImage" data-type="image" data-src="' + media.imageUrl + '" data-media-id="' + media.mediaId + '" data-file-id="' + media.fileId + '"><i class="xi-arrow-up"></i><span class="xe-sr-only">' + XE.Lang.trans('ckeditor::addContentToBody') + '</span></button>')
      // 커버로 지정
      if (this.options.useSetCover) {
        var selected = (media.fileId === that.options.coverId) ? 'selected' : ''

        html.push('<button type="button" class="btn-cover btnCover ' + selected + '" data-media-id="' + media.mediaId + '" data-file-id="' + media.fileId + '"><i class="xi-star-o"></i><span class="xe-sr-only">' + XE.Lang.trans('ckeditor::setCover') + '</span></button>')
      }

      // 첨부 삭제
      html.push('<button type="button" class="btn-delete btnDelFile" data-media-id="' + media.mediaId + '" data-file-id="' + media.fileId + '" data-size="' + media.size + '"><i class="xi-close"></i><span class="xe-sr-only">' + XE.Lang.trans('ckeditor::deleteAttachment') + '</span></button>')
      html.push('<input type="hidden" name="' + this.options.names.file.input + '[]" value="' + media.fileId + '" />')
      html.push('</li>')

      var $item = $(html.join(''))

      // 이미지 본문 삽입
      $item.find('.btnAddImage').on('click', function () {
        that._insertImageContent(media.mediaId, media.fileId)
      })

      // 커버로 지정
      $item.find('.btnCover').on('click', function () {
        var $this = $(this)
        var fileId = $this.data('file-id')
        that._setCover(fileId)
      })

      // 삭제, 제거
      $item.find('.btnDelFile').on('click', function () {
        that._removeImageContent(media.mediaId, media.fileId)
      })

      $container.append($item)
    },

    _insertImageContent: function (mediaId, fileId) {
      var $image = this._$el.fileListContainer.find('.thumbnail-list').find('img[data-file-id=' + fileId + ']')
      var mediaUrl = $image.attr('src')
      var imageHtml = [
        '<img',
        'src="' + mediaUrl + '"',
        (mediaId) ? 'xe-media-id="' + mediaId + '"' : '',
        'xe-file-id="' + fileId + '"',
        '/>'
      ].join(' ')

      this.options.editorInstance.addContents(imageHtml)
    },

    _setCover: function (fileId) {
      if (!this.options.names.cover) return

      var $item = $('.file-view').find('li[data-file-id=' + fileId + ']')
      var $button = $item.find('btn-cover')
      var selected = !!$button.hasClass('.selected').length

      $('.file-view').find('.btn-cover').removeClass('selected')

      if (!selected) {
        $item.find('.btn-cover').addClass('selected')
        $('[name=' + this.options.names.cover.input + ']').val(fileId)
      } else {
        $('[name=' + this.options.names.cover.input + ']').val('')
      }
    },

    _removeImageContent: function (mediaId, fileId) {
      var dom = this.options.editorInstance.getContentDom()
      $(dom).find('img[xe-file-id=' + fileId + ']').remove()
    },

    _destroy: function () {
      console.debug('wid._destroy')
      // remove generated elements
      // this.changer.remove()

      // this.element
      //   .removeClass('custom-colorize')
      //   .enableSelection()
      //   .css('background-color', 'transparent')
    },

    // _setOptions is called with a hash of all options that are changing
    // always refresh when changing options
    _setOptions: function () {
      console.debug('wid._setOptions')
      // _super and _superApply handle keeping the right this-context
      this._superApply(arguments)
      // this._refresh()
    },

    // _setOption is called for each individual option that is changing
    _setOption: function (key, value) {
      console.debug('wid._setOption')
      // prevent invalid color values
      // if (/red|green|blue/.test(key) && (value < 0 || value > 255)) {
      //   return
      // }
      this._super(key, value)
    }
  })
})
