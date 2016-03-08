<?php
/**
 *
 */
namespace Xpressengine\Plugins\CkEditor\UIObject;

use Xpressengine\UIObject\AbstractUIObject;
use Xpressengine\Plugin\PluginRegister;

/**
 * Class ContentsView
 * @package Xpressengine\UIObjects\CKEditor
 */
class ContentsCompiler extends AbstractUIObject
{

    protected static $id = 'uiobject/xpressengine@contentsCompiler';

    protected static $loaded = false;

    /**
     * @var ContentsCompilerPluginInterface[]
     */
    protected static $plugins = [];

    /**
     * boot
     *
     * @return void
     */
    public static function boot()
    {
        // TODO: Implement boot() method.
    }

    /**
     * Get Manage URI
     *
     * @return string
     */
    public static function getSettingsURI()
    {
        // TODO: Implement getSettingsURI() method.
    }

    /**
     * render
     *
     * @return string
     */
    public function render()
    {
        /** @var \Xpressengine\Plugin\PluginRegister $register */
        $register = app('xe.pluginRegister');
        self::$plugins = $register->get(self::getId() . PluginRegister::KEY_DELIMITER . 'plugin');

        $args = $this->arguments;
        $content = $args['content'];

        $this->initAssets();

        $this->template = $content;
        $this->template = $this->renderPlugins($this->template);

        $this->template = sprintf('<div class="__xe_contents_compiler">%s</div>', $this->template);
        return parent::render();
    }

    public function renderPlugins($content)
    {
        /** @var ContentsCompilerPluginInterface $plugin */
        foreach (self::$plugins as $plugin) {
            $content = $plugin::render($content);
        }

        return $content;
    }

    /**
     * initialize asset files
     *
     * @return void
     */
    protected function initAssets()
    {
        if (self::$loaded === false || true) {
            self::$loaded = true;
            $this->initAssetPlugins();
        }
    }

    /**
     *
     */
    protected function initAssetPlugins()
    {
        /** @var ContentsCompilerPluginInterface $plugin */
        foreach (self::$plugins as $plugin) {
            $plugin::initAssets();
        }
    }
}
