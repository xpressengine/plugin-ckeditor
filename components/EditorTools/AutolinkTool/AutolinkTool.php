<?php
namespace Xpressengine\Plugins\CkEditor\Components\EditorTools\AutolinkTool;

use App\Facades\XeFrontend;
use Illuminate\Contracts\Auth\Access\Gate;
use Xpressengine\Editor\AbstractTool;
use Xpressengine\Permission\Instance;
use XePresenter;
use Xpressengine\Plugins\CkEditor\Plugin;
use Xpressengine\Http\Request;

class AutolinkTool extends AbstractTool
{
    /**
     * @var array
     */
    private $schemas = [
        'http', 'https'
    ];

    public static function boot()
    {
    }

    /**
     * Initialize assets for the tool
     *
     * @return void
     */
    public function initAssets()
    {
        XeFrontend::js([
            asset($this->getAssetsPath() . '/autolink.js')
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
    }

    private function getAssetsPath()
    {
        return str_replace(base_path(), '', realpath(__DIR__ . '/assets'));
    }
}
