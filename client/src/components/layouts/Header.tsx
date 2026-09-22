import { useAuth } from "../../context/useAuth";

function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <div>
        <p className="header-kicker">Falcore Consumer Goods Trading</p>
        <h1>Distribution workspace</h1>
      </div>

      <div className="header-user">
        <strong>{user ? `${user.firstName} ${user.lastName}` : "User"}</strong>
        <span>{user?.role.name ?? ""}</span>
      </div>
    </header>
  );
}

export default Header;