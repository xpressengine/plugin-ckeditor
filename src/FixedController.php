<?php
//namespace Xpressengine\Plugins\CkEditor;
//
//use App\Http\Controllers\Controller;
//use XePresenter;
//use Xpressengine\Http\Request;
//use Xpressengine\Media\Models\Image;
//use Xpressengine\Plugins\CkEditor\Exceptions\NotFoundUploadFileException;
//use Xpressengine\Storage\File;
//use Xpressengine\Storage\Storage;
//use Xpressengine\Tag\TagHandler;
//use Xpressengine\User\Models\User;
//use Auth;
//
//class FixedController extends Controller
//{
//    /**
//     * file upload
//     *
//     * @param Request $request request
//     * @param Storage $storage storage
//     * @return mixed
//     */
//    public function fileUpload(Request $request, Storage $storage)
//    {
//        $uploadedFile = null;
//        if ($request->file('file') !== null) {
//            $uploadedFile = $request->file('file');
//        } elseif ($request->file('image') !== null) {
//            $uploadedFile = $request->file('image');
//        }
//
//        if ($uploadedFile === null) {
//            throw new NotFoundUploadFileException;
//        }
//
//        $file = $storage->upload($uploadedFile, Editors\CkEditor::FILE_UPLOAD_PATH);
//
//        /** @var \Xpressengine\Media\MediaManager $mediaManager */
//        $mediaManager = app('xe.media');
//        $media = null;
//        $thumbnails = null;
//        if ($mediaManager->is($file) === true) {
//            $media = $mediaManager->make($file);
//            $thumbnails = $mediaManager->createThumbnails($media, Editors\CkEditor::THUMBNAIL_TYPE);
//
//            $media = $media->toArray();
//
//            if (!empty($thumbnails)) {
//                $info['thumbnails'] = $thumbnails;
//            }
//        }
//
//        return XePresenter::makeApi([
//            'file' => $file->toArray(),
//            'media' => $media,
//            'thumbnails' => $thumbnails,
//        ]);
//    }
//
//    /**
//     * get file source
//     *
//     * @param string $id document id
//     * @return void
//     */
//    public function fileSource($id)
//    {
//        if (empty($id)) {
//            throw new \Exception('File id required');
//        }
////        if (Gate::denies(
////            BoardPermissionHandler::ACTION_READ,
////            new Instance($boardPermission->name($this->instanceId)))
////        ) {
////            throw new AccessDeniedHttpException;
////        }
//
//        $file = File::find($id);
//
//        /** @var \Xpressengine\Media\MediaManager $mediaManager */
//        $mediaManager = app('xe.media');
//        if ($mediaManager->is($file) === true) {
//            $dimension = 'L';
//            if (\Agent::isMobile() === true) {
//                $dimension = 'M';
//            }
//            $media = Image::getThumbnail(
//                $mediaManager->make($file),
//                Editors\CkEditor::THUMBNAIL_TYPE,
//                $dimension
//            );
//
//            header('Content-type: ' . $media->mime);
//            echo $media->getContent();
//        }
//    }
//
//    /**
//     * file download
//     *
//     * @param $id
//     * @return void
//     */
//    public function fileDownload($id)
//    {
//        if (empty($id)) {
//            throw new \Exception('File id required');
//        }
//
////        if (Gate::denies(
////            BoardPermissionHandler::ACTION_READ,
////            new Instance($boardPermission->name($this->instanceId)))
////        ) {
////            throw new AccessDeniedHttpException;
////        }
//
//        $file = File::find($id);
//
//        /** @var \Xpressengine\Storage\Storage $storage */
//        $storage = app('xe.storage');
//        $storage->download($file);
//    }
//
//    public function fileDestroy($id)
//    {
//        if (empty($id)) {
//            throw new \Exception('File id required');
//        }
//
//        /** @var \Xpressengine\Storage\Storage $storage */
//        $storage = app('xe.storage');
//        $storage->remove(File::find($id));
//
//        return XePresenter::makeApi([
//            'deleted' => true,
//        ]);
//    }
//
//    /**
//     * 해시태그 suggestion 리스트
//     *
//     * @param Request $request
//     * @param TagHandler $tag
//     * @param string|null $id
//     * @return mixed
//     */
//    public function hashTag(Request $request, TagHandler $tag, $id = null)
//    {
//        $tags = $tag->similar($request->get('string'));
//
//        $suggestions = [];
//        foreach ($tags as $tag) {
//            $suggestions[] = [
//                'id' => $tag->id,
//                'word' => $tag->word,
//            ];
//        }
//
//        return XePresenter::makeApi($suggestions);
//    }
//
//    /**
//     * 멘션 suggestion 리스트
//     *
//     * @param Request $request
//     * @param string|null $id
//     * @return mixed
//     */
//    public function mention(Request $request, $id = null)
//    {
//        $suggestions = [];
//
//        $string = $request->get('string');
//        $users = User::where('displayName', 'like', $string . '%')->where('id', '<>', Auth::user()->getId())->get();
//        foreach ($users as $user) {
//            $suggestions[] = [
//                'id' => $user->getId(),
//                'displayName' => $user->getDisplayName(),
//                'profileImage' => $user->profileImage,
//            ];
//        }
//
//        return XePresenter::makeApi($suggestions);
//    }
//
//}
