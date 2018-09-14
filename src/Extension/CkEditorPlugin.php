<?php
/**
 * CkEditorPlugin module class
 *
 * @category    CkEditorPlugin
 * @package     CkEditorPlugin
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER Corp. <http://www.navercorp.com>
 * @license     LGPL-2.1
 * @license     http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * @link        https://xpressengine.io
 */

namespace Xpressengine\Plugins\CkEditor\Extension;

use XeFrontend;
use Xpressengine\Plugin\AbstractComponent;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;

/**
 * CkEditorPlugin class
 *
 * @category    CkEditorPlugin
 * @package     CkEditorPlugin
 */
class CkEditorPlugin extends AbstractComponent implements CkEditorPluginInterface
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

            $path = str_replace(base_path(), '', realpath(__DIR__ . '/../../assets'));
        }
    }
}
