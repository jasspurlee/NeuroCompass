export function ScreenCard({ title, subtitle, children, actions, accent = "default" }) {
  return (
    <section className={`screen-card screen-card-${accent}`}>
      <div className="screen-card-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
