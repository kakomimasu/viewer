# Kakomimasu Viewer

## 環境変数

[Basic Features: Environment Variables | Next.js](https://nextjs-ja-translation-docs.vercel.app/docs/basic-features/environment-variables)

| 環境変数名                   | 説明                                                | デフォルト値                  |
| ---------------------------- | --------------------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_APISERVER_HOST` | API サーバのホスト名を設定します。                  | `https://api.kakomimasu.com`  |
| `SSR_APISERVER_HOST`         | SSR 時に使用する API サーバのホスト名を設定します。 | `$NEXT_PUBLIC_APISERVER_HOST` |

### 設定方法

ルートフォルダに`.env.local`を作成し、以下のように記述する。

```
NEXT_PUBLIC_APISERVER_HOST=http://127.0.0.1:8880
```
