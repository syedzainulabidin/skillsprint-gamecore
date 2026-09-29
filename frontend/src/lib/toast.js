import { toast } from "react-toastify";

const base = {
  position: "top-right",
  autoClose: 3200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  theme: "light",
};

export const notify = {
  success: (msg, opts = {}) => toast.success(msg, { ...base, ...opts }),
  error: (msg, opts = {}) => toast.error(msg, { ...base, autoClose: 4500, ...opts }),
  info: (msg, opts = {}) => toast.info(msg, { ...base, ...opts }),
  warn: (msg, opts = {}) => toast.warn(msg, { ...base, ...opts }),
  message: (msg, opts = {}) => toast(msg, { ...base, ...opts }),
};

export default notify;
