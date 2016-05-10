<?php
namespace Xpressengine\Plugins\CkEditor;

use Xpressengine\Skin\AbstractSkin;

class SettingsSkin extends AbstractSkin
{
    public function render()
    {
        return view(
            sprintf('%s::views.settings.%s', app('xe.plugin.ckeditor')->getId(), $this->view),
            $this->data
        );
    }
}