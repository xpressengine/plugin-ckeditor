<?php
namespace Xpressengine\Plugins\CkEditor\Exceptions;

use Xpressengine\Plugins\CkEditor\CkEditorException;

class NotFoundUploadFileException extends CkEditorException
{
    protected $message = 'Upload file cannot be found.';
}
