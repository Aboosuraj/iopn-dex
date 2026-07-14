"use client";

import { useAccount, usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import {
  parseAbiItem,
  formatUnits,
  erc20Abi,
} from "viem";


export type WalletToken = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  balance: string;
};


export function useWalletTokens() {

  const { address } = useAccount();

  const publicClient = usePublicClient();


  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);

  const [loading,setLoading] = useState(false);



  useEffect(()=>{


    async function scanTokens(){

      if(!address || !publicClient)
        return;


      try {

        setLoading(true);



        const logs = await publicClient.getLogs({

          event: parseAbiItem(
            "event Transfer(address indexed from,address indexed to,uint256 value)"
          ),

          args:{
            to: address,
          },

          fromBlock: "earliest",

          toBlock: "latest",

        });



        const tokenAddresses = [
          ...new Set(
            logs.map(
              (log)=>log.address
            )
          )
        ];



        const results:WalletToken[]=[];



        for(const tokenAddress of tokenAddresses){


          try{


            const [
              symbol,
              decimals,
              balance
            ] = await Promise.all([


              publicClient.readContract({

                address:tokenAddress,

                abi:erc20Abi,

                functionName:"symbol",

              }),



              publicClient.readContract({

                address:tokenAddress,

                abi:erc20Abi,

                functionName:"decimals",

              }),



              publicClient.readContract({

                address:tokenAddress,

                abi:erc20Abi,

                functionName:"balanceOf",

                args:[
                  address
                ],

              })

            ]);



            if(balance > 0n){

              results.push({

                address:tokenAddress,

                symbol,

                decimals,

                balance:
                  formatUnits(
                    balance,
                    decimals
                  ),

              });

            }


          }catch(error){

            console.log(
              "Token scan failed:",
              tokenAddress
            );

          }

        }



        setWalletTokens(results);



      }catch(error){

        console.log(
          "Wallet token scanner error:",
          error
        );

      }

      finally{

        setLoading(false);

      }


    }


    scanTokens();


  },[
    address,
    publicClient
  ]);



  return {

    walletTokens,

    loading,

  };

}