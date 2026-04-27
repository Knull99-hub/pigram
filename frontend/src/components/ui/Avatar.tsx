interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-24 h-24',
};

export default function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  return (
    <img
      src={src || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random`}
      alt={alt}
      className={`${sizes[size]} rounded-full object-cover border border-gray-200 flex-shrink-0 ${className}`}
    />
  );
}
