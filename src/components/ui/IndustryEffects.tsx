import { getSendEffectConfig } from '../../config/industry';

// Individual effect functions
const createLeafFlutterEffect = (element: HTMLElement, colors: string[]) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        document.body.appendChild(particle);
        particle.style.position = 'absolute';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.width = `${Math.random() * 8 + 5}px`;
        particle.style.height = `${Math.random() * 5 + 5}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '20% 80%';
        particle.style.opacity = '0.9';
        particle.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
        particle.style.pointerEvents = 'none';

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 20;
        const flutterAngle = (Math.random() - 0.5) * 60;

        // Animate
        requestAnimationFrame(() => {
            particle.style.transform = `
                translateX(${Math.cos(angle) * distance}px)
                translateY(${Math.sin(angle) * distance}px)
                rotate(${flutterAngle}deg)
                scale(0)`;
            particle.style.opacity = '0';
        });

        setTimeout(() => {
            particle.remove();
        }, 800);
    }
};

const createGentlePulseEffect = (element: HTMLElement, colors: string[]) => {
    const pulse = document.createElement('div');
    document.body.appendChild(pulse);
    const rect = element.getBoundingClientRect();

    pulse.style.position = 'absolute';
    pulse.style.left = `${rect.left}px`;
    pulse.style.top = `${rect.top}px`;
    pulse.style.width = `${rect.width}px`;
    pulse.style.height = `${rect.height}px`;
    pulse.style.borderRadius = element.style.borderRadius || '0.75rem';
    pulse.style.backgroundColor = colors[1] || '#3b82f6';
    pulse.style.opacity = '0.7';
    pulse.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
    pulse.style.pointerEvents = 'none';
    pulse.style.zIndex = '9998';

    requestAnimationFrame(() => {
        pulse.style.transform = 'scale(1.5)';
        pulse.style.opacity = '0';
    });

    setTimeout(() => {
        pulse.remove();
    }, 500);
};

const createSparkBurstEffect = (element: HTMLElement, colors: string[]) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        document.body.appendChild(particle);
        particle.style.position = 'absolute';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.width = '3px';
        particle.style.height = `${Math.random() * 8 + 8}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.opacity = '1';
        particle.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
        particle.style.pointerEvents = 'none';

        const angle = Math.random() * 360;
        const distance = Math.random() * 40 + 30;

        particle.style.transform = `rotate(${angle}deg) translateY(0px)`;

        requestAnimationFrame(() => {
            particle.style.transform = `rotate(${angle}deg) translateY(${distance}px)`;
            particle.style.opacity = '0';
        });

        setTimeout(() => {
            particle.remove();
        }, 600);
    }
}


// Main trigger function
export const triggerSendEffect = (buttonElement: HTMLElement | null) => {
  if (!buttonElement) return;

  const config = getSendEffectConfig();

  switch (config.effect) {
    case 'leaf_flutter':
      createLeafFlutterEffect(buttonElement, config.colors);
      break;
    case 'spark_burst':
        createSparkBurstEffect(buttonElement, config.colors);
        break;
    // case 'stone_ripple':
    //   createStoneRippleEffect(buttonElement, config.colors);
    //   break;
    case 'gentle_pulse':
      createGentlePulseEffect(buttonElement, config.colors);
      break;
  }
};