<?php
/**
 * CkEditor
 *
 * PHP version 5
 *
 * @category    CkEditor
 * @package     CkEditor
 * @author      XE Team (developers) <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 */
namespace Xpressengine\Plugins\CkEditor\Editors;

use XeFrontend;
use Xpressengine\Editor\AbstractEditor;
use Route;
use Xpressengine\Editor\AbstractTool;
use Xpressengine\Editor\EditorHandler;
use Xpressengine\Plugin\PluginRegister;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;

/**
 * CkEditor
 *
 * @category    CkEditor
 * @package     CkEditor
 * @author      XE Team (akasima) <osh@xpressengine.com>
 * @copyright   2014 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 */
class CkEditor extends AbstractEditor
{
    protected $editors;

    protected $register;

    protected static $loaded = false;

    protected static $plugins = [];

    protected $tools;

    const FILE_UPLOAD_PATH = 'attached/ckeditor';

    const THUMBNAIL_TYPE = 'spill';

    public function __construct(EditorHandler $editors, PluginRegister $register)
    {
        $this->editors = $editors;
        $this->register = $register;
    }

    protected function getDefaultOptions()
    {
        return [
            'content' => '',
            'contentDomName' => 'content',
            'contentDomId' => 'xeContentEditor',
            'contentDomOptions' => [
                'class' => 'form-control',
                'rows' => '20',
                'cols' => '80'
            ],
            'editorOptions' => [],
        ];
    }

    public static function boot()
    {
        self::registerFixedRoute();

        // TODO: Implement boot() method.
    }

    /**
     * Register fixed route for slug
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
     * getoptions
     *
     * @return array
     */
    protected function getOptions()
    {
        $args = $this->arguments;
        $editorSetting = array_merge($this->getDefaultOptions(), $args);

        return $editorSetting;
    }

    public function render()
    {
        static::$plugins = $this->register->get(self::getId() . PluginRegister::KEY_DELIMITER . 'plugin');

        $this->initAssets();
        $this->loadTools();

        $htmlString = [];
        if($this->arguments !== false){
            $editorSetting = $this->getOptions();

            $htmlString[] = $this->getContentHtml(array_get($editorSetting, 'content'), $editorSetting);
            $htmlString[] = $this->getEditorScript($editorSetting);
        }

        // todo: comment 와 같이 js만 사용 하는 경우 config 값을 전달할 수 있어야 함.

        return $this->renderPlugins(implode('', $htmlString));
    }

    protected function loadTools()
    {
        foreach ($this->config->get('tools', []) as $toolId) {
            if ($tool = $this->editors->getTool($toolId, $this->instanceId)) {
                $tool->initAssets();
                $this->tools[$toolId] = $tool;
            }
        }
    }

    protected function renderPlugins($content)
    {
        /** @var CkEditorPluginInterface $plugin */
        foreach (static::$plugins as $plugin) {
            $content = $plugin::render($content);
        }

        return $content;
    }

    protected function getContentHtml($content, $editorSetting)
    {
        $contentHtml = [];
        $contentHtml[] = '<textarea ';
        $contentHtml[] = 'name="' . $editorSetting['contentDomName'] . '" ';
        $contentHtml[] = 'id="' . $editorSetting['contentDomId'] . '" ';
        $contentHtml[] = $this->getContentDomHtmlOption($editorSetting['contentDomOptions']);
        $contentHtml[] = ' placeholder="' . xe_trans('xe::content') . '">';
        $contentHtml[] = $content;
        $contentHtml[] = '</textarea>';

        return implode('', $contentHtml);
    }

    protected function getEditorScript($editorSetting)
    {
        $arrConfig = array_except($this->config->all(), 'tools');
        $tools = [];
        /** @var AbstractTool $tool */
        foreach ($this->tools as $tool) {
            $tools[] = [
                'id' => $tool->getId(),
                'name' => $tool->getName(),
                'icon' => $tool->getIcon(),
                'options' => $tool->getOptions(),
            ];
        }
        $editorScript = [];
        $editorScript[] = "
        <script>
            $(function() {
                XEeditor.getEditor('" . $this->getName() . "').create('{$editorSetting['contentDomId']}', ".json_encode($editorSetting['editorOptions']).", ".json_encode($arrConfig).", ".json_encode($tools).");
            });
        </script>";

        return implode('', $editorScript);
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

            $path = '/plugins/ckeditor/assets/ckeditor';
            XeFrontend::js([
                'assets/vendor/jQuery-File-Upload/js/vendor/jquery.ui.widget.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.iframe-transport.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.fileupload.js',
                asset(str_replace(base_path(), '', $path . '/ckeditor.js')),
                asset(str_replace(base_path(), '', $path . '/styles.js')),
//                asset(str_replace(base_path(), '', $path . '/xe3.js')),
                asset(str_replace(base_path(), '', $path . '/xe.ckeditor.define.js')),
            ])->load();

            XeFrontend::css([
                asset(str_replace(base_path(), '', $path . '/xe3.css')),
            ])->load();

            // ckeditor load 후 plugin 을 불러옴
            $this->initAssetPlugins();

        }

    }

    protected function initAssetPlugins()
    {
        /** @var CkEditorPluginInterface $plugin */
        foreach (static::$plugins as $plugin) {
            $plugin::initAssets();
        }
    }

    /**
     * getContentDomHtmlOption
     *
     * @param array $domOptions
     *
     * @return string
     */
    protected function getContentDomHtmlOption($domOptions)
    {
        $optionsString = '';
        foreach ($domOptions as $key => $val) {
            $optionsString.= "$key='{$val}' ";
        }

        return $optionsString;
    }

    public function getName()
    {
        return 'XEckeditor';
    }

    /**
     * 에디터로 등록된 내용 출력
     *
     * @param string $contents contents
     * @return string
     */
    public function contentsCompile($contents)
    {
        // TODO: Implement contentsCompile() method.
    }

    public static function getInstanceSettingURI($instanceId)
    {
        return route('manage.plugin.cke.setting', $instanceId);
    }
}
