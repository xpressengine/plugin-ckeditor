/**
 * @description ckeditor library 로드가 선행되어야함
 * */
XEeditor.define({
    editorSettings: {
        name: 'XEckeditor',
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
        plugins: [{
            name: 'extractor',
            path: CKEDITOR.basePath + 'plugins/extractor/plugin.js'
        },{
            name: 'fileUpload',
            path: CKEDITOR.basePath + 'plugins/fileUpload/plugin.js'
        },{
            name: 'suggestion',
            path: CKEDITOR.basePath + 'plugins/suggestion/plugin.js'
        },{
            name: 'sourcearea',
            path: CKEDITOR.basePath + 'plugins/sourcearea/plugin.js'
        }],
        addPlugins: function(plugins) {
            if(plugins.length > 0) {
                for(var i = 0, max = plugins.length; i < max; i += 1) {
                    CKEDITOR.plugins.addExternal(plugins[i].name, plugins[i].path);

                    var pluginNames = this.configs.extraPlugins.split(',');
                    pluginNames.push(plugins[i].name);
                    this.configs.extraPlugins = pluginNames.join(",");
                }
            }
        }
    },
    interfaces: {
        components: [{
            name: 'Code',
            options: {
                label: 'Wrap code',
                command: 'wrapCode'
            },
            exec: function(editor) {
                editor.insertText( '```diagram\n' + editor.getSelection().getSelectedText() + '\n```' );
            }
        }, {
            name: 'Diagram',
            options: {
                label: 'Wrap diagram',
                command: 'wrapDiagram'
            },
            exec: function (editor) {
                editor.insertText( '```diagram\n' + editor.getSelection().getSelectedText() + '\n```' );
            }
        }, {
            name: 'FileUpload',
            options: {
                label: 'File upload'

            }
        }, {
            name: 'ImageUpload',
            options: {
                label: 'Image upload'
            }
        }],
        addComponents: function(components) {
            var editor = this.props.editor;

            for(var i = 0, max = components.length; i < max; i += 1) {
                var component = components[i];

                editor.ui.add( component.name, CKEDITOR.UI_BUTTON, component.options);

                if(component.hasOwnProperty('options')
                    && component.options.hasOwnProperty('command')) {
                    editor.addCommand(component.options.command, {
                        exec: component.exec
                    });
                }
            }

        },
        initialize: function (selector, options) {
            var editor = CKEDITOR.replace(selector, options || {});

            editor.on('change', function(e) {
                e.editor.updateElement();
            });

            this.addProps({
                editor: editor
                , selector: selector
                , options: options
            });
        },
        getContents: function () {
            return CKEDITOR.instances[this.props.selector].getData();
        },
        setContents: function (text) {
            CKEDITOR.instances[this.props.selector].setData(text);
        },
        addContents: function (text) {
            CKEDITOR.instances[this.props.selector].insertHtml(text);
        },
        addComponents: function (components) {
            var editor = this.props.editor;

            for(var i = 0, max = components.length; i < max; i += 1) {
                var component = components[i];

                editor.ui.add( component.name, CKEDITOR.UI_BUTTON, component.options);

                if(component.hasOwnProperty('options')
                    && component.options.hasOwnProperty('command')) {
                    editor.addCommand(component.options.command, {
                        exec: component.exec
                    });
                }
            }
        }
    }
});