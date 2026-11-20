import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", permission: null, icon: "▦" },
  { label: "Users", path: "/users", permission: "users.read", icon: "♙" },
  { label: "Roles", path: "/roles", permission: "roles.read", icon: "◇" },
  { label: "Inventory", path: "/inventory", permission: "inventory.read", icon: "▤" },
  { label: "Products", path: "/products", permission: "products.read", icon: "□" },
  { label: "Customers", path: "/customers", permission: "customers.read", icon: "♧" },
  { label: "Deliveries", path: "/deliveries", permission: "deliveries.read", icon: "⇢" },
  { label: "Sales", path: "/sales", permission: "reports.read", icon: "↗" },
  { label: "Reports", path: "/reports", permission: "reports.read", icon: "▥" },
];

function Sidebar() {
  const { logout, hasPermission } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-brand-mark"><span aria-hidden="true">F</span><h2>FALCORE</h2></div>
        <p className="sidebar-subtitle">Bakery distribution</p>
        <p className="sidebar-caption">OPERATIONS PORTAL</p>
      </div>

      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="sidebar-navigation" aria-label="Main navigation">
        {navigationItems.filter((item) => !item.permission || hasPermission(item.permission)).map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-note">FALCORE · MANAGEMENT SYSTEM</p>
        <button type="button" onClick={logout}><span aria-hidden="true">↪</span> Sign out</button>
      </div>
    </aside>
  );
}

export default Sidebar;
