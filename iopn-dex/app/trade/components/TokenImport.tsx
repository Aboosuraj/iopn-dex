"use client";

import { useState } from "react";

type Token = {
  symbol: string;
  address: string;
  decimals: number;
  native: boolean;
};


type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (token: Token) => void;
};


export default function TokenImport({
  open,
  onClose,
  onImport,

}: Props) {


  const [address, setAddress] = useState("");

  const [error, setError] = useState("");



  if (!open) return null;




  function handleImport() {


    setError("");



    if (!address) {

      setError("Enter token address");

      return;

    }



    if (!address.startsWith("0x") || address.length !== 42) {

      setError("Invalid token address");

      return;

    }




    const token: Token = {

      symbol: "CUSTOM",

      address,

      decimals: 18,

      native: false,

    };



    onImport(token);



    setAddress("");

    onClose();


  }





  return (

    <div className="
      fixed
      inset-0
      z-[999]
      flex
      items-center
      justify-center
      bg-black/70
      px-4
    ">



      <div className="
        w-full
        max-w-md
        rounded-3xl
        border
        border-white/10
        bg-zinc-900
        p-6
        text-white
        shadow-2xl
      ">



        <h2 className="
          mb-5
          text-2xl
          font-bold
        ">
          Import Token
        </h2>





        <input

          value={address}

          onChange={(e)=>{

            setAddress(e.target.value);

            setError("");

          }}

          placeholder="0x token contract address"

          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/10
            p-4
            text-white
            outline-none
          "

        />





        {error && (

          <p className="
            mt-3
            text-sm
            text-red-400
          ">

            {error}

          </p>

        )}







        <button

          type="button"

          onClick={handleImport}

          className="
            mt-5
            w-full
            rounded-2xl
            bg-green-400
            py-3
            font-bold
            text-black
          "

        >

          Import Token

        </button>







        <button

          type="button"

          onClick={onClose}

          className="
            mt-3
            w-full
            rounded-2xl
            border
            border-white/20
            py-3
            text-white
          "

        >

          Cancel

        </button>



      </div>


    </div>

  );


}