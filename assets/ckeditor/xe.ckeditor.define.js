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
                },
                div: {

                }
            },
            removeButtons : 'Cut,Copy,Paste,Undo,Redo,Anchor,Underline,Strike,Subscript,Superscript',
            removeDialogTabs : 'link:advanced',
            extraPlugins: 'resize',
            resize_dir: 'vertical',
            extraAllowedContent: 'style;*[id,rel](*){*}'
        },
        // plugins: [{
        //     name: 'extractor',
        //     path: CKEDITOR.basePath + 'plugins/extractor/plugin.js'
        // },{
        //     name: 'fileUpload',
        //     path: CKEDITOR.basePath + 'plugins/fileUpload/plugin.js'
        // },{
        //     name: 'suggestion',
        //     path: CKEDITOR.basePath + 'plugins/suggestion/plugin.js'
        // },{
        //     name: 'sourcearea',
        //     path: CKEDITOR.basePath + 'plugins/sourcearea/plugin.js'
        // }],
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
        }
    }
});



//
// XEeditor.tools.define({
//     id : 'a2222',
//     events: {
//         iconClick: function(callback) {
//             //var child = window.open('/plugins/ckeditor/assets/popup/popup.html', 'test', "width=500,height=500,resizable=false");
//
//         },
//         elementDoubleClick: function(callback) {
//             console.log("elementDbClick");
//             // callback(content)
//
//             // XE.editor.addContent(instanceId, id, content);
//             //
//             // //editor.addCoentns();
//             // this.instance[instanceId].addContent(content);
//             //
//             // return content;
//             //
//             // tool
//             // var content = function (editor) {
//             //
//             // }
//             //
//             // parseDOM().attr('id', '');
//         }
//     },
//     props: {
//         name: 'Code',
//         options: {
//             label: 'Wrap code',
//             command: 'wrapCode'
//         }
//     }
// });

/*
<div data-xe-parts="{id}"></div>

<img data-xe-part="{id}" />
*/

/*
 before: <div>asfasdfasdf</div>

 after: <div data-id='editortool/afasdf@emoticon'>asfasdfasdf</div>


 content = XEeditor.setId(content)

 // ckeditor
 handle: fucntion (tool) {


 tool.exec(function (content) {
 // this.coreEditor == XEeditor
 content=this.coreEditor.setId(content);
 });
 this.addContent(content);
 }
* */