"use clients";
import { Metadata } from "next";
import AdminSignUp from "@/components/AdminSignup";

export const metadata: Metadata = {
  title: " Admin SignUp Page | ProjectSphere- Innovative Portal for FYP Management",
  description: "This is Admin SignUp Page for ProjectSphere -Innovative Portal for FYP Management",
 
};
const AdminSignupPage = () => {
  return (
    <>
     <div>
        <AdminSignUp />
      </div>
    </>
  );
};

export default AdminSignupPage;