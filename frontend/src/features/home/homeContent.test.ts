import { describe, expect, it } from "vitest";

import { HOME_CONTENT, HOME_NAVIGATION } from "./homeContent";

const expectedNavigation = [
  { href: "/dashboard", icon: "dashboard" },
  { href: "/documents", icon: "documents" },
  { href: "/chat", icon: "chat" },
  { href: "/quiz", icon: "quiz" },
  { href: "/analytics", icon: "analytics" }
];

describe("Home content", () => {
  it("uses the specified route and icon keys for product navigation", () => {
    expect(HOME_NAVIGATION.map(({ href, icon }) => ({ href, icon }))).toEqual(expectedNavigation);
  });

  it.each(["en", "th"] as const)("provides the complete %s Home surface", (language) => {
    const content = HOME_CONTENT[language];

    expect(content.navbar).toEqual(
      expect.objectContaining({
        languageLabel: expect.any(String),
        themeLabel: expect.any(String),
        themeLightLabel: expect.any(String),
        themeDarkLabel: expect.any(String),
        themeLightIconLabel: expect.any(String),
        themeDarkIconLabel: expect.any(String),
        menuLabel: expect.any(String),
        loginLabel: expect.any(String),
        accountGreeting: expect.any(String),
        logoutLabel: expect.any(String),
        logoutError: expect.any(String)
      })
    );
    expect(content.navigation).toEqual(
      expect.objectContaining({
        dashboard: expect.any(String),
        documents: expect.any(String),
        chat: expect.any(String),
        quiz: expect.any(String),
        analytics: expect.any(String)
      })
    );
    expect(content.hero).toEqual(
      expect.objectContaining({
        eyebrow: expect.any(String),
        heading: expect.any(String),
        body: expect.any(String),
        guestCta: expect.any(String),
        authenticatedCta: expect.any(String),
        supportingLine: expect.any(String)
      })
    );
    expect(content.features).toHaveLength(3);
    expect(content.features).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: expect.any(String), description: expect.any(String) })
      ])
    );
  });

  it("matches the approved English copy", () => {
    expect(HOME_CONTENT.en).toMatchObject({
      navbar: {
        languageLabel: "Language",
        themeLabel: "Theme",
        themeLightLabel: "Light",
        themeDarkLabel: "Dark",
        themeLightIconLabel: "Sun",
        themeDarkIconLabel: "Moon",
        menuLabel: "Open navigation menu",
        loginLabel: "Log in",
        accountGreeting: "Hello! {email}",
        logoutLabel: "Log out",
        logoutError: "Unable to log out. Please try again."
      },
      navigation: {
        dashboard: "Dashboard",
        documents: "Documents",
        chat: "AI Chat",
        quiz: "Quiz",
        analytics: "Analytics"
      },
      hero: {
        eyebrow: "Your personal AI study partner",
        heading: "Learn smarter. Understand more.",
        body: "Turn your documents into clear summaries, grounded AI answers, review quizzes, and progress you can act on.",
        guestCta: "Get started for free",
        authenticatedCta: "Start with a document",
        supportingLine: "Built for focused, document-based learning."
      },
      features: [
        {
          title: "Personalized learning",
          description: "Move from your own documents to the next useful study action."
        },
        {
          title: "Grounded AI help",
          description: "Ask questions and keep answers connected to your learning material."
        },
        {
          title: "Track your progress",
          description: "Review quiz results and see what deserves your attention next."
        }
      ]
    });
  });

  it("matches the approved Thai copy", () => {
    expect(HOME_CONTENT.th).toMatchObject({
      navbar: {
        languageLabel: "ภาษา",
        themeLabel: "ธีม",
        themeLightLabel: "สว่าง",
        themeDarkLabel: "มืด",
        themeLightIconLabel: "ดวงอาทิตย์",
        themeDarkIconLabel: "ดวงจันทร์",
        menuLabel: "เปิดเมนูนำทาง",
        loginLabel: "เข้าสู่ระบบ",
        accountGreeting: "สวัสดี! {email}",
        logoutLabel: "ออกจากระบบ",
        logoutError: "ไม่สามารถออกจากระบบได้ โปรดลองอีกครั้ง"
      },
      navigation: {
        dashboard: "แดชบอร์ด",
        documents: "เอกสาร",
        chat: "AI แชท",
        quiz: "ควิซ",
        analytics: "สถิติ"
      },
      hero: {
        eyebrow: "ผู้ช่วยเรียน AI ส่วนตัวของคุณ",
        heading: "เรียนได้ฉลาดขึ้น เข้าใจได้มากกว่า",
        body: "เปลี่ยนเอกสารของคุณเป็นสรุปที่เข้าใจง่าย คำตอบ AI ที่อ้างอิงเนื้อหา ควิซทบทวน และสถิติที่นำไปใช้ต่อได้",
        guestCta: "เริ่มต้นใช้งานฟรี",
        authenticatedCta: "เริ่มจากเอกสาร",
        supportingLine: "ออกแบบเพื่อการเรียนรู้จากเอกสารอย่างมีสมาธิ"
      },
      features: [
        {
          title: "การเรียนรู้ที่เหมาะกับคุณ",
          description: "ต่อยอดจากเอกสารของคุณไปยังขั้นตอนการเรียนที่เหมาะสม"
        },
        {
          title: "AI ตอบจากเอกสาร",
          description: "ถามคำถามและรับคำตอบที่เชื่อมโยงกับเนื้อหาที่คุณเรียน"
        },
        {
          title: "ติดตามความก้าวหน้า",
          description: "ดูผลควิซและรู้ว่าควรกลับไปทบทวนเรื่องใดต่อ"
        }
      ]
    });
  });
});
