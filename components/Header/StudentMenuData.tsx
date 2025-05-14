import { Menu } from "@/types/menu";

const StudentMenuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "Supervisors",
    path: "/supervisors",
    newTab: false,
  },
  {
    id: 3,
    title: "Projects",
    path: "/projects",
    newTab: false,
  },
  {
    id: 4,
    title: "Explore Ideas with Gpt",
    path: "#",
    newTab: false,
  },
  {
    id: 5,
    title: "Fyp Guidelines",
    path: "/Uni",
    newTab: false,
  },
  {
    id: 6,
    title: "Notice board",
    path: "/admin",
    newTab: false,
  },
  // {
  //   id: 5,
  //   title: "Pages",
  //   newTab: false,
  //   submenu: [
  //     {
  //       id: 51,
  //       title: "Sign In",
  //       path: "/signin",
  //       newTab: false,
  //     },
  //     {
  //       id: 52,
  //       title: "Sign Up",
  //       path: "/signup",
  //       newTab: false,
  //     },
  //     {
  //       id: 53,
  //       title: "Error Page",
  //       path: "/error",
  //       newTab: false,
  //     },
  //   ],
  // },
];

export default StudentMenuData;
