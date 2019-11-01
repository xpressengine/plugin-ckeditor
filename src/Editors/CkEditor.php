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

namespace Xpressengine\Plugins\CkEditor\Editors;

use Illuminate\Contracts\Routing\UrlGenerator;
use Xpressengine\Editor\AbstractEditor;
use Route;
use Xpressengine\Plugins\CkEditor\plugin;
use Xpressengine\Plugin\PluginRegister;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;
use Illuminate\Contracts\Auth\Access\Gate;

/**
 * CkEditor
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://www.xehub.io>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.io
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

            $this->frontend->js([
                'assets/vendor/jQuery-File-Upload/js/vendor/jquery.ui.widget.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.iframe-transport.js',
                'assets/vendor/jQuery-File-Upload/js/jquery.fileupload.js',
                plugin::asset('assets/ckeditor/ckeditor.js'),
                plugin::asset('assets/ckeditor/styles.js'),
                plugin::asset('assets/js/media_library.widget.js'),
                plugin::asset('assets/js/xe.ckeditor.define.js'),
            ])->before('assets/core/editor/editor.bundle.js')->load();

            $this->frontend->css([
                plugin::asset('assets/css/editor.css'),
                plugin::asset('assets/css/media_library.widget.css'),
                plugin::asset('assets/css/content.css')
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
        $this->frontend->css([
            plugin::asset('assets/css/content.css')
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
