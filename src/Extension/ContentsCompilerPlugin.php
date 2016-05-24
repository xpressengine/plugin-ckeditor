<?php
/**
 * ContentsCompilerPlugin
 *
 * PHP version 5
 *
 * @category    CkEditorPlugin
 * @package     CkEditorPlugin
 * @author      XE Team (developers) <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 */
namespace Xpressengine\Plugins\CkEditor\Extension;

use XeFrontend;
use Xpressengine\Media\Models\Image;
use Xpressengine\Plugin\AbstractComponent;
use Xpressengine\Plugins\CkEditor\ContentsCompilerPluginInterface;
use Xpressengine\Storage\File;
use Xpressengine\Plugins\Board\Modules\Board as BoardModule;

/**
 * ContentsCompilerPlugin
 *
 * @category    CkEditorPlugin
 * @package     CkEditorPlugin
 * @author      XE Team (developers) <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 *
 * @deprecated 
 */
class ContentsCompilerPlugin extends AbstractComponent implements ContentsCompilerPluginInterface
{

    protected static $loaded = false;

    /**
     * get manage URI
     *
     * @return null|string
     */
    public static function getSettingsURI()
    {
        return null;
    }

    /**
     *
     */
    public static function render($content)
    {
        $_this = new static;
        return implode('', [
            $_this->compile($content),
            '<script>$(function(){mermaid.initialize({startOnLoad:true})});</script>',
        ]);
    }

    /**
     *
     */
    public static function initAssets()
    {
        if (self::$loaded === false || true) {
            self::$loaded = true;

            $path = 'plugins/ckeditor/assets/compiler';
            // requirejs 를 load 하기 전에 붙여야 한다.
            XeFrontend::js([
                asset(str_replace(base_path(), '', $path . '/mermaid.min.js')),
            ])->appendTo('head')->load();

            XeFrontend::js([
                asset(str_replace(base_path(), '', $path . '/contentsCompiler.js')),
                asset(str_replace(base_path(), '', $path . '/prism.js')),
            ])->load();

            XeFrontend::css([
                asset(str_replace(base_path(), '', $path . '/hashTag.css')),
                asset(str_replace(base_path(), '', $path . '/prism.css')),
                asset(str_replace(base_path(), '', $path . '/mermaid.css')),
                asset(str_replace(base_path(), '', $path . '/mermaid.forest.css')),
            ])->load();
        }
    }

    /**
     * compile
     *
     * @param string $content content
     * @return string
     */
    private function compile($content)
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
                $block = $this->hashTag($block);
                $block = $this->mention($block);
                $block = $this->file($block);
                $block = $this->image($block);
                $block = $this->link($block);
                $blockParts[] = $block;
            }
        }
        return implode('', $blockParts);
    }

    /**
     * @param $code
     * @return string
     */
    private function diagram($code)
    {
        return "<div class='mermaid'>$code</div>";
    }

    /**
     * @param $language
     * @param $link
     * @param $code
     * @return string
     */
    private function codes($language, $line, $code)
    {
        return join('', [
            "<div class='code-wrap'>",
            "<div class='plugins'>",
            "<span class='language' style='display:none;'>$language</span>",
            "<span class='expend'><i class='xi-fullscreen'></i></span>",
            "</div>",
            "<pre class='line-numbers' data-line='$line'><code class='language-$language'>$code</code></pre>",
            "</div>",
        ]);
    }

    /**
     * @param $content
     */
    private function hashTag($content)
    {
        $pattern = '/<span[a-zA-Z0-9=\"\s\']+?class=\"__xe_hashtag\">#([\xEA-\xED\x80-\xBF-a-zA-Z0-9_]+)<\/span>/';
        $replace = '<a href="/tag/?tag=$1" class="__xe_hashtag" target="_blank">#$1</a>';
        return preg_replace($pattern, $replace, $content);
    }

    /**
     * @param $content
     */
    private function mention($content)
    {
        $pattern = '/<span[a-zA-Z0-9=\"\s\']+?data-id=\"([-a-z0-9]+)\" class=\"__xe_mention\">@([\xEA-\xED\x80-\xBF-a-zA-Z0-9_]+)<\/span>/';
        $replace = '<span role="button" class="__xe_member __xe_mention" data-id="$1" data-text="$2">$2</span>';
        return preg_replace($pattern, $replace, $content);
    }

    /**
     * @param $content
     */
    private function link($content)
    {
        return $content;
    }

    private function file($content)
    {
        $pattern = '/<span[a-zA-Z0-9=\"\s\']+?data-download-link=\"([\/\-\:\.a-zA-Z0-9]+)\" data-id=\"([\/\-a-z0-9]+)\" class=\"__xe_file\">([\xEA-\xED\x80-\xBF-a-zA-Z0-9_\(\)\s\.\&;\:\<\>]+)<\/span>/';
        $replace = '<a href="$1" data-id="$2" target="_blank" class="__xe_file"><i class="xi-file-download"></i> $3</a>';
        return preg_replace($pattern, $replace, $content);
    }

    private function image($content)
    {
        /** @var \Xpressengine\Storage\Storage $storage */
        $storage = app('xe.storage');
        /** @var \Xpressengine\Media\MediaManager $mediaManager */
        $mediaManager = \App::make('xe.media');
        /** @var \Xpressengine\Media\Handlers\ImageHandler $handler */
        $handler = $mediaManager->getHandler(\Xpressengine\Media\Models\Media::TYPE_IMAGE);

        $dimension = 'L';
        if (\Agent::isMobile() === true) {
            $dimension = 'M';
        }

        $pattern = '/<img[a-zA-Z0-9=\"\s\']+?title=\"([\xEA-\xED\x80-\xBF-a-zA-Z0-9_\(\)\s\.\&;\:\<\>#]+)\" data-id=\"([\/\-a-z0-9]+)\" class=\"__xe_image\" src=\"([\/\-\:\.a-zA-Z0-9]+)\" \/>/';
        return preg_replace_callback($pattern, function ($matches) use ($storage, $mediaManager, $handler, $dimension) {
            $title = $matches[1];
            $id = $matches[2];
            $src = null;

//            $file = File::find($id);
//            $media = Image::getThumbnail(
//                $mediaManager->make($file),
//                BoardModule::THUMBNAIL_TYPE,
//                $dimension
//            );
//
////             여기 url 없다함
////             $src = $media->url();

            if ($src == null) {
                $src = $matches[3];
            }

            return sprintf('<img title="%s" data-id="%s" src="%s" class="__xe_image" />', $title, $id, $src);
        }, $content);
    }

    /**
     * @var array
     */
    private $languages = [
        'diagram', 'php',
        'javascript', 'css', 'markup', 'scss',
        'c', 'clike', 'cpp', 'csharp', 'objectivec',
        'go', 'java', 'pascal' , 'ruby', 'swift'
    ];

    /**
     * 코드 블럭 분할
     *
     * @param string $content content
     * @return array
     */
    public function splitBlocks($content)
    {
        return explode('```', $content);
    }

    /**
     * glue blocks
     *
     * @param array $blocks blocks
     * @return string
     */
    public function glueBlocks(array $blocks)
    {
        return implode('```', $blocks);
    }

    /**
     * make block clear
     *
     * @param string $text text
     * @return string
     */
    public function makeBlockClear($text)
    {
        $text = str_replace(['<p>','</p>'], ['','<br />'], $text);
        return strip_tags($text, '<br>');
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
}
