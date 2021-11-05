import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { styled } from "@mui/material/styles";

import Section, { SubSection } from "../components/section";

const Main = styled("main")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "& a": {
    color: "#5C4C40",
  },
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
        囲碁と将棋とリアルタイムストラテジーゲームが混ざったような陣取りゲームです。
        <br />
        フィールドは、点数がついたマス目、辿ったり囲んだりして自分の陣地を広げ、点数が高いほうが勝ち！
        <br />
        誰でも開発に参加できる、オープンソース (
        <a href="https://github.com/codeforkosen/Kakomimasu">src on GitHub</a>
        )。
      </Section>

      <Section title="人対AI!?">
        同時に動かせるエージェントの人数は最大14コマ。1ターンは最短3秒。人の判断では間に合わない？
        <br />
        そんな時はプログラミングしたAIにサポートしてもらいましょう！
      </Section>

      <Section title="ランクシステム">
        AIを登録しておけば、勝手にリーグ戦が組まれてランキング登録されます。
        <br />
        囲みマス世界ランク一位には豪華賞品があるかも！？
      </Section>

      <Section title="勝手にプロコン実行委員会">
        中止になった第31回高専プロコン競技部門を勝手にやっちゃおうと立ち上がった、Code
        for KOSEN の部門のひとつ。
      </Section>
      <Section title="開発者用ツール">
        <Link href="/dev/field-editor">フィールド説明用エディタ</Link>
        <br />
      </Section>
    </Main>
  );
}
