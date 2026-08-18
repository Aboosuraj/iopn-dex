"use client";

import { useEffect, useState } from "react";
import { Settings2, X, Check, ShieldCheck } from "lucide-react";

type Props = {
open: boolean;
onClose: () => void;
slippage: number;
setSlippage: (value: number) => void;
};

const PRESETS = [0.1, 0.5, 1];

export default function SlippageModal({
open,
onClose,
slippage,
setSlippage,
}: Props) {
const [custom, setCustom] = useState("");

useEffect(() => {
if (open) {
setCustom("");
}
}, [open]);

if (!open) {
return null;
}

function selectPreset(value: number) {
setSlippage(value);
onClose();
}

function saveCustom() {
const value = Number(custom);

if (!Number.isFinite(value) || value <= 0) {  
  return;  
}  

setSlippage(value);  
onClose();

}

const customValue = Number(custom);

const isCustomValid =
custom.length > 0 &&
Number.isFinite(customValue) &&
customValue > 0;

return (
<div
className="
fixed
inset-0
z-[110]
flex
items-end
justify-center
bg-black/70
px-0
backdrop-blur-md
sm:items-center
sm:px-4
"
onMouseDown={(event) => {
if (event.target === event.currentTarget) {
onClose();
}
}}
>
<div  
className="  
w-full  
max-w-md  
rounded-t-[2rem]  
border  
border-white/10  
bg-[#080d1d]  
p-6  
text-white  
shadow-[0_0_70px_rgba(6,182,212,0.12)]  
sm:rounded-[2rem]  
"  
>

{/* HEADER */}  

    <div className="mb-6 flex items-center justify-between">  

      <div className="flex items-center gap-3">  

        <div  
          className="  
            flex  
            h-11  
            w-11  
            items-center  
            justify-center  
            rounded-2xl  
            bg-cyan-500/10  
            text-cyan-400  
          "  
        >  
          <Settings2 size={21} />  
        </div>  

        <div>  

          <h2 className="text-xl font-black">  
            Slippage Tolerance  
          </h2>  

          <p className="mt-1 text-xs text-white/40">  
            Set the maximum price movement  
          </p>  

        </div>  

      </div>  

      <button  
        type="button"  
        onClick={onClose}  
        aria-label="Close slippage settings"  
        className="  
          flex  
          h-10  
          w-10  
          items-center  
          justify-center  
          rounded-full  
          border  
          border-white/10  
          bg-white/[0.04]  
          text-white/50  
          transition  
          hover:border-cyan-400/30  
          hover:bg-cyan-400/10  
          hover:text-cyan-400  
        "  
      >  
        <X size={18} />  
      </button>  

    </div>  


    {/* CURRENT SLIPPAGE */}  

    <div  
      className="  
        mb-5  
        flex  
        items-center  
        justify-between  
        rounded-2xl  
        border  
        border-cyan-400/10  
        bg-cyan-400/[0.05]  
        px-4  
        py-3  
      "  
    >  

      <span className="text-sm text-white/50">  
        Current slippage  
      </span>  

      <span className="font-black text-cyan-400">  
        {slippage}%  
      </span>  

    </div>  


    {/* PRESETS */}  

    <div>  

      <p className="mb-3 text-sm font-semibold text-white/60">  
        Quick settings  
      </p>  

      <div className="grid grid-cols-3 gap-3">  

        {PRESETS.map((value) => {  

          const active = slippage === value;  

          return (  
            <button  
              key={value}  
              type="button"  
              onClick={() => selectPreset(value)}  
              className={`  
                relative  
                rounded-2xl  
                border  
                py-4  
                font-black  
                transition  
                ${  
                  active  
                    ? "border-cyan-400/60 bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.18)]"  
                    : "border-white/10 bg-white/[0.04] text-white hover:border-cyan-400/30 hover:bg-cyan-400/10"  
                }  
              `}  
            >  

              {active && (  
                <Check  
                  size={14}  
                  className="  
                    absolute  
                    right-2  
                    top-2  
                  "  
                />  
              )}  

              {value}%  

            </button>  
          );  
        })}  

      </div>  

    </div>  


    {/* CUSTOM */}  

    <div className="mt-6">  

      <label  
        htmlFor="custom-slippage"  
        className="  
          mb-3  
          block  
          text-sm  
          font-semibold  
          text-white/60  
        "  
      >  
        Custom slippage  
      </label>  

      <div className="relative">  

        <input  
          id="custom-slippage"  
          type="number"  
          min="0"  
          step="0.1"  
          placeholder="0.5"  
          value={custom}  
          onChange={(event) =>  
            setCustom(event.target.value)  
          }  
          className="  
            w-full  
            rounded-2xl  
            border  
            border-white/10  
            bg-white/[0.04]  
            px-4  
            py-4  
            pr-12  
            text-lg  
            font-bold  
            text-white  
            outline-none  
            placeholder:text-white/25  
            transition  
            focus:border-cyan-400/50  
            focus:bg-white/[0.06]  
          "  
        />  

        <span  
          className="  
            absolute  
            right-4  
            top-1/2  
            -translate-y-1/2  
            font-bold  
            text-white/30  
          "  
        >  
          %  
        </span>  

      </div>  

    </div>  


    {/* WARNING / INFO */}  

    <div  
      className="  
        mt-5  
        flex  
        gap-3  
        rounded-2xl  
        border  
        border-amber-400/10  
        bg-amber-400/[0.04]  
        p-4  
      "  
    >  

      <ShieldCheck  
        size={19}  
        className="  
          mt-0.5  
          shrink-0  
          text-amber-400  
        "  
      />  

      <p className="text-xs leading-5 text-white/45">  
        Higher slippage increases the chance of your  
        transaction completing, but may result in a  
        worse execution price.  
      </p>  

    </div>  


    {/* SAVE */}  

    <button  
      type="button"  
      onClick={saveCustom}  
      disabled={!isCustomValid}  
      className="  
        mt-6  
        w-full  
        rounded-2xl  
        bg-cyan-400  
        py-4  
        font-black  
        text-black  
        transition  
        hover:bg-cyan-300  
        disabled:cursor-not-allowed  
        disabled:opacity-40  
      "  
    >  
      Apply Slippage  
    </button>  

  </div>  
</div>

);
}