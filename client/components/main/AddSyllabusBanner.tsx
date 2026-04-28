"use client"

export default function AddSyllabusBanner() {
    return(
        <div className="md:absolute mb-5 md:mb-0 -top-2 right-0 z-50 bg-yellow-50 flex items-center gap-2 text-sm px-3 py-2 w-fit rounded-md">
          <div className="h-2 w-2 bg-yellow-300 animate-pulse rounded-full"></div>
          <p className="text-black">Add your syllabus in profile for personalized tests</p>
        </div>
    );
}