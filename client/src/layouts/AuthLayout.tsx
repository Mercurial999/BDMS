import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <main className="auth-layout">
      <div className="auth-brand-panel">
        <div className="falcore-lockup">
          <span className="falcore-emblem" aria-hidden="true">F</span>
          <div>
            <p className="auth-mark">FALCORE</p>
            <p className="auth-submark">Consumer Goods Trading</p>
          </div>
        </div>
        <p className="auth-brand-title">A sharper view of every movement.</p>
        <p className="auth-brand-copy">
          Bakery distribution operations, organized for confident decisions from stockroom to delivery.
        </p>
      </div>
      <div className="auth-form-panel">
        <Outlet />
      </div>
    </main>
  );
}

export default AuthLayout;
