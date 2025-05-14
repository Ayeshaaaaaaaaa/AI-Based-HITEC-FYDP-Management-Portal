import Departments from "@/components/Department/departments";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { Metadata } from "next";
import ScrollUp from "@/components/Common/ScrollUp";

export const metadata: Metadata = {
  title: "Department Page | ProjectSphere- Innovative Portal for FYP Management",
  description: "This is Department Page for ProjectSphere -Innovative Portal for FYP Management",
 
};
const DepartmentPage = () => {
  return (
    <>
     <ScrollUp />
    <br/>
    <Breadcrumb
        pageName="Departments Page"
        description="You can see all departments and their projects here"
      />
      <Departments />
    </>
  );
};

export default DepartmentPage;