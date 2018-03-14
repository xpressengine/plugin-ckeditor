<div class="container">
    <ul class="nav nav-tabs">
        <li class="active"><a data-toggle="tab" href="#home">일반</a></li>
        <li><a data-toggle="tab" href="#menu1">소스 코드</a></li>
    </ul>

    <div class="tab-content">
        <div id="home" class="tab-pane fade in active">
            <div class="panel panel-primary">
                <div class="panel-body">
                    <div class="form-group">
                        <label for="iframeUrl">URL</label>
                        <input type="email" class="form-control" id="iframeUrl" placeholder="URL을 입력하세요.">
                    </div>
                    <div class="form-group">
                        <label for="iframeUrl">가로 길이 <small>( 단위 : px )</small></label>
                        <input type="number" class="form-control" id="iframeWidth" placeholder="width를 입력하세요.">
                    </div>
                    <div class="form-group">
                        <label for="iframeUrl">세로 길이 <small>( 단위 : px )</small></label>
                        <input type="number" class="form-control" id="iframeHeight" placeholder="height를 입력하세요.">
                    </div>
                    <div class="form-check">
                        <label class="form-check-label">
                            <input type="checkbox" class="form-check-input" id="iframeEnableScroll">
                            스크롤 활성화
                        </label>
                        &nbsp;
                        <label class="form-check-label">
                            <input type="checkbox" class="form-check-input" id="iframeEnableBorder">
                            테두리 사용
                        </label>
                    </div>
                </div>
                <div class="panel-footer">
                    <div class="clearfix">
                        <button type="button" class="btn btn-default pull-right btnClosePopup">닫기</button>
                        <button type="button" id="btnAppendGeneralContent" class="btn btn-primary pull-right">입력</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="menu1" class="tab-pane fade">
            <div class="panel panel-success">
                <div class="panel-body">
                    <div class="form-group">
                        <label for="iframeCode">iframe 코드 붙여 넣기</label>
                        <textarea class="form-control" id="iframeCode" rows="5"></textarea>
                    </div>
                </div>
                <div class="panel-footer">
                    <div class="clearfix">
                        <button type="button" class="btn btn-default pull-right btnClosePopup">닫기</button>
                        <button type="button" id="btnAppendSourceCodeContent" class="btn btn-success pull-right">입력</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    var IframeTool = (function() {
        var _this;

        return {
            init: function() {
                _this = this;

                this.cache();
                this.bindEvents();

                return this;
            },
            cache: function() {
                this.$iframeUrl = $('#iframeUrl');
                this.$iframeWidth = $('#iframeWidth');
                this.$iframeHeight = $('#iframeHeight');
                this.$iframeEnableScroll = $('#iframeEnableScroll');
                this.$iframeEnableBorder = $('#iframeEnableBorder');
                this.$iframeCode = $('#iframeCode');
                this.$btnClosePopup = $('.btnClosePopup');
                this.$btnAppendGeneralContent = $('#btnAppendGeneralContent');
                this.$btnAppendSourceCodeContent = $('#btnAppendSourceCodeContent');
            },
            bindEvents: function() {
                this.$btnClosePopup.on('click', function() { self.close(); });
                this.$btnAppendGeneralContent.on('click', this.appendGeneralContent);
                this.$btnAppendSourceCodeContent.on('click', this.appendSourceCodeContent);
            },
            validate: function() {
                var flag = true;
                var selectedTab = $("ul.nav li").index($('.active'));
                var url = '';
                var width = '';
                var height = '';
                var scrolling = '';

                switch(selectedTab) {
                    case 0:
                        url = this.$iframeUrl.val();
                        width = this.$iframeWidth.val();
                        height = this.$iframeHeight.val();
                        scrolling = (this.$iframeEnableScroll.is(':checked'))? 'yes' : 'no';
                        frameborder = (this.$iframeEnableBorder.is(':checked'))? '1' : '0';

                        flag = this.isValid({
                            url: url,
                            width: width,
                            height: height
                        });

                        break;
                    case 1:
                        var iframeCode = this.$iframeCode.val();
                        var iframeParser = $(iframeCode);

                        url = iframeParser.attr('src');
                        width = iframeParser.attr('width');
                        height = iframeParser.attr('height');
                        scrolling = iframeParser.attr('scrolling');
                        frameborder = iframeParser.attr('frameborder');

                        flag = this.isValid({
                            url: url,
                            width: width,
                            height: height
                        });

                        break;
                }

                return {
                    isValid: flag,
                    url: url,
                    width: width,
                    height: height,
                    scrolling: scrolling,
                    frameborder: frameborder
                };
            },
            isValid: function(obj) {
                var flag = true;
                var parser = this.getParser(obj.url);

                if(!Utils.isURL(obj.url)) {
                    alert('url 형식이 맞지 않습니다.');
                    flag = false;

                } else if (!this.checkWhiteList(parser)) {
                    alert('신뢰되지 않는 도메인입니다.');
                    flag = false;
                }

                return flag;
            },
            getParser: function(url) {
                var parser = $('<a />')[0];
                parser.href = url;

                return {
                    protocol: parser.protocol, // => "http:"
                    port: parser.port,     // => "3000"
                    pathname: parser.pathname, // => "/pathname/"
                    search: parser.search,   // => "?search=test"
                    hash: parser.hash,     // => "#hash"
                    host: parser.host     // => "example.com:3000"
                };
            },
            checkWhiteList: function(parser) {
                var whiteList = opener.iframeToolURL.get('whiteList');
                var flag = false;

                if(whiteList.length > 0) {
                    for(var i = 0, max = whiteList.length; i < max; i += 1) {
                        if(whiteList[i].indexOf(parser.host) > -1) {
                            flag = true;
                            break;
                        }
                    }
                }

                return flag;
            },
            getIframeTemplate: function(info) {
                var $iframe = $('<iframe />');

                if(info.url) {
                    $iframe.attr('src', info.url);
                }

                if(info.width) {
                    $iframe.attr('width', info.width);
                }

                if(info.height) {
                    $iframe.attr('height', info.height);
                }

                if(info.scrolling) {
                    $iframe.attr('scrolling', info.scrolling);
                }

                if(info.frameborder) {
                    $iframe.attr('frameborder', info.frameborder);
                }

                return $iframe;
            },
            appendGeneralContent: function() {
                var info = _this.validate();

                if(info.isValid) {
                    appendToolContent(_this.getIframeTemplate(info));
                    self.close();
                }
            },
            appendSourceCodeContent: function() {
                var info = _this.validate();

                if(info.isValid) {
                    appendToolContent(_this.getIframeTemplate(info));
                    self.close();
                }
            }
        }
    })()
</script>
