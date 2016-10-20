@if ($config == null)
@else
    {{--{{dump($config)}}--}}
    <a href="{{route('settings.editor.setting.detail', $config->get('group') . '_' . $config->get('id'))}}" target="_blank">Configure</a>
@endif
