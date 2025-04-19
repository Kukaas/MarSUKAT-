import { forwardRef, useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const ReCaptcha = forwardRef(({ onChange, siteKey, size: propSize }, ref) => {
  const recaptchaSiteKey = siteKey || import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const [containerWidth, setContainerWidth] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Update width measurements on mount and resize
  useEffect(() => {
    const updateWidths = () => {
      setWindowWidth(window.innerWidth);
      
      const container = document.querySelector('.recaptcha-container');
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };
    
    // Initial size calculation
    updateWidths();
    
    // Update size on window resize
    window.addEventListener('resize', updateWidths);
    
    return () => {
      window.removeEventListener('resize', updateWidths);
    };
  }, []);
  
  // Calculate scale based on container width
  const getScale = () => {
    if (containerWidth === 0) return 1;
    if (containerWidth < 304) {
      return containerWidth / 304;
    }
    return 1;
  };

  // Determine size based on screen width
  // This affects the rendered size of the reCAPTCHA and also the popup
  const size = propSize || (windowWidth < 400 ? 'compact' : 'normal');

  const scale = getScale();

  return (
    <div className="recaptcha-container w-full flex justify-start">
      <div 
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'left top',
          height: scale !== 1 ? `${78 * scale}px` : 'auto',
        }}
      >
        <ReCAPTCHA
          ref={ref}
          sitekey={recaptchaSiteKey}
          onChange={onChange}
          size={size}
          // Add data-mobile attribute to help adjust popup behavior on mobile
          data-mobile={windowWidth < 768 ? "true" : "false"}
        />
      </div>
    </div>
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;