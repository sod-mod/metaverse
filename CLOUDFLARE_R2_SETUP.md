# Cloudflare R2 이미지 마이그레이션 가이드

이 가이드는 Multiverse Wiki의 이미지 파일들을 Cloudflare R2로 이동하는 방법을 설명합니다.

## 1. Cloudflare R2 설정

### 1.1 R2 버킷 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. 왼쪽 사이드바에서 **R2** 선택
3. **Create bucket** 클릭
4. 버킷 이름 입력 (예: `multiverse-wiki-images`)
5. **Create bucket** 클릭

### 1.2 R2 API 토큰 생성 (Cloudflare REST API)

Cloudflare REST API를 사용하므로 일반 R2 API 토큰을 생성합니다. R2 API 토큰은 **일반 Account API 토큰과 별도**로 관리됩니다.

**방법 1: R2 페이지에서 직접 생성**

1. R2 페이지로 이동:
   - Cloudflare 대시보드: https://dash.cloudflare.com/
   - 왼쪽 사이드바에서 **R2** 선택
   - 또는 직접 URL: `https://dash.cloudflare.com/<account-id>/r2/api-tokens`

2. **API Tokens** 페이지 찾기:
   - R2 메인 페이지에서 **"API Tokens"** 또는 **"Manage R2 API Tokens"** 링크 클릭
   - 또는 상단 탭에서 **"API Tokens"** 선택
   - 직접 링크: `https://dash.cloudflare.com/<account-id>/r2/api-tokens` (Account ID로 교체)

3. **Create API token** 클릭

4. 토큰 이름 입력 (예: `multiverse-wiki-upload`)

5. **Permissions** 섹션에서:
   - **Object Read & Write** 선택
   - 생성한 버킷 선택 (또는 **All buckets** 선택)

6. **Create API Token** 클릭

7. 생성된 **API Token**을 안전하게 저장 (다시 볼 수 없음)
   - 이 토큰은 환경 변수 `CLOUDFLARE_R2_API_TOKEN`에 설정됩니다
   - **참고**: S3 API 토큰이 아닌 **일반 R2 API 토큰**을 사용합니다

**방법 2: 직접 URL 접근**

"Manage R2 API Tokens" 버튼이 보이지 않는 경우, 직접 URL로 접근:

1. 브라우저 주소창에 다음 URL 입력 (Account ID로 교체):
   ```
   https://dash.cloudflare.com/<account-id>/r2/api-tokens
   ```
   예: `https://dash.cloudflare.com/abc123def456/r2/api-tokens`

2. 위의 3-7단계를 따라 진행

**방법 3: 버킷 설정에서 생성**

1. 생성한 버킷을 클릭하여 버킷 상세 페이지로 이동
2. **Settings** 탭 선택
3. **API Tokens** 섹션에서 토큰 생성
4. 위의 3-7단계를 따라 진행

**참고**: 
- R2 API 토큰은 Account API 토큰과 다릅니다
- Cloudflare REST API를 사용하므로 **일반 R2 API 토큰**을 사용합니다
- S3 API 토큰은 필요하지 않습니다

### 1.3 Account ID 확인

R2 엔드포인트 URL에 필요한 Account ID를 확인합니다:

1. Cloudflare 대시보드 우측 사이드바에서 **Account ID** 확인
2. 또는 R2 버킷의 설정 페이지 URL에서 확인: `https://dash.cloudflare.com/<account-id>/r2/...`
3. 이 Account ID를 `.env` 파일의 `VITE_CLOUDFLARE_R2_ACCOUNT_ID`에 입력

### 1.4 Public Access 설정 (선택사항)

1. 버킷 설정에서 **Public Access** 활성화
2. 또는 Custom Domain 설정 (권장)
   - 버킷 설정 → **Connect Domain** 클릭
   - 도메인을 연결하면 `https://your-domain.com` 형태로 접근 가능

## 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

### 옵션 1: Public URL 사용 (간단함)

```env
CLOUDFLARE_R2_API_TOKEN=your_api_token_here
VITE_CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
VITE_CLOUDFLARE_R2_BUCKET_NAME=multiverse-wiki-images
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://your-domain.r2.cloudflarestorage.com
# 또는 Custom Domain 사용 시:
# VITE_CLOUDFLARE_R2_PUBLIC_URL=https://images.yourdomain.com
```

### 옵션 2: Public URL 없이 사용 (Custom Domain 또는 Workers)

Public URL을 사용하지 않으려면 `VITE_CLOUDFLARE_R2_PUBLIC_URL`을 설정하지 않으면 됩니다:

```env
CLOUDFLARE_R2_API_TOKEN=your_api_token_here
VITE_CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
VITE_CLOUDFLARE_R2_BUCKET_NAME=multiverse-wiki-images
# VITE_CLOUDFLARE_R2_PUBLIC_URL은 설정하지 않음
```

