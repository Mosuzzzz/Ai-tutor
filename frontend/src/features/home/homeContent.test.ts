import { describe, expect, it } from "vitest";

import { HOME_CONTENT, HOME_NAVIGATION } from "./homeContent";

const expectedNavigation = [
  { href: "#how-it-works", key: "howItWorks" },
  { href: "#study-kit", key: "studyKit" },
  { href: "#progress", key: "progress" },
  { href: "#faq", key: "faq" }
];

describe("Home content", () => {
  it("uses marketing anchors instead of protected workspace routes", () => {
    expect(HOME_NAVIGATION).toEqual(expectedNavigation);
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
    expect(content.navigation).toEqual(expect.objectContaining({
      howItWorks: expect.any(String),
      studyKit: expect.any(String),
      progress: expect.any(String),
      faq: expect.any(String),
      startStudying: expect.any(String)
    }));
    expect(content.hero).toEqual(
      expect.objectContaining({
        eyebrow: expect.any(String),
        heading: expect.any(String),
        body: expect.any(String),
        guestCta: expect.any(String),
        authenticatedCta: expect.any(String),
        guestSecondaryCta: expect.any(String),
        authenticatedSecondaryCta: expect.any(String),
        supportingLine: expect.any(String)
      })
    );
    expect(content.studyScene).toEqual(
      expect.objectContaining({
        ariaLabel: expect.any(String),
        documentLabel: expect.any(String),
        summaryLabel: expect.any(String),
        questionLabel: expect.any(String),
        answerLabel: expect.any(String),
        quizLabel: expect.any(String),
        resultLabel: expect.any(String),
        pauseLabel: expect.any(String),
        playLabel: expect.any(String)
      })
    );
    expect(content.features).toHaveLength(4);
    expect(content.walkthrough.items).toHaveLength(3);
    expect(content.faq.items.length).toBeGreaterThanOrEqual(5);
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
        howItWorks: "How it works",
        studyKit: "Study kit",
        progress: "Progress",
        faq: "FAQ",
        startStudying: "Start studying"
      },
      hero: {
        eyebrow: "Your material, one connected study loop.",
        heading: "Turn your documents into an AI study workspace.",
        body: "Upload your material, read a clear summary, ask questions tied to the selected document, build a review quiz, and see what to study next.",
        guestCta: "Create your study workspace",
        authenticatedCta: "Open my documents",
        guestSecondaryCta: "Log in",
        authenticatedSecondaryCta: "Go to my dashboard",
        supportingLine: "Summary, document-based questions, review quizzes, and progress in one focused flow."
      }
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
        howItWorks: "วิธีการทำงาน",
        studyKit: "ชุดเครื่องมือเรียน",
        progress: "ความก้าวหน้า",
        faq: "คำถามที่พบบ่อย",
        startStudying: "เริ่มเรียน"
      },
      hero: {
        eyebrow: "จากเอกสารของคุณ สู่การเรียนที่ต่อเนื่อง",
        heading: "เปลี่ยนเอกสารของคุณให้เป็นพื้นที่เรียนกับ AI",
        body: "อัปโหลดเนื้อหา อ่านสรุป ถามคำถามจากเอกสารที่เลือก สร้างควิซทบทวน และดูว่าควรกลับไปเรียนเรื่องใดต่อ",
        guestCta: "สร้างพื้นที่เรียนของฉัน",
        authenticatedCta: "เปิดเอกสารของฉัน",
        guestSecondaryCta: "เข้าสู่ระบบ",
        authenticatedSecondaryCta: "ไปที่แดชบอร์ดของฉัน",
        supportingLine: "สรุป แชทจากเอกสาร ควิซทบทวน และความก้าวหน้าใน flow เดียว"
      }
    });
  });
});
