<?php
namespace Xpressengine\Plugins\CkEditor;

use XePresenter;
use App\Http\Controllers\Controller;
use Xpressengine\Http\Request;

class SettingsController extends Controller
{
    protected $plugin;

    public function __construct()
    {
        $this->plugin = app('xe.plugin.ckeditor');
        XePresenter::setSettingsSkinTargetId($this->plugin->getId());
    }

    public function getSetting($instanceId)
    {
        return XePresenter::make('form', [
            'instanceId' => $instanceId
        ]);
    }

    public function postSetting(Request $request, $instanceId)
    {
        dd($request->all());

        XeConfig::set(Editors\CkEditor::getId() . '.' . $instanceId, $request->except(['_token']));

        return redirect()->route('manage.plugin.cke.setting', $instanceId);
    }
}
