# plugin-ckeditor
이 어플리케이션은 Xpressengien3(이하 XE3)의 플러그인 입니다.

이 플러그인은 XE3에서 기본 에디터 기능을 제공합니다.

[![License](http://img.shields.io/badge/license-GNU%20LGPL-brightgreen.svg)]

# Installation
### Console
```
$ php artisan plugin:install ckeditor
```

### Web install
- 관리자 > 플러그인 & 업데이트 > 플러그인 목록 내에 새 플러그인 설치 버튼 클릭
- `ckeditor` 검색 후 설치하기

### Ftp upload
- 다음의 페이지에서 다운로드
    * https://store.xpressengine.io/plugins/ckeditor
    * https://github.com/xpressengine/plugin-ckeditor/releases
- 프로젝트의 `plugin` 디렉토리 아래 `ckeditor` 디렉토리명으로 압축해제
- `ckeditor` 디렉토리 이동 후 `composer dump` 명령 실행

# Usage
XE3에서 제공하는 게시판, 댓글 등의 기능에서 기본 Editor로 제공됩니다.

# Option
**Ckeditor 설정**
- 관리자 > 설정 > Editor 설정 > `상세 설정`에서 사이트 전체 Ckeditor의 설정을 지정합니다.
  - 관리자 페이지에서 지정한 설정을 기본 설정으로 사용하고 Ckeditor를 사용하는 게시판이나 댓글 등의 관리 메뉴에서 예외 설정을 지정 할 수 있습니다.
- `추가도구`에서 iframe, XEIcon, 이미지 편집 툴, Code Highlight, Autolink 등의 기능을 추가로 제공합니다.

## License
이 플러그인은 LGPL라이선스 하에 있습니다. <https://opensource.org/licenses/LGPL-2.1>
