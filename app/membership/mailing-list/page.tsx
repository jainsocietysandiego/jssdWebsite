import React from 'react'
import MailingListForm from '@/app/components/mailingListSection';
import Footer from '@/app/components/Footer';
import Navbar from '@/app/components/Navbar';

const MailingList = () => {
  return (
    <>
    <Navbar />
    <div className="pt-24 px-4 min-h-screen bg-white">
      <MailingListForm />
    </div>
    <Footer />
    </>
  );
}

export default MailingList