export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-(--bg) text-(--text) px-6 py-12">
      <div className="max-w-4xl mx-auto card space-y-6">
        
        <h1 className="text-3xl">Terms and Conditions</h1>
        <p className="text-sm opacity-70">
          Effective Date: 29th April 2026
        </p>

        <section>
          <h2 className="text-xl mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Syntropy, you agree to be bound by these Terms and Conditions.
            If you do not agree, you must not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">2. Description of Service</h2>
          <p>
            Syntropy is a mock test platform that allows users to create, generate, and attempt
            tests, track performance, and analyze results using both manual and AI-powered tools.
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>AI-generated and manual mock tests</li>
            <li>Timed test interface</li>
            <li>Analytics and performance tracking</li>
            <li>Syllabus upload and parsing</li>
            <li>Subscription-based AI credit system</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl mb-2">3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities under your account. You agree to provide accurate information
            during registration.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">4. AI Credits and Billing</h2>
          
          <h3 className="font-semibold mt-2">4.1 Monthly Plans</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Credits are valid only within the billing cycle</li>
            <li>Unused credits do not roll over</li>
            <li>Credits reset at the start of each billing period</li>
          </ul>

          <h3 className="font-semibold mt-2">4.2 Top-up Credits</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Top-up credits remain in your account until used</li>
            <li>They are consumed after monthly credits are exhausted</li>
          </ul>

          <h3 className="font-semibold mt-2">4.3 Usage Rules</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Each AI-generated test consumes credits</li>
            <li>Manual test creation is unlimited</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl mb-2">5. Payments</h2>
          <p>
            Payments are processed through third-party providers such as Razorpay.
            All payments are final unless otherwise stated. We are not responsible
            for failures caused by external payment systems.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">6. Refund and Cancellation Policy</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All purchases are non-refundable unless required by law</li>
            <li>Subscriptions can be canceled at any time</li>
            <li>No partial refunds will be issued for unused time or credits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl mb-2">7. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the platform for unlawful activities</li>
            <li>Attempt to exploit or reverse-engineer the system</li>
            <li>Abuse AI generation or manipulate results</li>
            <li>Share or resell your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl mb-2">8. AI Disclaimer</h2>
          <p>
            AI-generated tests and evaluations are provided for practice purposes only.
            Accuracy is not guaranteed, and users should not rely solely on AI outputs
            for academic decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">9. Intellectual Property</h2>
          <p>
            All platform content, including design, features, and functionality,
            is owned by Syntropy. Unauthorized use or reproduction is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">10. Data and Privacy</h2>
          <p>
            We collect and process user data to provide and improve our services.
            By using Syntropy, you agree to our data practices.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">11. Service Availability</h2>
          <p>
            We do not guarantee uninterrupted service. Downtime, bugs, or data loss
            may occur, and we are not liable for such issues.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">12. Limitation of Liability</h2>
          <p>
            Syntropy is provided "as is". We are not responsible for academic outcomes,
            data loss, or indirect damages resulting from platform usage.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">13. Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these terms or misuse
            the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">14. Changes to Terms</h2>
          <p>
            These Terms may be updated periodically. Continued use of the platform
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">15. Contact</h2>
          <p>Email: syntropy.tests@gmail.com</p>
        </section>

        <div className="text-sm opacity-60 pt-4 border-t">
          Last updated: April 2026
        </div>

      </div>
    </div>
  );
}