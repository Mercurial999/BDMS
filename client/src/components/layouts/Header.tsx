import { useAuth } from "../../context/useAuth";

function Header() {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";
  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";

  return (
    <header className="header">
      <div className="header-heading">
        <p className="header-kicker">FALCORE / MANAGEMENT</p>
        <h1>Distribution workspace</h1>
      </div>
      <div className="header-user">
        <div className="header-user-meta">
          <strong>{fullName}</strong>
          <span>{user?.role.name ?? "Team member"}</span>
        </div>
        <div className="header-avatar" aria-label={`Profile initials: ${initials}`}>{initials}</div>
      </div>
    </header>
  );
}

export default Header;
