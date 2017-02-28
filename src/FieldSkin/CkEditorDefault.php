<?php
/**
 * @author    XE Developers <developers@xpressengine.com>
 * @copyright 2015 Copyright (C) NAVER Corp. <http://www.navercorp.com>
 * @license   LGPL-2.1
 * @license   http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * @link      https://xpressengine.io
 */

namespace Xpressengine\Plugins\CkEditor\FieldSkin;

use Xpressengine\DynamicField\AbstractSkin;
use Xpressengine\Config\ConfigEntity;
use View;

class CkEditorDefault extends AbstractSkin
{

    protected static $id = 'fieldType/ckeditor@CkEditor/fieldSkin/ckeditor@default';
    protected $name = 'defult';
    protected $description = 'CkEditor 기본 스킨';

    /**
     * 다이나믹필스 생성할 때 스킨 설정에 적용될 rule 정의
     *
     * @return void
     */
    public function setSettingsRules()
    {
        // TODO: Implement setSettingsRules() method.
    }

    public function settings(ConfigEntity $config = null)
    {
        return View::make('ckeditor::views/FieldType/CkEditor/Default/settings', ['config' => $config,])->render();
    }

    public function create(array $inputs)
    {
        $config = $this->config;
        return View::make('ckeditor::views/FieldType/CkEditor/Default/create', [
            'config' => $config,
        ])->render();
    }

    public function edit(array $args)
    {
        $config = $this->config;
        return View::make('ckeditor::views/FieldType/CkEditor/Default/edit', [
            'config' => $config,
            'content' => $args[$config->get('id') . 'Contents'],
            'args' => $args,
        ])->render();
    }

    public function show(array $args)
    {
        $config = $this->config;
        return View::make('ckeditor::views/FieldType/CkEditor/Default/show', [
            'config' => $config,
            'content' => $args[$config->get('id') . 'Contents'],
            'args' => $args,
        ])->render();
    }

    public function search(array $inputs)
    {
        $config = $this->config;
        if ($config->get('searchable') !== true) {
            return '';
        }

        return View::make('ckeditor::views/FieldType/CkEditor/Default/search', [
            'config' => $config,
        ])->render();
    }

    /**
     * @param string $name
     * @param array $args
     */
    public function output($name, array $args)
    {
        $key = $name.'ItemId';
        if (isset($args[$key]) === false || $args[$key] == '') {
            return null;
        }

        return Category::getItem($args[$key])->word;
    }

    public static function getSettingsURI()
    {
    }
}

