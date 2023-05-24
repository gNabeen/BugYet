import Navbar from "./dashboard/Navbar";

const faq = () => {
  return (
    <div className="faq-main-div">
      <Navbar />
      <p className="faq-title">FAQ</p>
      <p className="faq-text">
        Find the answers for the most frequently asked questions below
      </p>
      <hr />
      <div className="faq-row">
        <p className="faq-card">
          <span style={{ fontWeight: "bold", color: "rgb(37, 108, 225)" }}>
            Is my payment completely secured?
          </span>
          <br /> <br />{" "}
          <span style={{ fontWeight: "bold", textDecoration: "underline" }}>
            Absolutely!
          </span>{" "}
          We work with top payment companies which guarantees your safety and
          security. All billing information is stored on our payment processing
          partner.
        </p>
        <p className="faq-card">
          <span style={{ fontWeight: "bold", color: "rgb(37, 108, 225)" }}>
            Is is possible to cancel my subscription at any time?
          </span>
          <br /> <br />{" "}
          <span style={{ fontWeight: "bold", textDecoration: "underline" }}>
            Yes, it is possible!
          </span>{" "}
          You can cancel your subscription anytime in your account. Once the
          subscription is cancelled, you will not be charged for the next month.
        </p>
        <p className="faq-card">
          <span style={{ fontWeight: "bold", color: "rgb(37, 108, 225)" }}>
            Are there other options besides monthly subscriptions?
          </span>
          <br /> <br /> Currently, we only offer monthly subscriptions. You can
          upgrade or cancel your monthly subscription at any time with no
          further obligation.
        </p>
      </div>
      <hr />
      <div className="faq-row">
        <p className="faq-card">
          <span style={{ fontWeight: "bold", color: "rgb(37, 108, 225)" }}>
            I want to use a new credit card. Can I change my payment method?
          </span>
          <br /> <br /> Yes! You can go to the billing section of your dashboard
          and update your payment information.
        </p>
        <p className="faq-card">
          <span style={{ fontWeight: "bold", color: "rgb(37, 108, 225)" }}>
            Do you offer refunds?
          </span>
          <br /> <br />{" "}
          <span style={{ fontWeight: "bold", textDecoration: "underline" }}>
            Unfortunately, no.
          </span>{" "}
          We do not issue full or partial refunds for any reason.
        </p>
        <p className="faq-card">
          <span style={{ fontWeight: "bold", color: "rgb(37, 108, 225)" }}>
            Do you offer a free trial?
          </span>
          <br /> <br /> Of course! We're happy to offer a free plan to anyone
          who wants to try our service.
        </p>
      </div>
    </div>
  );
};
export default faq;
