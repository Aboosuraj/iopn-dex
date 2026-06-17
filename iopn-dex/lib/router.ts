export const ROUTER_ADDRESS =
  "0x05795eB171D8A5040EE0499C5A66CE1Eae6DFe5A";

  export const FACTORY_ADDRESS =
    "0x266174ba738E757AA82398E7b0dd3D7840ed6232";

    export const routerAbi = [
      {
          name: "getAmountsOut",
              type: "function",
                  stateMutability: "view",
                      inputs: [
                            { name: "amountIn", type: "uint256" },
                                  { name: "path", type: "address[]" }
                                      ],
                                          outputs: [
                                                { name: "amounts", type: "uint256[]" }
                                                    ]
                                                      }
                                                      ] as const;