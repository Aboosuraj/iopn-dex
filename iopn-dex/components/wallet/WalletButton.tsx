"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";


export default function WalletButton(){


const {
  address,
  isConnected
}=useAccount();


const {
 connect,
 connectors
}=useConnect();


const {
 disconnect
}=useDisconnect();




function handleClick(){


if(isConnected){

disconnect();

return;

}


connect({
 connector: connectors[0]
});


}





return (

<button

onClick={handleClick}

className="rounded-2xl bg-green-400 px-4 py-2 text-sm font-bold text-black transition hover:scale-105"

>


{
isConnected

?

`${address?.slice(0,6)}...${address?.slice(-4)}`

:

"Connect"

}


</button>


);


}