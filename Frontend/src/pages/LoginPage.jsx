import React from "react";
import { motion } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";

/**
 * LoginPage - Apple Professional Theme
 * Optimized for stability to prevent black-screen rendering issues.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4 selection:bg-[#0071e3] selection:text-white relative overflow-hidden">

      {/* 1. Background Texture (Safe & Lightweight) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/topography.png')` }}
      />

      {/* 2. Soft Background Glows (CSS only - No Three.js for safety) */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#0071e3]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-gray-300/50 blur-[100px] rounded-full pointer-events-none" />

      {/* 3. Main Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white text-lg font-bold italic mx-auto mb-6 shadow-xl"
          >
            S
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1d1d1f] antialiased">
            Sign in to Saahas.
          </h1>
          <p className="text-[#86868b] font-semibold mt-4 text-lg">
            Education for every ability.
          </p>
        </div>

        {/* The Login Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-10 md:p-12 border border-black/5 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
              Enter your ID.
            </h2>
          </div>

          {/* Your LoginForm component remains untouched */}
          <div className="relative z-20">
            <LoginForm />
          </div>


        </div>
      </motion.div>
    </div>
  );
}