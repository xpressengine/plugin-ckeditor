<?php
/**
 * CkEditorPlugin
 *
 * PHP version 7
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://xpressengine.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.com
 */

namespace Xpressengine\Plugins\CkEditor\Extension;

use Xpressengine\Plugin\AbstractComponent;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;

/**
 * CkEditorPlugin
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://xpressengine.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.com
 */
class CkEditor5Plugin extends AbstractComponent implements CkEditorPluginInterface
{
    protected static $loaded = false;

    public static function render($content, $scriptOnly = false)
    {
        return $content;
    }

    public static function compile($content)
    {
        static::initAssetsForCompile();

        return $content;
    }

    private static function initAssetsForCompile()
    {
        if (self::$loaded === false) {
            self::$loaded = true;
        }
    }
}
