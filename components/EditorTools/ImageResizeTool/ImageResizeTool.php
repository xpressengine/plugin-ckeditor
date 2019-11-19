<?php
/**
 * ImageResizeTool
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

namespace Xpressengine\Plugins\CkEditor\Components\EditorTools\ImageResizeTool;

use App\Facades\XeFrontend;
use Xpressengine\Editor\AbstractTool;
use Route;
use XePresenter;
use Xpressengine\Plugins\CkEditor\Plugin;
use Xpressengine\Http\Request;

/**
 * ImageResizeTool
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://www.xehub.io>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.io
 */
class ImageResizeTool extends AbstractTool
{
    public static function boot()
    {
        static::route();
    }

    public static function route()
    {
        Route::fixed(static::getId(), function () {
            Route::get('image_resize_tool/popup/create', [
                'as' => 'ckeditor::image_resize_tool.popup',
                'uses' => 'ComponentController@popup'
            ]);
        }, ['namespace' => 'Xpressengine\\Plugins\\CkEditor\\Components\\EditorTools\\ImageResizeTool']);
    }

    public function initAssets()
    {
        XeFrontend::html('ckeditor.image_resize_tool.load_url')->content("
        <script>
            (function() {
                var _url = {
                    popup: '".route('ckeditor::image_resize_tool.popup')."'
                };

                window.imageResizeURL = {
                    get: function (type) {
                        return _url[type];
                    }
                };
            })();
        </script>
        ")->load();
        XeFrontend::js([
            asset($this->getAssetsPath() . '/ImageResizeTool.js'),
        ])->load();
    }

    public function getIcon()
    {
        return asset($this->getAssetsPath() . '/icon.png');
    }

    public function compile($content)
    {
        return $content;
    }

    private function getAssetsPath()
    {
        return str_replace(base_path(), '', plugins_path() . '/ckeditor/components/EditorTools/ImageResizeTool/assets');
    }
}
