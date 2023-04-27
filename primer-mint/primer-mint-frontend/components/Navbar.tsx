import { useWeb3Store } from "@/stores/web3Store";
import { shortenAddress } from "@/utils/address";

const Navbar = () => {
  const { 
    connectWallet, 
    address: userAddress, 
    provider,
    setProvider,
    chainId,
    errorMessage,
    disconnectWallet
  } = useWeb3Store();
  
  function getChainName(chainId: number): string {
    switch(chainId) {
      case 1:
        return "Eth. mainnet";
      case 3:
        return "Ropsten";
      case 4:
        return "Rinkeby";
      case 5:
        return "Goerli";
      case 42:
        return "Kovan";
      case 56:
        return "Binance SC";
      case 100:
        return "Gnosis";
      case 137:
        return "Polygon";
      case 11155111:
        return "Sepolia";
      default:
        return "Red desconocida";
    }
  }

  return (
    <nav className="flex items-center justify-between p-5">
        <div>
            <img className="w-40" src="mrc-logo.png" alt="logo mr crypto" />
        </div>
        <div>          
          { userAddress !== "" 
            ? <div className="flex">
              <div className="flex flex-col items-end mr-4">
                <p>Conectado <b>{shortenAddress(userAddress)}</b></p>
                <p>en <b>{getChainName(chainId)} </b>(id: {chainId})</p>
              </div>
              <button onClick={disconnectWallet} className="myButton">Desconectar</button>
            </div> 
            : <button onClick={connectWallet}>Conectar wallet</button>
          }          
        </div>
    </nav>
  )
}

export default Navbar