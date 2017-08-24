@section('page_title')
    <h2>Iframe Editor Tool</h2>
@endsection

@section('page_description')
    This is iframe editor tool for video
@endsection
<div class="panel">
    <div class="panel-heading">
        <h3 class="panel-title">Domain White list</h3>
    </div>
    <div class="panel-body">


            <div class="row">
                <div class="col-md-6">
                    <form method="post" action="{{ route('xe.plugin.ckeditor.iframe_tool.settings.post') }}" id="__xe_form-iframe-tool">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="items" value="{{ implode(',', $whitelist) }}">

                        <div class="form-group">
                            <label>List</label>
                            <ul class="list-group" id="__xe_select-list" style="min-height: 100px; max-height: 300px; overflow: auto;">
                                <div class="well">허용할 동영상 서비스 도메인을 등록하세요.</div>
                            </ul>
                        </div>
                        <button type="submit" class="btn btn-primary">{{ xe_trans('xe::save') }}</button>
                    </form>
                </div>
                <div class="col-md-6">
                    <div class="form-group has-success">
                        <label>Add Domain <small>ex) www.youtube.com</small></label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="__xe_input-add">
                            <span class="input-group-addon" id="__xe_btn-add" style="cursor: pointer">{{ xe_trans('xe::add') }}</span>
                        </div>

                    </div>
                </div>
            </div>



    </div>
</div>
<script type="text/javascript">
    $(function () {
        var whiteList = {
            init: function () {
                this.__render(this.__get());
            },
            add: function (v) {
                var items = this.__get();
                var i = this.__search(items, v);
                if (i === -1) {
                    items.push(v);
                }
                this.__set(items);
            },
            remove: function (v) {
                var items = this.__get();
                var i = this.__search(items, v);
                if (i !== -1) {
                    items.splice(i, 1);
                }
                this.__set(items);
            },
            __get: function () {
                var str = $('input[name="items"]', '#__xe_form-iframe-tool').val();
                return $.trim(str) == '' ? [] : str.split(',');
            },
            __set: function (items) {
                $('input[name="items"]', '#__xe_form-iframe-tool').val(items.join(','));
                this.__render(items);
            },
            __search: function (items, v) {
                for (var i in items) {
                    if (v == items[i]) {
                        return i;
                    }
                }
                return -1;
            },
            __render: function (items) {
                $('li', '#__xe_select-list').remove();
                for (var i in items) {
                    $('#__xe_select-list').prepend(this.__makeLine(items[i]));
                }

                if (items.length < 1) {
                    $('#__xe_select-list > div').show();
                } else {
                    $('#__xe_select-list > div').hide();
                }
            },
            __makeLine: function (v) {
                return $('<li>').addClass('list-group-item')
                    .text(v)
                    .data('val', v)
                    .append(
                        $('<span>').addClass('badge __xe_btn-remove')
                            .css('cursor', 'pointer')
                            .html('<i class="xi-close"></i>')
                    );
            }
        };
        $('#__xe_btn-add').click(function () {
            var v = $.trim($('#__xe_input-add').val());
            if (v == '') {
                return;
            }

            whiteList.add(v);

            $('#__xe_input-add').val('');
        });
        $('#__xe_input-add').keyup(function (e) {
            e.preventDefault();
            if (e.keyCode == 13) {
                $('#__xe_btn-add').trigger('click')
            }
        });
        $('#__xe_select-list').on('click', '.__xe_btn-remove', function () {
            whiteList.remove($(this).parent().data('val'));
        });

        whiteList.init();
    });
</script>
