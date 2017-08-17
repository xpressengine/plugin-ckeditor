<?php
/**
 * Created by PhpStorm.
 * User: seungman
 * Date: 2017. 6. 2.
 * Time: PM 3:38
 */

namespace Xpressengine\Plugins\CkEditor\Components\EditorTools\IframeTool;

use Symfony\Component\DomCrawler\Crawler;
use XeConfig;
use XeFrontend;
use Route;
use Xpressengine\Editor\AbstractTool;
use Xpressengine\Plugins\CkEditor\Plugin;
use Xpressengine\Http\Request;
use XePresenter;

class IframeTool extends AbstractTool
{
    public static function boot()
    {
        static::route();
    }

    protected static function route()
    {
        // implement code

        Route::fixed(
            Plugin::getId(),
            function () {
                Route::get(
                    'iframe_tool/popup/create',
                    [
                        'as' => 'ckeditor::iframe_tool.popup',
                        'uses' => function (Request $request) {

                            $title = 'iframe Tool';

                            // set browser title
                            XeFrontend::title($title);

                            XeFrontend::css([
                                asset(Plugin::asset('/components/EditorTools/IframeTool/assets/style.css')),
                                '/assets/vendor/bootstrap/css/bootstrap.min.css'
                            ])->load();

                            XeFrontend::js([
                                '/assets/vendor/bootstrap/js/bootstrap.min.js'
                            ])->load();

                            //header, footer 제거
                            \XeTheme::selectBlankTheme();

                            // output
                            return XePresenter::make('ckeditor::components.EditorTools.IframeTool.views.popup');

                        }
                    ]
                );
            }
        );

        Route::settings(Plugin::getId(), function () {
            Route::get('setting', [
                'as' => 'xe.plugin.ckeditor.iframe_tool.settings.get',
                'uses' => 'SettingController@getSetting'
            ]);
            Route::post('setting', [
                'as' => 'xe.plugin.ckeditor.iframe_tool.settings.post',
                'uses' => 'SettingController@postSetting'
            ]);

        }, ['namespace' => 'Xpressengine\\Plugins\\CkEditor\\Components\\EditorTools\\IframeTool']);

    }

    public static function getInstanceSettingURI($instanceId)
    {
        return route('xe.plugin.ckeditor.iframe_tool.settings.get', $instanceId);
    }

    /**
     * Initialize assets for the tool
     *
     * @return void
     */
    public function initAssets()
    {
        $wls = function () {
            return implode(',', array_map(function ($item) {
                return "'" . $item . "'";
            }, $this->getWhiteList()));
        };
        XeFrontend::html('ckeditor.iframe_tool.load_url')->content("
        <script>
            (function() {
            
                var _url = {
                    popup: '".route('ckeditor::iframe_tool.popup')."',
                    whiteList: [".call_user_func($wls)."]
                };
            
                var URL = {
                    get: function (type) {
                        return _url[type];                 
                    }
                };
                
                window.iframeToolURL = URL;
            })();
        </script>
        ")->load();

        XeFrontend::js([
            asset($this->getAssetsPath() . '/iframe.js')
        ])->load();

        XeFrontend::css([
            asset($this->getAssetsPath() . '/style.css')
        ])->load();
    }

    /**
     * Get the tool's symbol
     *
     * @return array ['normal' => '...', 'large' => '...']
     */
    public function getIcon()
    {
        return asset($this->getAssetsPath() . '/icon.png');
    }

    /**
     * Compile the raw content to be useful
     *
     * @param string $content content
     * @return string
     */
    public function compile($content)
    {
        $crawler = new Crawler($content);
        $data = $crawler->filter('*[xe-tool-data]')->eq(0)->attr('xe-tool-data');
        $data = str_replace("'", '"', $data);
        $data = json_decode($data, true);

        $source = array_get($data, 'src');
        if (!$source || !in_array(parse_url($source, PHP_URL_HOST), $this->getWhiteList())) {
            return '';
        }
        
        $attr = 'src="'.$data['src'].'" ';

        if(array_get($data, 'width')) {
            $attr .= 'width="'.$data['width'].'" ';
        }

        if(array_get($data, 'height')) {
            $attr .= 'height="'.$data['height'].'" ';
        }

        if(array_get($data, 'scrolling')) {
            $attr .= 'scrolling="'.$data['scrolling'].'" ';
        }

        return '<iframe '.$attr.'></iframe>';
    }

    private function getAssetsPath()
    {
        return str_replace(base_path(), '', realpath(__DIR__ . '/assets'));
    }

    private function getWhiteList()
    {
        $config = XeConfig::get(static::getId());
        return $config ? $config->get('whitelist') : [];
    }
}