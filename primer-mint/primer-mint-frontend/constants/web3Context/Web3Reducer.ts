import { Web3State } from '.';
import {ethers} from "ethers"


type Web3ActionType = 
   | { type: '[Web3] - Connect', payload: string } 
   | { type: "[Web3] - instance provider", payload: ethers.providers.Web3Provider}
   | { type: "[Web3] - Disconnect"}
   | { type: "[Web3] - Wallet change", payload: string }
   | { type: "[Web3] - Set chainId", payload: string }

export const web3Reducer = ( state: Web3State, action: Web3ActionType ): Web3State => {
   switch (action.type) {
      case '[Web3] - Connect':
         return {
            ...state,
            address: action.payload
          }       
      case "[Web3] - instance provider":
         return {
            ...state,
            web3: action.payload
         }
      case "[Web3] - Disconnect":
         return {
            ...state,
            address: "",
            web3: null
         }
      case "[Web3] - Wallet change": 
         return {
            ...state,
            address: action.payload
         }
      case "[Web3] - Set chainId":
         return {
            ...state,
            chainId: action.payload
         };
      default:
         return state;
   }
}