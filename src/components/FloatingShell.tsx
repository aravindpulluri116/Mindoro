import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springSoft } from '@/lib/motion-variants';

type FloatingShellProps = HTMLMotionProps<'div'> & {
  className?: string;
  /** Disable subtle hover lift (e.g. nested lists). */
  noLift?: boolean;
};

/**
 * Shared glass “floating” panel: blur, soft shadow, rounded corners.
 */
export function FloatingShell({
  className,
  children,
  noLift,
  ...props
}: FloatingShellProps) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-white/[0.1] bg-white/[0.07] backdrop-blur-2xl',
        'shadow-[0_16px_48px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.05)_inset]',
        className
      )}
      whileHover={
        noLift
          ? undefined
          : { y: -3, transition: { type: 'spring', stiffness: 400, damping: 28 } }
      }
      transition={springSoft}
      {...props}
    >
      {children}
    </motion.div>
  );
}
