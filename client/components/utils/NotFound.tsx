"use client"

import Image from "next/image";

export default function NotFound() {
    return(
        <div className="w-full h-full flex flex-col items-center justify-center">
            <Image src="/NotFound2.png" alt="Not found illustration" width={216} height={216} className="h-54 w-auto" />
            <p className="font-bold opacity-50 text-[1.2rem]">Nothing here!</p>
        </div>
    );
}
