<?php
/**
 * CodeTool
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

namespace Xpressengine\Plugins\CkEditor\Components\EditorTools\CodeTool;

use App\Facades\XeFrontend;
use Illuminate\Contracts\Auth\Access\Gate;
use Xpressengine\Editor\AbstractTool;
use Xpressengine\Permission\Instance;
use Route;
use XePresenter;
use Xpressengine\Plugins\CkEditor\Plugin;
use Xpressengine\Http\Request;

/**
 * CodeTool
 *
 * @category    CkEditor
 * @package     Xpressengine\Plugins\CkEditor
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2019 Copyright XEHub Corp. <https://www.xehub.io>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        https://xpressengine.io
 */
class CodeTool extends AbstractTool
{
    /**
     * @var array
     */
    private $languages = [
        'diagram', 'php',
        'javascript', 'css', 'markup', 'scss',
        'c', 'clike', 'cpp', 'csharp', 'objectivec',
        'go', 'java', 'pascal' , 'ruby', 'swift'
    ];

    public static function boot()
    {
        static::route();
    }

    public static function route()
    {
    }

    /**
     * Initialize assets for the tool
     *
     * @return void
     */
    public function initAssets()
    {
        XeFrontend::html('ckeditor.code_tool.highlight_block')->content('
            <script>
                window.XE.$$on(\'content.render\', function (eventName, { element }) {
                    var codeBlock = $(element).find(\'pre code\');
                    if(codeBlock.length) {
                        codeBlock.each(function (index, element) {
                            hljs.highlightBlock(element);
                            window.XE.$$emit(\'content.updated.codeHighlight\', element);
                        });
                    }
                })
            </script>
        ')->load();

        XeFrontend::js([
            asset('plugins/ckeditor/assets/ckeditor/plugins/codesnippet/lib/highlight/highlight.pack.js')
        ])->load();

        XeFrontend::js([
            asset($this->getAssetsPath() . '/code.js')
        ])->load();

        XeFrontend::css([
            asset('plugins/ckeditor/assets/compiler/hashTag.css'),
            asset('plugins/ckeditor/assets/ckeditor/plugins/codesnippet/lib/highlight/styles/monokai_sublime.css'),
        ])->load();
    }

    /**
     * Get the tool's symbol
     *
     * @return array ['normal' => '...', 'large' => '...']
     */
    public function getIcon()
    {
        return null;
    }

    /**
     * Compile the raw content to be useful
     *
     * @param string $content content
     * @return string
     */
    public function compile($content)
    {
        return $content;

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

                        return $_this->codes($language, $line, $code);
                    },
                    $block
                );
            } else {
                $blockParts[] = $block;
            }
        }
        return implode('', $blockParts);
    }

    private function getAssetsPath()
    {
        return str_replace(base_path(), '', plugins_path() . '/ckeditor/components/EditorTools/CodeTool/assets');
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

    private function codes($language, $line, $code)
    {
        return join('', [
            "<div class='code-wrap'>",
            "<div class='plugins'>",
            "<span class='language' style='display:none;'>$language</span>",
            "<span class='expend'><i class='xi-overscan'></i></span>",
            "</div>",
            "<pre class='line-numbers language-$language' data-line='$line' data-language='$language'><code class='language-$language'>$code</code></pre>",
            "</div>",
        ]);
    }
}
