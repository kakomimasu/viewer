import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'

import Header from "../components/header"
import Footer from "../components/footer"

function MyApp({ Component, pageProps }: AppProps) {
  return (<div>
    <Head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
    <link rel="icon" type="image/png" href="/img/kakomimasu-icon.png" />
    <link rel="apple-touch-icon" href="/img/kakomimasu-icon.png" />

    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />

    <title>囲みマス</title>

    </Head>
    {/*<Header />*/}
    <Component {...pageProps} />
  <Footer />
  </div>)
}
export default MyApp
