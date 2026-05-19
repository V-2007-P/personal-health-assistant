const GlassCard = ({ children, className = '', dark = false, style = {} }) => {
  const baseClass = dark ? 'dark-glass' : 'glass';
  return (
    <div className={`${baseClass} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default GlassCard;
