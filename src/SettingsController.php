<?php
namespace Xpressengine\Plugins\CkEditor;

use XePresenter;
use XeConfig;
use App\Http\Controllers\Controller;
use Xpressengine\Editor\EditorHandler;
use Xpressengine\Http\Request;

class SettingsController extends Controller
{
    protected $plugin;

    public function __construct()
    {
        $this->plugin = app('xe.plugin.ckeditor');
        XePresenter::setSettingsSkinTargetId($this->plugin->getId());
    }

    public function getSetting(EditorHandler $handler, $instanceId)
    {
        $config = XeConfig::get(Editors\CkEditor::getId() . '.' . $instanceId);

        $parts = $handler->getPartsAll();

        $partsIds = $config->get('parts', []);
        $activated = array_intersect_key($parts, array_flip($partsIds));
        $activated = array_merge(array_flip($partsIds), $activated);
        $deactivated = array_diff_key($parts, array_flip($partsIds));

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
            'items' => $items,
        ]);
    }

    public function postSetting(Request $request, $instanceId)
    {
        XeConfig::set(Editors\CkEditor::getId() . '.' . $instanceId, [
            'var1' => $request->get('var1'),
            'var2' => $request->get('var2'),
            'parts' => $request->get('parts', [])
        ]);

        return redirect()->route('manage.plugin.cke.setting', $instanceId);
    }
}
