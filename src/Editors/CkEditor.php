<?php
/**
 * CkEditor
 *
 * @category    CkEditor
 * @package     CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER Corp. <http://www.navercorp.com>
 * @license     LGPL-2.1
 * @license     http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * @link        https://xpressengine.io
 */

namespace Xpressengine\Plugins\CkEditor\Editors;

use XeFrontend;
use Xpressengine\Editor\AbstractEditor;
use Route;
use Xpressengine\Editor\EditorHandler;
use Xpressengine\Permission\Instance;
use Xpressengine\Plugin\PluginRegister;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;
use Illuminate\Contracts\Auth\Access\Gate;

/**
 * CkEditor
 *
 * @category    CkEditor
 * @package     CkEditor
 */
class CkEditor extends AbstractEditor
{
    protected $register;

    protected $gate;

    protected static $loaded = false;

    protected static $plugins = [];

    const FILE_UPLOAD_PATH = 'attached/ckeditor';

    const THUMBNAIL_TYPE = 'spill';

    public function __construct(EditorHandler $editors, PluginRegister $register, Gate $gate, $instanceId)
    {
        parent::__construct($editors, $instanceId);

        $this->register = $register;
        $this->gate = $gate;
    }

    public static function boot()
    {
        self::registerFixedRoute();
    }

    /**
     * Register fixed route for slug
     *
     * todo: route 쓸지 말지 체크 필요
     *
     * @return void
     */
    protected static function registerFixedRoute()
    {
        Route::fixed('ckEditor', function () {
            $c = 'FixedController';
            Route::post('/file/upload', ['as' => 'fixed.ckEditor.file.upload', 'uses' => $c.'@fileUpload']);
            Route::get('/file/source/{id}', ['as' => 'fixed.ckEditor.file.source', 'uses' => $c.'@fileSource']);
            Route::get('/file/download/{id}', ['as' => 'fixed.ckEditor.file.download', 'uses' => $c.'@fileDownload']);
            Route::get('/hashTag/{id?}', ['as' => 'fixed.ckEditor.hashTag', 'uses' => $c.'@hashTag']);
            Route::get('/mention/{id?}', ['as' => 'fixed.ckEditor.mention', 'uses' => $c.'@mention']);
        }, ['namespace' => 'Xpressengine\Plugins\CkEditor']);
    }

    /**
     * Get the evaluated contents of the object.
     *
     * @return string
     */
    public function render()
    {
        $this->initAssets();

        return $this->renderPlugins(parent::render(), $this->scriptOnly);
    }

    protected function renderPlugins($content, $scriptOnly)
    {
        /** @var CkEditorPluginInterface $plugin */
        foreach ($this->getPlugins() as $plugin) {
            $content = $plugin::render($content, $scriptOnly);
        }

        return $content;
    }

    protected function getPlugins()
    {
        return $this->register->get(self::getId() . PluginRegister::KEY_DELIMITER . 'plugin');
    }

    /**
     * initAssets
     *
     * @return void
     */
    protected function initAssets()
    {
        if (self::$loaded === false) {
            self::$loaded = true;

            $path = str_replace(base_path(), '', realpath(__DIR__.'/../../assets/ckeditor'));
            XeFrontend::js([
                'assets/core/common/js/xe.editor.core.js',
                'assets/vendor/jQuery-File-Upload/js/vendor/jquery.ui.widget.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.iframe-transport.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.fileupload.js',
                asset($path . '/ckeditor.js'),
                asset($path . '/styles.js'),
                asset($path . '/xe.ckeditor.define.js'),
            ])->load();

            XeFrontend::css([
                asset($path . '/xe3.css'),
            ])->load();
        }
    }

    public static function getPermKey($instanceId)
    {
        return static::getConfigKey($instanceId);
    }

    public function getName()
    {
        return 'XEckeditor';
    }

    public function getConfigData()
    {
        $data = array_except($this->config->all(), 'tools');
        $data['fontFamily'] = isset($data['fontFamily']) ? array_map(function ($v) {
            return trim($v);
        }, explode(',', $data['fontFamily'])) : [];
        $instance = new Instance(static::getPermKey($this->instanceId));
        $data['perms'] = [
            'html' => $this->gate->allows('html', $instance),
            'tool' => $this->gate->allows('tool', $instance),
        ];

        return $data;
    }

    public function getActivateToolIds()
    {
        return $this->config->get('tools', []);
    }

    /**
     * 에디터로 등록된 내용 출력
     *
     * @param string $content content
     * @return string
     */
    public function compile($content)
    {
        return $this->compilePlugins($content);
    }

    protected function compilePlugins($content)
    {
        /** @var CkEditorPluginInterface $plugin */
        foreach ($this->getPlugins() as $plugin) {
            $content = $plugin::compile($content);
        }

        return $content;
    }

    public static function getInstanceSettingURI($instanceId)
    {
        return route('manage.plugin.cke.setting', $instanceId);
    }
}
