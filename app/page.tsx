import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
// import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import { AuthProvider } from '../context/AuthContext';
import { Metadata } from "next";
import Department from "@/components/Department";
export const metadata: Metadata = {
  title: "ProjectSphere - Innovative Portal for FYP Management",
  description: "ProjectSphere offers a comprehensive platform for managing and collaborating on final year projects, enhancing the research experience for students and researchers and avoid repitions of projects.",
  
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Department/>
      <Brands />
      {/* <Contact /> */}
      <br/><br/>
    </>
  );
}

