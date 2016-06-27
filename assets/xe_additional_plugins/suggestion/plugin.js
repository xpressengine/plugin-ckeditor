"use strict";

(function(XE){
    /**
     * polyfill for IE9 to allow for multiple arguments in setTimeout
     */
    if (document.all && !window.setTimeout.isPolyfill) {
        var __nativeST__ = window.setTimeout;
        window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
            var aArgs = Array.prototype.slice.call(arguments, 2);
            return __nativeST__(vCallback instanceof Function ? function () {
                vCallback.apply(null, aArgs);
            } : vCallback, nDelay);
        };
        window.setTimeout.isPolyfill = true;
    }
    if (document.all && !window.setInterval.isPolyfill) {
        var __nativeSI__ = window.setInterval;
        window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
            var aArgs = Array.prototype.slice.call(arguments, 2);
            return __nativeSI__(vCallback instanceof Function ? function () {
                vCallback.apply(null, aArgs);
            } : vCallback, nDelay);
        };
        window.setInterval.isPolyfill = true;
    }

    /**
     * move cursor to end
     * @param editor
     */
    function moveCursorToEnd(editor) {
        var range = editor.getSelection().getRanges()[0];
        range.moveToElementEditEnd(range.endContainer);
        editor.getSelection().selectRanges([range]);
    }

    /**
     * get Editor Cursor Position
     * @param editor
     */
    function getCursorPosition(editor)
    {
        var iframe = $(editor.container.$).find('iframe'),
            cke_top = $(editor.container.$).find('.cke_top'),
            dummyElement = CKEDITOR.dom.element.createFromHtml("<br class='dummyElement' />")

        // insert dummy element
        editor.insertElement( dummyElement );

        // get left/right scrolling for calc
        var scrollTop = iframe.contents().scrollTop(),
            scrollLeft = iframe.contents().scrollLeft();

        var obj = $(dummyElement.$);
        var x = obj.position().left-scrollLeft;
        var y = obj.position().top-scrollTop + cke_top.outerHeight();

        dummyElement.remove();
        return { x: x, y: y };
    }

    /**
     * get word data starts with
     * @param editor
     * @param start_str
     * @returns {*}
     */
    function getWordStartsWith(editor, start_str) {
        var range = editor.getSelection().getRanges()[ 0 ],
            startNode = range.startContainer;

        if ( startNode.type == CKEDITOR.NODE_TEXT && range.startOffset ) {
            var indexPrevSpace = startNode.getText().lastIndexOf( start_str, range.startOffset) + 1;
            var indexNextSpace = startNode.getText().indexOf(' ', range.startOffset);
            if(indexPrevSpace == -1) {
                indexPrevSpace=0;
            }
            if(indexNextSpace == -1) {
                indexNextSpace = startNode.getText().length;
            }
            return {
                startNode : startNode,
                start : indexPrevSpace,
                end: indexNextSpace,
                text: startNode.getText().substring(indexPrevSpace,indexNextSpace)
            };
        }
        return false;
    }

    /**
     *
     * @param {Object} editor An instance of a CKEDITOR
     * @constructor
     */
    function CKEDITOR_autocomplete(editor) {
        this.editor = editor;
        this.observe_hashtag = 0;
        this.observe_mention = 0;
        this.observe_hashtag_keyword = '';
        this.observe_mention_keyword = '';

        this.char_input = '';
        this.timeout_id = null;
        this.position = null;
        this.$suggestion_list = null;

        //if (CKEDITOR_autocomplete.caller !== CKEDITOR_autocomplete.get_instance) {
        //    throw new Error("This object cannot be instanciated");
        //}
    }

    /**
     * Collection of pairs editor id / instance of CKEDITOR_autocomplete
     * @type {Array}
     */
    CKEDITOR_autocomplete.instances = [];

    /**
     * Delay of the timeout between the last key pressed and the ajax query. It's use to prevent ajax flooding when user types fast.
     * @type {number}
     */
    CKEDITOR_autocomplete.timeout_delay = 200;

    /**
     * Minimum number of characters needed to start searching for users (includes the @ or #).
     * @type {number}
     */
    CKEDITOR_autocomplete.start_observe_count = 1;

    /**
     * Method used to get an instance of CKEDITOR_autocomplete linked to an instance of CKEDITOR.
     * Its design is based on the singleton design pattern.
     *
     * @param {Object} editor An instance of a CKEDITOR
     * @returns An instance of CKEDITOR_autocomplete
     */
    CKEDITOR_autocomplete.get_instance = function (editor) {
        for (var i in this.instances) {
            if (this.instances[i].id === editor.id) {
                return this.instances[i].instance;
            }
        }
        this.instances.push({
            id: editor.id,
            instance: new CKEDITOR_autocomplete(editor)
        });
        return this.instances[this.instances.length - 1].instance;
    };


    CKEDITOR_autocomplete.prototype = {

        /**
         * This method returns if a char should stop the observation.
         *
         * @param {int} charcode A character key code
         * @returns {Boolean} Whether or not the char should stop the observation
         */
        break_on: function (charcode) {
            // 13 = enter
            // 27 = esc
            // 32 = space
            // 37 = left key
            // 38 = top key
            // 39 = right key
            // 40 = bottom key
            // 46 = delete
            // 91 = home/end (?)
            var special = [27, 32, 37, 46];
            for (var i = 0; i < special.length; i++) {
                if (special[i] == charcode) {
                    return true;
                }
            }
            return false;
        },

        /**
         * remove suggestion list
         */
        remove_suggestions: function() {
            if(this.$suggestion_list) {
                this.$suggestion_list.remove();
                this.$suggestion_list = null;
            }
        },

        /**
         * stop all observing
         */
        stop_observing: function() {
            this.observe_mention = 0;
            this.observe_hashtag = 0;
            this.char_input = '';
            this.remove_suggestions();
        },

        /**
         * start mention observing
         */
        start_mention_observing: function() {
            this.stop_observing();
            this.position = getCursorPosition(this.editor);
            this.observe_mention = 1;
        },

        /**
         * start hashtag observing
         */
        start_hashtag_observing: function() {
            this.stop_observing();
            this.position = getCursorPosition(this.editor);
            this.observe_hashtag = 1;
        },

        /**
         * is observing anything
         * @returns {boolean}
         */
        is_anything_observing: function() {
            return (this.is_hashtag_observing() || this.is_mention_observing());
        },

        /**
         * is hashtag observing
         * @returns {boolean}
         */
        is_hashtag_observing: function() {
            return (this.observe_hashtag === 1);
        },

        /**
         * is mention observing
         * @returns {boolean}
         */
        is_mention_observing: function() {
            return (this.observe_mention === 1);
        },

        /**
         * get current word
         * this method should be start after start observing
         * @returns {string}
         */
        getCurrentWord: function() {
            var start_str = (this.is_hashtag_observing()) ? '#' : '@',
                word = getWordStartsWith(this.editor, start_str).text;
            return (word !== false) ? word : '';
        },

        /**
         * Sending Ajax query and get Hashtag List (#)
         */
        get_hashtag: function() {
            if (null !== this.timeout_id) {
                clearTimeout(this.timeout_id);
            }
            this.timeout_id = setTimeout(this.timeout_callback, CKEDITOR_autocomplete.timeout_delay, [this, 'hashtag']);
        },

        /**
         * Sending Ajax query and get Mention List (@)
         * @param selection
         */
        get_mention: function(selection) {
            if (null !== this.timeout_id) {
                clearTimeout(this.timeout_id);
            }
            this.timeout_id = setTimeout(this.timeout_callback_mention, CKEDITOR_autocomplete.timeout_delay, [this, selection]);
        },

        /**
         * return suggestion UL element
         * @returns {*}
         */
        make_suggetion_element: function() {
            return $("<ul>", {class: "suggestions"})
                .css("position", "absolute")
                .css("top", this.position.y + 24)
                .css("left", this.position.x);
        },

        /**
         * make hashtag suggestion list
         * @param keyword
         */
        make_hashtag_list: function(keyword) {

            var autocomplete = this,
                editor = autocomplete.editor;

            XE.ajax({
                type: 'get',
                dataType: 'json',
                data: {string: keyword},
                url: editor.config.suggestion.hashtag_api,
                success: function(autolist) {
                    if(autolist.length <= 0) return;

                    if (autocomplete.observe_hashtag_keyword != keyword) return;

                    var $list = autocomplete.make_suggetion_element();

                    $.each(autolist, function(index, data){
                        var css = (index === 0) ? 'selected' : '';
                        $list.append('<li class="suggestions-list '+ css +'" data-keyword="' + data.word +'"># ' + data.word + '</li>');
                    });
                    $(editor.container.$).append($list);
                    autocomplete.$suggestion_list = $list;

                    $list.find("li").click(function(e) {
                        e.preventDefault();
                        autocomplete.selectSuggestion($(this).data());
                    });
                }
            });
        },

        /**
         * make mention suggestion list
         * @param keyword
         */
        make_mention_list: function(keyword) {
            var autocomplete = this,
                editor = autocomplete.editor;

            XE.ajax({
                type: 'get',
                dataType: 'json',
                data: {string: keyword},
                url: editor.config.suggestion.mention_api,
                success: function(autolist) {
                    if(autolist.length <= 0) return;

                    if (autocomplete.observe_mention_keyword != keyword) return;

                    var $list = autocomplete.make_suggetion_element();

                    $.each(autolist, function(index, data){
                        var css = (index === 0) ? 'selected' : '';
                        $list.append('<li class="suggestions-list '+ css +'" data-keyword="' + data.displayName +'" data-id="' + data.id + '"><img class="__xe_profile_image small" src="' + data.profileImage + '" /> @' + data.displayName + '</li>');
                    });
                    $(editor.container.$).append($list);
                    autocomplete.$suggestion_list = $list;

                    $list.find("li").click(function(e) {
                        e.preventDefault();
                        autocomplete.selectSuggestion($(this).data());
                    });
                }
            });
        }
    };


    /**
     * start searching hashtags
     * @param {Array} args An Array of parameters containing the current instance of CKEDITOR_autocomplete and selection (cf. CKEDITOR_autocomplete.prototype.get_hashtag)
     */
    CKEDITOR_autocomplete.prototype.timeout_callback = function (args) {
        var autocomplete   = args[0],
            keyword = autocomplete.char_input;

        autocomplete.remove_suggestions();

        if (!keyword || keyword.length < CKEDITOR_autocomplete.start_observe_count) {
            return;
        }
        autocomplete.observe_hashtag_keyword = keyword;
        autocomplete.make_hashtag_list(keyword);
    };


    /**
     * start searching mentions in box
     * @param {Array} args An Array of parameters containing the current instance of CKEDITOR_autocomplete and selection (cf. CKEDITOR_autocomplete.prototype.get_hashtag)
     */
    CKEDITOR_autocomplete.prototype.timeout_callback_mention = function (args) {

        var autocomplete   = args[0],
            keyword = autocomplete.char_input;

        autocomplete.remove_suggestions();

        if (!keyword || keyword.length < CKEDITOR_autocomplete.start_observe_count) {
            return;
        }
        autocomplete.observe_mention_keyword = keyword;
        autocomplete.make_mention_list(keyword);
    };

    CKEDITOR_autocomplete.prototype.selectSuggestion = function( data ) {
        var word, startNode, parent, range;

        var editor = this.editor,
            str = data.keyword;

        if(this.is_hashtag_observing()) {
            word = getWordStartsWith(editor, '#');
        }
        else if(this.is_mention_observing()) {
            word = getWordStartsWith(editor, '@');
        }

        // change written hashtag
        startNode = word.startNode;
        startNode.$.textContent = startNode.getText().substring(0, word.start) + '`@`' + str + '`@`' + startNode.getText().substring(word.end);
        parent = $(startNode.$).parent();

        // replace text
        if(this.is_hashtag_observing()) {
            parent.html(parent.html().replace(/#`@`(.+)`@`/g, "<span contenteditable='false' class='" + editor.config.names.tag.class + "'>#$1</span>"));
        }
        else if(this.is_mention_observing()) {
            parent.html(parent.html().replace(/@`@`(.+)`@`/g, "<span contenteditable='false' " + editor.config.names.mention.identifier + "='" + data.id + "' class='" + editor.config.names.mention.class + "'>@$1</span>"));
        }

        // move cursor focus end of text
        range = editor.createRange();
        range.moveToElementEditEnd( range.root );
        editor.getSelection().selectRanges( [ range ] );

        // add space
        editor.insertText(' ');

        // stop observing
        this.stop_observing();
    };

    CKEDITOR.plugins.add('suggestion', {
        icons: '',
        init: function(editor) {
            var autocomplete = CKEDITOR_autocomplete.get_instance(editor);

            editor.on('key', function(event) {

                var is_shift_key = event.data.domEvent.$.shiftKey,
                    which = event.data.domEvent.$.which;

                // hashtag 가 observing 중이면 enter disabled
                if(autocomplete.is_hashtag_observing() && which == 13 ) {
                    event.cancel();
                }

                // if # is inserted
                if ( is_shift_key && which == 51 ) {
                    autocomplete.start_hashtag_observing();
                }
                // if @ is inserted
                if ( is_shift_key && which == 50 ) {
                    autocomplete.start_mention_observing();
                }

                // 어떤것도 observing 상태가 아니면 종료
                if(!autocomplete.is_anything_observing()) return;

                // if there $suggestion_list
                var $suggestion_list = autocomplete.$suggestion_list;
                if($suggestion_list) {

                    var $selected = $suggestion_list.find(".selected");

                    // enter 키 입력
                    if (event.data.keyCode == 13){
                        event.cancel();

                        autocomplete.selectSuggestion( $selected.data() );
                        autocomplete.stop_observing();
                    }

                    // 리스트가 1개이상 있을때 위아래 동작.
                    if($suggestion_list.find('li').length > 1) {
                        // 위 방향 키 입력 (up)
                        if (event.data.keyCode == 38) {
                            event.cancel();
                            $selected.removeClass("selected");
                            if ($selected.prev().length == 0) {
                                $selected.siblings().last().addClass("selected");
                            } else {
                                $selected.prev().addClass("selected");
                            }
                        }
                        // 아래 방향 키 입력 (up)
                        if (event.data.keyCode == 40) { // down
                            event.cancel();
                            $selected.removeClass("selected");
                            if ($selected.next().length == 0) {
                                $selected.siblings().first().addClass("selected");
                            } else {
                                $selected.next().addClass("selected");
                            }
                        }
                    }
                }
            });

            editor.on('contentDom', function() {
                var editable = editor.editable();

                editable.attachListener(editable, 'keyup', function(event) {

                    var which = event.data.$.which;

                    if(autocomplete.is_anything_observing()) {

                        // 위 아래 방향키
                        if(which == 38 || which == 40) {
                            return;
                        }

                        // space 키가 입력되면 중단하거나 정규식으로 찾음
                        if (which == 32){
                            autocomplete.stop_observing();
                            var target = $(editor.getSelection().getStartElement().$);
                            var target_replaced_html = target.html().replace(/(&nbsp;){0,}$/, '')
                                .replace(/(?:^|[^>:])#([가-힣a-zA-Z0-9\-\_]+)/g, function(match, contents, offset, s)
                                {
                                    var data_hex_color = '';
                                    if(/^([0-9a-fA-F]{6})$/.test(contents)) {
                                        data_hex_color = "<i class='color' style='background:#" + contents + "'>&nbsp;</i>";
                                    }
                                    return "<span contenteditable='false' class='__xe_hashtag'>" + data_hex_color + "#" + contents + "</span>";
                                });

                            target.html(target_replaced_html);

                            moveCursorToEnd(editor);
                            editor.insertText(' ')
                        }

                        // 입력된 단어를 구함
                        var char_input = autocomplete.getCurrentWord();
                        if (char_input && char_input.length > 15) {
                            autocomplete.stop_observing();
                            return;
                        }
                        autocomplete.char_input = char_input;

                        // @ 멘션
                        if(autocomplete.is_mention_observing()) {
                            autocomplete.get_mention(this.editor.getSelection());
                        }

                        // # 해시태그
                        if(autocomplete.is_hashtag_observing()) {
                            autocomplete.get_hashtag();
                        }
                    }

                    // 스페셜 키가 입력되면 Autocomplete 모든 observing 중단
                    if(autocomplete.break_on(which)) {
                        autocomplete.stop_observing();
                    }

                });
            });
        }
    });
})(XE);
