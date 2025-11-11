
const navItems: any[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "dashboard-01",
    accessId: 1,
  },
  {
    title: "Employees",
    path: "/employees",
    icon: "accounts-02",
    accessId:1,

  },
 
];

const bottomMenuItems = [
  {
    id: 1,
    to: "/profile",
    title: ("profile_module_name"),
    condition: true,
    avatar: true, // Use avatar for profile instead of icon
    subMenu: [
      {
        title: ("profile_module_name"),
        accessId:1,
        path: "/profile",
      },
      { title: "Logout", isLogout: true },
    ],
  },
];

const layoutConstants = { bottomMenuItems, navItems };
export default layoutConstants;
