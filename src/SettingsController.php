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
        $config = XeConfig::get(Editors\CkEditor::getConfigKey($instanceId));

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
            'permArgs' => $this->getPermArguments(Editors\CkEditor::getPermKey($instanceId), 'html'),
            'items' => $items,
        ]);
    }

    public function postSetting(Request $request, $instanceId)
    {
        XeConfig::set(Editors\CkEditor::getConfigKey($instanceId), [
            'var1' => $request->get('var1'),
            'var2' => $request->get('var2'),
            'tools' => $request->get('tools', [])
        ]);

        $this->permissionRegister($request, Editors\CkEditor::getPermKey($instanceId), 'html');

        return redirect()->route('manage.plugin.cke.setting', $instanceId);
    }
}
