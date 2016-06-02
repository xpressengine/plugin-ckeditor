"use strict";

(function($) {

    var CKEDITOR_extractor = {
        origincontent: null,
        workers: [],
        register: function(worker) {
            this.workers[worker.id] = worker;
        },
        extract: function(editor) {
            for (var name in this.workers) {
                this.workers[name].extract(editor);
            }
        },
        createElements: function(form) {
            for (var name in this.workers) {
                this.workers[name].createElements(form);
            }
        }
    };

    CKEDITOR_extractor.register(new function() {
        this.id = 'code';
        this.codes = [];
        this.extract = function(editor) {
            var content = editor.getData(),
                blocks = this._splitBlocks(content),
                blockParts = [],
                _this = this;

            this.codes = [];
            $.each(blocks, function(index, block) {
                if (_this._isCodeBlock(block) === true) {
                    block = _this._makeBlockClear(block);
                    content = content.replace(['<br />', '<br>'], "\n");
                    var pattern = '/(' + _this.languages.join('|') + ')(?:#([\\-\\~,0-9]+))?\\n(.+)/g';

                    content.replace(pattern, function(match) {
                        _this.codes.push({
                            language: match[1],
                            line: match[2],
                            code: match[3]
                        });
                    });
                }
                blockParts.push(block);
            });
            editor.setData(this._glueBlocks(blockParts));
        };
        this.createElements = function(form) {
            var elementName = '_codes[]';
            form.find('[name="'+elementName+'"]').remove();
            $.each(this.codes, function(key, val) {
                form.append($('<input>').attr('type', 'hidden').attr('name', elementName).val(val));
            });
        };
        this.languages = [
            'diagram', 'php',
            'javascript', 'css', 'markup', 'scss',
            'c', 'clike', 'cpp', 'csharp', 'objectivec',
            'go', 'java', 'pascal' , 'ruby', 'swift'
        ];
        this._isCodeBlock = function(block) {
            var languages = this.languages;
            for (var i in languages) {
                if (this._startWith(block, languages[i]) === true) {
                    return true;
                }
            }
            return false;
        };
        this._makeBlockClear = function(text) {
            text = text.replace(/<p>|<\/p>/g, function(matches) {
                if (matches == '<p>') {
                    return '';
                } else {
                    return '<br />';
                }
            });
            return this._stripTags(text, '<br>');
        };
        this._startWith = function(haystack, needle) {
            if (haystack.indexOf(needle) === 0) {
                return true;
            }
            return false;
        };
        this._stripTags = function(input, allowed) {
            allowed = (((allowed || '') + '')
                .toLowerCase()
                .match(/<[a-z][a-z0-9]*>/g) || [])
                .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
            var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
                commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
            return input.replace(commentsAndPhpTags, '')
                .replace(tags, function($0, $1) {
                    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
                });
        };
        this._splitBlocks = function(content) {
            return content.split('```');
        };
        this._glueBlocks = function(blocks) {
            return blocks.join('```');
        };
    });

    CKEDITOR_extractor.register(new function() {
        this.id = 'link';
        this.links = [];
        this.extract = function(editor) {
            // 아무것도 하지 마.
            this.links = [];
        };
        this.createElements = function(form) {
            var elementName = '_links[]';
            form.find('[name="'+elementName+'"]').remove();
            $.each(this.links, function(key, val) {
                form.append($('<input>').attr('type', 'hidden').attr('name', elementName).val(val));
            });
        };
    });

    CKEDITOR_extractor.register(new function() {
        this.id = 'hashTag';
        this.hashTags = [];
        this.extract = function(editor) {
            var doc = $(editor.document.$),
                _this = this;

            this.hashTags = [];
            doc.find('.__xe_hashtag').each(function() {
                var hashTag = $(this).text();
                hashTag.replace('&nbsp;', '');
                if (hashTag.substring(0, 1) === '#') {
                    hashTag = hashTag.substring(1, hashTag.length);
                }
                _this.hashTags.push(hashTag);
            });
        };
        this.createElements = function(form) {
            var elementName = '_hashTags[]';
            form.find('[name="'+elementName+'"]').remove();
            $.each(this.hashTags, function(key, val) {
                form.append($('<input>').attr('type', 'text').attr('name', elementName).val(val));
            });
        };
    });

    CKEDITOR_extractor.register(new function() {
        this.id = 'mention';
        this.mentions = [];
        this.extract = function(editor) {
            var doc = $(editor.document.$);
            this.mentions = [];

            var _this = this;
            doc.find('.__xe_mention').each(function() {
                _this.mentions.push($(this).data('id'));
            });
        };
        this.createElements = function(form) {
            var elementName = '_mentions[]';
            form.find('[name="'+elementName+'"]').remove();
            $.each(this.mentions, function(key, val) {
                form.append($('<input>').attr('type', 'hidden').attr('name', elementName).val(val));
            });
        };
    });

    CKEDITOR_extractor.register(new function() {
        this.id = 'file';
        this.files = [];
        this.extract = function(editor) {
            var doc = $(editor.document.$),
                _this = this;

            this.files = [];

            // 실패 항목 제거
            doc.find('.__xe_error').each(function() {
                $(this).detach();
            });

            doc.find('.__xe_file').each(function() {
                _this.files.push($(this).data('id'));
            });


            doc.find('.__xe_image').each(function() {
                _this.files.push($(this).data('id'));
            });
        };

        this.createElements = function(form) {
            var elementName = '_files[]';
            form.find('[name="'+elementName+'"]').remove();
            $.each(this.files, function(key, val) {
                form.append($('<input>').attr('type', 'hidden').attr('name', elementName).val(val));
        });
        };
    });

    CKEDITOR.plugins.add('extractor', {

        init: function(editor) {
            $(editor.element.$).closest('form').on('submit', function(event) {
                CKEDITOR_extractor.extract(editor);
                var target = $(event.target);
                if (target.nodeName != 'FORM') {
                    target = target.closest('form');
                }
                CKEDITOR_extractor.createElements(target);

                editor.updateElement();

                //event.preventDefault();
                //return false;
            });
        }
    });
})($);
