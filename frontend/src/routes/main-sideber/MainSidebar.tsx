import { memo, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./MainSidebar.module.scss";
import layoutConstants from "./constants";

const MainSideBar = memo(() => {

  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<string>("");
  const roleAccess ={moduleAccessIds:[1]}
  // const [activeUser, setActiveUser] = useState<any>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // Define state for intervalId



  // const testIdle= async()=>{
  //   setTimeout(async()=>{
  //     await authServices.rotateToken()

  //   },3000)
  // }


  const logOut = async () => {
    const refreshToken = JSON.parse(localStorage.token)?.state?.refresh_token;
  
  };
  return (
    <nav className="card bg-blue-800	">
      <div className={`${styles.sc_nav} bg-blue-600	 h-screen`}>
        <div className="text-center pt-4 pb-4">
          <div className={"flex align-items-center justify-content-center " + styles.sc_nav_logo}>
            <img src={encodeURI(`https://sellerscommerce.sirv.com/00000000-0000-0000-0000-000000000000/development/globe.png`)} loading="lazy"  alt="one_source_logo" width={48} height={48}  />
          </div>
        </div>
        <div className={`${styles.menubar} flex flex-column justify-content-between`}>
          {/* Top Menu */}
          <div className="menu">
            <ul className="pl-0 m-0 text-center">
              {layoutConstants?.navItems.map((item: any) => {
                const hasAccess = Array.isArray(item.accessId)
                  ? item.accessId.some((id: any) => roleAccess?.moduleAccessIds?.includes(id))
                  : roleAccess?.moduleAccessIds?.includes(item.accessId);
                if (!hasAccess) return null;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSelected =
                  selectedPath.includes(item.path.substring(1)) ||
                  (item.subItems &&
                    item.subItems.find((item: any) =>
                      selectedPath.includes(item.path.substring(1))
                    ));
                item.subItems = item.subItems
                  ? item.subItems.filter((subItems1: any) =>
                      roleAccess?.moduleAccessIds.includes(subItems1.accessId)
                    )
                  : [];
                return (
                  <li
                    key={item.title}
                    className={`${styles.menu_item} ${hasSubItems ? "relative" : ""}`}
                  >
                    <Link
                      to={
                        hasSubItems && item?.subItems.length === 1
                          ? item.subItems[0].path
                          : item.path
                      }
                      title={
                        hasSubItems && item?.subItems.length === 1
                          ? item.subItems[0].title
                          : (item.title)
                      }
                      className={
                        `${styles.menu_link}text-white icon-20x20 zoomin animation-duration-500 animation-iteration-forwards border-round-6 mb-2 inline-block hover:bg-primary-300 ` +
                        (isSelected ? styles.active : "")
                      }
                    >
                     {item.title}
                    </Link>
                   
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Bottom Menu */}
          <div className="menubottom">
            <ul className="pl-0 m-0 text-center mb-3">
              {layoutConstants?.bottomMenuItems.map((item) => (
                <li key={item.id} className={styles.menu_item + " relative"}>
                  <Link
                    to={item.to}
                    title={(item.title)}
                    className={
                      styles.profile_menu_link +
                      `icon-20x20 zoomin animation-duration-500 animation-iteration-forwards p-0 max-w-max m-auto flex justify-content-center`
                    }
                  >
                    <>
                      
                       
                          {/* <Avatar size="xlarge" label="A" image={""} className='my-6 p-0' shape="circle" /> */}
                         
                    
                    </>
                  </Link>
                  {/* SubMenu for items with subMenu */}
                  {item.subMenu && (
                    <ul
                      className={`${styles.submenu} bg-primary-25 pl-0 border-round-right overflow-hidden`}
                      style={{ marginTop: "-36px" }}
                    >
                      {item.subMenu.map((subItem: any, index) =>
                        subItem.isLogout ? (
                          <li
                            onClick={logOut}
                            key={index}
                            className={`text-left text-primary-500 hover:bg-white cursor-pointer px-4 py-3`}
                          >
                            {"Logout"}
                          </li>
                        ) : (
                          <>
                            {subItem.title && (
                              <li className="text-left w-full white-space-nowrap hover:bg-white px-4 py-3">
                                <Link
                                  to={subItem.path}
                                  className="text-primary-500 block hover:bg-white w-full"
                                >
                                  {(subItem.title)}
                                </Link>{" "}
                              </li>
                            )}
                          </>
                        )
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
});

export default MainSideBar;
