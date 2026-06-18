import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface GeexWelcomeEmailProps {
  first_name?: string;
  discountCode?: string;
  validUntil?: string;
}

export const GeexWelcomeEmail = ({
  first_name = "Valued Customer",
  discountCode,
  validUntil,
}: GeexWelcomeEmailProps) => {
  const frontendUrl = process.env.FRONTEND_URL || "https://www.geexfans.com";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@geexfans.com";

  return (
    <Html>
      <Head />
      <Preview>Welcome to GEEX</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>GEEX</Text>
            <Text style={tagline}>Everyday electronics for better setups</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Welcome to GEEX.</Heading>
            <Text style={greeting}>Hi {first_name},</Text>
            <Text style={paragraph}>
              Your account is ready. Use it to track orders, save checkout details, and keep your setup gear in one place.
            </Text>
            <Text style={paragraph}>
              We curate keyboards, gaming peripherals, Bluetooth audio, mobile accessories, and desk setup tools with clear compatibility and practical support.
            </Text>

            {discountCode && (
              <Section style={discountContainer}>
                <Text style={discountTitle}>First order offer</Text>
                <Text style={discountText}>Enjoy 15% off your first GEEX order.</Text>
                <Section style={codeBox}>
                  <Text style={codeText}>{discountCode}</Text>
                </Section>
                {validUntil && <Text style={expiryText}>Valid until {validUntil}</Text>}
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={`${frontendUrl}/shop`}>
                Shop GEEX Gear
              </Button>
            </Section>

            <Text style={supportNote}>
              Need help choosing switches, ports, charging gear, or audio? Reply to this email and GEEX Setup Support will help.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>GEEX Setup Support</Text>
            <Text style={footerLinks}>
              <Link href={frontendUrl} style={link}>Visit Website</Link>
              {" | "}
              <Link href={`mailto:${supportEmail}`} style={link}>Contact</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default GeexWelcomeEmail;

const main = {
  backgroundColor: "#f8fbfd",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px",
  marginBottom: "64px",
  border: "1px solid #dce6ec",
  maxWidth: "580px",
};

const header = {
  marginBottom: "32px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0",
  fontSize: "34px",
  fontWeight: "900",
  letterSpacing: "6px",
  color: "#050607",
};

const tagline = {
  margin: "8px 0 0",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "#48afcf",
};

const content = {
  paddingBottom: "20px",
};

const heading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#050607",
  marginBottom: "24px",
  textAlign: "left" as const,
};

const greeting = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#050607",
  marginBottom: "16px",
  fontWeight: "600",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#5e6872",
  marginBottom: "20px",
};

const discountContainer = {
  backgroundColor: "#f8fbfd",
  padding: "24px",
  margin: "24px 0",
  border: "1px dashed #82c8de",
  textAlign: "center" as const,
};

const discountTitle = {
  fontSize: "13px",
  fontWeight: "800",
  color: "#48afcf",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  marginBottom: "8px",
};

const discountText = {
  fontSize: "14px",
  color: "#5e6872",
  marginBottom: "16px",
};

const codeBox = {
  backgroundColor: "#ffffff",
  border: "1px dashed #82c8de",
  padding: "8px 16px",
  display: "inline-block",
  marginBottom: "12px",
};

const codeText = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#050607",
  letterSpacing: "1px",
  margin: "0",
};

const expiryText = {
  fontSize: "12px",
  color: "#5e6872",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#050607",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "13px 30px",
};

const supportNote = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#5e6872",
  marginTop: "20px",
};

const divider = {
  borderColor: "#dce6ec",
  margin: "30px 0 20px",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#5e6872",
  marginBottom: "10px",
};

const footerLinks = {
  fontSize: "12px",
  color: "#5e6872",
};

const link = {
  color: "#48afcf",
  textDecoration: "underline",
};
