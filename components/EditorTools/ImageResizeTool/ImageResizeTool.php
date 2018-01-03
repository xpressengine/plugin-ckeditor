<?php

namespace Xpressengine\Plugins\CkEditor\Components\EditorTools\ImageResizeTool;

use App\Facades\XeFrontend;
use Xpressengine\Editor\AbstractTool;
use Route;
use XePresenter;
use Xpressengine\Plugins\CkEditor\Plugin;
use Xpressengine\Http\Request;

class ImageResizeTool extends AbstractTool
{
    public static function boot()
    {
        static::route();
    }

    public static function route()
    {
        Route::fixed(
            static::getId(),
            function () {
                Route::get(
                    'image_resize_tool/popup/create',
                    [
                        'as' => 'ckeditor::image_resize_tool.popup',
                        'uses' => function (Request $request) {

                            $title = '이미지 리사이즈, 편집 에디터툴';

                            // set browser title
                            XeFrontend::title($title);

                            //header, footer 제거
                            \XeTheme::selectBlankTheme();

                            XeFrontend::css([
                                asset('assets/vendor/bootstrap/css/bootstrap.min.css'),
                                asset('assets/vendor/jqueryui/jquery-ui.min.css'),
                                Plugin::asset('components/EditorTools/ImageResizeTool/assets/vendor/cropper/cropper.min.css'),
                            ])->appendTo('head')->load();

                            XeFrontend::js([
                                asset('assets/vendor/jqueryui/jquery-ui.min.js'),
                                Plugin::asset('components/EditorTools/ImageResizeTool/assets/vendor/cropper/cropper.min.js'),
                                Plugin::asset('components/EditorTools/ImageResizeTool/assets/ImageResize.js'),
                            ])->appendTo('body')->load();

                            // output
                            return XePresenter::make('ckeditor::components.EditorTools.ImageResizeTool.views.popup');

                        }
                    ]
                );
            }
        );
    }

    public function initAssets()
    {
        XeFrontend::html('ckeditor.image_resize_tool.load_url')->content("
        <script>
            (function() {
                var _url = {
                    popup: '".route('ckeditor::image_resize_tool.popup')."'
                };
                
                window.imageResizeURL = {
                    get: function (type) {
                        return _url[type];                 
                    }
                };
            })();
        </script>
        ")->load();
        XeFrontend::js([
            asset($this->getAssetsPath() . '/ImageResizeTool.js'),
        ])->load();
    }

    public function getIcon()
    {
        return asset($this->getAssetsPath() . '/icon.png');
    }

    public function compile($content)
    {
        return $content;
    }

    private function getAssetsPath()
    {
        return str_replace(base_path(), '', realpath(__DIR__ . '/assets'));
    }
}
