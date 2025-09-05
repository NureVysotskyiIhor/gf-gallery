import { Sparkles } from "lucide-react";

// Компонент плавающего индикатора загрузки
export function FloatingLoadingIndicator({ icon: Icon, text, color = "blue" }: { 
  icon: any, 
  text: string, 
  color?: "blue" | "pink" | "purple" 
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    pink: "from-pink-500 to-rose-600", 
    purple: "from-purple-500 to-indigo-600"
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-bounce">
      <div className={`bg-gradient-to-r ${colorClasses[color]} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-sm`}>
        <div className="relative">
          <Icon className="w-5 h-5 animate-spin" style={{ animationDuration: '2s' }} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
        </div>
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  );
}
// Компонент для красивых loading частиц
export function LoadingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        >
          <Sparkles 
            className="w-3 h-3 text-blue-300 animate-pulse" 
            style={{ 
              animationDuration: `${2 + Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Компонент для shimmer эффекта
export function ShimmerSkeleton({ className, children }: { className: string, children?: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      {children}
    </div>
  );
}

// Компонент для волновой анимации загрузки
export function WaveLoader({ color = "blue" }: { color?: "blue" | "pink" | "purple" }) {
  const colorClasses = {
    blue: "bg-blue-500",
    pink: "bg-pink-500",
    purple: "bg-purple-500"
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-8 ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        ></div>
      ))}
    </div>
  );
}

export function LoginParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        >
          <Sparkles 
            className="w-2 h-2 text-blue-400 animate-pulse" 
            style={{ 
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}