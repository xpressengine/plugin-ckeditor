<?php
namespace Xpressengine\Plugins\CkEditor;

use XePresenter;
use XeConfig;
use App\Http\Controllers\Controller;
use Xpressengine\Editor\EditorHandler;
use Xpressengine\Http\Request;
use Xpressengine\Permission\Grant;
use Xpressengine\User\Models\UserGroup;

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
        $config = XeConfig::get(Editors\CkEditor::getConfigKey($instanceId));
        $permission = app('xe.permission')->findOrNew(Editors\CkEditor::getPermKey($instanceId));

        $mode = function ($action) use ($permission) {
            return $permission->pure($action) ? 'manual' : 'inherit';
        };

        $allGroup = UserGroup::get();
        $permArgs = [
            'html' => [
                'mode' => $mode('html'),
                'grant' => $permission['html'],
                'title' => 'html',
                'groups' => $allGroup,
            ]
        ];

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
            'permArgs' => $permArgs,
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

        $permInputs = [];
        foreach ($request->all() as $name => $value) {
            if (substr($name, 0, strlen('html')) === 'html') {
                $permInputs[$name] = $value;
            }
        }

        $grantInfo = [
            'html' => $this->makeGrant($permInputs, 'html'),
        ];

        $grant = new Grant();
        foreach (array_filter($grantInfo) as $action => $info) {
            $grant->set($action, $info);
        }

        app('xe.permission')->register(Editors\CkEditor::getPermKey($instanceId), $grant);

        return redirect()->route('manage.plugin.cke.setting', $instanceId);
    }

    private function makeGrant($inputs, $action)
    {
        if (array_get($inputs, $action . 'Mode') === 'inherit') {
            return null;
        }

        return [
            Grant::RATING_TYPE => array_get($inputs, $action . 'Rating'),
            Grant::GROUP_TYPE => array_get($inputs, $action . 'Group', []),
            Grant::USER_TYPE => array_filter(explode(',', array_get($inputs, $action . 'User'))),
            Grant::EXCEPT_TYPE => array_filter(explode(',', array_get($inputs, $action . 'Except'))),
            Grant::VGROUP_TYPE => array_get($inputs, $action . 'VGroup', []),
        ];
    }
}
