import Breadcrumb from "@/components/Common/Breadcrumb";
import University from"@/components/University/universities";
import ScrollUp from "@/components/Common/ScrollUp";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "University Page | ProjectSphere- Innovative Portal for FYP Management",
  description: "This is University Page for ProjectSphere -Innovative Portal for FYP Management",
 
};
const DepartmentPage = () => {
  return (
    <>
    <ScrollUp />
    <br/>
    <Breadcrumb
        pageName="Universities Page"
        description="All Hec regognized universities and listed here"
      />
    
    <div>
      <University />
    </div>
    </>
  );
};

export default DepartmentPage;