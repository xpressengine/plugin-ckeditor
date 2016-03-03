<?php
/**
 * CkEditor plugin
 *
 * PHP version 5
 *
 * @category    CkEditor
 * @package     CkEditor
 * @author      XE Team (akasima) <osh@xpressengine.com>
 * @copyright   2014 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 */
namespace Xpressengine\Plugins\CkEditor;

use Xpressengine\Plugin\AbstractPlugin;

/**
 * CkEditor plugin
 *
 * @category    CkEditor
 * @package     CkEditor
 * @author      XE Team (akasima) <osh@xpressengine.com>
 * @copyright   2014 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 */
class Plugin extends AbstractPlugin
{
    /**
     * @return boolean
     */
    public function unInstall()
    {
        // TODO: Implement unInstall() method.
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
        /** @var \Xpressengine\UIObject\UIObjectHandler $uiobjectHandler */
        $uiobjectHandler = app('xe.uiobject');
        //$uiobjectHandler->setAlias('editor', UIObject\CkEditor::getId());
        //$uiobjectHandler->setAlias('contentCompiler', UIObject\ContentsCompiler::getId());
        $uiobjectHandler->setAlias('editor', 'uiobject/xpressengine@ckEditor');
        $uiobjectHandler->setAlias('contentCompiler', 'uiobject/xpressengine@contentsCompiler');
    }

    /**
     * activate
     *
     * @param null $installedVersion installed version
     * @return void
     */
    public function activate($installedVersion = null)
    {
    }
}
