import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.footer
      className="bg-[#2c3e50] text-white text-center py-5 mt-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionVariants}
    >
      <p className="mb-2">© 2025 FunMath. All rights reserved.</p>
      <div className="flex justify-center gap-4">
        {["linkedin", "facebook-square", "instagram", "twitter"].map((icon) => (
          <a
            key={icon}
            href={`https://www.${icon}.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl text-white hover:text-[#ff6f61] transition-colors"
          >
            <i className={`fab fa-${icon}`}></i>
          </a>
        ))}
      </div>
    </motion.footer>
  );
};

export default Footer;