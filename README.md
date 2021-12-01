# Kakomimasu Viewer

Next.js 製 Kakomimasu Viewer

## 環境変数

### `.env.local`

| 環境変数名                   | 説明                                                | デフォルト値                  |
| ---------------------------- | --------------------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_APISERVER_HOST` | API サーバのホスト名を設定します。                  | `https://api.kakomimasu.com`  |
| `SSR_APISERVER_HOST`         | SSR 時に使用する API サーバのホスト名を設定します。 | `$NEXT_PUBLIC_APISERVER_HOST` |
