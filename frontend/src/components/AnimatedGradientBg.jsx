import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

const gradients = [
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(120deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(120deg, #fda085 0%, #f6d365 100%)',
  'linear-gradient(120deg, #f5f7fa 0%, #c3cfe2 100%)',
  'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
];

export default function AnimatedGradientBg() {
  const controls = useAnimation();

  useEffect(() => {
    let i = 0;
    const animate = async () => {
      while (true) {
        await controls.start({
          background: gradients[i % gradients.length],
          transition: { duration: 3 },
        });
        i++;
      }
    };
    animate();
  }, [controls]);

  return (
    <motion.div
      initial={{ background: gradients[0] }}
      animate={controls}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        width: '100vw',
        height: '100vh',
        backgroundSize: '400% 400%',
        transition: 'background 1s',
      }}
    />
  );
}