<?php
namespace Xpressengine\Plugins\CkEditor;

use XePresenter;
use XeConfig;
use App\Http\Controllers\Controller;
use Xpressengine\Editor\EditorHandler;
use Xpressengine\Http\Request;
use Xpressengine\Permission\PermissionSupport;

class SettingsController extends Controller
{
    use PermissionSupport;

    protected $plugin;

    public function __construct()
    {
        $this->plugin = app('xe.plugin.ckeditor');
        XePresenter::setSettingsSkinTargetId($this->plugin->getId());
    }

    public function getSetting(EditorHandler $handler, $instanceId)
    {
        $config = XeConfig::getOrNew(Editors\CkEditor::getConfigKey($instanceId));

        $tools = $handler->getToolAll();

        $toolIds = $config->get('tools', []);
        $activated = array_intersect_key($tools, array_flip($toolIds));
        $activated = array_merge(array_flip($toolIds), $activated);
        $deactivated = array_diff_key($tools, array_flip($toolIds));

        $items = [];
        foreach ($activated as $key => $item) {
            $items[$key] = ['class' => $item, 'activated' => true];
        }
        foreach ($deactivated as $key => $item) {
            $items[$key] = ['class' => $item, 'activated' => false];
        }

        return XePresenter::make('form', [
            'instanceId' => $instanceId,
            'config' => $config,
            'permArgs' => $this->getPermArguments(Editors\CkEditor::getPermKey($instanceId), ['html', 'tool']),
            'items' => $items,
        ]);
    }

    public function postSetting(Request $request, $instanceId)
    {
        $this->validate($request, [
            'height' => 'required|numeric',
            'fontSize' => 'required'
        ]);
        XeConfig::set(Editors\CkEditor::getConfigKey($instanceId), [
            'height' => $request->get('height'),
            'fontSize' => $request->get('fontSize'),
            'fontFamily' => empty($request->get('fontFamily')) ? null : $request->get('fontFamily'),
            'tools' => $request->get('tools', [])
        ]);

        $this->permissionRegister($request, Editors\CkEditor::getPermKey($instanceId), ['html', 'tool']);

        return redirect()->route('manage.plugin.cke.setting', $instanceId);
    }
}
