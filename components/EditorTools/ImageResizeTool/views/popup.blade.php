<style>
    #container {margin: 0 auto; width: 800px; padding-top:15px}
    #imageWrapper { width: 100%; height: 800px;}
    img {max-width: 100%;}
    .infoArea { position:relative; width: 100%; height: 40px; }
    .image_size { position: absolute; bottom: 0; right: 0; }
</style>

<div id="container">
    <div class="panel panel-default">
        <div class="panel-body">
            <div id="imageWrapper"></div>
            <div class="infoArea">
                <div class="image_size"></div>
            </div>
        </div>
        <div class="panel-footer clearfix text-center">
            <div class="row">
                <input type="file" id="imageFile" accept="image/*" class="hide" />
                <button type="button" id="btnSelectImage" class="btn btn-default"><i class="xi-image-o"></i> 파일 선택</button>
                &nbsp;
                <button type="button" id="btnToggleResize" class="btn btn-default" disabled="disabled"><i class="xi-image-o"></i> Resize</button>
                &nbsp;
                <button type="button" id="btnToggleCrop" class="btn btn-default" disabled="disabled"><i class="xi-image-o"></i> Crop</button>
                <button type="button" id="btnCropImage" class="btn btn-default" disabled="disabled"><i class="xi-cut"></i> 자르기</button>
                &nbsp;
                <button type="button" id="btnClose" class="btn btn-default"><i class="xi-close"></i> 닫기</button>
                <button type="button" id="btnResetImage" class="btn btn-default" disabled="disabled"><i class="xi-redo"></i> 리셋</button>
                <button type="button" id="btnUpload" class="btn btn-default" disabled="disabled"><i class="xi-upload"></i> 업로드</button>
                <button type="button" id="btnAppendToEditor" class="btn btn-default" disabled="disabled"><i class="xi-log-in"></i> 에디터에 넣기</button>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">


</script>