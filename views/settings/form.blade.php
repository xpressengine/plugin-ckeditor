@section('page_title')
    <h2>CK Editor 설정</h2>
@endsection

@section('page_description')
    <small>CK Editor 설정페이지 입니다.</small>
@endsection

@section('content_bread_crumbs')

@endsection

<div class="panel-group" role="tablist" aria-multiselectable="true">
    <div class="panel">
        <div class="panel-heading">
            <div class="pull-left">
                <h3 class="panel-title">상세 설정</h3>
            </div>
        </div>
        <div class="panel-collapse collapse in">
            <form method="post" action="{{ route('manage.plugin.cke.setting', $instanceId) }}">
                {{ csrf_field() }}
                <div class="panel-body">

                    <div class="panel">
                        <div class="panel-heading">
                            <div class="pull-left">
                                <h4 class="panel-title">기본설정</h4>
                            </div>
                        </div>
                        <div class="panel-body">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <div class="clearfix">
                                            <label>설정1</label>
                                        </div>
                                        <input type="text" class="form-control" name="var1" value="{{ $config->get('var1') }}">
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <div class="clearfix">
                                            <label>설정2</label>
                                        </div>
                                        <input type="text" class="form-control" name="var2" value="{{ $config->get('var2') }}">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-sm-12">
                                    <div class="form-group">
                                        <label>html 편집 권한</label>
                                        <div class="well">
                                            {!! uio('permission', $permArgs['html']) !!}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="panel">
                        <div class="panel-heading">
                            <div class="pull-left">
                                <h4 class="panel-title">부가기능</h4>
                            </div>
                        </div>

                            <ul class="list-group item-setting">
                                @foreach ($items as $id => $item)
                                <li class="list-group-item">
                                    <button class="btn handler"><i class="xi-bullet-point"></i></button>
                                    <em class="item-title">{{ $item['class']::getComponentInfo('name') }}</em>
                                    <span class="item-subtext">{{ $item['class']::getComponentInfo('description') }}</span>
                                    <div class="xe-btn-toggle pull-right">
                                        <label>
                                            <span class="sr-only">toggle</span>
                                            <input type="checkbox" name="tools[]" value="{{ $id }}" {{$item['activated'] ? 'checked' : ''}}>
                                            <span class="toggle"></span>
                                        </label>
                                    </div>
                                    <div class="pull-right">
                                        @if($uri = $item['class']::getInstanceSettingURI($instanceId))
                                            <a href="{{ $uri }}">설정</a>
                                        @endif
                                    </div>
                                </li>
                                @endforeach
                            </ul>

                    </div>

                </div>
                <div class="panel-footer">
                    <div class="pull-right">
                        <button type="submit" class="btn btn-primary">저장</button>
                    </div>
                </div>

            </form>
        </div>
    </div>
</div>