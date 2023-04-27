import { createContext } from 'react';
import ethers from "ethers"

interface ContextProps {
    address: string;
    chainId: string; 
    pending: boolean; 
    web3: ethers.providers.Web3Provider | null;

    //Methods
    connectWallet: () => Promise<void>;  
    disconnect: () => void;  
}

export const Web3Context = createContext({} as ContextProps );