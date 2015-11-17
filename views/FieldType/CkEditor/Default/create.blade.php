<div class="__xe_content __xe_section">
    {!! uio('editor', [
    'contentDomName' => $config->get('id').'Contents',
    'contentDomId' => $config->get('id').'ContentEditor',
    'content' => Input::old($config->get('id').'Contents', ''),
    'editorConfig' => [
    'fileUpload' => [
    'upload_url' => route('fixed.ckEditor.file.upload'),
    'source_url' => route('fixed.ckEditor.file.source', ['id'=>null]),
    'download_url' => route('fixed.ckEditor.file.download', ['id'=>null]),
    ],
    'suggestion' => [
    'hashtag_api' => route('fixed.ckEditor.hashTag'),
    'mention_api' => route('fixed.ckEditor.mention'),
    ],
    ]
    ]) !!}
</div>