이 경우:
- **개발 환경**: 로컬 `/images/` 경로 사용 (이미지가 `public/images`에 있어야 함)
- **프로덕션**: Custom Domain 또는 Workers 프록시 필요 (아래 참고)

### 옵션 3: 로컬 개발용

`.env.local` 파일 생성하여 로컬 개발용 설정:

```env
# 로컬 개발 시에는 항상 로컬 이미지 사용
VITE_USE_LOCAL_IMAGES=true
```

## 3. 이미지 업로드

Cloudflare REST API를 사용하여 이미지를 업로드합니다. AWS CLI나 S3 호환 도구는 필요하지 않습니다.

### 3.1 환경 변수 설정

업로드 스크립트를 실행하기 전에 환경 변수를 설정합니다:

**Windows Git Bash:**
```bash
export CLOUDFLARE_R2_API_TOKEN="your_api_token_here"
export VITE_CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"
export VITE_CLOUDFLARE_R2_BUCKET_NAME="multiverse-wiki-images"
```

**Windows PowerShell:**
```powershell
$env:CLOUDFLARE_R2_API_TOKEN="your_api_token_here"
$env:VITE_CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"
$env:VITE_CLOUDFLARE_R2_BUCKET_NAME="multiverse-wiki-images"
```

**Windows CMD:**
```cmd
set CLOUDFLARE_R2_API_TOKEN=your_api_token_here
set VITE_CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
set VITE_CLOUDFLARE_R2_BUCKET_NAME=multiverse-wiki-images
```

**또는 `.env` 파일에 추가:**
```env
CLOUDFLARE_R2_API_TOKEN=your_api_token_here
VITE_CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
VITE_CLOUDFLARE_R2_BUCKET_NAME=multiverse-wiki-images
```

### 3.2 이미지 업로드 실행

**업로드 실행:**
```bash
npm run upload-images
```

**테스트 실행 (실제 업로드 없이 확인):**
```bash
npm run upload-images:dry-run
```

**특정 버킷에 업로드:**
```bash
node tools/upload-images.cjs --bucket=my-bucket-name
```

### 3.3 업로드 스크립트 동작

업로드 스크립트는:
1. `public/images` 디렉토리의 모든 파일을 재귀적으로 검색
2. 각 파일을 Cloudflare R2 REST API를 통해 업로드
3. 파일 경로를 유지하여 `images/` 경로로 업로드
4. 진행 상황을 실시간으로 표시

**참고**: 
- API 토큰은 1.2에서 생성한 R2 API 토큰을 사용합니다
- Account ID는 1.3에서 확인한 값을 사용합니다
- 버킷 이름은 1.1에서 생성한 버킷 이름을 사용합니다

## 4. 코드 변경사항

이미지 URL을 동적으로 생성하는 유틸리티 함수가 추가되었습니다:

- `src/utils/imageUrl.js` - 이미지 URL 생성 헬퍼
- 모든 컴포넌트가 이 헬퍼를 사용하도록 업데이트됨

### 이미지 URL 동작 방식

`src/utils/imageUrl.js`의 동작 순서:

1. **`VITE_USE_LOCAL_IMAGES=true`** 설정 시: 로컬 `/images/` 경로 사용
2. **`VITE_CLOUDFLARE_R2_PUBLIC_URL`** 설정 시: R2 Public URL 사용
3. **둘 다 설정되지 않음**: 로컬 `/images/` 경로 사용 (fallback)

따라서 Public URL 없이 사용하려면:
- `.env`에서 `VITE_CLOUDFLARE_R2_PUBLIC_URL`을 설정하지 않거나
- `VITE_USE_LOCAL_IMAGES=true`로 설정하여 로컬 이미지 사용

## 5. Public URL 없이 사용하기

`VITE_CLOUDFLARE_R2_PUBLIC_URL`을 설정하지 않으면 Public URL 없이 사용할 수 있습니다.

### 5.1 Custom Domain 사용 (권장)

R2 버킷에 Custom Domain을 연결하면 Public URL 대신 커스텀 도메인으로 접근 가능합니다:

1. R2 버킷 설정 → **Connect Domain** 클릭
2. 도메인 입력 (예: `images.yourdomain.com`)
3. DNS 설정 완료 후 `.env`에 설정:
   ```env
   VITE_CLOUDFLARE_R2_PUBLIC_URL=https://images.yourdomain.com
   ```

### 5.2 Cloudflare Workers 프록시 사용

Workers를 통해 이미지를 프록시하여 제공:

1. Cloudflare Workers 생성
2. 다음 코드로 이미지 프록시 구현:
   ```javascript
   export default {
     async fetch(request, env) {
       const url = new URL(request.url);
       const path = url.pathname;
       
       // R2 버킷에서 이미지 가져오기
       const object = await env.R2_BUCKET.get(`images${path}`);
       
       if (!object) {
         return new Response('Not found', { status: 404 });
       }
       
       return new Response(object.body, {
         headers: {
           'Content-Type': object.httpMetadata.contentType,
           'Cache-Control': 'public, max-age=31536000',
         },
       });
     },
   };
   ```
