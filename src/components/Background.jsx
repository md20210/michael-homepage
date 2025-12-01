// src/components/Background.jsx - Optimierte Version ohne Re-Renders
import React, { useEffect, useRef } from 'react';

const Background = () => {
    const containerRef = useRef(null);
    const particlesCreated = useRef(false);

    useEffect(() => {
        // Verhindere mehrfache Initialisierung
        if (particlesCreated.current) return;
        particlesCreated.current = true;

        // Erstelle statische Partikel mit CSS-Animationen
        const createStaticParticles = () => {
            if (!containerRef.current) return;

            // Entferne existierende Partikel
            const existingParticles = containerRef.current.querySelectorAll('.particle');
            existingParticles.forEach(particle => particle.remove());

            // Erstelle initiale Partikel
            for (let i = 0; i < 9; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = `${(i + 1) * 10}%`;
                particle.style.animationDelay = `${i * 0.5}s`;
                particle.style.animationDuration = `${Math.random() * 3 + 4}s`;
                containerRef.current.appendChild(particle);
            }
        };

        // Kontinuierliche Partikel-Erstellung ohne React State
        const createNewParticle = () => {
            if (!containerRef.current) return;

            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = '0s';
            particle.style.animationDuration = `${Math.random() * 3 + 4}s`;
            
            containerRef.current.appendChild(particle);

            // Entferne Partikel nach Animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 7000);
        };

        // Initiale Partikel erstellen
        createStaticParticles();

        // Neue Partikel alle 2 Sekunden hinzufügen
        const interval = setInterval(createNewParticle, 2000);

        // Cleanup
        return () => {
            clearInterval(interval);
            if (containerRef.current) {
                const particles = containerRef.current.querySelectorAll('.particle');
                particles.forEach(particle => particle.remove());
            }
        };
    }, []); // Leere Dependency-Array = nur einmal ausführen

    return (
        <div ref={containerRef} className="background-container">
            {/* Statische Hintergrund-Elemente */}
            <div className="bg-animation" />
            <div className="wireframe-overlay" />
        </div>
    );
};

// Verwende React.memo um unnötige Re-Renders zu verhindern
export default React.memo(Background);