"use client";

import { useAccount, usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { TOKENS } from "@/lib/tokens";
import { ERC20_ABI } from "@/lib/erc20";


export type WalletToken = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  balance: string;
};


export function useWalletTokens() {

  const { address } = useAccount();

  const publicClient = usePublicClient();


  const [walletTokens,setWalletTokens] =
    useState<WalletToken[]>([]);


  const [loading,setLoading] =
    useState(false);



  useEffect(()=>{


    async function loadTokens(){


      if(!address || !publicClient){

        setWalletTokens([]);

        return;

      }


      try{

        setLoading(true);



        const results:WalletToken[] = [];



        for(const token of TOKENS){


          try{


            // Native OPN

            if(token.native){


              const balance =
                await publicClient.getBalance({
                  address,
                });



              if(balance > 0n){


                results.push({

                  address:token.address,

                  symbol:token.symbol,

                  decimals:token.decimals,

                  balance:
                    formatUnits(
                      balance,
                      token.decimals
                    ),

                });


              }


              continue;

            }





            // ERC20 tokens

            const balance =
              await publicClient.readContract({

                address:
                  token.address,

                abi:
                  ERC20_ABI,

                functionName:
                  "balanceOf",

                args:[
                  address
                ],

              });



            if(balance > 0n){


              results.push({

                address:
                  token.address,

                symbol:
                  token.symbol,

                decimals:
                  token.decimals,

                balance:
                  formatUnits(
                    balance,
                    token.decimals
                  ),

              });


            }



          }catch(error){

            console.log(
              "Token balance error:",
              token.symbol,
              error
            );

          }


        }



        setWalletTokens(results);



      }catch(error){

        console.log(
          "Portfolio token loading error:",
          error
        );


      }finally{

        setLoading(false);

      }


    }



    loadTokens();



  },[
    address,
    publicClient
  ]);



  return {

    walletTokens,

    loading,

  };


}