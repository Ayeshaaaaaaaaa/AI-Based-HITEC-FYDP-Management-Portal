import Breadcrumb from "@/components/Common/Breadcrumb";
import VerifyEmail from"@/components/verify-email/index";
import ScrollUp from "@/components/Common/ScrollUp";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "verifyemail Page | ProjectSphere- Innovative Portal for FYP Management",
  description: "",
 
};
const vemailPage = () => {
  return (
    <>
    <ScrollUp />
    <br/>
    <Breadcrumb
        pageName="User Verification"
        description=""
      />
    
    <div>
      <VerifyEmail/>
    </div>
    </>
  );
};

export default vemailPage;