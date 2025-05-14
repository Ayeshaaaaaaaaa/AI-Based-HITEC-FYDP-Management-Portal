import Breadcrumb from "@/components/Common/Breadcrumb";
import Supervisor from"@/components//supervisor/index";
import ScrollUp from "@/components/Common/ScrollUp";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "University Page | ProjectSphere- Innovative Portal for FYP Management",
  description: "This is University Page for ProjectSphere -Innovative Portal for FYP Management",
 
};
const SupervisorPage = () => {
  return (
    <>
    <ScrollUp />
    <br/>
    <Breadcrumb
        pageName="Supervisors"
        description="Send proposal to your desired supervisor"
      />
    
    <div>
      <Supervisor />
    </div>
    </>
  );
};

export default SupervisorPage;