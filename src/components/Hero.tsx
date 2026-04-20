import React from 'react';
import { BookOpen, Mic, Languages } from 'lucide-react';

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="max-w-4xl">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-ink">
          Your Life, <span className="text-primary italic">As a Story</span>
        </h1>
        
        {/* Subtext */}
        <p className="text-xl md:text-2xl text-ink/80 mb-10 max-w-2xl mx-auto">
          The AI-powered diary that weaves your daily journals into 
          beautifully narrated chapters in your mother tongue.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button className="bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-hover transition-all shadow-md cursor-pointer">
            Start Journaling
          </button>
          <button className="border-2 border-ink text-ink px-8 py-4 rounded-full font-semibold text-lg hover:bg-ink/5 transition-all cursor-pointer">
            Watch How it Works
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-10">
          <div className="p-6 border border-ink/10 rounded-2xl bg-white/50">
            <Mic className="text-primary mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2 text-ink">Speak Naturally</h3>
            <p className="text-ink/70 text-sm">Voice-first journaling in Tamil, Telugu, Hindi, and more.</p>
          </div>
          <div className="p-6 border border-ink/10 rounded-2xl bg-white/50">
            <BookOpen className="text-primary mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2 text-ink">Weekly Chapters</h3>
            <p className="text-ink/70 text-sm">Every Saturday, AI weaves your entries into a flowing story.</p>
          </div>
          <div className="p-6 border border-ink/10 rounded-2xl bg-white/50">
            <Languages className="text-primary mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2 text-ink">Regional First</h3>
            <p className="text-ink/70 text-sm">Built for Indian languages from the ground up.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;