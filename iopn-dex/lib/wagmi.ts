import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import {
  iopnTestnet,
} from "./chains";


export const Config = getDefaultConfig({

  appName: "IOPn DEX",

  projectId:
    "2f556cee5880c8a19600fcfc8238056d",

  chains: [
    iopnTestnet,
  ],

  ssr: true,

});