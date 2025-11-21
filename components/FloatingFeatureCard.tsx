'use client'

interface FloatingFeatureCardProps {
  icon: string
  title: string
  description: string
  animationClass: string
  borderColor: string
  glowColor: string
}

export function FloatingFeatureCard({
  icon,
  title,
  description,
  animationClass,
  borderColor,
  glowColor,
}: FloatingFeatureCardProps) {
  return (
    <div className={`absolute ${animationClass}`}>
      <div className="relative group">
        {/* Glow Effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${glowColor} rounded-2xl blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
        
        {/* Card */}
        <div className={`relative bg-slate-900/80 backdrop-blur-xl ${borderColor} border rounded-2xl p-4 md:p-5 w-48 md:w-56 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group`}>
          {/* Icon */}
          <div className="text-3xl md:text-4xl mb-3">{icon}</div>
          
          {/* Title */}
          <h3 className="text-sm md:text-base font-bold text-white mb-2 line-clamp-2">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed">
            {description}
          </p>
          
          {/* Hover accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  )
}
