import { useWeb3Store } from '@/stores/web3Store';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {

  const { connectWallet, changeAddress, changeChain, setProvider } = useWeb3Store();
  
  useEffect(() => {
    setProvider();
    connectWallet();
    if(!window.ethereum) {
      return;
    }
    window.ethereum.on("accountsChanged", (acc: string[]) => {
      changeAddress(acc[0]);
    });
    window.ethereum.on("chainChanged", (newChain: number) => {
      changeChain(Number(newChain));
    });
  }, []);
  return <Component {...pageProps} />
}