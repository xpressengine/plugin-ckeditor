<?php
/**
 * CkEditor
 *
 * PHP version 7
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2023 Copyright XEHub Corp. <https://xpressengine.comio>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.com
 */

namespace Xpressengine\Plugins\CkEditor\Editors;

use Xpressengine\Editor\AbstractEditor;
use Xpressengine\Plugins\CkEditor\plugin;
use Xpressengine\Plugin\PluginRegister;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;

/**
 * CkEditor
 *
 * @category    CkEditor5
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2023 Copyright XEHub Corp. <https://xpressengine.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.com
 */
class CkEditor5 extends AbstractEditor
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

        if (isset($this->arguments['content']) === true) {
            $this->arguments['content'] = str_replace(['&lt;', '&gt;'], ['&amp;lt;', '&amp;gt;'], $this->arguments['content']);
        }

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

            $this->frontend->js([
                'assets/vendor/jQuery-File-Upload/js/vendor/jquery.ui.widget.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.iframe-transport.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.fileupload.js',

                plugin::asset('assets/ckeditor5-36.0.0/build/ckeditor5.js'),
                plugin::asset('assets/js/media_library.ckeditor5.js'),
                plugin::asset('assets/js/xe.ckeditor5.define.js'),
            ])->before('assets/core/editor/editor.bundle.js')->load();

            $this->frontend->css([
                plugin::asset('assets/css/editor.css'),
                plugin::asset('assets/css/ckeditor5.css'),
            ])->load();

            $lang = require realpath(__DIR__.'/../../langs') . '/lang.php';

            $keywords = array_keys($lang);

            expose_route('media_library.index');
            expose_route('media_library.drop');
            expose_route('media_library.get_folder');
            expose_route('media_library.store_folder');
            expose_route('media_library.update_folder');
            expose_route('media_library.move_folder');
            expose_route('media_library.get_file');
            expose_route('media_library.update_file');
            expose_route('media_library.modify_file');
            expose_route('media_library.move_file');
            expose_route('media_library.upload');
            expose_route('media_library.download_file');

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
        return 'XEckeditor5';
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
        $this->frontend->css([
            plugin::asset('assets/css/ckeditor5.css')
        ])->load();

        // @deprecated `.__xe_contents_compiler` https://github.com/xpressengine/xpressengine/issues/867
        return sprintf('<div class="__xe_contents_compiler">%s</div>', $this->compilePlugins($content));
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
