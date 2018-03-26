<?php
/**
 * ComponentController.php
 *
 * PHP version 5
 *
 * @category
 * @package
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER Corp. <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html LGPL-2.1
 * @link        https://xpressengine.io
 */

namespace Xpressengine\Plugins\CkEditor\Components\EditorTools\XeiconTool;

use App\Http\Controllers\Controller;
use XeConfig;
use XeFrontend;
use XePresenter;
use Xpressengine\Http\Request;
use Xpressengine\Plugins\CkEditor\Components\EditorTools\IframeTool\IframeTool;
use Xpressengine\Plugins\CkEditor\Plugin;

class ComponentController extends Controller
{
    public function popup()
    {

        $title = 'XEIcon Tool';

        // set browser title
        XeFrontend::title($title);

        XeFrontend::css([
            asset(Plugin::asset('/components/EditorTools/XeiconTool/assets/style.css')),
            asset('https://cdn.jsdelivr.net/npm/xeicon@2.3/xeicon.min.css')
        ])->load();

        //header, footer 제거
        \XeTheme::selectBlankTheme();

        // output
        return XePresenter::make('ckeditor::components.EditorTools.XeiconTool.views.popup');
    }

    public function edit()
    {
        $title = 'XEIcon Tool';

        // set browser title
        XeFrontend::title($title);

        // load css file
        XeFrontend::css(Plugin::asset('/components/EditorTools/XeiconTool/assets/style.css'))->load();

        //header, footer 제거
        \XeTheme::selectBlankTheme();

        // output
        return XePresenter::make('ckeditor::components.EditorTools.XeiconTool.views.popup-edit');
    }
}
