<?php
namespace Xpressengine\Plugins\CkEditor\Skins;

use Xpressengine\Skin\AbstractSkin;

class UserSkin extends AbstractSkin
{
    public function render()
    {
        return view(
            sprintf('%s::views.user.%s', app('xe.plugin.ckeditor')->getId(), $this->view),
            $this->data
        );
    }
}
