<?php
/**
 * CkEditor
 *
 * PHP version 7
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://www.xehub.io>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.io
 */

namespace Xpressengine\Plugins\CkEditor;

/**
 * CkEditorPluginInterface
 *
 * CkEditor 모듈에 plugin 을 등록하려면 이 interface 를 사용하세요.
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://www.xehub.io>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.io
 */
interface CkEditorPluginInterface
{
    public static function render($content, $scriptOnly = false);

    public static function compile($content);
}
