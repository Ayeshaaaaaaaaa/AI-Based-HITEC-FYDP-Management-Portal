"use clients";
import { Metadata } from "next";
import ScrollUp from "@/components/Common/ScrollUp";
import SignUp from "@/components/Signup/Signup";

export const metadata: Metadata = {
  title: "SignUp Page | ProjectSphere- Innovative Portal for FYP Management",
  description: "This is SignUp Page for ProjectSphere -Innovative Portal for FYP Management",
 
};
const SignupPage = () => {
  return (
    <>
     <div>
        <SignUp />
      </div>
    </>
  );
};

export default SignupPage;