import React from 'react';
import { useWeb3Store } from '@/stores/web3Store';

const Error = () => {

  const errorMessage = useWeb3Store((state) => state.errorMessage);

  if(errorMessage == "") {
      return(<></>);
  }
  return (
    <div className="bg-red-700 p-5 text-center m-32 py-20 rounded">
      <p className="text-white text-xl">{errorMessage}</p>
    </div>
  )
}

export default Error
