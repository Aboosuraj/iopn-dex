import { ButtonHTMLAttributes } from "react";

export default function PrimaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={`
        w-full
        rounded-2xl
        bg-cyan-500
        py-4
        font-bold
        text-black
        transition
        hover:bg-cyan-400
        disabled:opacity-50
        ${props.className ?? ""}
      `}
    />
  );
}