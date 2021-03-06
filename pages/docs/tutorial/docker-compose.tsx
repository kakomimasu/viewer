import React from "react";

import Link from "../../../src/link";
import { KkmmCodeBlock } from "../../../components/code";
import Content from "../../../components/content";
import Section, { SubSection } from "../../../components/section";

export default function Index() {
  return (
    <Content title="docker-composeを用いたローカルサーバ構築">
      <Section title="概要">
        自分で作成した対戦プログラム(以下、自作AI)は通常 api.kakomimasu.com
        に接続して対戦させますが、その場合、毎回マイゲームを作成して接続させるのは大変面倒です。
        実際に開発する時にはローカルでサーバを立て、フリーマッチという形で自作AIを接続する形を取った方が楽な場合があります。
        <br />
        したがって囲みマスではdocker-composeを利用したビューア・APIサーバ
        ローカルサーバ実行ツールを提供しています。これを使用することでローカル環境による自作AI開発が容易になります。
      </Section>
      <Section title="ローカル実行ツールビルド・起動方法">
        <SubSection title="1. Docker・Composeインストール">
          docker-composeコマンドが実行できる環境が必要です。既にインストール済みの人は2へ進んでください。
          <br />
          まだの方は下記サイトからDocker及びDocker
          Composeのインストールを行ってください。
          <p>
            <Link
              href="https://docs.docker.jp/compose/install.html"
              noLinkStyle
            >
              Docker Composeのインストール - Docker-docs-ja
            </Link>
          </p>
          Docker for Mac または Docker for
          Windowsをインストール済みの方は既にDocker
          Composeも使えるようになっています。
        </SubSection>
        <SubSection title="2. ビルド">
          <Link href="https://github.com/kakomimasu/viewer-server" noLinkStyle>
            kakomimasu/viewer-server - Github
          </Link>
          をクローンして、buildコマンドを実行します。
          <br />
          一度ビルドしたら次回からは3のみで起動できます。しかしserverやviewerのバグ修正や新機能追加などを取り入れるには再度ビルドする必要があります。
          <p>
            <KkmmCodeBlock
              language="bash"
              text={`git clone https://github.com/kakomimasu/viewer-server.git
cd viewer-server
docker-compose build`}
            />
          </p>
        </SubSection>
        <SubSection title="3. 起動">
          作成したコンテナを実行します。
          <p>
            <KkmmCodeBlock language="bash" text={`docker-compose up`} />
          </p>
          docker-composeの詳しい使用方法は公式のドキュメントなどをご覧ください。
        </SubSection>
        <SubSection title="4. ビューア起動の確認">
          http://localhost:3000 に接続し、ビューア(
          <Link href="https://kakomimasu.com" noLinkStyle>
            kakomimasu.com
          </Link>
          と同じ画面)が表示されれば起動成功です。
          <br />
          <Link href="#client-connect" noLinkStyle>
            クライアントの接続
          </Link>
          へ進んでください。
        </SubSection>
      </Section>
      <Section title="クライアントの接続" id="client-connect">
        起動したローカルサーバにクライアントを接続してAI対戦をしてみましょう。
        <br />
        Deno版クライアント「
        <Link href="https://github.com/kakomimasu/client-deno" noLinkStyle>
          client-deno
        </Link>
        」を使用します。
        <br />
        <SubSection title="1. client-denoをダウンロード">
          <p>
            <KkmmCodeBlock
              language="bash"
              text={`git clone https://github.com/kakomimasu/client-deno.git
cd client-deno`}
            />
          </p>
        </SubSection>
        <SubSection title="2. client_a1.jsとAI-5を対戦">
          <p>
            <KkmmCodeBlock
              language="bash"
              text={`deno run -A .\client_a1.js --useAi a5 --local --OnlyAi`}
            />
          </p>
        </SubSection>
        <SubSection title="3. 対戦の様子を観察">
          http://localhost:3000/game/detail
          に接続すると対戦の様子をリアルタイムで見ることが出来ます。
        </SubSection>
        ※ client_ax.jsに渡す引数については
        <Link href="https://github.com/kakomimasu/client-deno" noLinkStyle>
          kakomimasu/client-deno - Github
        </Link>
        をご覧ください。
      </Section>
      <Section title="自作AIの開発">
        <Link href="#client-connect" noLinkStyle>
          クライアントの接続
        </Link>
        にてclient_a1とAI-5を対戦させた場合、たいていは自分(client_a1)が負けていると思います。
        <br />
        まずはこのAI-5に勝つことを目標として自作AIを開発してみましょう。
        <br />
        以下のサイトでクライアントの作成方法を紹介しています。参考にしてみてください。
        <p>
          <Link href="https://hackmd.io/k_ZAf7HPTcG66DlUWxeIMA" noLinkStyle>
            ゲーム参加方法
          </Link>
        </p>
        また、以下のクライアントやAPIドキュメントも公開していますのでぜひ活用ください。
        <ul>
          <li>
            <Link href="https://github.com/kakomimasu/client-cpp" noLinkStyle>
              client-cpp
            </Link>
            ：C++用クライアント
          </li>
          <li>
            <Link href="https://github.com/kakomimasu/client-js" noLinkStyle>
              client-js
            </Link>
            ：Browser、Node.js、Deno用クライアント（client-denoはAI作成に便利なクラスを実装していますのでDenoを用いる際にはclient-denoをお使いください。）
          </li>
          <li>
            <Link
              href="https://github.com/kakomimasu/client-deno-template"
              noLinkStyle
            >
              client-deno-template
            </Link>
            ：client-denoを用いた開発テンプレート
          </li>
          <li>
            <Link href="/docs/apiv1" noLinkStyle>
              APIドキュメント
            </Link>
          </li>
        </ul>
      </Section>
    </Content>
  );
}
