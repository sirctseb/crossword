import { RecoilRoot } from 'recoil';
import { AppProps } from 'next/app';
import Header from '../components/Header';
import '../styles/globals.scss';

import firebase from '../firebase/app';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <RecoilRoot>
      <Header />
      <Component {...pageProps} firebase={firebase} />
    </RecoilRoot>
  );
};

export default MyApp;
