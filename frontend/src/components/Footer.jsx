import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <footer className="bg-white border-t border-cream-200 py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-charcoal/60">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-sm bg-olive-700 flex items-center justify-center text-cream-50 font-semibold text-[10px]">
              S
            </div>
            <span className="font-medium text-charcoal text-sm">
              SkillSprint AI
            </span>
          </div>

          <p>
            © {new Date().getFullYear()} SkillSprint AI. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              to="/terms"
              className="hover:text-olive-700 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/policy"
              className="hover:text-olive-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="hover:text-olive-700 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
