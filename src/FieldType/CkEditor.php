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

namespace Xpressengine\Plugins\CkEditor\FieldType;

use Xpressengine\DynamicField\DynamicFieldHandler;
use Xpressengine\DynamicField\AbstractType;
use Xpressengine\DynamicField\ColumnEntity;
use Xpressengine\DynamicField\ColumnDataType;
use Xpressengine\Config\ConfigEntity;
use Illuminate\Database\Query\Builder;
use Xpressengine\Plugins\CkEditor\Editors\CkEditor as CkEditorComponent;
use Xpressengine\Plugins\CkEditor\FieldSkin\CkEditorDefault;
use View;
use XeEditor;

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
class CkEditor extends AbstractType
{
    /**
     * @var string
     */
    protected static $id = 'fieldType/ckeditor@CkEditor';

    // 네임스페이스 이름..
    protected $name = 'CK Editor';
    protected $description = '에디터';
    protected $sortable = false;
    protected $searchable = true;
    protected $searchColumnNames = ['contents'];
    protected $columns = [];
    protected $params = [];
    protected $configs = [];
    protected $rules = [];

    /**
     * boot
     *
     * @return void
     */
    public static function boot()
    {
        /** @var \Xpressengine\Plugin\PluginRegister $register */
        $register = app('xe.pluginRegister');
        $register->add(CkEditorDefault::class);
        CkEditorDefault::boot();
    }


    /**
     * 스키마 구성을 위한 database column 설정
     *
     * @return void
     */
    public function setColumns()
    {
        $this->columns['contents'] = (new ColumnEntity('contents', ColumnDataType::TEXT));
    }

    /**
     * 사용자 페이지 입력할 때 적용될 rule 정의
     *
     * @return void
     */
    public function setRules()
    {
        // TODO: Implement setRules() method.
    }

    /**
     * 다이나믹필스 생성할 때 타입 설정에 적용될 rule 정의
     *
     * @return void
     */
    public function setSettingsRules()
    {
        // TODO: Implement setSettingsRules() method.
    }

    /**
     * Dynamic Field 설정 페이지에서 각 fieldType 에 필요한 설정 등록 페이지 반환
     * return html tag string
     *
     * @param ConfigEntity $config config entity
     * @return string
     */
    public function getSettingsView(ConfigEntity $config = null)
    {
        return View::make('ckeditor::views/FieldType/CkEditor/settings', [
            'config' => $config,
        ])->render();
    }

    /**
     * get manage uri
     *
     * @return null|string
     */
    public static function getSettingsURI()
    {
        return null;
    }

    public function create(ColumnEntity $column)
    {
        parent::create($column);

        XeEditor::setInstance($this->config->get('group') . '_' . $this->config->get('id'), CkEditorComponent::getId());
    }
}
