const TermsContent = () => {
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed ml-10">
          By accessing and using MarSUKAT, you acknowledge that you have read,
          understood, and agree to be bound by these Terms of Service.
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">2. Service Description</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed ml-10">
          MarSUKAT is an academic platform designed to facilitate course
          management and student services. The platform provides tools for
          course enrollment, grade viewing, and academic resource access.
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
                d="M12 4v1m6 11h2m-6 0h-2m2 0v4m-6-4h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">3. User Responsibilities</h3>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2 ml-10">
          {[
            "Maintain the confidentiality of your account credentials",
            "Provide accurate and up-to-date information",
            "Use the service for legitimate academic purposes only",
            "Comply with all applicable laws and institutional policies",
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">4. Intellectual Property</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed ml-10">
          All content and materials available through MarSUKAT are protected by
          intellectual property rights. Users may not copy, modify, or
          distribute content without explicit permission.
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">5. Limitation of Liability</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed ml-10">
          MarSUKAT is provided "as is" without any warranties. We are not liable
          for any damages arising from the use or inability to use our services.
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">6. Modifications</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed ml-10">
          We reserve the right to modify these terms at any time. Continued use
          of the service after changes constitutes acceptance of the modified
          terms.
        </p>
      </section>
    </div>
  );
};

export default TermsContent;
