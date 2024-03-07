// Footer.js
import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-center items-center">
        <div className="text-center md:text-left mb-4 md:mb-0 text-sm font-Plus Jakarta San">
          <div>&copy; {"2024"} Your Company. All rights reserved.</div>
          <div className="flex justify-center mt-8 md:mt-4">
            <a href="#" className="text-white hover:text-blue-500 mr-4"><FaFacebook /></a>
            <a href="#" className="text-white hover:text-blue-500 mr-4"><FaTwitter /></a>
            <a href="#" className="text-white hover:text-blue-500"><FaInstagram /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
