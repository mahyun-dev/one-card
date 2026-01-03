import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        // 기본 스타일
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #00f0ff',
          borderRadius: '12px',
          padding: '16px',
        },
        // Success 스타일
        success: {
          iconTheme: {
            primary: '#00ff88',
            secondary: '#1f2937',
          },
          style: {
            border: '1px solid #00ff88',
          },
        },
        // Error 스타일
        error: {
          iconTheme: {
            primary: '#ff0055',
            secondary: '#1f2937',
          },
          style: {
            border: '1px solid #ff0055',
          },
        },
        // Loading 스타일
        loading: {
          iconTheme: {
            primary: '#00f0ff',
            secondary: '#1f2937',
          },
          style: {
            border: '1px solid #00f0ff',
          },
        },
        // 기본 duration
        duration: 3000,
      }}
    />
  );
};

export default Toast;
