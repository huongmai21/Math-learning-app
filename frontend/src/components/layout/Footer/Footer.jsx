import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.footer
      className="bg-[#2c3e50] text-white text-center py-6 mt-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionVariants}
    >
      <p className="mb-4">© 2025 FunMath. All rights reserved.</p>
      <div className="flex justify-center gap-6">
        <a
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl hover:text-[#ff6f61]"
        >
          <i className="fab fa-linkedin"></i>
        </a>
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl hover:text-[#ff6f61]"
        >
          <i className="fab fa-facebook-square"></i>
        </a>
        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl hover:text-[#ff6f61]"
        >
          <i className="fab fa-instagram"></i>
        </a>
        <a
          href="https://www.twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl hover:text-[#ff6f61]"
        >
          <i className="fab fa-twitter"></i>
        </a>
      </div>
    </motion.footer>
  );
};

export default Footer;
