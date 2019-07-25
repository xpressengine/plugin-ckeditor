<?php
/**
 * ComponentController
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

namespace Xpressengine\Plugins\CkEditor\Components\EditorTools\IframeTool;

use App\Http\Controllers\Controller;
use XeConfig;
use XeFrontend;
use XePresenter;
use Xpressengine\Http\Request;
use Xpressengine\Plugins\CkEditor\Components\EditorTools\IframeTool\IframeTool;
use Xpressengine\Plugins\CkEditor\Plugin;

/**
 * ComponentController
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://www.xehub.io>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.io
 */
class ComponentController extends Controller
{
    public function popup() {

        $title = 'iframe Tool';

        // set browser title
        XeFrontend::title($title);

        XeFrontend::css([
            asset(Plugin::asset('/components/EditorTools/IframeTool/assets/style.css')),
            '/assets/vendor/bootstrap/css/bootstrap.min.css'
        ])->load();

        XeFrontend::js([
            '/assets/vendor/bootstrap/js/bootstrap.min.js'
        ])->load();

        //header, footer 제거
        \XeTheme::selectBlankTheme();

        // output
        return XePresenter::make('ckeditor::components.EditorTools.IframeTool.views.popup');
    }
}
