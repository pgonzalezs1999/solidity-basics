import { mrPabloContract } from "@/constants/contracts";
import { useWeb3Store } from "@/stores/web3Store";
import { ethers } from "ethers";
import { useEffect, useState, ChangeEvent } from "react";

declare global {
    interface Window { ethereum: any }
}

const Mint = () => {
    
    const PRICE_PER_NFT = 0.1;
    const {  
        address,
        addressBalance,
        chainId,
        isConnected,
        errorMessage,
        provider,
      } = useWeb3Store();

    const [cantidad, setCantidad] = useState<number>(1);
    const [supply, setSupply] = useState<number>(0);
    const [ids, setIds] = useState<number[]>([]);
    const [urls, setUrls] = useState<string[]>([]);
    const [contract, setContract] = useState<ethers.Contract>();
    const [userIsOwner, setUserIsOwner] = useState<boolean>(false);
    const [userIsAdmin, setUserIsAdmin] = useState<boolean>(false);
    const [userIsWhitelisted, setUserIsWhitelisted] = useState<boolean>(false);
    const [textoOwner, setTextoOwner] = useState<string>("");
    const [textoAdmin, setTextoAdmin] = useState<string>("");
    const [contractIsPaused, setContractIsPaused] = useState<boolean>(false);
    const [userBalance, setUserBalance] = useState<number>(0);

    async function selectLess() {
        if(cantidad > 1) {
            setCantidad(cantidad - 1);
            await fillIds();
        }
    };
    
    async function selectMore() {
        if(cantidad < 5) {
            setCantidad(cantidad + 1);
            await fillIds();
        }
    };
    
    async function fillIds() {
        let auxIds: number[] = [];
        for(let i = 1; i <= cantidad; i++) {
            auxIds.push(supply + i);
        }
        setIds(auxIds);
        const newUrls: string[] = [];
        for(const id of ids) {
            const response = await fetch(`https://apinft.racksmafia.com/api/${id}.json`);
            const data = await response.json();
            newUrls.push(data.image);
        }
        setUrls(newUrls);
    }

    async function getContractIsPaused() {
        if(!contract) {
            return;
        }
        try {
            setContractIsPaused(await contract.isPaused());
        } catch(error) {
            console.log("Error en el try de getContractIsPaused():", error)
        }
    }

    async function pausarContrato() {
        if(!contract) {
            return console.log("PabloError: Contract not found on pausarContrato()");
        }
        try {
            await contract.togglePause();
        } catch(error) {
            console.log("Error en el try de pausarContrato():", error)
        }
    }

    async function retirarFondos() {
        if(!contract) {
            return console.log("PabloError: Contract not found on retirarFondos()");
        }
        try {
            await contract.withdraw();
        } catch(error) {
            console.log("Error en el try de retirarFondos():", error)
        }
    }

    async function nuevoAdmin() {
        if(!contract) {
            return console.log("PabloError: Contract not found on nuevoAdmin()");
        }
        try {
            await contract.addAdmin(textoOwner);
            setTextoAdmin("");
            setTextoOwner("");
        } catch(error) {
            console.log("Error en el try de nuevoAdmin():", error)
        }
    }

    async function quitarAdmin() {
        if(!contract) {
            return console.log("PabloError: Contract not found on quitarAdmin()");
        }
        try {
            await contract.removeAdmin(textoOwner);
            setTextoAdmin("");
            setTextoOwner("");
        } catch(error) {
            console.log("Error en el try de quitarAdmin():", error)
        }
    }

    async function nuevoWhitelist() {
        if(!contract) {
            return console.log("PabloError: Contract not found on nuevoAdmin()");
        }
        try {
            await contract.addToWhitelist(textoAdmin);
            setTextoAdmin("");
            setTextoOwner("");
        } catch(error) {
            console.log("Error en el try de addToWhitelist():", error)
        }
    }

    async function quitarWhitelist() {
        if(!contract) {
            return console.log("PabloError: Contract not found on quitarAdmin()");
        }
        try {
            await contract.removeFromWhitelist(textoAdmin);
            setTextoAdmin("");
            setTextoOwner("");
        } catch(error) {
            console.log("Error en el try de removeFromWhitelist():", error)
        }
    }
    
    async function getUserIsOwner() {
        if(!contract) {
            return console.log("PabloError: Contract not found on getUserIsOwner()");
        }
        try {
            const ownerAddress = await contract.owner();
            setUserIsOwner(ownerAddress.toLowerCase() == address.toLowerCase());
        } catch(error) {
            console.log("Error en el try de getUserIsOwner():", error)
        }
    }

    async function getUserIsAdmin() {
        if(!contract || !isConnected) {
            return;
        }
        try {
            setUserIsAdmin(await contract.isAdmin(address));
        } catch(error) {
            console.log("Error en el try de getUserIsAdmin():", error)
        }
    }

    async function getUserWhitelisted() {
        if(!contract || !isConnected) {
            return;
        }
        try {
            setUserIsWhitelisted(await contract.isWhitelisted(address));
        } catch(error) {
            console.log("Error en el try de getUserWhitelisted():", error)
        }
    }

    async function getSupply() {
        if(!contract) {
            return console.log("PabloError: Contract not found on getSupply()");
        }
        try {
            const newSupply = await contract.supply();
            setSupply(Number(newSupply));
        } catch(error) {
            console.log("Error en el try de getSupply():", error)
        }
    }

    async function mintSelected() {
        if(!contract) {
            return console.log("contract = ", contract);
        }
        let dinero = ethers.utils.parseEther((PRICE_PER_NFT * cantidad).toFixed(1));
        try {
            await contract.mint(cantidad, {value: dinero});
        } catch(e) {
            console.log("Error en el try de mintSelected(): ", e);
        }
    }

    function cambiarTextOwner(event: ChangeEvent<HTMLInputElement>) {
        setTextoOwner(event.target.value);
    }

    function cambiarTextAdmin(event: ChangeEvent<HTMLInputElement>) {
        setTextoAdmin(event.target.value);
    }

    useEffect(() => {
        if(typeof window === "undefined" || !provider) {
            return;
        }
        fillIds();
    }, [cantidad]);

    useEffect(() => {
        if(typeof window === "undefined") {
            return;
        }
        setUserBalance(addressBalance);
    }, [addressBalance]);

    useEffect(() => {
        if(typeof window === "undefined") {
            return;
        }
        setContract(
            new ethers.Contract(
                mrPabloContract.address,
                mrPabloContract.abi,
                provider?.getSigner()
            )
        );
        if(contract != undefined) {
            getSupply();
            getUserIsOwner();
            getUserIsAdmin();
            getUserWhitelisted();
            getContractIsPaused();
            setUserBalance(addressBalance);
            contract.on("pauseEvent", (value: boolean) => {
                setContractIsPaused(value);
            });
            contract.on("mintEvent", async () => {
                await getSupply();
                await fillIds();
            });
        }
    }, [provider, address, chainId, isConnected]);

    useEffect(() => {
        if(typeof window === "undefined") {
            return;
        }
        if(contract?.address) {
            getSupply();
        }
    }, [contract]);
    
    return (
    <>
    {
        errorMessage != ""
        ? <></>
        : <div className="pb-5">
            <section className="m-0-auto flex text-center justify-center">
                <div className="mt-2 ml-5 mr-5 mb-2 bg-gray-900 p-5 rounded-sm border-2 border-gray-100 sm:w-[70%] lg:max-w-[30%]">
                    <h2 className="text-center pb-2 text-2xl">Mintea nuevos Mr Pablos:</h2>
                    <div className="flex flex-wrap justify-center">
                    {
                        ids.map((id, index) => (
                            <div key={index} className="mr-2 ml-2 mt-2">
                                <img src={urls[index]} className="h-20 w-20 mb-1"></img>
                                <p>#{id}</p>
                            </div>
                        ))
                    }
                    </div>
                    <div className="flex items-center justify-between p-1 mt-2">
                        <p>Supply actual:</p>
                        <p>{supply} de 1000</p>
                    </div>
                    <div className="flex items-center justify-between p-1 mt-2">
                        <p>Seleccionar cantidad:</p>
                        <div className="flex items-center justify-center">
                            <button onClick={selectLess} className="text-2xl bg-blue-400 pl-3 pr-3 rounded-sm">-</button>
                            <p className="text-2xl text-black pl-2 pr-2 bg-blue-200">{cantidad}</p>
                            <button onClick={selectMore} className="text-2xl bg-blue-400 pl-3 pr-3 rounded-sm">+</button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-1 mt-2">
                        <p>Precio total:</p>
                        <p>{(PRICE_PER_NFT * cantidad).toFixed(1)} ETH</p>
                    </div>
                    {
                        (userIsWhitelisted === true)
                        ? <div>
                            <hr className="m-5"/>
                            {
                                (contractIsPaused === true)
                                ? <p className="text-red-500">El contrato está pausado, no puedes mintear</p>
                                : <div>
                                    {
                                        (userBalance > (PRICE_PER_NFT * cantidad))
                                        ? <button onClick={mintSelected} className="myButton">Mint</button>
                                        : <p className="text-red-500">No tienes suficiente balance para mintear ( {userBalance.toFixed(4)} / {(cantidad * PRICE_PER_NFT).toFixed(1)} sepETH )</p>
                                    }
                                </div>
                            }
                        </div>
                        : <div>
                            <hr className="m-5"/>
                            <p className="text-red-500">No estás en la whitelist, así que no puedes mintear</p>
                        </div>
                    }
                </div>
            </section>
            <div className="flex flex-col items-center">
                {
                    (userIsWhitelisted === false)
                    ? <></>
                    : <section className="seccionCustom">
                        <p><b>¡ENHORABUENA!</b> Estás en la whitelist, ya puedes mintear</p>
                    </section>
                }
                {  
                    (userIsOwner === true)
                    ? <section className="seccionCustom">
                        <p>Ejecuta las siguientes funciones como owner:</p>
                        <div className="my-3">
                            <div className="mb-3">
                            <input type="text" placeholder="address" value={textoOwner} onChange={cambiarTextOwner}/>
                            <button onClick={nuevoAdmin} className="myButton">Añadir admin</button>
                            <button onClick={quitarAdmin} className="myButton">Eliminar admin</button>
                            </div>
                            <button onClick={pausarContrato} className="myButton">Pausar contrato</button>
                        </div>
                    </section>
                    : <></>
                }
            {
                (userIsOwner === true || userIsAdmin === true)
                ? <section className="seccionCustom">
                    <p>Ejecuta las siguientes funciones como administrador:</p>
                    <div className="mt-3">
                        <input type="text" placeholder="address" value={textoAdmin} onChange={cambiarTextAdmin}/>
                        <button onClick={nuevoWhitelist} className="myButton">Añadir a WL</button>
                        <button onClick={quitarWhitelist} className="myButton">Eliminar de WL</button>
                    </div>
                    <div className="flex justify-center my-3">
                        <button onClick={retirarFondos} className="myButton">Retirar fondos</button>
                        <button /*onClick={}*/ className="myButton">Cambiar URI (no implementada)</button>
                    </div>
                </section>
                : <></>
            }
            </div>
        </div>
    }
    </>
    );
}
export default Mint