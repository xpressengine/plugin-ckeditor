<?php
/**
 * CkEditorPlugin module class
 *
 * PHP version 5
 *
 * @category    CkEditorPlugin
 * @package     CkEditorPlugin
 * @author      XE Team (developers) <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 */
namespace Xpressengine\Plugins\CkEditor\Extension;

use XeFrontend;
use Xpressengine\Plugin\AbstractComponent;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;
use Xpressengine\Database\VirtualConnectionInterface;
use Schema;
use Illuminate\Database\Schema\Blueprint;

/**
 * CkEditorPlugin class
 *
 * @category    CkEditorPlugin
 * @package     CkEditorPlugin
 * @author      XE Team (developers) <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 */
class CkEditorPlugin extends AbstractComponent implements CkEditorPluginInterface
{
    protected static $loaded = false;

    /**
     * get manage URI
     *
     * @return null|string
     */
    public static function getSettingsURI()
    {
        return null;
    }

    /**
     *
     */
    public static function render($content)
    {
        return $content;
    }

    /**
     *
     */
    public static function initAssets()
    {
        if (self::$loaded === false) {
            self::$loaded = true;

//            $path = '/plugins/ckeditor/assets/plugins';
//            XeFrontend::js([
//                asset(str_replace(base_path(), '', $path . '/append.js')),
//            ])->load();
        }

    }
}
