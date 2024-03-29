import React from "react";
import Head from "next/head";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ChatIcon from "@mui/icons-material/Chat";

import Link from "../src/link";
import Section, { SubSection } from "../components/section";

const Main = styled("div")({
  width: "90%",
  maxWidth: "1000px",
  padding: "3em 0",
  margin: "0 auto",
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
            <Link href="/game" color="inherit">
              ゲーム閲覧 はこちらから
            </Link>
            <br />
            <Link href="/game/playground" color="inherit">
              Playground
            </Link>
            <br />
            <a href="/vr/index.html" color="inherit">
              最新のゲームビューア(VR版) はこちらから
            </a>
            <br />
            <Link href="/game/create" color="inherit">
              カスタムゲーム作成 はこちらから
            </Link>
            <br />
            <Link href="/game/manual" color="inherit">
              人力対戦 はこちらから
            </Link>
          </div>
        </SubSection>
        <SubSection title="大会">
          <div>
            <Link href="/tournament" color="inherit">
              大会一覧はこちらから
            </Link>
            <br />
            <Link href="/tournament/create" color="inherit">
              大会作成はこちらから
            </Link>
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
              <Link
                href="https://www.procon.gr.jp/?page_id=76771"
                color="inherit"
              >
                #procon31
              </Link>
              のものがベース（実際のルールは
              <Link href="/rule" color="inherit">
                こちら
              </Link>
              をご覧ください。）
            </li>
            <li>
              誰でも開発に参加できる、オープンソース (
              <Link href="https://github.com/kakomimasu" color="inherit">
                src on GitHub
              </Link>
              )。
            </li>
          </ul>
        </SubSection>
        <SubSection title="ルール">
          第31回高専プロコンのルールをベースに公式ルールを作成しました。第30回高専プロコンのルールとは少し異なっていますので、元競技部門参加者の方はご注意ください。
          <p>
            <Link href="/rule" color="inherit">
              公式ルール - 囲みマス
            </Link>
          </p>
        </SubSection>
        <SubSection title="クライアント">
          公式で用意しているクライアントライブラリは、以下の言語、ランタイムです。
          <ul>
            <li>
              JavaScript(TypeScript) -{" "}
              <Link
                href="https://github.com/kakomimasu/client-js"
                color="inherit"
              >
                client-js
              </Link>
            </li>

            <li>
              Deno -{" "}
              <Link
                href="https://github.com/kakomimasu/client-deno"
                color="inherit"
              >
                client-deno
              </Link>
            </li>
            <li>
              c++ -{" "}
              <Link
                href="https://github.com/kakomimasu/client-cpp"
                color="inherit"
              >
                client-cpp
              </Link>
            </li>
          </ul>
          またAPIドキュメントを公開していますので異なる言語でもゲームへの参加が可能です。
        </SubSection>
        <SubSection title="APIドキュメント">
          現在APIの最新バージョンはv1です。また、procon30(都城),procon31(苫小牧)互換APIもあります。以下のリンクからご覧ください。
          <ul>
            <li>
              <Link href="/docs/api/v1">API v1</Link>
            </li>
            <li>
              <Link href="/docs/api/miyakonojo">API miyakonojo</Link>
            </li>
            <li>
              <Link href="/docs/api/tomakomai">API tomakomai</Link>
            </li>
          </ul>
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
        <Link href="https://codeforkosen.github.io/" color="inherit">
          Code for KOSEN
        </Link>{" "}
        の部門のひとつ。
      </Section>
      <Section title="開発者用ツール">
        <Link href="/dev/field-editor" color="inherit">
          フィールド説明用エディタ
        </Link>
        <br />
      </Section>
    </Main>
  );
}
