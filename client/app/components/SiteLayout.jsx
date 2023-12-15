"use client";
import { Layout, Typography } from "antd";
import { ConnectWallet } from "@thirdweb-dev/react";
import Image from "next/image";
import styles from "./SiteLayout.module.css";

const { Content, Footer } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <Image
            src="/wizard_logo.svg"
            alt="Logo"
            className={styles.logoImage}
            width={40}
            height={40}
          />
          <Typography.Text strong className={styles.logoText}>
            SuperToken Wizard
          </Typography.Text>
        </div>
        <div className={styles.navbarButtons}>
          <ConnectWallet
            theme="light"
            modalSize={"wide"} // compact | wide
          />
        </div>
      </div>
      <Content style={{ minHeight: 300 }}>{children}</Content>
      <Footer className={styles.footer}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ❤️ by Salman Dabbakuti. Powered by Nextjs & Ant Design
        </a>
      </Footer>
    </Layout>
  );
}
