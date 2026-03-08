import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";

const Sidebar = ({
  menuItems,
  activeTab,
  setActiveTab,
  title,
  username,
  role,
  onProfileClick,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
      if (window.innerWidth < 1024) setIsOpen(false);
    } else {
      navigate("/profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-[#f85606] text-white rounded-full shadow-2xl hover:bg-[#d04a05] transition-all"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-40
        transition-transform duration-300 ease-in-out transform
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        pt-20 pb-8 flex flex-col justify-between
      `}
      >
        <div>
          <div className="px-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              {title}
            </h2>
            <div className="h-1 w-12 bg-[#f85606] mt-2 rounded-full" />
          </div>

          <nav className="px-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${
                    activeTab === item.id
                      ? "bg-[#f85606]/5 text-[#f85606] border border-[#f85606]/10"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }
                `}
              >
                <item.icon
                  size={20}
                  className={
                    activeTab === item.id ? "text-[#f85606]" : "text-gray-400"
                  }
                />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4">
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-4 space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f85606] to-[#0a4692] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {username ? username[0].toUpperCase() : <FiUser size={16} />}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {username || "User"}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {role || "Account"}
                </p>
              </div>
            </div>

            {/* Profile Button */}
            <button
              onClick={handleProfileClick}
              className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <FiUser size={13} /> My Profile
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <FiLogOut size={13} /> Log Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
