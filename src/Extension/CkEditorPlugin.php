<?php
/**
 * CkEditorPlugin module class
 *
 * @category    CkEditorPlugin
 * @package     CkEditorPlugin
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER Corp. <http://www.navercorp.com>
 * @license     LGPL-2.1
 * @license     http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * @link        https://xpressengine.io
 */

namespace Xpressengine\Plugins\CkEditor\Extension;

use XeFrontend;
use Xpressengine\Plugin\AbstractComponent;
use Xpressengine\Plugins\CkEditor\CkEditorPluginInterface;

/**
 * CkEditorPlugin class
 *
 * @category    CkEditorPlugin
 * @package     CkEditorPlugin
 */
class CkEditorPlugin extends AbstractComponent implements CkEditorPluginInterface
{
    protected static $loaded = false;

    /**
     * @var array
     */
    private $languages = [
        'diagram', 'php',
        'javascript', 'css', 'markup', 'scss',
        'c', 'clike', 'cpp', 'csharp', 'objectivec',
        'go', 'java', 'pascal' , 'ruby', 'swift'
    ];

    public static function render($content, $scriptOnly = false)
    {
        return $content;
    }

    public static function compile($content)
    {
        static::initAssetsForCompile();

        $object = new static;

        return implode('', [
            $object->contentCompile($content),
            '<script>$(function(){mermaid.initialize({startOnLoad:true})});</script>',
        ]);
    }

    private static function initAssetsForCompile()
    {
        if (self::$loaded === false) {
            self::$loaded = true;

            $path = str_replace(base_path(), '', realpath(__DIR__ . '/../../assets/compiler'));
            // requirejs 를 load 하기 전에 붙여야 한다.
            XeFrontend::js(asset($path . '/mermaid.min.js'))->appendTo('head')->load();
            XeFrontend::js([asset($path . '/contentsCompiler.js'), asset($path . '/prism.js')])->load();
            XeFrontend::css([
                asset($path . '/hashTag.css'),
                asset($path . '/prism.css'),
                asset($path . '/mermaid.css'),
                asset($path . '/mermaid.forest.css'),
            ])->load();
        }
    }

    private function contentCompile($content)
    {
        $blocks = $this->splitBlocks($content);

        $blockParts = [];

        $_this = $this;
        $supportLanguages = join('|', $this->languages);
        foreach ($blocks as $block) {
            if ($this->isCodeBlock($block)) {
                $blockParts[] = preg_replace_callback(
                    "/^^(".$supportLanguages.")(?:#([\-\~,0-9]+))?(.+)/s",
                    function ($matches) use ($_this) {
                        $language = $matches[1];
                        $line = $matches[2];
                        $code = $matches[3];
                        $code = trim(str_replace(['<br>', '<br />', '<br/>'], "\n", $code));

                        if ($language == 'diagram') {
                            return $_this->diagram($code);
                        } else {
                            return $_this->codes($language, $line, $code);
                        }
                    },
                    $block
                );
            } else {
                $blockParts[] = $block;
            }
        }
        return implode('', $blockParts);
    }

    /**
     * 코드 블럭 분할
     *
     * @param string $content content
     * @return array
     */
    private function splitBlocks($content)
    {
        return explode('```', $content);
    }

    /**
     * check is code block
     *
     * @param string $block block
     * @return bool
     */
    public function isCodeBlock($block)
    {
        foreach ($this->languages as $language) {
            if (starts_with($block, $language)) {
                return true;
            }
        }
        return false;
    }

    private function diagram($code)
    {
        return "<div class='mermaid'>$code</div>";
    }

    private function codes($language, $line, $code)
    {
        return join('', [
            "<div class='code-wrap'>",
            "<div class='plugins'>",
            "<span class='language' style='display:none;'>$language</span>",
            "<span class='expend'><i class='xi-fullscreen'></i></span>",
            "</div>",
            "<pre class='line-numbers language-$language' data-line='$line' data-language='$language'><code class='language-$language'>$code</code></pre>",
            "</div>",
        ]);
    }
}
