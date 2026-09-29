import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-cream-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-olive-700 flex items-center justify-center text-cream-50 font-semibold text-sm tracking-widest">
            S
          </div>
          <span className="font-semibold text-xl tracking-tight text-charcoal">
            SkillSprint<span className="text-olive-700 font-light">.AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal/70">
          <Link
            to="/"
            className="text-sm font-medium text-charcoal hover:text-olive-700 px-3 py-2 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-charcoal hover:text-olive-700 px-3 py-2 transition-colors"
          >
            Contact
          </Link>
          <Link
            to="/terms"
            className="text-sm font-medium text-charcoal hover:text-olive-700 px-3 py-2 transition-colors"
          >
            Terms
          </Link>
          <Link
            to="/policy"
            className="text-sm font-medium text-charcoal hover:text-olive-700 px-3 py-2 transition-colors"
          >
            Policy
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-charcoal hover:text-olive-700 px-3 py-2 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-olive-700 text-cream-50 px-5 py-2.5 rounded-sm hover:bg-olive-600 transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-charcoal hover:text-olive-700 transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-cream-50 border-b border-cream-200 px-6 py-6 space-y-4"
          >
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              to="/"
              className="text-sm font-medium text-charcoal hover:text-olive-700 px-3 py-2 transition-colors"
            >
              Home
            </Link>

            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              to="/contact"
              className="text-sm font-medium text-charcoal hover:text-olive-700 px-3 py-2 transition-colors"
            >
              Contact
            </Link>

            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              to="/terms"
              className="text-sm font-medium text-charcoal hover:text-olive-700 px-3 py-2 transition-colors"
            >
              Terms
            </Link>

            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              to="/policy"
              className="text-sm font-medium text-charcoal hover:text-olive-700 px-3 py-2 transition-colors"
            >
              Policy
            </Link>
            <div className="pt-4 border-t border-cream-200 flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full text-center text-sm font-medium py-2 text-charcoal border border-charcoal/20 rounded-sm"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="w-full text-center text-sm font-medium py-2.5 bg-olive-700 text-cream-50 rounded-sm"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
