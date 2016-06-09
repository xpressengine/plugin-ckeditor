/**
 * @description ckeditor library 로드가 선행되어야함
 * */
XEeditor.define({
    editorSettings: {
        name: 'XEckeditor',
        configs: {
            skin : 'xe-minimalist',
            customConfig : '',
            contentsCss : CKEDITOR.basePath + 'content.css',
            on : {
                focus : function() {
                    $(this.container.$).addClass('active');
                },
                blur : function(e) {
                    $(e.editor.container.$).removeClass('active');
                }.bind(this)
            },
            toolbarGroups: [
              { name: 'clipboard',   groups: [ 'undo', 'clipboard' ] },
              { name: 'editing',     groups: [ 'find', 'selection' ] },
              { name: 'links' },
              { name: 'insert' },
              { name: 'tools' },
              { name: 'document',    groups: [ 'mode' ] },
              '/',
              { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
              { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
              '/',
              { name: 'styles' },
              { name: 'colors' },
              { name: 'others' }
            ],
            height : 300,
            autoGrow_minHeight : 300,
            autoGrow_maxHeight : 300,
            // allowedContent: {
            //     p: {}, strong: {}, em: {}, i: {}, u: {}, br: {}, ul: {}, ol: {}, table: {},
            //     a: {attributes: ['!href']},
            //     span: {
            //         attributes: ['contenteditable', 'data-*'],
            //         classes: []
            //     },
            //     img: {
            //         attributes: ['*'],
            //         classes: []
            //     },
            //     div: {

            //     }
            // },
            removeButtons : 'Save,Preview,Print,Cut,Copy,Paste',
            removePlugins: 'stylescombo',
            // removeDialogTabs : 'link:advanced',
            extraPlugins: 'resize',
            resize_dir: 'vertical',
            extraAllowedContent: 'style;*[id,rel](*){*}'
        },
        plugins: [{
            name: 'extractor',
            path: CKEDITOR.basePath + '../xe_additional_plugins/extractor/plugin.js'
        },{
            name: 'fileUpload',
            path: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/plugin.js'
        },{
            name: 'suggestion',
            path: CKEDITOR.basePath + '../xe_additional_plugins/suggestion/plugin.js'
        },{
            name: 'sourcearea',
            path: CKEDITOR.basePath + '../xe_additional_plugins/sourcearea/plugin.js'
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
        coreEditor: null,
        initialize: function (selector, options, customOptions) {
            CKEDITOR.env.isCompatible = true;

            var editor = CKEDITOR.replace(selector, options || {});

            editor.on('change', function(e) {
                e.editor.updateElement();
            });

            this.addProps({
                editor: editor
                , selector: selector
                , options: options
            });

            editor.ui.add('Code', CKEDITOR.UI_BUTTON, {
              label: 'Wrap code',
              command: 'wrapCode',
              icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/code.png'
            });
            editor.ui.add('Diagram', CKEDITOR.UI_BUTTON, {
              label: 'Wrap diagram',
              command: 'wrapDiagram',
              icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/diagram.png'
            });

            editor.ui.add('FileUpload', CKEDITOR.UI_BUTTON, {
              label: 'File upload',
              icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/fileupload.png'
            });
            editor.ui.add('ImageUpload', CKEDITOR.UI_BUTTON, {
              label: 'Image upload',
              icon: CKEDITOR.basePath + '../xe_additional_plugins/fileUpload/icons/imageupload.png'
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
        addTools: function (toolsMap, toolInfoList) {
            var editor = this.props.editor;
            var self = this;

            for(var i = 0, max = toolInfoList.length; i < max; i += 1) {
                var component = toolsMap[toolInfoList[i].id];

                if(toolInfoList[i].enable) {
                    var editorOption = component.props;
                    editor.ui.add( editorOption.name, CKEDITOR.UI_BUTTON, editorOption.options);

                    if(editorOption.hasOwnProperty('options')
                        && editorOption.options.hasOwnProperty('command')) {

                        editor.addCommand(editorOption.options.command, {
                            exec: function() {
                                //var Tool = XEeditor.tools.get(component.id);

                                component.events.iconClick(function(content) {
                                    var dom = XEeditor.attachDomId(content, component.id);

                                    self.addContents(dom);
                                });
                            }
                        });
                    }

                    if(component.events && component.events.hasOwnProperty('elementDoubleClick')) {

                        CKEDITOR.instances[self.selector].on("instanceReady", function() {
                            var domSelector = XEeditor.getDomSelector(component.id);
                            var editorIframe = CKEDITOR.instances[self.selector].document.$;

                            component.events.elementDoubleClick(component.id, editorIframe, domSelector);
                        });

                    }


                }
            }
        },
        on: function (eventName, callback) {
            CKEDITOR.instances[this.props.selector].on(eventName, callback);
        }
    }
});
