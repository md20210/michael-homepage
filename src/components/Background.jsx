// src/components/Background.jsx
import React, { useEffect } from 'react';

const Background = () => {
    useEffect(() => {
        // Create particles periodically
        const particleInterval = setInterval(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
            document.body.appendChild(particle);

            setTimeout(() => {
                if (document.body.contains(particle)) {
                    particle.remove();
                }
            }, 7000);
        }, 2000);

        // Mouse movement parallax effect
        const handleMouseMove = (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            document.querySelectorAll('.skill-node').forEach((node, index) => {
                const speed = (index % 3 + 1) * 0.5;
                node.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
            });

            const profileFrame = document.querySelector('.profile-frame');
            if (profileFrame) {
                profileFrame.style.transform = `translate(${mouseX * 2}px, ${mouseY * 2}px)`;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            clearInterval(particleInterval);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <>
            <div className="bg-animation"></div>
            <div className="wireframe-overlay"></div>
        </>
    );
};

export default Background;