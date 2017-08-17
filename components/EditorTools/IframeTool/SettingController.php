<?php
/**
 * SettingsController.php
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

namespace Xpressengine\Plugins\CkEditor\Components\EditorTools\IframeTool;

use Illuminate\Http\Exception\HttpResponseException;
use App\Http\Controllers\Controller;
use XeConfig;
use XePresenter;
use Xpressengine\Http\Request;
use Xpressengine\Plugins\CkEditor\Components\EditorTools\IframeTool\IframeTool;

class SettingController extends Controller
{
    public function getSetting()
    {
        $config = XeConfig::get(IframeTool::getId());
        return XePresenter::make('ckeditor::components.EditorTools.IframeTool.views.setting', [
            'whitelist' => $config ? $config->get('whitelist') : []
        ]);
    }

    public function postSetting(Request $request)
    {
        $items = explode(',' , $request->get('items'));

//        foreach ($items as $item) {
//            if (filter_var($item, FILTER_VALIDATE_URL) === false) {
//                throw new HttpResponseException($this->buildFailedValidationResponse(
//                    $request, ['domain' => "invalid domain [$item]"]
//                ));
//            }
//        }

        XeConfig::set(IframeTool::getId(), ['whitelist' => $items]);

        return redirect()->back();
    }
}
