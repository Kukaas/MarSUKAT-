const PrivacyContent = () => {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">1. Information We Collect</h3>
        </div>
        <div className="space-y-3 ml-10">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We collect the following types of information:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            {[
              "Personal information (name, student ID, contact details)",
              "Academic records and course enrollment data",
              "System usage data and login information",
              "Device and browser information",
            ].map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mt-0.5 text-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4"
                  />
                </svg>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">
            2. How We Use Your Information
          </h3>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2 ml-10">
          {[
            "Provide and maintain the MarSUKAT platform",
            "Process course enrollments and academic records",
            "Communicate important updates and notifications",
            "Improve our services and user experience",
            "Ensure platform security and prevent unauthorized access",
          ].map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mt-0.5 text-primary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4"
                />
              </svg>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">3. Data Protection</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed ml-10">
          We implement robust security measures to protect your data, including
          encryption, secure servers, and regular security audits. Access to
          personal information is strictly controlled and limited to authorized
          personnel.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">4. Data Sharing</h3>
        </div>
        <div className="space-y-3 ml-10">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We do not share your personal information with third parties except
            when:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            {[
              "Required by law or legal process",
              "Necessary for academic administration",
              "Authorized by you in writing",
            ].map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mt-0.5 text-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4"
                  />
                </svg>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">5. Your Rights</h3>
        </div>
        <div className="space-y-3 ml-10">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You have the right to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            {[
              "Access your personal data",
              "Request corrections to your information",
              "Request data deletion (subject to academic record requirements)",
              "Opt-out of non-essential communications",
            ].map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mt-0.5 text-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4"
                  />
                </svg>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">6. Contact Us</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed ml-10">
          For privacy-related inquiries or concerns, please contact our Data
          Protection Officer through the Contact page.
        </p>
      </section>
    </div>
  );
};

export default PrivacyContent;
