"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { HomeLanguage } from "../home/types";

const ProductLanguageContext = createContext<HomeLanguage>("en");

export const ProductLanguageProvider = ({ children, language }: { children: ReactNode; language: HomeLanguage }) => (
  <ProductLanguageContext.Provider value={language}>{children}</ProductLanguageContext.Provider>
);

export const useProductLanguage = () => useContext(ProductLanguageContext);
