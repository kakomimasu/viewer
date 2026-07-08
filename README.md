# Kakomimasu Viewer

## セットアップ

パッケージをインストールする

```
npm install
```

ローカル環境で実行する

```
npm run dev
```

http://localhost:3000 にアクセスしてください。

## ローカル起動（HTTPS）

ログインの確認など HTTPS（`https://local.kakomimasu.com:3000`）で起動したい場合のみ、以下を実施してください。

1. hosts ファイルの編集

`local.kakomimasu.com` で起動するため、localhost に向けるために hosts を編集する必要があります。

以下の行を hosts に追加してください。

```
127.0.0.1      local.kakomimasu.com
```

2. ローカル環境立ち上げ

```
npm run dev:https
```

3. ブラウザでアクセス

https://local.kakomimasu.com:3000 にアクセスしてください

> [!TIP]
> 初回アクセス時などにブラウザで警告が出ることがありますが、「詳細設定」から「local.kakomimasu.com にアクセスする」をクリックするとページが開きます。（Google Chrome の場合）
>
> その後もアドレスバーに「保護されていない通信」と出ますがこのままでも開発は可能です。
> 気になる方は、Next.js でのローカル用証明書の作成に [mkcert](https://github.com/FiloSottile/mkcert) を使用しているため、`mkcert -install` でローカルCAを登録してください

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
