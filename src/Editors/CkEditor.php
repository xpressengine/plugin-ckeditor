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
use Xpressengine\Permission\Instance;
use Xpressengine\Plugin\PluginRegister;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;
use Illuminate\Contracts\Auth\Access\Gate;

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

    protected $gate;

    protected static $loaded = false;

    protected static $plugins = [];

    protected $tools;

    const FILE_UPLOAD_PATH = 'attached/ckeditor';

    const THUMBNAIL_TYPE = 'spill';

    public function __construct(EditorHandler $editors, PluginRegister $register, Gate $gate)
    {
        $this->editors = $editors;
        $this->register = $register;
        $this->gate = $gate;
    }

    protected function getDefaultOptions()
    {
        return [
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
     * get options
     *
     * @return array
     */
    protected function getOptions()
    {
        return array_merge($this->getDefaultOptions(), $this->arguments);
    }

    public function render()
    {
        static::$plugins = $this->register->get(self::getId() . PluginRegister::KEY_DELIMITER . 'plugin');

        $this->initAssets();
        $this->loadTools();

        $htmlString = [];
        if($this->arguments !== false){
            $options = $this->getOptions();

            $htmlString[] = $this->getContentHtml(array_get($options, 'content'), $options);
            $htmlString[] = $this->getEditorScript($options);
        }

        return $this->renderPlugins(implode('', $htmlString));
    }

    protected function loadTools()
    {
        foreach ($this->getTools() as $tool) {
            $tool->initAssets();
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

    protected function getContentHtml($content, $options)
    {
        $contentHtml = [];
        $contentHtml[] = '<textarea ';
        $contentHtml[] = 'name="' . $options['contentDomName'] . '" ';
        $contentHtml[] = 'id="' . $options['contentDomId'] . '" ';
        $contentHtml[] = $this->getContentDomHtmlOption($options['contentDomOptions']);
        $contentHtml[] = ' placeholder="' . xe_trans('xe::content') . '">';
        $contentHtml[] = $content;
        $contentHtml[] = '</textarea>';

        return implode('', $contentHtml);
    }

    protected function getEditorScript($options)
    {
        $editorScript = '
        <script>
            $(function() {
                XEeditor.getEditor(\'%s\').create(\'%s\', %s, %s, %s);
            });
        </script>';

        return sprintf(
            $editorScript,
            $this->getName(),
            $options['contentDomId'],
            json_encode($options['editorOptions']),
            json_encode($this->getConfigData()),
            json_encode($this->getTools())
        );
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
        $data['perms'] = [
            'html' => $this->gate->allows('html', new Instance(static::getPermKey($this->instanceId)))
        ];

        return $data;
    }

    public function getTools()
    {
        if ($this->tools === null) {
            $this->tools = [];
            foreach ($this->config->get('tools', []) as $toolId) {
                if ($tool = $this->editors->getTool($toolId, $this->instanceId)) {
                    $this->tools[] = $tool;
                }
            }
        }

        return $this->tools;
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
