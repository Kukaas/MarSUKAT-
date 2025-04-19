import { forwardRef} from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const ReCaptcha = forwardRef(({ onChange, siteKey }, ref) => {
  const recaptchaSiteKey = siteKey || import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  return (
    <ReCAPTCHA
      ref={ref}
      sitekey={recaptchaSiteKey}
      onChange={onChange}
      className="mt-2 transform scale-[0.77] sm:scale-100 origin-left"
    />
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;