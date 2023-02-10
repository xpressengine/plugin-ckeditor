window.$(function ($) {
  var XE = window.XE

  $.widget('xe.medialibraryUploader', {
    // default options
    options: {
      classess: {
        dropZone: 'dropZone',
        fileThumbsContainer: 'file-view',
        fileListContainer: 'file-view-list'
      },
      editorInstance: null,
      allowedExtensions: ['*'],
      coverId: null,
      useSetCover: false,
      $el: {
        dropZone: null,
        progressbarContainer: null,
        fileThumbsContainer: null,
        fileListContainer: null,
        btnMediaLibrary: null
      }
    },

    // The constructor
    _create: function () {
      this._refresh()
      this.editorInstance = this.options.editorInstance
    },

    _refresh: function () {
      this._initDropZone()
      // this._initProgressbar()
      this._initFileList()
      this._initUploader()
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

    _initUploader: function () {
      var that = this
      XE.app('MediaLibrary').then(function (appMediaLibrary) {
        appMediaLibrary.createUploader(that.element.find('input[name=file]'), { instance_id: that.options.instanceId }, {
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

        $(that.element).on('done.upload.editor', function (eventName, media, options) {
          that._renderMedia(media.file, media.form)
          that._insertToDocument(that._normalizeFileData(media.file), media.form, that.options)
        })
      })
    },

    _updateProgress: function (progress) {
      this.options.$el.progressbarContainer.find('.xefu-progressbar__block').text(progress.percent)

      if (progress.percent === 100) {
        this.options.$el.progressbarContainer.show().addClass('xe-hidden')
      } else {
        this.options.$el.progressbarContainer.show().removeClass('xe-hidden')
      }
    },

    _initDropZone: function () {
      var that = this
      var $form = this.element.closest('form')
      var user = {
        id: XE.config.getters['user/id'],
        rating: XE.config.getters['user/rating']
      }

      if (!this.options.$el.dropZone) {
        this.element.addClass(this.options.classess)
        var fileAttach = '<label class="xe-btn xe-btn-link"><i class="xi-icon xi-plus"></i> 파일 첨부<input type="file" class="' + this.options.names.file.class + ' xe-hidden" name="file" multiple /></label>'
        var medialibraryEmbed = '<button type="button" class="xe-btn xe-btn-link __xefu-medialibrary-import"><i class="xi-plus"></i> 미디어 라이브러리</button>'

        if (user.rating === 'guest') {
          medialibraryEmbed = ''
        }

        this.options.$el.dropZone = $('<div class="file-attach"><p class="attach-info-text xe-hidden-xs">여기에 파일을 끌어 놓거나 미디어 라이브러리 또는 파일 첨부 버튼을 누르세요.</p>' + fileAttach + medialibraryEmbed + '</div>')
        this.element.append(this.options.$el.dropZone)
      }

      XE.app('MediaLibrary').then(function (appMediaLibrary) {
        // 미디어 embed 버튼
        that.options.$el.dropZone.find('.__xefu-medialibrary-import').on('click', function () {
          appMediaLibrary.open({
            listMode: 2,
            user: user,
            selected: function (mediaList) {
              $.each(mediaList, function () {
                that._renderMedia(this, $form)
                that._insertToDocument(that._normalizeFileData(this), $form)
              })
            }
          })
        })
      })
    },

    _initProgressbar: function () {
      if (!this.options.$el.progressbarContainer) {
        this.options.$el.progressbarContainer = $('<div class="xefu-progress-container xe-hidden"><div class="xefu-progressbar"><div class="xefu-progressbar__block"></div></div></div>')
        this.element.append(this.options.$el.progressbarContainer)
      }
    },

    _initMediaLibrary: function () {
      if (!this.options.$el.btnMediaLibrary) {
        this.options.$el.btnMediaLibrary = $('<button type="button" class="xe-btn xe-btn-sm"><i class="xi-library-image-o"></i>미디어 라이브러리</button>')
      }
    },

    _initFileList: function () {
      if (!this.options.$el.fileThumbsContainer) {
        this.options.$el.fileThumbsContainer = $('<div class="' + this.options.classess.fileThumbsContainer + ' xe-hidden"><ul class="thumbnail-list"></ul></div>')
        this.element.append(this.options.$el.fileThumbsContainer)
      }

      if (!this.options.$el.fileListContainer) {
        this.options.$el.fileListContainer = $('<ul class="file-attach-list"></ul>')
        this.options.$el.fileThumbsContainer.find('.thumbnail-list').after(this.options.$el.fileListContainer)
      }
    },

    _renderFiles: function () {
      var that = this
      var filesList = this.options.files
      var $form = this.element.closest('form')

      if (filesList.length) {
        this.options.$el.fileThumbsContainer.removeClass('xe-hidden')
        XE._.forEach(filesList, function (file, idx) {
          that._renderMedia(file, $form)
        })
      }
    },

    _normalizeFileData: function (payload) {
      var data = {
        title: payload.title || payload.clientname,
        imageUrl: XE._.get(payload, 'file.url', payload.url) ? new URL(XE._.get(payload, 'file.url', payload.url)).pathname : undefined,
        mediaId: (payload.file_id) ? XE._.get(payload, 'id', '') : '',
        fileId: XE._.get(payload, 'file_id', payload.id || ''),
        size: payload.size,
        mime: XE._.get(payload, 'file.mime', XE._.get(payload, 'mime', ''))
      }

      data.downloadUrl = this.options.downloadUrl + '/' + data.fileId

      return data
    },

    _renderMedia: function (payload, $form) {
      var that = this
      var $container
      var isCover = false
      var media = this._normalizeFileData(payload)

      this.options.$el.fileThumbsContainer.removeClass('xe-hidden')

      if (this.options.useSetCover && window.XE.Utils.isImage(media.mime)) {
        isCover = media.fileId === that.options.coverId
      }

      if (window.XE.Utils.isImage(media.mime)) {
        if (!this.options.coverId) {
          this.options.coverId = media.fileId
          this._setCover(media.fileId)
        }
        $container = $form.find(this.options.$el.fileThumbsContainer).find('.thumbnail-list')
      } else {
        $container = $form.find(this.options.$el.fileListContainer)
      }

      if ($container.find('[data-id=' + media.fileId + ']').length) {
        return
      }

      var html = []
      var itemClass = ['file-item']
      if (isCover) {
        itemClass.push('is-cover')
      }
      if (!window.XE.Utils.isImage(media.mime)) {
        itemClass.push('xe-col-md-6')
      }

      html.push('<li class="' + itemClass.join(' ') + '" data-media-id="' + media.mediaId + '" data-id="' + media.fileId + '" title="' + media.title + '">')

      if (window.XE.Utils.isImage(media.mime)) {
        html.push('<img src="' + media.imageUrl + '" alt="' + media.title + '">')
      } else {
        html.push('<div class="file-item-group">')
        html.push('<p class="filename xe-pull-left">' + media.title + '</p>')
      }

      // 커버로 지정
      if (this.options.useSetCover && window.XE.Utils.isImage(media.mime)) {
        html.push('<button type="button" class="btn-cover">' + XE.Lang.trans('ckeditor::cover') + '</button>')
      }

      // 첨부 삭제
      if (window.XE.Utils.isImage(media.mime)) {
        html.push('<button type="button" class="btn-delete"><i class="xi-close"></i><span class="xe-sr-only">' + XE.Lang.trans('ckeditor::deleteAttachment') + '</span></button>')
      } else {
        html.push('<div class="xe-pull-right"><button type="button" class="btn-insert"><i class="xi-arrow-up"></i></button><button type="button" class="btn-delete"><i class="xi-close"></i><span class="xe-sr-only">' + XE.Lang.trans('ckeditor::deleteAttachment') + '</span></button></div>')
      }

      // 본문 삽입
      if (window.XE.Utils.isImage(media.mime)) {
        html.push('<button type="button" class="btn-insert"><i class="xi-arrow-up"></i></button>')
      }

      html.push('<input type="hidden" name="' + this.options.names.file.input + '[]" value="' + media.fileId + '" />')

      if (!window.XE.Utils.isImage(media.mime)) {
        html.push('</div>')
      }

      html.push('</li>')

      var $item = $(html.join(''))

      // 커버로 지정
      $item.on('click', '.btn-cover', function () {
        that._setCover(media.fileId)
      })

      // 삭제, 제거
      $item.find('.btn-delete').on('click', function () {
        that._removeFromDocument({
          fileId: media.fileId,
          mediaId: media.mediaId || null
        })
        $item.remove()

        if (!that.options.names.cover) {
          if (this.options.$el.fileThumbsContainer.find('[name=' + that.options.names.cover.input + ']').val() == media.fileId) {
            this.options.$el.fileThumbsContainer.find('[name=' + that.options.names.cover.input + ']').val('')
          }
        }
      })

      // 본문 삽입
      $item.find('.btn-insert').on('click', function () {
        that._insertToDocument(media)
      })

      $container.append($item)
    },

    _insertToDocument: function (media, form, options) {
      if (typeof options === 'undefined') {
        options = {}
      }
      var html = []
      var importMode = options.importMode || 'embed'

      if (form instanceof window.jQuery && !form.is($('#' + this.editorInstance.selector).closest('form'))) {
        return
      }

      // embed
      if (window.XE.Utils.isImage(media.mime)) {
        var mediaUrl
        // Image
        if (media.imageUrl) {
          mediaUrl = media.imageUrl
        } else {
          var $image = this.options.$el.fileThumbsContainer.find('.thumbnail-list').find('li[data-id=' + media.fileId + '] img')
          mediaUrl = $image.attr('src')
        }

        html.push('<img')
        html.push('class="__xe_image"')
        html.push('src="' + mediaUrl + '"')
        if (media.mediaId) {
          html.push('data-media-id="' + media.mediaId + '"')
        }
        html.push('data-id="' + media.fileId + '"')
        html.push('/><br>')
      } else if (window.XE.Utils.isVideo(media.mime)) {
        // Video
        html.push('<div class="ckeditor-html5-video" data-responsive="true" style="text-align:center;"')
        if (media.mediaId) {
          html.push('data-media-id="' + media.mediaId + '"')
        }
        html.push('data-id="' + media.fileId + '"')
        html.push('>')
        html.push('<video controls="controls" controlslist="nodownload" src="' + media.imageUrl + '" style="max-width: 100%; height: auto;"></video>')
        html.push('</div>')
      } else if (window.XE.Utils.isAudio(media.mime)) {
        // Audio
        html.push('<p>')
        html.push('<audio controls="controls" controlslist="nodownload" src="' + media.imageUrl + '"')
        if (media.mediaId) {
          html.push('data-media-id="' + media.mediaId + '"')
        }
        html.push('data-id="' + media.fileId + '"')
        html.push('></audio>')
        html.push('</p>')
      } else {
        // download
        html.push('<a href="' + media.downloadUrl + '"')
        if (media.mediaId) {
          html.push('data-media-id="' + media.mediaId + '"')
        }
        html.push('data-id="' + media.fileId + '"')
        html.push('">')
        html.push(media.title)
        html.push('</a>')
      }
      this.editorInstance.addContents(html.join(' '))
    },

    _setCover: function (fileId) {
      if (!this.options.names.cover) return

      var $item = this.options.$el.fileThumbsContainer.find('li[data-id=' + fileId + ']')
      this.options.$el.fileThumbsContainer.find('.file-item').removeClass('is-cover')

      $item.addClass('is-cover')
      this.element.find('[name=' + this.options.names.cover.input + ']').val(fileId)
      this.options.coverId = fileId
    },

    _removeFromDocument: function (payload) {
      var $editable = $(this.editorInstance.getContentDom())
      var $elTarget = $editable.find('[data-id="' + payload.fileId + '"],[xe-file-id="' + payload.fileId + '"]')

      if ($elTarget.hasClass('cke_widget_element')) {
        $elTarget.closest('.cke_widget_wrapper').remove()
      } else {
        $elTarget.remove()
      }
    },

    _destroy: function () {
      // console.debug('wid._destroy')
      // remove generated elements
      // this.changer.remove()

      // this.element
      //   .removeClass('custom-colorize')
      //   .enableSelection()
      //   .css('background-color', 'transparent')
    },

    _setOptions: function () {
      // console.debug('wid._setOptions')
      // _super and _superApply handle keeping the right this-context
      this._superApply(arguments)
      // this._refresh()
    },

    _setOption: function (key, value) {
      // console.debug('wid._setOption')
      // prevent invalid color values
      // if (/red|green|blue/.test(key) && (value < 0 || value > 255)) {
      //   return
      // }
      this._super(key, value)
    }
  })
})
