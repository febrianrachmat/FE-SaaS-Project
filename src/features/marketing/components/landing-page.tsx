"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/shared/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/config/env";

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: easeOut },
  }),
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-900">
            {APP_NAME}
          </span>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-[100svh] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(37,99,235,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 15% 80%, rgba(14,116,144,0.12), transparent 50%), linear-gradient(160deg, #eef3f9 0%, #f8fafc 45%, #e8eef8 100%)",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-3xl opacity-80 md:opacity-100"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: easeOut }}
        >
          <HeroBoardBackdrop />
        </motion.div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 pb-16 pt-28">
          <motion.p
            className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl md:text-7xl"
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {APP_NAME}
          </motion.p>
          <motion.h1
            className="mt-4 max-w-xl text-2xl font-medium tracking-tight text-slate-800 sm:text-3xl"
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            Ship work with a shared pulse.
          </motion.h1>
          <motion.p
            className="mt-4 max-w-md text-base text-slate-600 sm:text-lg"
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {APP_TAGLINE}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <Link href="/register">
              <Button size="lg">Start free</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-900">
              Boards that stay in sync
            </h2>
            <p className="mt-3 max-w-md text-slate-600">
              Move tasks across statuses with your team and see updates land
              live—no refresh roulette.
            </p>
          </motion.div>
          <motion.div
            className="relative h-56 overflow-hidden rounded-none md:h-64"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 100%)",
              }}
            />
            <div className="absolute inset-0 grid grid-cols-3 gap-3 p-5">
              {["Plan", "Build", "Ship"].map((label, i) => (
                <div key={label} className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                    {label}
                  </p>
                  <motion.div
                    className="h-16 bg-white/80"
                    initial={{ y: 12, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 * i, duration: 0.45 }}
                  />
                  <div className="h-10 bg-white/50" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#0b1220] text-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              One workspace for delivery
            </h2>
            <p className="mt-3 text-slate-300">
              Comments, files, invites, and activity—kept close to the work so
              context never gets lost in chat threads.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Collaborate",
                body: "Threaded comments and mentions on every task.",
              },
              {
                title: "Trace activity",
                body: "A clear timeline of what changed and who moved it.",
              },
              {
                title: "Invite freely",
                body: "Share a link, assign a role, and get people onboard.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.45 }}
              >
                <h3 className="text-sm font-semibold tracking-wide text-primary-300 uppercase">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-900">
              Ready when your team is
            </h2>
            <p className="mt-2 max-w-md text-slate-600">
              Create a workspace in minutes and bring delivery into focus.
            </p>
          </div>
          <Link href="/register">
            <Button size="lg">Create your workspace</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#f4f7fb]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-slate-500">
          <span className="font-[family-name:var(--font-display)] font-semibold text-slate-700">
            {APP_NAME}
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function HeroBoardBackdrop() {
  return (
    <div className="absolute inset-0 hidden md:block">
      <div
        className="absolute inset-y-8 right-0 w-[92%] overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 18%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 18%, black 100%)",
        }}
      >
        <div className="grid h-full grid-cols-3 gap-4 bg-gradient-to-br from-white/40 to-primary-100/30 p-8 backdrop-blur-[2px]">
          {["Backlog", "Doing", "Done"].map((col, colIndex) => (
            <div key={col} className="space-y-3">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                {col}
              </p>
              {Array.from({ length: 3 - colIndex }).map((_, i) => (
                <motion.div
                  key={`${col}-${i}`}
                  className="h-14 border border-white/70 bg-white/70"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.35 + colIndex * 0.12 + i * 0.08,
                    duration: 0.45,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
