"use strict"

function xe3CkEditor(textarea, config, closure)
{
    xe3CkEditorConfig.put(config);

    if (closure != undefined && typeof closure == 'function') {
        closure(xe3CkEditorConfig);
    }

    var editor = CKEDITOR.replace(textarea, xe3CkEditorConfig.get());
    xe3CkEditorConfig.fireAfterInit(editor);

    // 에디터 변경 시 textarea 내용 바로 업데이트
    editor.on('change', function(event) {
        event.editor.updateElement();
    });

    // 에디터 내용 초기화
    editor.clear = function() {
        this.setData('', function() {
            this.updateElement();
        });
    };

    return editor;
}

var xe3CkEditorConfig = {
    configs: {
        skin : 'xe3',
        customConfig : '',
        contentsCss : '/plugins/ckeditor/assets/ckeditor/content.css',
        on : {
            focus : function() {
                $(this.container.$).addClass('active');
            },
            blur : function(e) {
                $(e.editor.container.$).removeClass('active');
            }.bind(this)
        },
        toolbarGroups: [
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
            { name: 'paragraph', groups: [ 'list' ] },
            { name: 'styles' },
            { name: 'tools' },
            { name: 'document', groups: [ 'mode' ] },
            { name: 'others', groups: ['code', 'source'] }
        ],
        height : 300,
        autoGrow_minHeight : 300,
        autoGrow_maxHeight : 300,
        allowedContent: {
            p: {}, strong: {}, em: {}, i: {}, u: {}, br: {}, ul: {}, ol: {}, table: {},
            a: {attributes: ['!href']},
            span: {
                attributes: ['contenteditable', 'data-*'],
                classes: []
            },
            img: {
                attributes: ['*'],
                classes: []
            }
        },
        removeButtons : 'Cut,Copy,Paste,Undo,Redo,Anchor,Underline,Strike,Subscript,Superscript',
        removeDialogTabs : 'link:advanced',
        extraPlugins: 'resize',
        resize_dir: 'vertical'
    },
    put: function(config) {
        this.configs = $.extend(this.configs, config);
    },
    get: function() {
        return this.configs;
    },
    addPlugin: function(pluginName) {
        var plugins = this.configs.extraPlugins.split(',');
        plugins.push(pluginName);
        this.configs.extraPlugins = plugins.join(',');
    },
    putAfterInit: function(name, callback) {
        // 에디터 생성 후 순차적으로 실행되야 하는 코드
        if (this.configs.afterInit == undefined) {
            this.configs.afterInit = {};
        }
        this.configs.afterInit[name] = callback;
    },
    fireAfterInit: function(editor) {
        if (this.configs.afterInit != undefined) {
            for (var name in this.configs.afterInit) {
                this.configs.afterInit[name](editor);
            }
        }
    }
};
