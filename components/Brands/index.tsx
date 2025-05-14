import { Brand } from "@/types/brand";
import Image from "next/image";
import brandsData from "./brandsData";
import SectionTitle from "../Common/SectionTitle";

const Brands = () => {
  return (
    <section className="pt-16">
      <div className="container">
        <SectionTitle
          title="HEC Approved Universities"
          paragraph="Our portal offers HEC-approved universities for FYP projects, 
          helping students discover unique ideas while avoiding repetition."
          center
        />
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="flex flex-wrap items-center justify-center rounded-sm bg-gray-light px-8 py-8 dark:bg-gray-dark sm:px-10 md:px-[50px] md:py-[40px] xl:p-[50px] 2xl:px-[90px] 2xl:py-[60px] min-h-[200px]">
              {brandsData.map((brand) => (
                <SingleBrand key={brand.id} brand={brand} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;

const SingleBrand = ({ brand }: { brand: Brand }) => {
  const { href, image, imageLight, name } = brand;

  return (
    <div className="flex flex-col items-center justify-center w-1/2 px-3 py-[15px] sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6">
      <a
        href={href}
        target="_blank"
        rel="nofollow noreferrer"
        className="relative w-full opacity-70 transition hover:opacity-100 dark:opacity-60 dark:hover:opacity-100"
      >
        <Image
          src={imageLight}
          alt={name}
          width={100}  
          height={100} 
          className="hidden dark:block mx-auto"
        />
        <Image
          src={image}
          alt={name}
          width={100}  
          height={100} 
          className="block dark:hidden mx-auto"
        />
      </a>
      <p className="mt-2 text-center text-sm font-medium text-gray-800 dark:text-gray-300">
        {name}
      </p>
    </div>
  );
};
