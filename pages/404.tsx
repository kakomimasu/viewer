import React from "react";
import Link from "next/link";

import Content from "../components/content";

export default function Page() {
  return (
    <Content title="404 NotFound">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>このページは存在しません</div>
        <Link href="/">囲みマス トップページへ</Link>
      </div>
    </Content>
  );
}
