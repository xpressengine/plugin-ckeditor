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

namespace Xpressengine\Plugins\CkEditor\Components\EditorTools\ImageResizeTool;

use App\Http\Controllers\Controller;
use XeConfig;
use XeFrontend;
use XePresenter;
use Xpressengine\Http\Request;
use Xpressengine\Plugins\CkEditor\Components\EditorTools\IframeTool\IframeTool;
use Xpressengine\Plugins\CkEditor\Plugin;

class ComponentController extends Controller
{
    public function popup() {
        $title = '이미지 리사이즈, 편집 에디터툴';

        // set browser title
        XeFrontend::title($title);

        //header, footer 제거
        \XeTheme::selectBlankTheme();

        XeFrontend::css([
            asset('assets/vendor/bootstrap/css/bootstrap.min.css'),
            asset('assets/vendor/jqueryui/jquery-ui.min.css'),
            Plugin::asset('components/EditorTools/ImageResizeTool/assets/vendor/cropper/cropper.min.css'),
        ])->load();

        XeFrontend::js([
            asset('assets/vendor/jqueryui/jquery-ui.min.js'),
            Plugin::asset('components/EditorTools/ImageResizeTool/assets/vendor/cropper/cropper.min.js'),
            Plugin::asset('components/EditorTools/ImageResizeTool/assets/ImageResize.js'),
        ])->appendTo('body')->load();

        // output
        return XePresenter::make('ckeditor::components.EditorTools.ImageResizeTool.views.popup');
    }
}
