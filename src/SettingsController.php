<?php
namespace Xpressengine\Plugins\CkEditor;

use XePresenter;
use App\Http\Controllers\Controller;

class SettingsController extends Controller
{
    public function __construct()
    {
        $plugin = app('xe.plugin.ckeditor');
        XePresenter::setSettingsSkinTargetId($plugin->getId());
    }

    public function getSetting($instanceId)
    {
        return XePresenter::make('form', []);
    }
}
