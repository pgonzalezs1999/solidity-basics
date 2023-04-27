import { supportedChains } from '@/constants/supportedChains';
import { ethers } from 'ethers';
import { create } from 'zustand';

interface Iweb3State {
    address: string;
    addressBalance: number;
    chainId: number;
    isConnected: boolean;
    errorMessage: string,
    provider?: ethers.providers.Web3Provider;
    
    setProvider: () => void;
    disconnectWallet: () => void;  
    connectWallet: () => Promise<void>;  
    changeChain: (chainId: number) => void;
    changeAddress: (address: string) => void;
}

export const useWeb3Store = create<Iweb3State>((set) => ({
  address: "",
  addressBalance: 0,
  chainId: 0,
  isConnected: false,
  provider: undefined,
  errorMessage: "",

  setProvider: () => {
    if(!window.ethereum) {
      return set ({
        errorMessage: "You need to install metamask",
      });
    }
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    set({
        provider: _provider,
        errorMessage: ""
    });
  },
  async connectWallet() {
    if(!window.ethereum) {
      return set({
        errorMessage: "Necesitas instalar metamask",
      });      
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts: string = await provider.send("eth_requestAccounts", []);
    const chainId = (await provider.getNetwork()).chainId;
    const newBalance: number = Number(ethers.utils.formatEther(await provider.getBalance(accounts[0])));
    set({
      isConnected: true,
      address: accounts[0],
      addressBalance: Number(newBalance.toFixed(5)),
      provider: provider,
      chainId: (await provider.getNetwork()).chainId,
      errorMessage: ""
    });
    if(!checkChain(chainId)) {
      return set({
        errorMessage: "Cadena no soportada",
        chainId: chainId
      });
    }
  },  
  disconnectWallet() {
    set({
      address: "",
      addressBalance: 0,
      chainId: 0,
      isConnected: false,
      errorMessage: "Necesitas conectar tu wallet",
    });
  },
  async changeAddress(address) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    set({
      address: address,
    });
    const accounts: string = await provider.send("eth_requestAccounts", []);
    const newBalance: number = Number(ethers.utils.formatEther(await provider.getBalance(accounts[0])));
    set({
      addressBalance: newBalance,
    });
  },
  changeChain(newChainId) {
    if(!checkChain(newChainId)) {
      return set({
        errorMessage: "Cadena no soportada",
        chainId: newChainId
      });
    }
    set({
        errorMessage: "",
        chainId: newChainId
    });
  },
}));

const checkChain = (chainId: number): boolean => {
    return supportedChains.includes(chainId);
}