<?php
/**
 * ContentsCompilerPluginInterface
 *
 * @category    CkEditor
 * @package     CkEditor
 * @author      XE Developers (akasima) <osh@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER Crop. <http://www.navercorp.com>
 * @license     LGPL-2.1
 * @license     http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * @link        https://xpressengine.io
 */

namespace Xpressengine\Plugins\CkEditor;

/**
 * ContentsCompilerPluginInterface
 *
 * CkEditor 모듈에 plugin 을 등록하려면 이 interface 를 사용하세요.
 *
 * @category    CkEditor
 * @package     CkEditor
 *
 * @deprecated
 */
interface ContentsCompilerPluginInterface
{
    public static function render($content);

    public static function initAssets();
}
