"use client"

import React from 'react';
import Header from '@/components/header';
import Mainbody from '@/components/main-body'
import Footer from '@/components/footer';

import { ToastContainer, } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

const Page = () => {
  return (
    <div>
      <Header/>
      <Mainbody/>
      <Footer/>
      <ToastContainer/>
    </div>
  );
};

export default Page;
