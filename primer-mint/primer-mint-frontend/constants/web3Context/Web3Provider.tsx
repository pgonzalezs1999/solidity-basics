import { FC, ReactNode, useContext, useEffect, useReducer } from 'react';
import { Web3Context, web3Reducer } from '.';
import { ethers } from 'ethers';

declare global {
    interface Window { ethereum: any; }
}

export interface Web3State {
    address: string;
    chainId: string;
    pending: boolean; 
    web3: ethers.providers.Web3Provider | null;
}

const WEB3_INITIAL_STATE: Web3State = {
    address: "",
    chainId: "",
    pending: false,    
    web3: null  
}

interface Props {
    children: ReactNode;
}

export const Web3Provider: FC<Props> = ({ children }) => {
 
    const [state, dispatch] = useReducer( web3Reducer , WEB3_INITIAL_STATE );

    const connectWallet = async () => {             
        const {ethereum} = window;
        if(!ethereum) {
            //TODO: Mostrar alerta de que el user necesita metamask            
        }
        try {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const eth = await ethereum.request({ method: "eth_requestAccounts" });
            dispatch({type: "[Web3] - Connect", payload: eth[0]});
            dispatch({type: '[Web3] - instance provider', payload: provider});
            //try to log the user in   
        } catch (error) {
            console.log("error")
        }
    }
    const setChainId = async () => {
        const {ethereum} = window;
        try {
            const _chainId = await ethereum.request({ method: "eth_chainId" });
            dispatch({type: "[Web3] - Set chainId", payload: _chainId});
        } catch(e) {

        }
    }

    const disconnect = () => {
        dispatch({type: "[Web3] - Disconnect"})
    }
    
    useEffect(() => {
        // TODO listen to wallet change and logout if change,
        if(window.ethereum) {
            window.ethereum.on('accountsChanged', function (accounts: string[]) {
                dispatch({type: "[Web3] - Wallet change", payload: accounts[0]});
                // dispatch({type: "[Web3] - Set chainId", payload: Web3State.chainId});
                connectWallet();
                setChainId();
            })
        }         
    }, [])
    
    return (
        <Web3Context.Provider value={{
            ...state,
            //Methods
            connectWallet,
            disconnect       
        }}>
            { children }
        </Web3Context.Provider>
    )
};