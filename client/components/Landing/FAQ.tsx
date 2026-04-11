"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const [active, setActive] = useState<number | null>(0);

  const faqs = [
    {
      q: "Are these tests actually useful?",
      a: "They show where you waste time, where you guess, and what topics you don’t actually understand.",
    },
    {
      q: "Is this only for competitive exams?",
      a: "No. Placements, semester prep, or any timed practice benefits from structured feedback.",
    },
    {
      q: "How is this different from practice platforms?",
      a: "Practice platforms give questions. This tells you why you keep getting them wrong.",
    },
    {
      q: "Do I need to attempt daily?",
      a: "Consistency helps, but a few serious tests per week are enough.",
    },
    {
      q: "Will this track weak topics automatically?",
      a: "Yes. Accuracy, time spent, and performance trends reveal what you need to fix.",
    },
  ];

  return (
    <section className="py-24 px-5 bg-secondary">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">

        {/* LEFT */}
        <div className="space-y-6">
          <p className="text-sm font-bold text-primary">
            CLEAR DOUBTS FAST
          </p>

          <h2 className="text-3xl md:text-5xl font-extrabold">
            You probably
            <br />
            <span className="text-primary">have questions.</span>
          </h2>

          <p className="text-gray-600">
            Most platforms overcomplicate things. These answers don’t. If something
            matters, it’s explained. If it doesn’t, it’s not here.
          </p>

          <p className="text-gray-600">
            Still confused? Try a test. The platform explains itself better than
            any landing page ever will.
          </p>
        </div>

        {/* RIGHT */}
        <div className="border-t border-black/20">
          {faqs.map((faq, i) => {
            const isOpen = active === i;

            return (
              <div key={i} className="border-b border-black/20">
                
                <div
                  onClick={() => setActive(isOpen ? null : i)}
                  className="flex items-center justify-between py-5 cursor-pointer select-none"
                >
                  <span className="font-semibold text-[1.05rem]">
                    {faq.q}
                  </span>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-primary"
                  >
                    <ChevronDown size={20} strokeWidth={2.5} />
                  </motion.div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-gray-600 pr-10">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}