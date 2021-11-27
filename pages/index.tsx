import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ChatIcon from "@mui/icons-material/Chat";

import Section, { SubSection } from "../components/section";

const Main = styled("main")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "& a": {
    color: "#5C4C40",
  },
  "section>h3+div": { marginLeft: "1em" },
});
const Logo = styled("div")({ width: "60vw", maxWidth: 546, margin: "2em" });

export default function Index() {
  return (
    <Main>
      <Head>
        <title>囲みマス</title>
      </Head>
      <Logo id="title">
        <Image
          alt="logo"
          src="/img/kakomimasu-logo.svg"
          width={546}
          height={195}
        />
      </Logo>

      <Section title="Webコンテンツ">
        オンラインで対戦中のゲームをリアルタイムで見ることができます。
        <br />
        <SubSection title="ゲーム">
          <div>
            <Link href="/game">ゲーム一覧はこちらから</Link>
            <br />
            <Link href="/game/detail">最新のゲームビューアはこちらから</Link>
            <br />
            <a href="/vr/latest.html">最新のゲームビューア(VR版)はこちらから</a>
            <br />
            <Link href="/game/create">カスタムゲーム作成はこちらから</Link>
          </div>
        </SubSection>
        <SubSection title="大会">
          <div>
            <Link href="/tournament">大会一覧はこちらから</Link>
            <br />
            <Link href="/tournament/create">大会作成はこちらから</Link>
            <br />
          </div>
        </SubSection>
      </Section>

      <Section title="囲みマスとは">
        囲みマスは、第31回高専プロコン競技部門で開催される予定だった「雪降る大地
        ミんなで クるっと
        囲みマス」をいつでも誰でも対戦できるように。という思いから立ち上がったプロジェクトです。
        <br />
        対戦に必要なサーバ、クライアント、ビューアを製作・提供しています。
        <SubSection title="概要・特徴">
          <ul>
            <li>
              囲碁と将棋とリアルタイムストラテジーゲームが混ざったような陣取りゲーム
            </li>
            <li>
              フィールドは、点数がついたマス目、辿ったり囲んだりして自分の陣地を広げ、点数が高いほうが勝ち！
            </li>
            <li>
              ルールは中止になった
              <a href="https://www.procon.gr.jp/?page_id=76771">#procon31</a>
              のものがベース（実際のルールは<Link href="/rule">こちら</Link>
              をご覧ください。）
            </li>
            <li>
              誰でも開発に参加できる、オープンソース (
              <a href="https://github.com/kakomimasu">src on GitHub</a>
              )。
            </li>
          </ul>
        </SubSection>
        <SubSection title="ルール">
          第31回高専プロコンのルールをベースに公式ルールを作成しました。第30回高専プロコンのルールとは少し異なっていますので、元競技部門参加者の方はご注意ください。
          <p>
            <Link href="/rule">公式ルール - 囲みマス</Link>
          </p>
        </SubSection>
        <SubSection title="クライアント">
          公式で用意しているクライアントライブラリは、以下の言語、ランタイムです。
          <ul>
            <li>
              JavaScript(TypeScript) -{" "}
              <a href="https://github.com/kakomimasu/client-js">client-js</a>
            </li>

            <li>
              Deno -{" "}
              <a href="https://github.com/kakomimasu/client-deno">
                client-deno
              </a>
            </li>
            <li>
              c++ -{" "}
              <a href="https://github.com/kakomimasu/client-cpp">client-cpp</a>
            </li>
          </ul>
          またAPIドキュメントを公開していますので異なる言語でもゲームへの参加が可能です。
        </SubSection>
        <SubSection title="APIドキュメント">
          <a href="https://github.com/kakomimasu/server/blob/main/v1/docs/index.md">
            Github上のドキュメント
          </a>
          をご覧ください。（今後サイト内でも閲覧できるように移行する予定です。）
        </SubSection>
      </Section>

      <Section title="Discord" id="discord">
        囲みマス公式のDiscordサーバを用意しています。
        <br />
        大会に関するアナウンスや、質問・提案等を受け付けます。是非ご参加ください！
        <br />
        <Button
          href="https://discord.gg/283ZvKPcUD"
          style={{
            backgroundColor: "#5865F2",
            color: "white",
            margin: "10px",
          }}
          startIcon={<ChatIcon />}
        >
          サーバ参加はこちら！
        </Button>
      </Section>

      {/*<Section title="人対AI!?">
        同時に動かせるエージェントの人数は最大14コマ。1ターンは最短3秒。人の判断では間に合わない？
        <br />
        そんな時はプログラミングしたAIにサポートしてもらいましょう！
      </Section>

      <Section title="ランクシステム">
        AIを登録しておけば、勝手にリーグ戦が組まれてランキング登録されます。
        <br />
        囲みマス世界ランク一位には豪華賞品があるかも！？
        </Section>*/}

      <Section title="勝手にプロコン実行委員会">
        中止になった第31回高専プロコン競技部門を勝手にやっちゃおうと立ち上がった、
        <a href="https://codeforkosen.github.io/">Code for KOSEN</a>{" "}
        の部門のひとつ。
      </Section>
      <Section title="開発者用ツール">
        <Link href="/dev/field-editor">フィールド説明用エディタ</Link>
        <br />
      </Section>
    </Main>
  );
}
