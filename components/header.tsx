import { RiCameraLensLine } from '@remixicon/react';
import { cn } from '@/utils/cn';



export default function Header({ className }: { className?: string }) {
  return (
    <div className={cn('border-b border-stroke-soft-200', className)}>
      <header className='mx-auto flex h-14 max-w-5xl items-center justify-between px-5'>
          <div className='flex items-center gap-2 text-label-md font-bold text-inherit'>
            <RiCameraLensLine className="text-primary-base" size={24} />
            <span>Studio Manager</span>
          </div>


      </header>
    </div>
  );
}
