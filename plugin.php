<?php
/**
 * CkEditor
 *
 * PHP version 7
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://www.xehub.io>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.io
 */

namespace Xpressengine\Plugins\CkEditor;

use Xpressengine\Permission\Grant;
use Xpressengine\Plugin\AbstractPlugin;
use XeSkin;
use Route;
use XeConfig;
use Xpressengine\Translation\Translator;
use Xpressengine\User\Rating;

/**
 * Plugin
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://www.xehub.io>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.io
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
    public function checkUpdated($installedVersion = NULL)
    {
        if (version_compare($installedVersion, '0.9.1', '<=')) {
            return false;
        }

        return true;
    }

    public function update($installedVersion = null)
    {
        /** @var Translator $trans */
        $trans = app('xe.translator');
        $trans->putFromLangDataSource('ckeditor', base_path('plugins/ckeditor/langs/lang.php'));
    }

    /**
     * boot
     *
     * @return void
     */
    public function boot()
    {
//        app()->bind('xe.plugin.ckeditor', function ($app) {
//            return $this;
//        }, true);
    }

    /**
     * activate
     *
     * @param null $installedVersion installed version
     * @return void
     */
    public function activate($installedVersion = null)
    {
        /** @var Translator $trans */
        $trans = app('xe.translator');
        $trans->putFromLangDataSource('ckeditor', base_path('plugins/ckeditor/langs/lang.php'));
    }
}
