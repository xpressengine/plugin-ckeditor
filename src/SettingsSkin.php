<?php
/**
 * @author    XE Developers <developers@xpressengine.com>
 * @copyright 2015 Copyright (C) NAVER Corp. <http://www.navercorp.com>
 * @license   LGPL-2.1
 * @license   http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * @link      https://xpressengine.io
 */

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