3. Workers Route 설정: `images.yourdomain.com/images/*`
4. `.env`에 설정:
   ```env
   VITE_CLOUDFLARE_R2_PUBLIC_URL=https://images.yourdomain.com
   ```

### 5.3 Vercel API Routes로 프록시 (권장: Vercel 기본 도메인 사용)

Vercel의 기본 도메인(`multiverse-wiki.vercel.app`)을 사용하면서 R2 이미지를 제공하려면 Vercel API Routes를 사용합니다:

1. **API Route 생성**: `api/images/[...path].js` 파일 생성

```javascript
// api/images/[...path].js
export default async function handler(req, res) {
  const { path } = req.query;
  const imagePath = Array.isArray(path) ? path.join('/') : path;
  
  // R2에서 이미지 가져오기
  const accountId = process.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID;
  const bucketName = process.env.VITE_CLOUDFLARE_R2_BUCKET_NAME;
  const apiToken = process.env.CLOUDFLARE_R2_API_TOKEN;
  
  const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/images/${imagePath}`;
  
  try {
    const response = await fetch(r2Url, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const contentType = response.headers.get('content-type') || 'image/webp';
    const imageData = await response.arrayBuffer();
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(Buffer.from(imageData));
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}
```

2. **환경 변수 설정**:
   - Vercel Dashboard → Settings → Environment Variables에 추가:
     - `CLOUDFLARE_R2_API_TOKEN` (업로드용 토큰)
     - `VITE_CLOUDFLARE_R2_ACCOUNT_ID`
     - `VITE_CLOUDFLARE_R2_BUCKET_NAME`

3. **이미지 URL 설정**:
   ```env
   # .env 파일에 추가 (또는 Vercel 환경 변수)
   VITE_CLOUDFLARE_R2_PUBLIC_URL=https://multiverse-wiki.vercel.app
   ```

4. **이미지 URL 유틸리티 수정 필요**: 
   - `/images/...` 경로를 `/api/images/...`로 변경하도록 `imageUrl.js` 수정

**장점**:
- Vercel 기본 도메인 사용 가능
- 별도 Custom Domain 불필요
- R2 Public URL 불필요

**단점**:
- Vercel의 함수 실행 시간 제한 (10초)
- 대용량 이미지의 경우 타임아웃 가능

### 5.4 Public URL 없이 배포 (이미지 포함)

Public URL을 사용하지 않고 배포하려면:

1. `.env`에서 `VITE_CLOUDFLARE_R2_PUBLIC_URL` 제거 또는 주석 처리
2. `.vercelignore`에서 이미지 제외 설정 제거:
   ```
   # public/images/** 제거
   ```
3. 이미지가 빌드에 포함되어 Vercel에서 제공됨
   - **주의**: Vercel의 100MB 제한에 걸릴 수 있음

## 6. 배포 설정

### Vercel 환경 변수 설정

1. Vercel Dashboard에서 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 변수 추가:

   **필수 변수 (업로드용, 빌드 시 필요 없음):**
   - `CLOUDFLARE_R2_API_TOKEN` - R2 API 토큰 (업로드 스크립트용, 빌드에는 불필요)
   
   **프로덕션 변수 (Public URL 사용 시):**
   - `VITE_CLOUDFLARE_R2_PUBLIC_URL` - R2 Public URL 또는 Custom Domain
   
   **선택 변수:**
   - `VITE_USE_LOCAL_IMAGES` - 개발용 (로컬 이미지 사용)
   
   **참고**: 
   - `CLOUDFLARE_R2_API_TOKEN`은 로컬에서 이미지 업로드할 때만 필요합니다
   - Vercel 빌드에는 필요하지 않으므로 설정하지 않아도 됩니다
   - Public URL 없이 사용 시 `VITE_CLOUDFLARE_R2_PUBLIC_URL`을 설정하지 않음

### .vercelignore 파일

배포 시 이미지 파일 제외:

```
public/images/**
!public/images/*.json
!public/images/*.md
```

## 7. 확인 및 테스트

1. 로컬에서 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 이미지가 정상적으로 로드되는지 확인

3. 프로덕션 빌드 테스트:
   ```bash
   npm run build
   npm run preview
   ```

## 8. 문제 해결

### 이미지가 로드되지 않는 경우

1. R2 버킷의 Public Access가 활성화되어 있는지 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. 브라우저 콘솔에서 네트워크 에러 확인
4. CORS 설정 확인 (필요한 경우)

### CORS 설정

R2 버킷에 CORS 규칙 추가:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

## 참고 자료

- [Cloudflare R2 문서](https://developers.cloudflare.com/r2/)
- [AWS CLI S3 호환 명령어](https://awscli.amazonaws.com/v2/documentation/latest/reference/s3/index.html)

