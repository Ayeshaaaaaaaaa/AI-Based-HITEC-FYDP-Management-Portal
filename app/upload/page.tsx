
"use client";
import { AuthProvider } from '@/components/context/AuthContext';
import Breadcrumb from "@/components/Common/Breadcrumb";
import Upload from"@/components/Upload/Upload";
import ScrollUp from "@/components/Common/ScrollUp";
import Link from "next/link";

const UploadPage = () => {
  return (
    <>
    <ScrollUp />
    <br/>
    <Breadcrumb
        pageName="Create a new project"
        description="upload your project here and send it to admin for approval"
      />
    <AuthProvider>
    <div>

      <Upload />
    </div>
    </AuthProvider>
    </>
  );
};

export default UploadPage;