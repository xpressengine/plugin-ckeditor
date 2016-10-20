<div class="__xe_section __xe_section_content content" style="min-height: 300px;">
    {!! compile($config->get('group') . '_' . $config->get('id'), $content, $args['format'] === Xpressengine\Plugins\Board\Models\Board::FORMAT_HTML) !!}
</div>