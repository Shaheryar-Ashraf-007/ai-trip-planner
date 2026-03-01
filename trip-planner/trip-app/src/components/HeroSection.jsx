import { Link } from "react-router-dom"

const HeroSection = () => {
  const destinations = ['🗼 Paris', '🏯 Kyoto', '🏝 Bali', '🌆 NYC', '🏔 Swiss Alps', '🕌 Istanbul']

  const stats = [
    { num: '2M+', label: 'Trips Planned', icon: '✈️' },
    { num: '180', label: 'Countries', icon: '🌍' },
    { num: '4.9★', label: 'User Rating', icon: '⭐' },
    { num: '100%', label: 'Free to Start', icon: '🎉' },
  ]


  const avatarColors = ['bg-pink-400', 'bg-orange-400', 'bg-violet-400', 'bg-emerald-400', 'bg-blue-400']

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-violet-50 px-4 py-20">

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-indigo-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sky-100 opacity-50 blur-3xl" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.2) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
      </div>

      {/* AI Badge */}
      <div className="relative z-10 flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2 mb-10">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-xs font-semibold tracking-widest uppercase text-indigo-600">
          AI-Powered Travel Planning
        </span>
      </div>

      {/* Headline */}
      <div className="relative z-10 text-center max-w-3xl w-full mx-auto px-2 mb-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight tracking-tight text-indigo-950 mb-1">
          Discover Your
        </h1>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold italic leading-tight tracking-tight mb-7 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
          Perfect Journey
        </h1>

        <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto mb-10">
          Personalized itineraries, hidden gems, and seamless planning — all curated by AI that truly understands how you love to travel.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 ">
          <Link to={'/create-trip'}>
            <button className="px-8 py-4 rounded-full cursor-pointer bg-gradient-to-r from-indigo-500
            to-sky-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200" >
              Get Started — It's Free →
            </button>
          </Link>
         
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 flex flex-wrap justify-center mt-14 bg-white border border-indigo-100 rounded-2xl shadow-lg shadow-indigo-50 overflow-hidden">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`flex flex-col items-center px-8 py-6 cursor-default hover:bg-indigo-50 transition-colors duration-200 ${
              i < stats.length - 1 ? 'border-r border-indigo-100' : ''
            }`}
          >
            <span className="text-2xl mb-2">{stat.icon}</span>
            <span className="text-2xl font-bold text-indigo-950 tracking-tight leading-none mb-1">{stat.num}</span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Destination Chips */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 mt-8 max-w-2xl px-4">
        <span className="text-xs uppercase tracking-widest text-slate-400 font-medium mr-1">Trending:</span>
        {destinations.map((dest) => (
          <button
            key={dest}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            {dest}
          </button>
        ))}
      </div>

      {/* Social Proof */}
      <div className="relative z-10 flex items-center gap-3 mt-10">
        <div className="flex">
          {avatarColors.map((color, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full ${color} border-2 border-white shadow-sm ${i > 0 ? '-ml-2' : ''}`}
            />
          ))}
        </div>
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-indigo-950">12,000+</span> travelers planned their trip this week
        </p>
      </div>

    </div>
  )
}

export default HeroSection