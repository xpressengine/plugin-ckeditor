<?php
/**
 * CkEditor plugin
 *
 * @category    CkEditor
 * @package     CkEditor
 * @author    XE Developers <developers@xpressengine.com>
 * @copyright 2015 Copyright (C) NAVER Corp. <http://www.navercorp.com>
 * @license   LGPL-2.1
 * @license   http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * @link      https://xpressengine.io
 */

namespace Xpressengine\Plugins\CkEditor;

use Xpressengine\Permission\Grant;
use Xpressengine\Plugin\AbstractPlugin;
use XeSkin;
use Route;
use XeConfig;
use Xpressengine\User\Rating;

/**
 * CkEditor plugin
 *
 * @category    CkEditor
 * @package     CkEditor
 */
class Plugin extends AbstractPlugin
{
    /**
     * 플러그인을 설치한다. 플러그인이 설치될 때 실행할 코드를 여기에 작성한다
     *
     * @return void
     */
    public function install()
    {
        XeConfig::set(Editors\CkEditor::getId(), [
            'height' => 400,
            'fontSize' => '14px',
            'fontFamily' => null,
            'uploadActive' => true,
            'fileMaxSize' => 2,
            'attachMaxSize' => 10,
            'extensions' => '*',
            'tools' => []
        ]);

        $data = [
            Grant::RATING_TYPE => Rating::MEMBER,
            Grant::GROUP_TYPE => [],
            Grant::USER_TYPE => [],
            Grant::EXCEPT_TYPE => [],
            Grant::VGROUP_TYPE => [],
        ];

        $grant = new Grant();
        $grant->set('html', $data);
        $grant->set('tool', $data);
        $grant->set('upload', $data);
        app('xe.permission')->register(Editors\CkEditor::getId(), $grant);
    }

    /**
     * @return boolean
     */
    public function unInstall()
    {
        // TODO: config, permission 삭제
    }

    /**
     * @return boolean
     */
    public function checkInstalled($installedVersion = NULL)
    {
        // TODO: Implement checkInstall() method.

        return true;
    }

    /**
     * @return boolean
     */
    public function checkUpdated($installedVersion = NULL)
    {
        // TODO: Implement checkUpdate() method.
    }

    /**
     * boot
     *
     * @return void
     */
    public function boot()
    {
        XeSkin::setDefaultSettingsSkin($this->getId(), 'editor/ckeditor@ckEditor/settingsSkin/ckeditor@default');

        Route::settings($this->getId(), function () {
            Route::get('setting/{instanceId}', ['as' => 'manage.plugin.cke.setting', 'uses' => 'SettingsController@getSetting']);
            Route::post('setting/{instanceId}', ['as' => 'manage.plugin.cke.setting', 'uses' => 'SettingsController@postSetting']);
        }, ['namespace' => __NAMESPACE__]);

        app()->bind('xe.plugin.ckeditor', function ($app) {
            return $this;
        }, true);

        // 인스턴스를 생성할때 각 인스턴스가 사용할 권한 레코드를 등록함
        intercept('XeEditor@setInstance', 'ckeditor.permission', function ($target, $instanceId, $editorId) {
            $result = $target($instanceId, $editorId);

            if ($editorId === Editors\CkEditor::getId()) {
                app('xe.permission')->register(Editors\CkEditor::getPermKey($instanceId), new Grant());
            }

            return $result;
        });
    }

    /**
     * activate
     *
     * @param null $installedVersion installed version
     * @return void
     */
    public function activate($installedVersion = null)
    {
        //
    }
}
