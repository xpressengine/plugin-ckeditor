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

use Illuminate\Contracts\Routing\UrlGenerator;
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

    protected $storage;

    protected $medias;

    protected static $loaded = false;

    protected $fileInputName = 'files';

    public function __construct(
        EditorHandler $editors,
        UrlGenerator $urls,
        PluginRegister $register,
        Gate $gate,
        $instanceId
    ) {
        parent::__construct($editors, $urls, $instanceId);

        $this->register = $register;
        $this->gate = $gate;
    }

    public static function boot()
    {
        //
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
        $instance = new Instance($this->editors->getPermKey($this->instanceId));
        $data['perms'] = [
            'html' => $this->gate->allows('html', $instance),
            'tool' => $this->gate->allows('tool', $instance),
            'upload' => $this->gate->allows('upload', $instance),
        ];

        $data['files'] = $this->files;

        return $data;
    }

    public function getActivateToolIds()
    {
        return $this->config->get('tools', []);
    }

    protected function compileBody($content)
    {
        return $this->compilePlugins($content);
    }

    protected function getFileView()
    {
        if (count($this->files) < 1) {
            return '';
        }

        return \XeSkin::getAssigned($this->getId())->setView('files')->setData(['files' => $this->files])->render();
    }

    protected function compilePlugins($content)
    {
        /** @var CkEditorPluginInterface $plugin */
        foreach ($this->getPlugins() as $plugin) {
            $content = $plugin::compile($content);
        }

        return $content;
    }
}
