<?php
/**
 * CkEditorPluginInterface
 *
 * PHP version 5
 *
 * @category    CkEditor
 * @package     CkEditor
 * @author      XE Team (akasima) <osh@xpressengine.com>
 * @copyright   2014 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 */
namespace Xpressengine\Plugins\CkEditor;

use App\Http\Controllers\Controller;
use XePresenter;

/**
 * CkEditorPluginInterface
 *
 * CkEditor 모듈에 plugin 을 등록하려면 이 interface 를 사용하세요.
 *
 * @category    CkEditor
 * @package     CkEditor
 * @author      XE Team (akasima) <osh@xpressengine.com>
 * @copyright   2014 Copyright (C) NAVER <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/lgpl-3.0-standalone.html LGPL
 * @link        http://www.xpressengine.com
 */
class FixedController extends Controller
{
    /**
     * file upload
     *
     * @return string|\Xpressengine\Presenter\RendererInterface
     * @throws Exception
     * @throws \Xpressengine\Media\Exceptions\NotAvailableException
     * @throws \Xpressengine\Storage\Exceptions\InvalidFileException
     */
    public function fileUpload()
    {
        /** @var \Illuminate\Http\Request $request */
        $request = app('request');

        /** @var \Xpressengine\Storage\Storage $storage */
        $storage = app('xe.storage');

        $uploadedFile = null;
        if ($request->file('file') !== null) {
            $uploadedFile = $request->file('file');
        } elseif ($request->file('image') !== null) {
            $uploadedFile = $request->file('image');
        }

        if ($uploadedFile === null) {
            throw new \Exception;
        }

        $file = $storage->upload($uploadedFile, UIObject\CkEditor::FILE_UPLOAD_PATH);

        /** @var \Xpressengine\Media\MediaManager $mediaManager */
        $mediaManager = app('xe.media');
        $media = null;
        $thumbnails = null;
        if ($mediaManager->is($file) === true) {
            $media = $mediaManager->make($file);
            $thumbnails = $mediaManager->createThumbnails($media, UIObject\CkEditor::THUMBNAIL_TYPE);

            $media = $media->toArray();

            if (!empty($thumbnails)) {
                $info['thumbnails'] = $thumbnails;
            }
        }

        return XePresenter::makeApi([
            'file' => $file->toArray(),
            'media' => $media,
            'thumbnails' => $thumbnails,
        ]);
    }

    /**
     * get file's source
     *
     * @param string $url url
     * @param string $id  id
     * @return void
     */
    public function fileSource($id)
    {
        /** @var \Xpressengine\Storage\Storage $storage */
        $storage = app('xe.storage');
        $file = $storage->get($id);

        /** @var \Xpressengine\Media\MediaManager $mediaManager */
        $mediaManager = \App::make('xe.media');
        if ($mediaManager->is($file) === true) {
            /** @var \Xpressengine\Media\Handlers\ImageHandler $handler */
            $handler = $mediaManager->getHandler(\Xpressengine\Media\Spec\Media::TYPE_IMAGE);
            $dimension = 'L';
            if (\Agent::isMobile() === true) {
                $dimension = 'M';
            }

            $media = $handler->getThumbnail($mediaManager->make($file), UIObject\CkEditor::THUMBNAIL_TYPE, $dimension);
            $file = $media->getFile();
        }

        header('Content-type: ' . $file->mime);
        echo $storage->read($file);
    }

    /**
     * download file
     *
     * @param string $url url
     * @param string $id  id
     * @throws \Xpressengine\Storage\Exceptions\NotExistsException
     * @return void
     */
    public function fileDownload($id)
    {
        /** @var \Xpressengine\Storage\Storage $storage */
        $storage = app('xe.storage');
        $file = $storage->get($id);

        header('Content-type: ' . $file->mime);

        $storage->download($file);
    }

    /**
     * 해시태그 suggestion 리스트
     *
     * @param string $url url
     * @param string $id  id
     * @return \Xpressengine\Presenter\RendererInterface
     */
    public function hashTag($id = null)
    {
        /** @var \Illuminate\Http\Request $request */
        $request = app('request');
        /** @var \Xpressengine\Tag\TagHandler tag */
        $tag = \App::make('xe.tag');

        $terms = $tag->autoCompletion($request->get('string'));

        $words = [];
        foreach ($terms as $tagEntity) {
            $words[] = $tagEntity->word;
        }

        return XePresenter::makeApi($words);
    }

    /**
     * 멘션 suggestion 리스트
     *
     * @param string $url url
     * @param string $id  id
     * @return \Xpressengine\Presenter\RendererInterface
     */
    public function mention($id = null)
    {
        /** @var \Illuminate\Http\Request $request */
        $request = app('request');
        $string = $request->get('string');
        $userIds = [];

        /** @var \Xpressengine\Member\Repositories\Database\MemberRepository $member */
        $member = app('xe.members');

        if (count($userIds) < 10) {
            $users = $member->getConnection()->table('member')->whereNotIn('id', $userIds)
                ->where('displayName', 'like', $string . '%')->get(['id']);
            foreach ($users as $user) {
                $userIds[] = $user['id'];
            }
        }

        $users = $member->getConnection()->table('member')->whereIn('id', $userIds)
            ->where('displayName', 'like', $string . '%')->get(['id', 'displayName', 'profileImage']);

        foreach ($users as $user) {
            $key = array_search($user['id'], $userIds);
            if ($key !== null && $key !== false) {
                unset($userIds[$key]);
            }
        }

        // 본인은 안나오게 하자..
        $suggestions = [];
        foreach ($users as $user) {
            $suggestions[] = [
                'id' => $user['id'],
                'displayName' => $user['displayName'],
                'profileImage' => $user['profileImage'],
            ];
        }
        return XePresenter::makeApi($suggestions);
    }

}
