import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
      <div className="container mx-auto px-4 py-3 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-sm"
        >
          Made with ❤️ | © 2026 UNO Connect
        </motion.p>
      </div>
    </footer>
  );
};

export default Footer;
