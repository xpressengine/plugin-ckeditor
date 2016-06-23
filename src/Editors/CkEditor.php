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
use Xpressengine\Media\MediaManager;
use Xpressengine\Media\Models\Image;
use Xpressengine\Permission\Instance;
use Xpressengine\Plugin\PluginRegister;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;
use Illuminate\Contracts\Auth\Access\Gate;
use Xpressengine\Storage\File;
use Xpressengine\Storage\Storage;

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

    protected $storage;

    protected $medias;

    protected static $loaded = false;

    const FILE_UPLOAD_PATH = 'public/plugin/ckeditor';

    const THUMBNAIL_TYPE = 'spill';

    public function __construct(
        EditorHandler $editors,
        PluginRegister $register,
        Gate $gate,
        Storage $storage,
        MediaManager $medias,
        $instanceId
    ) {
        parent::__construct($editors, $instanceId);

        $this->register = $register;
        $this->gate = $gate;
        $this->storage = $storage;
        $this->medias = $medias;
    }

    public static function boot()
    {
        self::registerFixedRoute();
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
            Route::get('/file/source/{id?}', ['as' => 'fixed.ckEditor.file.source', 'uses' => $c.'@fileSource']);
            Route::get('/file/download/{id?}', ['as' => 'fixed.ckEditor.file.download', 'uses' => $c.'@fileDownload']);
            Route::post('/file/destroy/{id?}', ['as' => 'fixed.ckEditor.file.destroy', 'uses' => $c.'@fileDestroy']);
            Route::get('/hashTag/{id?}', ['as' => 'fixed.ckEditor.hashTag', 'uses' => $c.'@hashTag']);
            Route::get('/mention/{id?}', ['as' => 'fixed.ckEditor.mention', 'uses' => $c.'@mention']);
        }, ['namespace' => 'Xpressengine\Plugins\CkEditor']);
    }

    /**
     * Set arguments for the editor
     *
     * @param array $arguments arguments
     * @return $this
     */
    public function setArguments($arguments = [])
    {
        return parent::setArguments(array_merge([
            'editorOptions' => [
                'fileUpload' => [
                    'upload_url' => route('fixed.ckEditor.file.upload'),
                    'source_url' => route('fixed.ckEditor.file.source'),
                    'download_url' => route('fixed.ckEditor.file.download'),
                    'destroy_url' => route('fixed.ckEditor.file.destroy'),
                ],
                'suggestion' => [
                    'hashtag_api' => route('fixed.ckEditor.hashTag'),
                    'mention_api' => route('fixed.ckEditor.mention'),
                ],
            ]
        ], $arguments));
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
                asset($path . '/editor.css'),
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
        $data['extensions'] = isset($data['extensions']) ? array_map(function ($v) {
            return trim($v);
        }, explode(',', $data['extensions'])) : [];
        $instance = new Instance(static::getPermKey($this->instanceId));
        $data['perms'] = [
            'html' => $this->gate->allows('html', $instance),
            'tool' => $this->gate->allows('tool', $instance),
            'upload' => $this->gate->allows('upload', $instance),
        ];
        
        
        if ($this->targetId) {
            $data['files'] = [];
            $files = File::getByFileable($this->targetId);
            foreach ($files as $file) {
                $thumbnails = null;
                if ($this->medias->is($file)) {
                    $thumbnails = Image::getThumbnails($this->medias->make($file), static::THUMBNAIL_TYPE);
                }

                $data['files'][] = array_merge($file->toArray(), ['thumbnails' => $thumbnails]);
            }
        }
        

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

    /**
     * Perform any final actions for the store action lifecycle
     *
     * @param array       $inputs     request inputs
     * @param string|null $targetId   target id
     * @return void
     */
    public function terminate($inputs = [], $targetId = null)
    {
        $targetId = $targetId ?: $this->targetId;
        if (!$targetId) {
            return;
        }
        
        $olds = File::getByFileable($targetId);
        $olds = $olds->getDictionary();
        $files = File::whereIn('id', array_get($inputs, 'files', []))->get();
        foreach ($files as $file) {
            if (!isset($olds[$file->getKey()])) {
                $this->storage->bind($targetId, $file);
            } else {
                unset($olds[$file->getKey()]);
            }
        }

        foreach ($olds as $old) {
            $this->storage->unBind($targetId, $old, true);
        }
    }
}
