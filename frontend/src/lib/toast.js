import toast from 'react-hot-toast';

export const notify = {
  success: (msg) => toast.success(msg, { duration: 3000 }),
  error:   (msg) => toast.error(msg,   { duration: 4500 }),
  info:    (msg) => toast(msg,         { duration: 3000 }),
};