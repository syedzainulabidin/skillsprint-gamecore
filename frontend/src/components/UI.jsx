export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "px-3 py-1.5 text-sm rounded border disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-gray-900 text-white border-gray-900 hover:bg-gray-800",
    secondary: "bg-white text-gray-900 border-gray-300 hover:bg-gray-50",
    danger: "bg-white text-red-700 border-red-300 hover:bg-red-50",
    ghost: "bg-transparent text-gray-700 border-transparent hover:bg-gray-100",
  };
  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`px-2 py-1.5 text-sm border border-gray-300 rounded w-full focus:outline-none focus:border-gray-500 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`px-2 py-1.5 text-sm border border-gray-300 rounded w-full focus:outline-none focus:border-gray-500 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`px-2 py-1.5 text-sm border border-gray-300 rounded bg-white w-full focus:outline-none focus:border-gray-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded p-4 ${className}`}>
      {children}
    </div>
  );
}

export function Alert({ type = "info", children }) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    error: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
  };
  return (
    <div className={`text-sm border rounded px-3 py-2 mb-3 ${styles[type]}`} role="alert">
      {children}
    </div>
  );
}

export function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 border rounded ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Table({ children }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TH({ children, className = "" }) {
  return (
    <th className={`text-left px-3 py-2 border-b border-gray-200 bg-gray-50 font-medium text-gray-700 ${className}`}>
      {children}
    </th>
  );
}

export function TD({ children, className = "" }) {
  return (
    <td className={`px-3 py-2 border-b border-gray-100 align-top ${className}`}>
      {children}
    </td>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function StatBox({ label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-xl font-semibold text-gray-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
