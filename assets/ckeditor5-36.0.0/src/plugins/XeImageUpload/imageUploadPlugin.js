export default function ImageUploadPlugin( editor ) {
  editor.editing.view.document.on( 'clipboardInput', (evt, data) => {
    const dataTransfer = data.dataTransfer;

    if(dataTransfer.files.length) {
      dataTransfer.files.forEach((file) => {
        const adaptor = new XeUploadAdapter(editor, file);
        adaptor.upload();
      });

      data.content = null;
    }
    return;
  })
}

class XeUploadAdapter  {
  constructor (editor, file) {
    this.editor = editor;
    this.config = editor.config._config;
    this.file = file;
    this.allowExtensions = ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'];
  }

  isValid (currentExt, fileSize) {
    var extensions = this.config.extensions
    var fileSize = this.file.size
    var extValid = false

    var attachFileSize = window.XE.Utils.sizeFormatToBytes($(this.editor.ui.view.element).parent().find('.file-view .currentFilesSize').text()) + fileSize
    var attachMaxSize = this.config.attachMaxSize * 1024 * 1024
    var fileMaxSize = this.config.fileMaxSize * 1024 * 1024

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
      XE.toast('warning', XE.Lang.trans('ckeditor::msgAvailableUploadingFiles', {extensions: extensions.join(', '), uploadFileName: this.file.name}))
      return false
    } else if (fileSize > fileMaxSize) {
      XE.toast('warning', XE.Lang.trans('ckeditor::msgMaxFileSize', {fileMaxSize: fileMaxSize, uploadFileName: this.file.name}))
      return false
    } else if (attachFileSize > attachMaxSize) {
      XE.toast('warning', XE.Lang.trans('ckeditor::msgAttachMaxSize', {attachMaxSizeMB: attachMaxSize}))
      return false
    }

    return true
  }

  sendRequest (dataUrl, currentExt, resolve, reject) {
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

    if (this.isValid(currentExt, blob.size)) {
      XE.ajax({
        url: this.config.fileUpload.upload_url,
        type: 'POST',
        processData: false,
        contentType: false,
        data: formData,
        success: (data) => {
          var file = data.file
          var fileName = file.clientname
          var fileSize = file.size
          var id = file.id
          $(this.editor.ui.view.element).siblings('.file-attach-group').trigger('done.upload.editor', {
            file: data.media,
            form: $(this.editor.ui.view.element).closest('form'),
            target: $(this.editor.ui.view.element).closest('form').find('.file-attach-group')
          });

          resolve({
            default: data.media.url
          })
        },
        error: (e) => {
          reject(e.message);
        }
      })
    }
  }

  upload () {
    return new Promise((resolve, reject) => {
        if(this.config.perms.upload) {
          var currentExt = this.file.type.split('/')[1];

          if(!this.allowExtensions.includes(currentExt)) {
            XE.toast('warning', XE.Lang.trans('ckeditor::msgAvailableUploadingFiles', {extensions: this.allowExtensions.join(', '), uploadFileName: this.file.name}))
            return;
          }

          var reader = new FileReader()
          reader.onload = (e) => {
            this.sendRequest(e.target.result, currentExt, resolve, reject)
          }
          reader.readAsDataURL(this.file)
        }
      })
  }
}
