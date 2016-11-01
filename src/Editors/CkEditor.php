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
use Xpressengine\Editor\AbstractEditor;
use Route;
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
    protected static $loaded = false;

    /**
     * Get the evaluated contents of the object.
     *
     * @return string
     */
    public function render()
    {
        $this->initAssets();

        $this->arguments['content'] = str_replace(['&lt;', '&gt;'], ['&amp;lt;', '&amp;gt;'], $this->arguments['content']);
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
        return app('xe.pluginRegister')->get(self::getId() . PluginRegister::KEY_DELIMITER . 'plugin');
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
            $this->frontend->js([
                'assets/vendor/jQuery-File-Upload/js/vendor/jquery.ui.widget.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.iframe-transport.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.fileupload.js',
                asset($path . '/ckeditor.js'),
                asset($path . '/styles.js'),
                asset($path . '/xe.ckeditor.define.js'),
            ])->before('assets/core/common/js/xe.editor.core.js')->load();

            $this->frontend->css([
                asset($path . '/editor.css'),
            ])->load();

            $lang = require realpath(__DIR__.'/../../langs') . '/lang.php';

            $keywords = array_keys($lang);

            $this->frontend->translation(array_map(function ($keyword) {
                return 'ckeditor::' . $keyword;
            }, $keywords));
        }
    }

    /**
     * Get a editor name
     *
     * @return string
     */
    public function getName()
    {
        return 'XEckeditor';
    }

    /**
     * Determine if a editor html usable.
     *
     * @return boolean
     */
    public function htmlable()
    {
        return true;
    }

    /**
     * Compile content body
     *
     * @param string $content content
     * @return string
     */
    protected function compileBody($content)
    {
        return sprintf('<div class="__xe_contents_compiler" id="xe-editor-content">%s</div>', $this->compilePlugins($content));
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
