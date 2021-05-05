import { RecoilRoot } from 'recoil';
import { AppProps } from 'next/app';
import '../styles/globals.scss';

import firebase from '../firebase/app';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <RecoilRoot>
      <Component {...pageProps} firebase={firebase} />
    </RecoilRoot>
  );
};

export default MyApp;
