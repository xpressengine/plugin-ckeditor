"use strict";
(function($) {
    var basePath = CKEDITOR.basePath;
    basePath = basePath.substr(0, basePath.indexOf("ckeditor/")) + '/ckeditor/assets/plugins/';

    CKEDITOR.plugins.addExternal('extractor', basePath + 'extractor/plugin.js');
    CKEDITOR.plugins.addExternal('fileUpload', basePath + 'fileUpload/plugin.js');
    CKEDITOR.plugins.addExternal('suggestion', basePath + 'suggestion/plugin.js');
    CKEDITOR.plugins.addExternal('sourcearea', basePath + 'sourcearea/plugin.js');

    xe3CkEditorConfig.addPlugin('extractor');
    xe3CkEditorConfig.addPlugin('fileUpload');
    xe3CkEditorConfig.addPlugin('suggestion');
    xe3CkEditorConfig.addPlugin('sourcearea');

    // for fileUpload config
    xe3CkEditorConfig.configs.allowedContent.span.classes.push('__xe_file', '__xe_image', '__xe_error');
    xe3CkEditorConfig.configs.allowedContent.img.classes.push('__xe_file', '__xe_image');

    // for suggestion config
    xe3CkEditorConfig.configs.allowedContent.span.classes.push('__xe_hashtag', '__xe_mention');

    // for sourcearea config
    $.extend(xe3CkEditorConfig.configs.allowedContent, {
        p: {classes: ['*']},
        a: {attributes: ['href', 'class'], classes: ['*']},
        div: {
            attributes: ['*'], classes: ['*'], styles: ['*']
        },
        h1: {classes: ['*']},
        h2: {classes: ['*']},
        h3: {classes: ['*']},
        h4: {classes: ['*']},
        h5: {classes: ['*']},
        h6: {classes: ['*']},
        dt: {classes: ['*']},
        dl: {classes: ['*']},
        dd: {classes: ['*']},
        ul: {classes: ['*']},
        li: {classes: ['*']},
        ol: {classes: ['*']},
        table: {classes: ['*']},
        i: {classes: ['*']}
    });

    xe3CkEditorConfig.putAfterInit('defaultPlugin', function(editor) {
        editor.ui.add( 'Code', CKEDITOR.UI_BUTTON, {
            label: 'Wrap code',
            command: 'wrapCode'
        });
        editor.ui.add( 'Diagram', CKEDITOR.UI_BUTTON, {
            label: 'Wrap diagram',
            command: 'wrapDiagram'
        });

        editor.ui.add( 'FileUpload', CKEDITOR.UI_BUTTON, {
            label: 'File upload'
        });
        editor.ui.add( 'ImageUpload', CKEDITOR.UI_BUTTON, {
            label: 'Image upload'
        });

        editor.addCommand( 'fileUpload', {
            exec: function() {
                editor.insertText( '```diagram\n' + editor.getSelection().getSelectedText() + '\n```' );
            }
        });

        editor.addCommand( 'wrapCode', {
            exec: function( editor ) {
                editor.insertText( '```javascript\n' + editor.getSelection().getSelectedText() + '\n```' );
            }
        });
        editor.addCommand( 'wrapDiagram', {
            exec: function( editor ) {
                editor.insertText( '```diagram\n' + editor.getSelection().getSelectedText() + '\n```' );
            }
        });
    });

})(XE.$);
